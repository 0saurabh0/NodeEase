package models

import "time"

// User represents a user in the system
type User struct {
	ID          string     `json:"id"`
	Email       string     `json:"email"`
	Name        string     `json:"name,omitempty"`
	CreatedAt   time.Time  `json:"createdAt"`
	LastLoginAt *time.Time `json:"lastLoginAt,omitempty"`
}
