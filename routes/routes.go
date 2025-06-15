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

	router.HandleFunc("/api/proxy/image", handlers.ProxyImageHandler).Methods("GET")

	// Protected routes (Require JWT authentication)
	protected := router.PathPrefix("/api").Subrouter()
	protected.Use(middleware.AuthMiddleware)

	protected.HandleFunc("/user/profile", handlers.GetUserProfileHandler).Methods("GET")

	// AWS Integration routes
	protected.HandleFunc("/aws/test-connection", handlers.TestAWSConnectionHandler).Methods("POST")
	protected.HandleFunc("/aws/integrate", handlers.IntegrateAWSHandler).Methods("POST")
	protected.HandleFunc("/aws/status", handlers.AWSStatusHandler).Methods("GET")
	protected.HandleFunc("/aws/disconnect", handlers.DisconnectAWSHandler).Methods("POST")

	// Node routes
	protected.HandleFunc("/nodes/deploy", handlers.DeployNodeHandler).Methods("POST")
	protected.HandleFunc("/nodes", handlers.ListNodesHandler).Methods("GET")
	protected.HandleFunc("/nodes/{id}", handlers.GetNodeHandler).Methods("GET")
	protected.HandleFunc("/nodes/{id}", handlers.DeleteNodeHandler).Methods("DELETE")
	protected.HandleFunc("/nodes/{id}/status", handlers.GetNodeStatusHandler).Methods("GET")
	protected.HandleFunc("/nodes/{id}/ssh-key", handlers.GetNodeSSHKeyHandler).Methods("GET")
	// Node control actions
	protected.HandleFunc("/nodes/{id}/start", handlers.StartNodeHandler).Methods("POST")
	protected.HandleFunc("/nodes/{id}/stop", handlers.StopNodeHandler).Methods("POST")
	protected.HandleFunc("/nodes/{id}/reboot", handlers.RebootNodeHandler).Methods("POST")

	// Public callback endpoint for node deployment updates
	// This endpoint doesn't use AuthMiddleware because the VM needs to call it
	router.HandleFunc("/api/node-status/{id}/{token}", handlers.UpdateNodeStatusHandler).Methods("POST")

	return router
}
