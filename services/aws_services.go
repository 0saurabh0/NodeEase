package services

import (
	"errors"
	"time"

	"github.com/0saurabh0/NodeEase/db"
	"github.com/0saurabh0/NodeEase/models"
	"github.com/0saurabh0/NodeEase/utils"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ec2"
	"github.com/google/uuid"
)

// SaveAWSIntegration saves or updates AWS integration for a user
func SaveAWSIntegration(userID string, integration models.Integration) error {
	// Set timestamps
	now := time.Now()

	// Check if integration exists
	existing, err := GetAWSIntegrationByUserID(userID)
	if err == nil && existing.ID != "" {
		// Update existing integration
		integration.ID = existing.ID
		integration.CreatedAt = existing.CreatedAt
		integration.UpdatedAt = now

		return db.UpdateIntegration(integration)
	}

	// Create new integration
	integration.ID = uuid.New().String()
	integration.CreatedAt = now
	integration.UpdatedAt = now

	return db.SaveIntegration(integration)
}

// GetAWSIntegrationByUserID retrieves AWS integration for a user
func GetAWSIntegrationByUserID(userID string) (models.Integration, error) {
	integration, err := db.GetIntegrationByUserAndProvider(userID, "AWS")
	if err != nil {
		return models.Integration{}, err
	}
	return integration, nil
}

// GetAWSSession creates an AWS session using stored credentials
func GetAWSSession(userID string) (*session.Session, error) {
	integration, err := GetAWSIntegrationByUserID(userID)
	if err != nil {
		return nil, err
	}

	// Cast the Data field to AWSIntegrationData
	awsData, ok := integration.Data.(models.AWSIntegrationData)
	if !ok {
		return nil, errors.New("invalid AWS integration data format")
	}

	// Decrypt credentials
	accessKeyID, err := decrypt(awsData.AccessKeyID)
	if err != nil {
		return nil, err
	}

	secretAccessKey, err := decrypt(awsData.SecretAccessKey)
	if err != nil {
		return nil, err
	}

	// Create session
	sess, err := session.NewSession(&aws.Config{
		Region:      aws.String(awsData.Region),
		Credentials: credentials.NewStaticCredentials(accessKeyID, secretAccessKey, ""),
	})

	if err != nil {
		return nil, err
	}

	return sess, nil
}

// ListEC2Instances lists EC2 instances for a user
func ListEC2Instances(userID string) (interface{}, error) {
	sess, err := GetAWSSession(userID)
	if err != nil {
		return nil, err
	}

	svc := ec2.New(sess)
	result, err := svc.DescribeInstances(&ec2.DescribeInstancesInput{})
	if err != nil {
		return nil, err
	}

	return result, nil
}

// Helper functions
func decrypt(encrypted string) (string, error) {
	// Implement decryption logic or use a utility function
	return utils.Decrypt(encrypted)
}
