package models

import (
	"time"
)

// AWSCredentials represents the AWS credentials received from client
type AWSCredentials struct {
	IntegrationType string `json:"integrationType"`
	AccessKeyID     string `json:"accessKeyId"`
	SecretAccessKey string `json:"secretAccessKey"`
	Region          string `json:"region"`
}

// AWSIntegrationData represents the stored AWS integration data
type AWSIntegrationData struct {
	AccessKeyID     string `json:"accessKeyId"`     // Encrypted
	SecretAccessKey string `json:"secretAccessKey"` // Encrypted
	Region          string `json:"region"`
	IntegrationType string `json:"integrationType"`
}

// Integration represents a cloud provider integration
type Integration struct {
	ID        string      `json:"id,omitempty"`
	UserID    string      `json:"userId"`
	Provider  string      `json:"provider"`
	Data      interface{} `json:"data"` // Can be AWSIntegrationData or other provider data
	Status    string      `json:"status"`
	CreatedAt time.Time   `json:"createdAt"`
	UpdatedAt time.Time   `json:"updatedAt"`
}
