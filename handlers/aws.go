package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/0saurabh0/NodeEase/middleware"
	"github.com/0saurabh0/NodeEase/models"
	"github.com/0saurabh0/NodeEase/services"
	"github.com/0saurabh0/NodeEase/utils"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/sts"
)

// TestAWSConnectionHandler tests AWS credentials by attempting to create a session
func TestAWSConnectionHandler(w http.ResponseWriter, r *http.Request) {
	var awsCredentials models.AWSCredentials
	if err := json.NewDecoder(r.Body).Decode(&awsCredentials); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// Get user ID from context (set by auth middleware)
	_, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusInternalServerError, "Could not get user ID")
		return
	}

	// Create AWS session based on integration type
	var sess *session.Session
	var err error

	// Create session with access keys
	sess, err = session.NewSession(&aws.Config{
		Region:      aws.String(awsCredentials.Region),
		Credentials: credentials.NewStaticCredentials(awsCredentials.AccessKeyID, awsCredentials.SecretAccessKey, ""),
	})

	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Failed to create AWS session: "+err.Error())
		return
	}

	// Test connection by getting caller identity
	svc := sts.New(sess)
	_, err = svc.GetCallerIdentity(&sts.GetCallerIdentityInput{})
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Failed to connect to AWS: "+err.Error())
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Connection successful"})
}

// IntegrateAWSHandler saves AWS integration details for a user
func IntegrateAWSHandler(w http.ResponseWriter, r *http.Request) {
	var awsCredentials models.AWSCredentials
	if err := json.NewDecoder(r.Body).Decode(&awsCredentials); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusInternalServerError, "Could not get user ID")
		return
	}

	// Validate AWS credentials by testing connection
	var sess *session.Session
	var err error

	sess, err = session.NewSession(&aws.Config{
		Region:      aws.String(awsCredentials.Region),
		Credentials: credentials.NewStaticCredentials(awsCredentials.AccessKeyID, awsCredentials.SecretAccessKey, ""),
	})

	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Failed to create AWS session: "+err.Error())
		return
	}

	// Test connection
	svc := sts.New(sess)
	_, err = svc.GetCallerIdentity(&sts.GetCallerIdentityInput{})
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Failed to connect to AWS: "+err.Error())
		return
	}

	// Encrypt sensitive data
	var encryptedAccessKey, encryptedSecretKey string
	encryptedAccessKey, err = utils.Encrypt(awsCredentials.AccessKeyID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to encrypt credentials")
		return
	}

	encryptedSecretKey, err = utils.Encrypt(awsCredentials.SecretAccessKey)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to encrypt credentials")
		return
	}

	// Create integration record
	integration := models.Integration{
		UserID:   userID,
		Provider: "AWS",
		Status:   "active",
		Data: models.AWSIntegrationData{
			AccessKeyID:     encryptedAccessKey,
			SecretAccessKey: encryptedSecretKey,
			Region:          awsCredentials.Region,
			IntegrationType: awsCredentials.IntegrationType,
		},
	}

	// Save or update the integration
	if err := services.SaveAWSIntegration(userID, integration); err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to save integration: "+err.Error())
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"message": "AWS integration successful",
		"integration": map[string]string{
			"provider": "AWS",
			"region":   awsCredentials.Region,
			"status":   "active",
		},
	})
}

// AWSStatusHandler retrieves the AWS integration status for a user
func AWSStatusHandler(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context (set by auth middleware)
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusInternalServerError, "Could not get user ID")
		return
	}

	// Get integration status from the database
	integration, err := services.GetAWSIntegrationByUserID(userID)
	if err != nil {
		utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
			"integrated": false,
		})
		return
	}

	// Return integration status
	utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"integrated": true,
		"provider":   integration.Provider,
		"region":     integration.Data.(models.AWSIntegrationData).Region,
		"status":     integration.Status,
	})
}
