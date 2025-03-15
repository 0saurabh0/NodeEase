package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"os"

	"github.com/0saurabh0/NodeEase/utils"

	"google.golang.org/api/idtoken"
)

type AuthRequest struct {
	Token string `json:"token"` // Token received from frontend
}

type AuthResponse struct {
	Status string `json:"status"`
	Token  string `json:"token"`
}

func GoogleAuthHandler(w http.ResponseWriter, r *http.Request) {
	var request AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get the Google Client ID from environment variables
	googleClientID := os.Getenv("GOOGLE_CLIENT_ID")
	if googleClientID == "" {
		http.Error(w, "Google Client ID not configured", http.StatusInternalServerError)
		return
	}

	// Verify Google ID token
	payload, err := idtoken.Validate(context.Background(), request.Token, googleClientID)
	if err != nil {
		http.Error(w, "Invalid Google token", http.StatusUnauthorized)
		return
	}

	// Extract user info
	email := payload.Claims["email"].(string)
	// name := payload.Claims["name"].(string)

	// Generate JWT token
	jwtToken, err := utils.GenerateJWT(email)
	if err != nil {
		http.Error(w, "Could not generate JWT", http.StatusInternalServerError)
		return
	}

	// Send response
	response := AuthResponse{Status: "success", Token: jwtToken}
	json.NewEncoder(w).Encode(response)
}

func VerifyTokenHandler(w http.ResponseWriter, r *http.Request) {
	// Extract the token from the Authorization header
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "No Authorization header provided", http.StatusUnauthorized)
		return
	}

	// Token format should be "Bearer <token>"
	if len(authHeader) <= 7 || authHeader[:7] != "Bearer " {
		http.Error(w, "Invalid Authorization header format", http.StatusUnauthorized)
		return
	}

	tokenString := authHeader[7:] // Remove "Bearer " prefix

	// Verify the token
	claims, err := utils.VerifyJWT(tokenString)
	if err != nil {
		http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
		return
	}

	// If we get here, token is valid
	response := map[string]interface{}{
		"status": "success",
		"email":  claims.Email,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
