package models

import (
	"time"
)

// NodeDeploymentLog represents a log entry during node deployment
type NodeDeploymentLog struct {
	Timestamp time.Time `json:"timestamp"`
	Step      string    `json:"step"`     // Deployment step e.g. "system_setup", "solana_install"
	Message   string    `json:"message"`  // Detailed message
	Progress  int       `json:"progress"` // Progress 0-100
}

// NodeStatusUpdate represents a status update from a node during deployment
type NodeStatusUpdate struct {
	NodeID   string `json:"nodeId"`
	Step     string `json:"step"`
	Message  string `json:"message"`
	Progress int    `json:"progress"`
	Status   string `json:"status"` // deploying, initializing, running, failed
}

// NodeDeployRequest contains parameters for node deployment
type NodeDeployRequest struct {
	NodeName      string `json:"nodeName"`
	RpcType       string `json:"rpcType"`       // base, extended
	InstanceType  string `json:"instanceType"`  // EC2 instance type
	Region        string `json:"region"`        // AWS region
	DiskSize      int    `json:"diskSize"`      // Disk size in GB
	HistoryLength string `json:"historyLength"` // minimal, recent, full
	NetworkType   string `json:"networkType"`   // mainnet, testnet, devnet
}

// Node represents a deployed Solana node
type Node struct {
	ID             string              `json:"id"`
	UserID         string              `json:"userId"`
	Name           string              `json:"name"`
	Provider       string              `json:"provider"` // AWS
	Region         string              `json:"region"`
	InstanceType   string              `json:"instanceType"`
	InstanceID     string              `json:"instanceId"`   // AWS EC2 instance ID
	NodeType       string              `json:"nodeType"`     // base, extended
	NetworkType    string              `json:"networkType"`  // mainnet, testnet, devnet
	Status         string              `json:"status"`       // deploying, running, stopped, failed
	StatusDetail   string              `json:"statusDetail"` // Detailed status or error message
	IPAddress      string              `json:"ipAddress"`
	DiskSize       int                 `json:"diskSize"`
	RpcEndpoint    string              `json:"rpcEndpoint"`
	DeploymentLogs []NodeDeploymentLog `json:"deploymentLogs,omitempty"`
	DeployToken    string              `json:"-"` // Token used for authenticating deployment updates
	SSHKeyName     string              `json:"sshKeyName,omitempty"`
	SshPrivateKey  string              `json:"sshPrivateKey,omitempty" db:"ssh_private_key"`
	CreatedAt      time.Time           `json:"createdAt"`
	UpdatedAt      time.Time           `json:"updatedAt"`
	LastCheck      *time.Time          `json:"lastCheck,omitempty"`
}
