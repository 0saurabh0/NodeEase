package models

import "time"

// NodeDeployRequest contains parameters for node deployment
type NodeDeployRequest struct {
	NodeName      string `json:"nodeName"`
	RpcType       string `json:"rpcType"`       // base, extended
	InstanceType  string `json:"instanceType"`  // EC2 instance type
	Region        string `json:"region"`        // AWS region
	DiskSize      int    `json:"diskSize"`      // Disk size in GB
	Snapshots     bool   `json:"snapshots"`     // Use snapshots
	HistoryLength string `json:"historyLength"` // minimal, recent, full
	NetworkType   string `json:"networkType"`   // mainnet, testnet, devnet
}

// Node represents a deployed Solana node
type Node struct {
	ID           string     `json:"id"`
	UserID       string     `json:"userId"`
	Name         string     `json:"name"`
	Provider     string     `json:"provider"` // AWS
	Region       string     `json:"region"`
	InstanceType string     `json:"instanceType"`
	InstanceID   string     `json:"instanceId"`   // AWS EC2 instance ID
	NodeType     string     `json:"nodeType"`     // base, extended
	NetworkType  string     `json:"networkType"`  // mainnet, testnet, devnet
	Status       string     `json:"status"`       // deploying, running, stopped, failed
	StatusDetail string     `json:"statusDetail"` // Detailed status or error message
	IPAddress    string     `json:"ipAddress"`
	DiskSize     int        `json:"diskSize"`
	RpcEndpoint  string     `json:"rpcEndpoint"`
	CreatedAt    time.Time  `json:"createdAt"`
	UpdatedAt    time.Time  `json:"updatedAt"`
	LastCheck    *time.Time `json:"lastCheck,omitempty"`
}
