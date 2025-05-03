package db

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

var DB *pgxpool.Pool

// InitDB initializes the database connection and creates tables
func InitDB() error {
	connStr := os.Getenv("db_url")
	config, err := pgxpool.ParseConfig(connStr)
	if err != nil {
		return fmt.Errorf("failed to parse connection string: %v", err)
	}

	DB, err = pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		return fmt.Errorf("failed to create connection pool: %v", err)
	}

	// Test the connection
	if err = DB.Ping(context.Background()); err != nil {
		return fmt.Errorf("failed to ping database: %v", err)
	}

	// Initialize tables
	if err = createTables(); err != nil {
		return err
	}

	return nil
}

// createTables creates all required database tables if they don't exist
func createTables() error {
	// Create users table
	_, err := DB.Exec(context.Background(), `
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            created_at TIMESTAMP NOT NULL,
            last_login_at TIMESTAMP
        )
    `)
	if err != nil {
		return fmt.Errorf("failed to create users table: %v", err)
	}

	// Create integrations table
	_, err = DB.Exec(context.Background(), `
        CREATE TABLE IF NOT EXISTS integrations (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            provider TEXT NOT NULL,
            data JSONB NOT NULL,
            status TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL,
            updated_at TIMESTAMP NOT NULL
        )
    `)
	if err != nil {
		return fmt.Errorf("failed to create integrations table: %v", err)
	}

	// Create nodes table
	_, err = DB.Exec(context.Background(), `
        CREATE TABLE IF NOT EXISTS nodes (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            provider TEXT NOT NULL,
            region TEXT NOT NULL,
            instance_type TEXT NOT NULL,
            instance_id TEXT,
            node_type TEXT NOT NULL,
            network_type TEXT NOT NULL,
            status TEXT NOT NULL,
            status_detail TEXT,
            ip_address TEXT,
            disk_size INTEGER NOT NULL,
            rpc_endpoint TEXT,
            created_at TIMESTAMP NOT NULL,
            updated_at TIMESTAMP NOT NULL
        )
    `)
	if err != nil {
		return fmt.Errorf("failed to create nodes table: %v", err)
	}

	return nil
}

// Close closes the database connection
func Close() {
	if DB != nil {
		DB.Close()
	}
}
