package handlers

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/0saurabh0/NodeEase/services"
	"github.com/0saurabh0/NodeEase/utils"

	"github.com/0saurabh0/NodeEase/middleware"
	"google.golang.org/api/idtoken"
)

type AuthRequest struct {
	Token string `json:"token"` // Token received from frontend
}

type AuthResponse struct {
	Status string `json:"status"`
	Token  string `json:"token"`
	User   struct {
		Name    string `json:"name"`
		Email   string `json:"email"`
		Picture string `json:"picture"`
	} `json:"user"`
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
	name := payload.Claims["name"].(string)
	picture := payload.Claims["picture"].(string)

	// Store user data in database
	if err := services.CreateOrUpdateUserFromGoogle(email, name, picture); err != nil {
		http.Error(w, "Failed to update user profile", http.StatusInternalServerError)
		return
	}

	// Generate JWT token
	jwtToken, err := utils.GenerateJWT(email)
	if err != nil {
		http.Error(w, "Could not generate JWT", http.StatusInternalServerError)
		return
	}

	// Send response with user profile data
	response := AuthResponse{
		Status: "success",
		Token:  jwtToken,
		User: struct {
			Name    string `json:"name"`
			Email   string `json:"email"`
			Picture string `json:"picture"`
		}{
			Name:    name,
			Email:   email,
			Picture: picture,
		},
	}

	w.Header().Set("Content-Type", "application/json")
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

// GetUserProfileHandler returns the user profile
func GetUserProfileHandler(w http.ResponseWriter, r *http.Request) {
	// Get user ID (email) from context
	email, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusInternalServerError, "Could not get user ID")
		return
	}

	// Get user from database
	user, err := services.GetUserByEmail(email)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get user: "+err.Error())
		return
	}

	// Return user profile
	utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"name":    user.Name,
		"email":   user.Email,
		"picture": user.ProfilePicture,
	})
}

// ProxyImageHandler fetches and proxies an external image
func ProxyImageHandler(w http.ResponseWriter, r *http.Request) {
	// Get the image URL from query parameter
	imageURL := r.URL.Query().Get("url")
	if imageURL == "" {
		http.Error(w, "Missing image URL", http.StatusBadRequest)
		return
	}

	// Create a new request to the target URL
	req, err := http.NewRequest("GET", imageURL, nil)
	if err != nil {
		http.Error(w, "Failed to create request: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Forward the request using http client
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "Failed to fetch image: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Copy response headers
	for k, v := range resp.Header {
		for _, val := range v {
			w.Header().Add(k, val)
		}
	}

	// Set CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")

	// Copy the status code
	w.WriteHeader(resp.StatusCode)

	// Copy the response body
	io.Copy(w, resp.Body)
}
