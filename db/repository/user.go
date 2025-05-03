package repository

import (
	"context"
	"time"

	"github.com/0saurabh0/NodeEase/db"
	"github.com/0saurabh0/NodeEase/models"
	"github.com/jackc/pgx/v5"
)

// CreateOrUpdateUser creates or updates a user record
func CreateOrUpdateUser(user models.User) error {
	now := time.Now()

	// Check if user exists
	var exists bool
	err := db.DB.QueryRow(context.Background(),
		"SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)",
		user.Email).Scan(&exists)

	if err != nil {
		return err
	}

	if exists {
		// Update last login time for existing user
		_, err = db.DB.Exec(context.Background(), `
            UPDATE users SET 
                name = $1,
                last_login_at = $2
            WHERE email = $3
        `, user.Name, now, user.Email)
	} else {
		// Create new user
		_, err = db.DB.Exec(context.Background(), `
            INSERT INTO users (id, email, name, created_at, last_login_at)
            VALUES ($1, $2, $3, $4, $5)
        `, user.ID, user.Email, user.Name, now, now)
	}

	return err
}

// GetUserByEmail retrieves a user by email
func GetUserByEmail(email string) (models.User, error) {
	var user models.User
	var lastLoginAt *time.Time

	err := db.DB.QueryRow(context.Background(), `
        SELECT id, email, name, created_at, last_login_at
        FROM users
        WHERE email = $1
    `, email).Scan(
		&user.ID,
		&user.Email,
		&user.Name,
		&user.CreatedAt,
		&lastLoginAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return models.User{}, nil
		}
		return models.User{}, err
	}

	user.LastLoginAt = lastLoginAt

	return user, nil
}

// GetUserByID retrieves a user by ID
func GetUserByID(id string) (models.User, error) {
	var user models.User
	var lastLoginAt *time.Time

	err := db.DB.QueryRow(context.Background(), `
        SELECT id, email, name, created_at, last_login_at
        FROM users
        WHERE id = $1
    `, id).Scan(
		&user.ID,
		&user.Email,
		&user.Name,
		&user.CreatedAt,
		&lastLoginAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return models.User{}, nil
		}
		return models.User{}, err
	}

	user.LastLoginAt = lastLoginAt

	return user, nil
}
