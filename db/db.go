package db

import (
	"context"
	"fmt"
	"net"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

var DB *pgxpool.Pool

// Add a custom resolver
func customResolver(ctx context.Context, host string) ([]string, error) {
	ips, err := net.DefaultResolver.LookupIP(ctx, "ip4", host)
	if err != nil {
		return nil, err
	}

	addrs := make([]string, len(ips))
	for i, ip := range ips {
		addrs[i] = ip.String()
	}
	return addrs, nil
}

// InitDB initializes the database connection and creates tables
func InitDB() error {
	connStr := os.Getenv("DB_URL")
	config, err := pgxpool.ParseConfig(connStr)
	if err != nil {
		return fmt.Errorf("failed to parse connection string: %v", err)
	}

	config.ConnConfig.LookupFunc = customResolver

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
			profile_picture TEXT,
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
			ssh_private_key TEXT,
        	deploy_token TEXT,
            created_at TIMESTAMP NOT NULL,
            updated_at TIMESTAMP NOT NULL
        )
    `)
	if err != nil {
		return fmt.Errorf("failed to create nodes table: %v", err)
	}

	// Create node_deployment_logs table
	_, err = DB.Exec(context.Background(), `
    CREATE TABLE IF NOT EXISTS node_deployment_logs (
        id SERIAL PRIMARY KEY,
        node_id TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
        timestamp TIMESTAMP NOT NULL,
        step TEXT NOT NULL,
        message TEXT NOT NULL,
        progress INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_node FOREIGN KEY (node_id) REFERENCES nodes(id)
    )
`)
	if err != nil {
		return fmt.Errorf("failed to create node_deployment_logs table: %v", err)
	}

	return nil
}

// Close closes the database connection
func Close() {
	if DB != nil {
		DB.Close()
	}
}
