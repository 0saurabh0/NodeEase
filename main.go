package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/0saurabh0/NodeEase/db"
	"github.com/0saurabh0/NodeEase/routes"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: Error loading .env file: %v", err)
	}

	// Initialize database
	if err := db.InitDB(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	router := routes.SetupRouter()

	// Create a more permissive CORS middleware configuration
	corsMiddleware := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
		Debug:            true, // Enable for debugging, remove in production
	})

	handler := corsMiddleware.Handler(router)

	fmt.Println("Server running on port 8080...")

	// Start the server and log any fatal errors that occur
	log.Fatal(http.ListenAndServe(":8080", handler))
}
