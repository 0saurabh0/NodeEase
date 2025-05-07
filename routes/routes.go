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

	// AWS Integration routes
	protected.HandleFunc("/user/profile", handlers.GetUserProfileHandler).Methods("GET")

	protected.HandleFunc("/aws/test-connection", handlers.TestAWSConnectionHandler).Methods("POST")
	protected.HandleFunc("/aws/integrate", handlers.IntegrateAWSHandler).Methods("POST")
	protected.HandleFunc("/aws/status", handlers.AWSStatusHandler).Methods("GET")
	protected.HandleFunc("/aws/disconnect", handlers.DisconnectAWSHandler).Methods("POST")

	protected.HandleFunc("/nodes/simulate", handlers.SimulateNodeHandler).Methods("POST")

	return router
}
