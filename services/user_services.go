package services

import (
	"time"

	"github.com/0saurabh0/NodeEase/db/repository"
	"github.com/0saurabh0/NodeEase/models"
	"github.com/google/uuid"
)

// CreateOrUpdateUserFromGoogle creates or updates a user from Google authentication
func CreateOrUpdateUserFromGoogle(email, name, picture string) error {
	// Check if user exists
	existingUser, err := repository.GetUserByEmail(email)
	if err != nil {
		return err
	}

	now := time.Now()

	// If user doesn't exist, create new user
	if existingUser.ID == "" {
		user := models.User{
			ID:        uuid.New().String(),
			Email:     email,
			Name:      name,
			CreatedAt: now,
		}

		return repository.CreateOrUpdateUser(user)
	}

	// Update existing user's login time
	existingUser.LastLoginAt = &now
	existingUser.Name = name // Update name in case it changed

	return repository.CreateOrUpdateUser(existingUser)
}

// GetUserByEmail retrieves a user by email
func GetUserByEmail(email string) (models.User, error) {
	return repository.GetUserByEmail(email)
}
