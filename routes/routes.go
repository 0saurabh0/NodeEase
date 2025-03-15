package routes

import (
	"github.com/0saurabh0/NodeEase/handlers"
	"github.com/0saurabh0/NodeEase/middleware"

	"github.com/gorilla/mux"
)

func SetupRouter() *mux.Router {
	router := mux.NewRouter()

	// Public routes
	router.HandleFunc("/api/auth/google", handlers.GoogleAuthHandler).Methods("POST")

	// JWT Verification endpoint
	router.HandleFunc("/api/auth/verify", handlers.VerifyTokenHandler).Methods("GET")

	// Protected routes (Require JWT authentication)
	protected := router.PathPrefix("/api").Subrouter()
	protected.Use(middleware.AuthMiddleware)
	// protected.HandleFunc("/api/nodes/provision", handlers.ProvisionNode).Methods("POST")

	return router
}
