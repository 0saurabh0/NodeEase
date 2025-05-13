package repository

import (
	"context"

	"github.com/0saurabh0/NodeEase/db"
	"github.com/0saurabh0/NodeEase/models"
	"github.com/jackc/pgx/v5"
)

// SaveNode creates or updates a node record
func SaveNode(node models.Node) error {
	// Check if node exists
	var exists bool
	err := db.DB.QueryRow(context.Background(),
		"SELECT EXISTS(SELECT 1 FROM nodes WHERE id = $1)",
		node.ID).Scan(&exists)

	if err != nil {
		return err
	}

	if exists {
		// Update existing node with all possible fields
		_, err = db.DB.Exec(context.Background(), `
            UPDATE nodes 
            SET name = $1,
                provider = $2,
                region = $3,
                instance_type = $4,
                instance_id = $5,
                node_type = $6,
                network_type = $7,
                status = $8,
                status_detail = $9,
                ip_address = $10,
                disk_size = $11,
                rpc_endpoint = $12,
                updated_at = $13
            WHERE id = $14
        `, node.Name, node.Provider, node.Region, node.InstanceType,
			node.InstanceID, node.NodeType, node.NetworkType, node.Status,
			node.StatusDetail, node.IPAddress, node.DiskSize, node.RpcEndpoint,
			node.UpdatedAt, node.ID)
	} else {
		// Create new node
		_, err = db.DB.Exec(context.Background(), `
            INSERT INTO nodes (
                id, user_id, name, provider, region, instance_type, 
                instance_id, node_type, network_type, status, status_detail,
                ip_address, disk_size, rpc_endpoint, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        `, node.ID, node.UserID, node.Name, node.Provider, node.Region, node.InstanceType,
			node.InstanceID, node.NodeType, node.NetworkType, node.Status, node.StatusDetail,
			node.IPAddress, node.DiskSize, node.RpcEndpoint, node.CreatedAt, node.UpdatedAt)
	}

	return err
}

// GetNodesByUserID retrieves all nodes for a user
func GetNodesByUserID(userID string) ([]models.Node, error) {
	rows, err := db.DB.Query(context.Background(), `
        SELECT id, user_id, name, provider, region, instance_type, instance_id, 
            node_type, network_type, status, status_detail, ip_address, 
            disk_size, rpc_endpoint, created_at, updated_at
        FROM nodes
        WHERE user_id = $1
        ORDER BY created_at DESC
    `, userID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var nodes []models.Node
	for rows.Next() {
		var node models.Node
		err := rows.Scan(
			&node.ID, &node.UserID, &node.Name, &node.Provider, &node.Region,
			&node.InstanceType, &node.InstanceID, &node.NodeType, &node.NetworkType,
			&node.Status, &node.StatusDetail, &node.IPAddress, &node.DiskSize,
			&node.RpcEndpoint, &node.CreatedAt, &node.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		nodes = append(nodes, node)
	}

	return nodes, nil
}

// GetNodeByID retrieves a node by ID
func GetNodeByID(nodeID, userID string) (models.Node, error) {
	var node models.Node

	err := db.DB.QueryRow(context.Background(), `
        SELECT id, user_id, name, provider, region, instance_type, instance_id, 
            node_type, network_type, status, status_detail, ip_address, 
            disk_size, rpc_endpoint, created_at, updated_at
        FROM nodes
        WHERE id = $1 AND user_id = $2
    `, nodeID, userID).Scan(
		&node.ID, &node.UserID, &node.Name, &node.Provider, &node.Region,
		&node.InstanceType, &node.InstanceID, &node.NodeType, &node.NetworkType,
		&node.Status, &node.StatusDetail, &node.IPAddress, &node.DiskSize,
		&node.RpcEndpoint, &node.CreatedAt, &node.UpdatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return models.Node{}, nil
		}
		return models.Node{}, err
	}

	return node, nil
}

// GetNodeByIDInternal retrieves a node by ID without user filtering
// Internal use only - not to be called from API handlers
func GetNodeByIDInternal(nodeID string) (models.Node, error) {
	var node models.Node

	err := db.DB.QueryRow(context.Background(), `
        SELECT id, user_id, name, provider, region, instance_type, instance_id, 
            node_type, network_type, status, status_detail, ip_address, 
            disk_size, rpc_endpoint, created_at, updated_at
        FROM nodes
        WHERE id = $1
    `, nodeID).Scan(
		&node.ID, &node.UserID, &node.Name, &node.Provider, &node.Region,
		&node.InstanceType, &node.InstanceID, &node.NodeType, &node.NetworkType,
		&node.Status, &node.StatusDetail, &node.IPAddress, &node.DiskSize,
		&node.RpcEndpoint, &node.CreatedAt, &node.UpdatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return models.Node{}, nil
		}
		return models.Node{}, err
	}

	return node, nil
}

// DeleteNode deletes a node record
func DeleteNode(nodeID, userID string) error {
	_, err := db.DB.Exec(context.Background(), `
        DELETE FROM nodes
        WHERE id = $1 AND user_id = $2
    `, nodeID, userID)
	return err
}
