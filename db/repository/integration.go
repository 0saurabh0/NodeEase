package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/0saurabh0/NodeEase/db"
	"github.com/0saurabh0/NodeEase/models"
	"github.com/jackc/pgx/v5"
)

// SaveIntegration saves a new integration
func SaveIntegration(integration models.Integration) error {
	data, err := json.Marshal(integration.Data)
	if err != nil {
		return fmt.Errorf("failed to marshal integration data: %v", err)
	}

	_, err = db.DB.Exec(context.Background(), `
        INSERT INTO integrations (id, user_id, provider, data, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, integration.ID, integration.UserID, integration.Provider, data, integration.Status, integration.CreatedAt, integration.UpdatedAt)

	return err
}

// UpdateIntegration updates an existing integration
func UpdateIntegration(integration models.Integration) error {
	data, err := json.Marshal(integration.Data)
	if err != nil {
		return fmt.Errorf("failed to marshal integration data: %v", err)
	}

	_, err = db.DB.Exec(context.Background(), `
        UPDATE integrations
        SET data = $1, status = $2, updated_at = $3
        WHERE id = $4
    `, data, integration.Status, integration.UpdatedAt, integration.ID)

	return err
}

// GetIntegrationByUserAndProvider retrieves an integration by user ID and provider
func GetIntegrationByUserAndProvider(userID, provider string) (models.Integration, error) {
	var integration models.Integration
	var data []byte
	var createdAt, updatedAt time.Time

	err := db.DB.QueryRow(context.Background(), `
        SELECT id, user_id, provider, data, status, created_at, updated_at
        FROM integrations
        WHERE user_id = $1 AND provider = $2
    `, userID, provider).Scan(
		&integration.ID,
		&integration.UserID,
		&integration.Provider,
		&data,
		&integration.Status,
		&createdAt,
		&updatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return models.Integration{}, nil
		}
		return models.Integration{}, err
	}

	// Unmarshal the JSON data into the appropriate type based on provider
	switch provider {
	case "AWS":
		var awsData models.AWSIntegrationData
		if err := json.Unmarshal(data, &awsData); err != nil {
			return models.Integration{}, fmt.Errorf("failed to unmarshal AWS data: %v", err)
		}
		integration.Data = awsData
	}

	integration.CreatedAt = createdAt
	integration.UpdatedAt = updatedAt

	return integration, nil
}

// DeleteIntegrationByUserAndProvider deletes an integration by user ID and provider
func DeleteIntegrationByUserAndProvider(userID, provider string) error {
	_, err := db.DB.Exec(context.Background(), `
        DELETE FROM integrations
        WHERE user_id = $1 AND provider = $2
    `, userID, provider)
	return err
}
