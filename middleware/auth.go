package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/0saurabh0/NodeEase/utils"

	"github.com/golang-jwt/jwt/v5"
)

// ContextKey is a type for context keys
type ContextKey string

const (
	// UserIDKey is the key used to store user ID in context
	UserIDKey ContextKey = "userID"
)

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Unauthorized: No token provided", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		claims := &jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return utils.JwtKey, nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Unauthorized: Invalid token", http.StatusUnauthorized)
			return
		}

		// Extract email from claims and use it as user ID
		email, ok := (*claims)["email"].(string)
		if !ok {
			http.Error(w, "Unauthorized: Invalid token claims", http.StatusUnauthorized)
			return
		}

		// Create new context with user ID
		ctx := context.WithValue(r.Context(), UserIDKey, email)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
