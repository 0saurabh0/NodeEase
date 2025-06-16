package services

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"fmt"
	"strings"
	"time"

	"golang.org/x/crypto/ssh"

	"github.com/0saurabh0/NodeEase/db/repository"
	"github.com/0saurabh0/NodeEase/models"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/ec2"
	"github.com/google/uuid"
)

// createNodeSecurityGroup creates a security group for Solana nodes
func createNodeSecurityGroup(ec2Client *ec2.EC2, nodeID string, vpcID string) (string, error) {
	// Create security group
	createOutput, err := ec2Client.CreateSecurityGroup(&ec2.CreateSecurityGroupInput{
		GroupName:   aws.String(fmt.Sprintf("solana-node-%s", nodeID)),
		Description: aws.String("Security group for Solana validator node"),
		VpcId:       aws.String(vpcID),
	})
	if err != nil {
		return "", err
	}

	securityGroupID := *createOutput.GroupId

	// Tag the security group
	_, err = ec2Client.CreateTags(&ec2.CreateTagsInput{
		Resources: []*string{aws.String(securityGroupID)},
		Tags: []*ec2.Tag{
			{
				Key:   aws.String("Name"),
				Value: aws.String(fmt.Sprintf("solana-node-%s", nodeID)),
			},
			{
				Key:   aws.String("NodeID"),
				Value: aws.String(nodeID),
			},
		},
	})
	if err != nil {
		return "", err
	}

	// Allow SSH (port 22)
	_, err = ec2Client.AuthorizeSecurityGroupIngress(&ec2.AuthorizeSecurityGroupIngressInput{
		GroupId: aws.String(securityGroupID),
		IpPermissions: []*ec2.IpPermission{
			{
				IpProtocol: aws.String("tcp"),
				FromPort:   aws.Int64(22),
				ToPort:     aws.Int64(22),
				IpRanges: []*ec2.IpRange{
					{
						CidrIp: aws.String("0.0.0.0/0"),
					},
				},
			},
		},
	})
	if err != nil {
		return "", err
	}

	// Allow Solana RPC port (8899)
	_, err = ec2Client.AuthorizeSecurityGroupIngress(&ec2.AuthorizeSecurityGroupIngressInput{
		GroupId: aws.String(securityGroupID),
		IpPermissions: []*ec2.IpPermission{
			{
				IpProtocol: aws.String("tcp"),
				FromPort:   aws.Int64(8899),
				ToPort:     aws.Int64(8899),
				IpRanges: []*ec2.IpRange{
					{
						CidrIp: aws.String("0.0.0.0/0"),
					},
				},
			},
		},
	})
	if err != nil {
		return "", err
	}

	// Allow Solana websocket port (8900)
	_, err = ec2Client.AuthorizeSecurityGroupIngress(&ec2.AuthorizeSecurityGroupIngressInput{
		GroupId: aws.String(securityGroupID),
		IpPermissions: []*ec2.IpPermission{
			{
				IpProtocol: aws.String("tcp"),
				FromPort:   aws.Int64(8900),
				ToPort:     aws.Int64(8900),
				IpRanges: []*ec2.IpRange{
					{
						CidrIp: aws.String("0.0.0.0/0"),
					},
				},
			},
		},
	})
	if err != nil {
		return "", err
	}

	// Allow Solana dynamic port range (8000-8020)
	_, err = ec2Client.AuthorizeSecurityGroupIngress(&ec2.AuthorizeSecurityGroupIngressInput{
		GroupId: aws.String(securityGroupID),
		IpPermissions: []*ec2.IpPermission{
			{
				IpProtocol: aws.String("tcp"),
				FromPort:   aws.Int64(8000),
				ToPort:     aws.Int64(8020),
				IpRanges: []*ec2.IpRange{
					{
						CidrIp: aws.String("0.0.0.0/0"),
					},
				},
			},
		},
	})
	if err != nil {
		return "", err
	}

	// Allow Solana dynamic port range for UDP (8000-8020)
	_, err = ec2Client.AuthorizeSecurityGroupIngress(&ec2.AuthorizeSecurityGroupIngressInput{
		GroupId: aws.String(securityGroupID),
		IpPermissions: []*ec2.IpPermission{
			{
				IpProtocol: aws.String("udp"),
				FromPort:   aws.Int64(8000),
				ToPort:     aws.Int64(8020),
				IpRanges: []*ec2.IpRange{
					{
						CidrIp: aws.String("0.0.0.0/0"),
					},
				},
			},
		},
	})
	if err != nil {
		return "", err
	}

	// Additional Solana validator ports (gossip port 8001)
	_, err = ec2Client.AuthorizeSecurityGroupIngress(&ec2.AuthorizeSecurityGroupIngressInput{
		GroupId: aws.String(securityGroupID),
		IpPermissions: []*ec2.IpPermission{
			{
				IpProtocol: aws.String("tcp"),
				FromPort:   aws.Int64(8001),
				ToPort:     aws.Int64(8001),
				IpRanges: []*ec2.IpRange{
					{
						CidrIp: aws.String("0.0.0.0/0"),
					},
				},
			},
		},
	})
	if err != nil {
		return "", err
	}

	return securityGroupID, nil
}

// DeployNode deploys a new Solana node
func DeployNode(userID string, req models.NodeDeployRequest) (string, error) {
	// Get AWS session
	sess, err := GetAWSSession(userID)
	if err != nil {
		return "", fmt.Errorf("failed to get AWS session: %v", err)
	}

	// Generate node ID
	nodeID := uuid.New().String()
	now := time.Now()

	// Generate deployment token
	deployToken := generateDeploymentToken(nodeID)

	// Generate SSH key pair
	privateKey, publicKey, err := generateSSHKeyPair()
	if err != nil {
		return "", fmt.Errorf("failed to generate SSH key: %v", err)
	}

	// Create node record in database
	node := models.Node{
		ID:            nodeID,
		UserID:        userID,
		Name:          req.NodeName,
		Provider:      "AWS",
		Region:        req.Region,
		InstanceType:  req.InstanceType,
		NodeType:      req.RpcType,
		NetworkType:   req.NetworkType,
		Status:        "deploying",
		DiskSize:      req.DiskSize,
		DeployToken:   deployToken,
		SshPrivateKey: privateKey,
		CreatedAt:     now,
		UpdatedAt:     now,
		DeploymentLogs: []models.NodeDeploymentLog{
			{
				Timestamp: now,
				Step:      "init",
				Message:   "Node deployment started",
				Progress:  0,
			},
		},
	}

	if err := repository.SaveNode(node); err != nil {
		return "", fmt.Errorf("failed to save node record: %v", err)
	}

	// Start EC2 instance provisioning in a separate goroutine
	go func() {
		ec2Client := ec2.New(sess)

		// Create key pair in AWS
		keyName := fmt.Sprintf("nodeease-key-%s", nodeID[:8])
		_, err := ec2Client.ImportKeyPair(&ec2.ImportKeyPairInput{
			KeyName:           aws.String(keyName),
			PublicKeyMaterial: []byte(publicKey),
		})

		if err != nil {
			updateNodeStatus(nodeID, "failed", fmt.Sprintf("Failed to import key pair: %v", err))
			return
		}

		// Get default VPC
		describeVpcsOutput, err := ec2Client.DescribeVpcs(&ec2.DescribeVpcsInput{
			Filters: []*ec2.Filter{
				{
					Name:   aws.String("isDefault"),
					Values: []*string{aws.String("true")},
				},
			},
		})
		if err != nil || len(describeVpcsOutput.Vpcs) == 0 {
			updateNodeStatus(nodeID, "failed", fmt.Sprintf("Failed to get default VPC: %v", err))
			return
		}

		vpcID := *describeVpcsOutput.Vpcs[0].VpcId

		// Create security group
		sgID, err := createNodeSecurityGroup(ec2Client, nodeID, vpcID)
		if err != nil {
			updateNodeStatus(nodeID, "failed", fmt.Sprintf("Failed to create security group: %v", err))
			return
		}

		// Generate startup script for Solana node
		userData := generateSolanaNodeScript(req, nodeID, node.DeployToken)

		// Define EC2 instance parameters
		runParams := &ec2.RunInstancesInput{
			ImageId:      aws.String(getSolanaAMI(req.Region)),
			InstanceType: aws.String(req.InstanceType),
			MinCount:     aws.Int64(1),
			MaxCount:     aws.Int64(1),
			UserData:     aws.String(base64.StdEncoding.EncodeToString([]byte(userData))),
			BlockDeviceMappings: []*ec2.BlockDeviceMapping{
				{
					DeviceName: aws.String("/dev/sda1"),
					Ebs: &ec2.EbsBlockDevice{
						DeleteOnTermination: aws.Bool(true),
						VolumeSize:          aws.Int64(int64(req.DiskSize)),
						VolumeType:          aws.String("gp3"),
					},
				},
			},
			TagSpecifications: []*ec2.TagSpecification{
				{
					ResourceType: aws.String("instance"),
					Tags: []*ec2.Tag{
						{
							Key:   aws.String("Name"),
							Value: aws.String(req.NodeName),
						},
						{
							Key:   aws.String("NodeID"),
							Value: aws.String(nodeID),
						},
						{
							Key:   aws.String("UserID"),
							Value: aws.String(userID),
						},
					},
				},
			},
			KeyName:          aws.String(keyName), // Add SSH key name here
			SecurityGroupIds: []*string{aws.String(sgID)},
		}

		// Launch EC2 instance
		runResult, err := ec2Client.RunInstances(runParams)

		if err != nil {
			updateNodeStatus(nodeID, "failed", fmt.Sprintf("Failed to deploy: %v", err))
			return
		}

		// Get instance ID
		instanceID := *runResult.Instances[0].InstanceId

		// Update node with instance ID
		updateNodeInstance(nodeID, instanceID)

		// Monitor instance until it's running and setup is complete
		go monitorNodeDeployment(nodeID, instanceID, ec2Client)
	}()

	return nodeID, nil
}

// GetNodeByID retrieves a node by ID
func GetNodeByID(nodeID, userID string) (models.Node, error) {
	return repository.GetNodeByID(nodeID, userID)
}

// GetNodesByUserID retrieves all nodes for a user
func GetNodesByUserID(userID string) ([]models.Node, error) {
	return repository.GetNodesByUserID(userID)
}

// DeleteNode deletes a node and terminates the associated AWS instance
func DeleteNode(nodeID, userID string) error {
	// Get node details
	node, err := repository.GetNodeByID(nodeID, userID)
	if err != nil {
		return err
	}

	// Only proceed if this is the user's node
	if node.UserID != userID {
		return fmt.Errorf("node not found or you don't have permission")
	}

	// If there's an instance ID, terminate the EC2 instance
	if node.InstanceID != "" {
		sess, err := GetAWSSession(userID)
		if err != nil {
			return err
		}

		ec2Client := ec2.New(sess)

		_, err = ec2Client.TerminateInstances(&ec2.TerminateInstancesInput{
			InstanceIds: []*string{
				aws.String(node.InstanceID),
			},
		})

		if err != nil {
			return fmt.Errorf("failed to terminate instance: %v", err)
		}
	}

	// Delete the node record
	return repository.DeleteNode(nodeID, userID)
}

// Generate a script to setup a Solana node
func generateSolanaNodeScript(req models.NodeDeployRequest, nodeID string, deployToken string) string {
	script := `#!/bin/bash
# Exit on command failures but allow the script to handle and report errors
set -e

# Log all output to a file
exec > >(tee -a /var/log/solana-deployment.log) 2>&1
echo "Starting Solana node deployment at $(date)"

# Function to send deployment status updates to NodeEase API
function update_status() {
    local STEP=$1
    local MESSAGE=$2
    local PROGRESS=$3
    local STATUS=$4  # Optional status parameter
    
    if [ -z "$STATUS" ]; then
        STATUS="deploying"
    fi
    
    # Also log status locally before attempting to send it
    echo "$(date): [$STEP] $MESSAGE ($PROGRESS%)" >> /var/log/solana-deployment.log
    echo "$(date): [$STEP] $MESSAGE ($PROGRESS%)"
    
    # Try sending the status update to the API with retries
    local MAX_RETRIES=5
    local RETRY_COUNT=0
    local SUCCESS=false
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ] && [ "$SUCCESS" != "true" ]; do
        HTTP_RESPONSE=$(curl -s -X POST "$API_BASE_URL/node-status/$NODE_ID/$DEPLOY_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"nodeId\": \"$NODE_ID\", \"step\": \"$STEP\", \"message\": \"$MESSAGE\", \"progress\": $PROGRESS, \"status\": \"$STATUS\"}" \
            -o /dev/null -w "%{http_code}" 2>/dev/null || echo "0")
        
        if [ "$HTTP_RESPONSE" == "200" ]; then
            SUCCESS=true
            echo "Status update sent successfully"
            break
        else
            RETRY_COUNT=$((RETRY_COUNT+1))
            echo "$(date): Warning: Failed to send status update (HTTP $HTTP_RESPONSE). Retry $RETRY_COUNT of $MAX_RETRIES..."
            echo "API URL being used: $API_BASE_URL/node-status/$NODE_ID/$DEPLOY_TOKEN"
            sleep 3
        fi
    done
    
    if [ "$SUCCESS" != "true" ]; then
        echo "$(date): Warning: Failed to send status update after $MAX_RETRIES retries. Continuing deployment..."
        # Save the failed status update to try sending it again later
        echo "{\"step\": \"$STEP\", \"message\": \"$MESSAGE\", \"progress\": $PROGRESS, \"status\": \"$STATUS\"}" >> /tmp/failed_status_updates.log
    fi
}

# Set deployment variables
NODE_ID="NODE_ID_PLACEHOLDER"
DEPLOY_TOKEN="TOKEN_PLACEHOLDER"
API_BASE_URL="API_BASE_URL_PLACEHOLDER"

# Start deployment
update_status "system_update" "Updating system packages" 5

# We'll add a small sleep to ensure system is ready
sleep 10
echo "Starting system update and installation..."

# Update system and install dependencies
apt-get update && apt-get upgrade -y
apt-get install -y git curl jq build-essential pkg-config libssl-dev libudev-dev unzip chrony
systemctl start chronyd
update_status "system_deps" "System dependencies installed" 10

# Create solana user
id -u solana &>/dev/null || useradd -m -s /bin/bash solana
update_status "setup_user" "Created Solana user" 15

# Mount data volume and setup solana directory
mkdir -p /data/solana
mkdir -p /data/solana/ledger
mkdir -p /data/solana/accounts
chown -R solana:solana /data/solana
update_status "disk_setup" "Data directory prepared" 30

# Install Solana - Direct approach with the Anza client
update_status "solana_install" "Installing Solana software (Anza Agave client)" 35

# Install Solana using the official Anza installer
su - solana -c 'sh -c "$(curl -sSfL https://release.anza.xyz/v2.2.14/install)"'

# Add to system PATH for everyone
echo 'export PATH="/home/solana/.local/share/solana/install/active_release/bin:$PATH"' > /etc/profile.d/solana-path.sh
chmod +x /etc/profile.d/solana-path.sh

# Also add to solana user's bash profile
echo 'export PATH="/home/solana/.local/share/solana/install/active_release/bin:$PATH"' >> /home/solana/.bashrc
echo 'export PATH="/home/solana/.local/share/solana/install/active_release/bin:$PATH"' >> /home/solana/.profile
chown solana:solana /home/solana/.bashrc /home/solana/.profile

# Source the path for current session
source /etc/profile.d/solana-path.sh
export PATH="/home/solana/.local/share/solana/install/active_release/bin:$PATH"

# Just use the direct path to the validator binary
VALIDATOR_BIN="/home/solana/.local/share/solana/install/active_release/bin/agave-validator"

# Verify the binary exists and is executable
if [ -x "$VALIDATOR_BIN" ]; then
    update_status "solana_install" "Anza Agave v2.2.14 installed successfully" 40
else
    update_status "error" "Validator binary not found or not executable" 35 "failed"
    echo "Expected binary at $VALIDATOR_BIN"
    ls -la /home/solana/.local/share/solana/install/active_release/bin/
    exit 1
fi

SOLANA_INSTALL_DIR="/home/solana/.local/share/solana/install/active_release"

`

	// Configure Solana RPC based on node type and network
	network := "mainnet-beta"
	if req.NetworkType == "testnet" {
		network = "testnet"
	} else if req.NetworkType == "devnet" {
		network = "devnet"
	}

	script += fmt.Sprintf(`
# Configure Solana for %s on %s
cat > /etc/systemd/system/solana-validator.service << EOF
[Unit]
Description=Solana Validator
After=network.target

[Service]
User=solana
Group=solana
Environment="PATH=/home/solana/.local/share/solana/install/active_release/bin:/usr/local/bin:/bin:/usr/bin"
ExecStart=${VALIDATOR_BIN} \\
`, req.RpcType, network)

	// Add node type specific parameters with network-specific configurations
	if req.RpcType == "base" {
		// Common parameters first
		script += fmt.Sprintf(`  --ledger /data/solana/ledger \\
  --accounts /data/solana/accounts \\
  --identity /data/solana/validator-keypair.json \\
  --account-index program-id \\
`)

		// Network-specific entrypoints
		if network == "mainnet-beta" {
			script += fmt.Sprintf(`  --entrypoint entrypoint.%s.solana.com:8001 \\
  --entrypoint entrypoint2.%s.solana.com:8001 \\
  --entrypoint entrypoint3.%s.solana.com:8001 \\
  --entrypoint entrypoint4.%s.solana.com:8001 \\
  --entrypoint entrypoint5.%s.solana.com:8001 \\
`, network, network, network, network, network)
		} else {
			// For testnet and devnet, use only the first 3 entrypoints
			script += fmt.Sprintf(`  --entrypoint entrypoint.%s.solana.com:8001 \\
  --entrypoint entrypoint2.%s.solana.com:8001 \\
  --entrypoint entrypoint3.%s.solana.com:8001 \\
`, network, network, network)
		}

		// Network-specific known validators
		if network == "mainnet-beta" {
			script += `  --known-validator 5D1fNXzvv5NjV1ysLjirC4WY92RNsVH18vjmcszZd8on \\
  --known-validator dDzy5SR3AXdYWVqbDEkVFdvSPCtS9ihF5kJkHCtXoFs \\
  --known-validator eoKpUABi59aT4rR9HGS3LcMecfut9x7zJyodWWP43YQ \\
  --known-validator 7XSY3MrYnK8vq693Rju17bbPkCN3Z7KvvfvJx4kdrsSY \\
  --known-validator Ft5fbkqNa76vnsjYNwjDZUXoTWpP7VYm3mtsaQckQADN \\
  --known-validator 9QxCLckBiJc783jnMvXZubK4wH86Eqqvashtrwvcsgkv \\
`
		} else if network == "testnet" {
			script += `  --known-validator 5D1fNXzvv5NjV1ysLjirC4WY92RNsVH18vjmcszZd8on \\
  --known-validator Ft5fbkqNa76vnsjYNwjDZUXoTWpP7VYm3mtsaQckQADN \\
  --known-validator 7XSY3MrYnK8vq693Rju17bbPkCN3Z7KvvfvJx4kdrsSY \\
`
		} else {
			// devnet validators
			script += `  --known-validator dv1ZAGvdsz5hHLwWXsVnM94hWf1pjbKVau1QVkaMJ92 \\
  --known-validator dv2eQHeP4RFrJZ6UeiZWoc3XTtmtZCUKxxCApCDcRNV \\
  --known-validator dv4ACNkpYPcE3aKmYDqZm9G5EB3J4MRoeE7WNDRBVJB \\
`
		}

		// Add common parameters after network-specific ones
		script += `  --account-index program-id spl-token-owner spl-token-mint \\
  --account-index-exclude-key kinXdEcpDQeHPEuQnqmUgtYykqKGVFq6CeVX5iAHJq6 \\
  --account-index-exclude-key TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA \\
  --rpc-port 8899 \\
  --private-rpc \\
  --full-rpc-api \\
  --dynamic-port-range 8000-8020 \\
  --wal-recovery-mode skip_any_corrupted_record \\
  --no-voting \\
  --enable-rpc-transaction-history \\
  --limit-ledger-size \\
  --rpc-bind-address 0.0.0.0 \\
`
	} else if req.RpcType == "extended" {
		// Extended node configuration with network-specific settings
		script += fmt.Sprintf(`  --ledger /data/solana/ledger \\
  --identity /data/solana/validator-keypair.json \\
`)

		// Network-specific entrypoints for extended nodes
		if network == "mainnet-beta" {
			script += fmt.Sprintf(`  --entrypoint entrypoint.%s.solana.com:8001 \\
  --entrypoint entrypoint2.%s.solana.com:8001 \\
  --entrypoint entrypoint3.%s.solana.com:8001 \\
`, network, network, network)
		} else {
			// For testnet and devnet, use only the first 3 entrypoints
			script += fmt.Sprintf(`  --entrypoint entrypoint.%s.solana.com:8001 \\
  --entrypoint entrypoint2.%s.solana.com:8001 \\
  --entrypoint entrypoint3.%s.solana.com:8001 \\
`, network, network, network)
		}

		// Network-specific validators for extended nodes
		if network == "mainnet-beta" {
			script += `  --known-validator 7Np41oeYqPefeNQEHSv1UDhYrehxin3NStELsSKCT4K2 \\
  --known-validator GdnSyH3YtwcxFvQrVVJMm1JhTS4QVX7MFsX56uJLUfiZ \\
  --known-validator DE1bawNcRJB9rVm3buyMVfr8mBEoyyu73NBovf2oXJsJ \\
  --expected-genesis-hash 5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d \\
`
		} else if network == "testnet" {
			script += `  --known-validator 5D1fNXzvv5NjV1ysLjirC4WY92RNsVH18vjmcszZd8on \\
  --known-validator Ft5fbkqNa76vnsjYNwjDZUXoTWpP7VYm3mtsaQckQADN \\
  --known-validator 7XSY3MrYnK8vq693Rju17bbPkCN3Z7KvvfvJx4kdrsSY \\
`
		} else {
			// devnet validators
			script += `  --known-validator dv1ZAGvdsz5hHLwWXsVnM94hWf1pjbKVau1QVkaMJ92 \\
  --known-validator dv2eQHeP4RFrJZ6UeiZWoc3XTtmtZCUKxxCApCDcRNV \\
  --known-validator dv4ACNkpYPcE3aKmYDqZm9G5EB3J4MRoeE7WNDRBVJB \\
`
		}

		// Common extended mode settings
		script += `  --rpc-port 8899 \\
  --dynamic-port-range 8000-8020 \\
  --no-untrusted-rpc \\
  --no-voting \\
  --full-rpc-api \\
  --enable-rpc-transaction-history \\
  --enable-extended-tx-metadata-storage \\
  --enable-cpi-and-log-storage \\
`

		if req.HistoryLength == "full" {
			script += "  --no-snapshot-fetch \\\n"
		}
	}

	// Complete the systemd service definition
	script += `
Restart=always
RestartSec=30s
LimitNOFILE=700000

[Install]
WantedBy=multi-user.target
EOF
update_status "config_setup" "Solana validator service configured" 60

# Create validator identity using the correct solana-keygen binary
su - solana -c 'solana-keygen new -o /data/solana/validator-keypair.json --no-bip39-passphrase'
if [ ! -f "/data/solana/validator-keypair.json" ]; then
    update_status "error" "Failed to create validator keypair" 70 "failed"
    ls -la /data/solana
    exit 1
fi

# Set proper permissions for the Solana data directory
chown -R solana:solana /data/solana
chmod -R 700 /data/solana
update_status "identity_setup" "Validator identity created" 70

# System tuning for Solana
update_status "system_tuning" "Applying system performance tuning" 72

# Create sysctl config file for Solana
cat > /etc/sysctl.d/21-solana-validator.conf << EOF
# Increase UDP buffer sizes
net.core.rmem_default = 134217728
net.core.rmem_max = 134217728
net.core.wmem_default = 134217728
net.core.wmem_max = 134217728

# Increase memory mapped files limit
vm.max_map_count = 1000000

# Increase number of allowed open files
fs.nr_open = 1000000
EOF

# Apply sysctl settings
sysctl -p /etc/sysctl.d/21-solana-validator.conf

# Update limits.conf to increase file descriptor limits
cat > /etc/security/limits.d/90-solana.conf << EOF
* soft nofile 1000000
* hard nofile 1000000
solana soft nofile 1000000
solana hard nofile 1000000
EOF

# Configure swap area if you want to
fallocate -l 8G /swap
chmod 600 /swap
mkswap /swap
swapon /swap
echo '/swap none swap sw 0 0' >> /etc/fstab

update_status "system_tuning" "System performance tuning applied" 74

# Start Solana validator service
systemctl daemon-reload
systemctl enable solana-validator
update_status "service_setup" "Solana services enabled" 75

# Install monitoring software
update_status "monitoring_setup" "Installing monitoring tools" 80
curl -LO https://github.com/prometheus/node_exporter/releases/download/v1.5.0/node_exporter-1.5.0.linux-amd64.tar.gz
tar -xzf node_exporter-1.5.0.linux-amd64.tar.gz
cp node_exporter-1.5.0.linux-amd64/node_exporter /usr/local/bin/
rm -rf node_exporter-1.5.0.linux-amd64*

# Create systemd service for node_exporter
cat > /etc/systemd/system/node_exporter.service << EOF
[Unit]
Description=Node Exporter
After=network.target

[Service]
User=root
Group=root
Type=simple
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable node_exporter
systemctl start node_exporter
update_status "monitoring_setup" "Monitoring tools installed" 90

# Start Solana validator service
systemctl start solana-validator
sleep 20

# Report completion
update_status "complete" "Solana node deployment complete" 100 "running"

# Setup status reporter and logs
mkdir -p /var/log/solana

# Create a script to periodically collect validator logs
cat > /usr/local/bin/collect-solana-logs.sh << 'EOF'
#!/bin/bash
journalctl -u solana-validator --no-pager -n 1000 > /var/log/solana/validator-recent.log
journalctl -u solana-validator --no-pager -p err > /var/log/solana/validator-errors.log
EOF

chmod +x /usr/local/bin/collect-solana-logs.sh

# Set up timers for monitoring
cat > /etc/systemd/system/nodeease-reporter.service << EOF
[Unit]
Description=NodeEase Status Reporter
After=solana-validator.service

[Service]
Type=oneshot
Environment="NODE_ID=$NODE_ID"
Environment="DEPLOY_TOKEN=$DEPLOY_TOKEN" 
Environment="API_BASE_URL=$API_BASE_URL"
ExecStart=/bin/bash -c 'if systemctl is-active --quiet solana-validator; then curl -s -X POST "$API_BASE_URL/node-status/$NODE_ID/$DEPLOY_TOKEN" -H "Content-Type: application/json" -d "{\"nodeId\": \"$NODE_ID\", \"step\": \"running\", \"message\": \"Solana validator service is running\", \"progress\": 100, \"status\": \"running\"}"; else curl -s -X POST "$API_BASE_URL/node-status/$NODE_ID/$DEPLOY_TOKEN" -H "Content-Type: application/json" -d "{\"nodeId\": \"$NODE_ID\", \"step\": \"warning\", \"message\": \"Solana validator service is not running\", \"progress\": 100, \"status\": \"failed\"}"; fi'

[Install]
WantedBy=multi-user.target
EOF

# Set up timers
systemctl daemon-reload
systemctl enable nodeease-reporter.service
systemctl start nodeease-reporter.service

# Get public IP and make final callback
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || curl -s https://api.ipify.org || hostname -I | awk '{print $1}')
update_status "complete" "Deployment complete. RPC endpoint: http://$PUBLIC_IP:8899" 100 "running"
echo "Node deployment complete at $(date)"
echo "RPC Endpoint: http://$PUBLIC_IP:8899"
`

	// Replace placeholders with actual values
	script = strings.ReplaceAll(script, "NODE_ID_PLACEHOLDER", nodeID)
	script = strings.ReplaceAll(script, "TOKEN_PLACEHOLDER", deployToken)
	// Use your server's public IP address so the VM can reach it
	script = strings.ReplaceAll(script, "API_BASE_URL_PLACEHOLDER", "https://nodeease.onrender.com//api")

	return script
}

// Get the right AMI for the region
func getSolanaAMI(region string) string {
	// Map of Ubuntu 22.04 LTS AMIs by region (updated May 2025)
	amiMap := map[string]string{
		"us-east-1":      "ami-0fc5d935ebf8bc3bc", // N. Virginia
		"us-east-2":      "ami-0f09ef696435ff61a", // Ohio
		"us-west-1":      "ami-0cbd40f694b804622", // N. California
		"us-west-2":      "ami-0efcece6bed30fd98", // Oregon
		"eu-west-1":      "ami-0694d931cee245f1e", // Ireland
		"eu-central-1":   "ami-0faab6bdbac9486fb", // Frankfurt
		"ap-northeast-1": "ami-0bc3d34a629664f3f", // Tokyo
		"ap-southeast-1": "ami-0d7901b37615eece7", // Singapore
		"ap-southeast-2": "ami-0d6f74b9139d25896", // Sydney
	}

	// If the region is in our map, return the associated AMI
	if ami, ok := amiMap[region]; ok {
		return ami
	}

	// If the region isn't in our map, return the us-east-1 AMI and log a warning
	fmt.Printf("Warning: No AMI defined for region %s, falling back to us-east-1 AMI\n", region)

	// Check if us-east-1 AMI exists as a fallback
	if fallbackAmi, exists := amiMap["us-east-1"]; exists {
		return fallbackAmi
	}

	// In case of any issues, return Ubuntu 22.04 LTS default AMI for us-east-1
	return "ami-0fc5d935ebf8bc3bc" // Latest stable Ubuntu 22.04 LTS AMI
}

// Update node status
func updateNodeStatus(nodeID, status, detail string) error {
	node, err := repository.GetNodeByIDInternal(nodeID)
	if err != nil {
		return err
	}

	node.Status = status
	node.StatusDetail = detail
	node.UpdatedAt = time.Now()

	return repository.SaveNode(node)
}

// Update node with log entry
func updateNodeWithLog(nodeID, status, step, detail string, progress int) error {
	node, err := repository.GetNodeByIDInternal(nodeID)
	if err != nil {
		return err
	}

	// Add a new log entry
	logEntry := models.NodeDeploymentLog{
		Timestamp: time.Now(),
		Message:   detail,
		Step:      step,
		Progress:  progress,
	}

	// Append to logs
	if node.DeploymentLogs == nil {
		node.DeploymentLogs = []models.NodeDeploymentLog{}
	}
	node.DeploymentLogs = append(node.DeploymentLogs, logEntry)

	if err := repository.AddNodeDeploymentLog(nodeID, logEntry); err != nil {
		return err
	}

	// Update status
	node.Status = status
	node.StatusDetail = detail
	node.UpdatedAt = time.Now()

	return repository.SaveNode(node)
}

// Update node instance ID
func updateNodeInstance(nodeID, instanceID string) error {
	node, err := repository.GetNodeByIDInternal(nodeID)
	if err != nil {
		return err
	}

	node.InstanceID = instanceID
	node.UpdatedAt = time.Now()

	return repository.SaveNode(node)
}

// Monitor node deployment
func monitorNodeDeployment(nodeID, instanceID string, ec2Client *ec2.EC2) {
	// Create initial log entry
	updateNodeWithLog(nodeID, "deploying", "provision", "Provisioning EC2 instance...", 5)

	for {
		// Wait a bit before checking status
		time.Sleep(15 * time.Second)

		// Get instance status
		result, err := ec2Client.DescribeInstances(&ec2.DescribeInstancesInput{
			InstanceIds: []*string{aws.String(instanceID)},
		})

		if err != nil {
			updateNodeWithLog(nodeID, "failed", "error", fmt.Sprintf("Failed to get instance status: %v", err), 0)
			return
		}

		if len(result.Reservations) == 0 || len(result.Reservations[0].Instances) == 0 {
			updateNodeWithLog(nodeID, "failed", "error", "Instance not found", 0)
			return
		}

		instance := result.Reservations[0].Instances[0]
		state := *instance.State.Name

		// Update node status based on instance state
		switch state {
		case "running":
			// Once the instance is running, the user-data script will take over
			// status updates via the API, but let's update the node with its IP address
			if instance.PublicIpAddress != nil {
				updateNodeIP(nodeID, *instance.PublicIpAddress)

				// Update RPC endpoint
				rpcEndpoint := fmt.Sprintf("http://%s:8899", *instance.PublicIpAddress)
				updateNodeRPCEndpoint(nodeID, rpcEndpoint)

				// Add a log entry that we've successfully provisioned the VM
				updateNodeWithLog(nodeID, "deploying", "vm_ready", "VM is running, setting up node software...", 15)

				// The rest of the status updates will come from the VM script
				return
			}
		case "terminated", "shutting-down":
			updateNodeWithLog(nodeID, "failed", "terminated", "Instance terminated unexpectedly", 0)
			return
		case "pending":
			updateNodeWithLog(nodeID, "deploying", "pending", "VM instance is being provisioned", 10)
		default:
			updateNodeWithLog(nodeID, "deploying", "provisioning", fmt.Sprintf("VM instance state: %s", state), 5)
		}
	}
}

// Update node IP address
func updateNodeIP(nodeID, ipAddress string) error {
	node, err := repository.GetNodeByIDInternal(nodeID)
	if err != nil {
		return err
	}

	node.IPAddress = ipAddress
	node.UpdatedAt = time.Now()

	return repository.SaveNode(node)
}

// Update node RPC endpoint
func updateNodeRPCEndpoint(nodeID, endpoint string) error {
	node, err := repository.GetNodeByIDInternal(nodeID)
	if err != nil {
		return err
	}

	node.RpcEndpoint = endpoint
	node.UpdatedAt = time.Now()

	return repository.SaveNode(node)
}

// GetNodeWithDeploymentLogs retrieves a node with its deployment logs
func GetNodeWithDeploymentLogs(nodeID, userID string) (models.Node, error) {
	node, err := repository.GetNodeByID(nodeID, userID)
	if err != nil {
		return models.Node{}, err
	}

	// Get deployment logs for this node
	logs, err := repository.GetDeploymentLogsForNode(nodeID)
	if err != nil {
		// Just log the error but don't fail completely
		fmt.Printf("Error fetching logs for node %s: %v\n", nodeID, err)
		logs = []models.NodeDeploymentLog{}
	}

	node.DeploymentLogs = logs
	return node, nil
}

// Generate deployment token for a node
func generateDeploymentToken(nodeID string) string {
	// In production, use a proper crypto function with a secret key
	// This is a simplified implementation
	return fmt.Sprintf("%s-%d", nodeID, time.Now().Unix())
}

// UpdateNodeDeploymentStatus updates node status based on VM callbacks
func UpdateNodeDeploymentStatus(nodeID, token string, update models.NodeStatusUpdate) error {
	// Get node without user ID check since this is coming from the VM
	node, err := repository.GetNodeByIDInternal(nodeID)
	if err != nil {
		return err
	}

	// Verify token (in production use proper HMAC validation)
	if node.DeployToken != token {
		return fmt.Errorf("invalid deployment token")
	}

	// Create a log entry
	logEntry := models.NodeDeploymentLog{
		Timestamp: time.Now(),
		Step:      update.Step,
		Message:   update.Message,
		Progress:  update.Progress,
	}

	// Initialize logs array if nil
	if node.DeploymentLogs == nil {
		node.DeploymentLogs = []models.NodeDeploymentLog{}
	}

	// Add log entry
	node.DeploymentLogs = append(node.DeploymentLogs, logEntry)

	if err := repository.AddNodeDeploymentLog(nodeID, logEntry); err != nil {
		return err
	}

	// Update status
	if update.Status != "" {
		node.Status = update.Status
	}
	node.StatusDetail = update.Message
	node.UpdatedAt = time.Now()

	// Save node
	return repository.SaveNode(node)
}

// Add this function to generate SSH key pairs
func generateSSHKeyPair() (string, string, error) {
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return "", "", err
	}

	// Convert private key to PEM format
	privateKeyPEM := &pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: x509.MarshalPKCS1PrivateKey(privateKey),
	}
	privateKeyBytes := pem.EncodeToMemory(privateKeyPEM)

	// Generate public key
	publicKey, err := ssh.NewPublicKey(&privateKey.PublicKey)
	if err != nil {
		return "", "", err
	}

	// Convert public key to authorized_keys format
	publicKeyBytes := ssh.MarshalAuthorizedKey(publicKey)

	return string(privateKeyBytes), string(publicKeyBytes), nil
}

// Add this function to get SSH key for a node
func GetNodeSSHKey(nodeID, userID string) (string, error) {
	node, err := repository.GetNodeByID(nodeID, userID)
	if err != nil {
		return "", err
	}

	if node.SshPrivateKey == "" {
		return "", fmt.Errorf("no SSH key available for this node")
	}

	return node.SshPrivateKey, nil
}

// StartNode starts a stopped EC2 instance
func StartNode(nodeID, userID string) error {
	// Get node details
	node, err := repository.GetNodeByID(nodeID, userID)
	if err != nil {
		return err
	}

	// Only proceed if this is the user's node
	if node.UserID != userID {
		return fmt.Errorf("node not found or you don't have permission")
	}

	// Ensure there's an instance ID
	if node.InstanceID == "" {
		return fmt.Errorf("no EC2 instance associated with this node")
	}

	// Get AWS session
	sess, err := GetAWSSession(userID)
	if err != nil {
		return err
	}

	ec2Client := ec2.New(sess)

	// Start the EC2 instance
	_, err = ec2Client.StartInstances(&ec2.StartInstancesInput{
		InstanceIds: []*string{
			aws.String(node.InstanceID),
		},
	})

	if err != nil {
		return fmt.Errorf("failed to start instance: %v", err)
	}

	// Update node status
	updateNodeStatus(nodeID, "starting", "Starting the EC2 instance...")

	// Start monitoring the instance state
	go monitorInstanceStateChange(nodeID, node.InstanceID, ec2Client, "start")

	return nil
}

// StopNode stops a running EC2 instance
func StopNode(nodeID, userID string) error {
	// Get node details
	node, err := repository.GetNodeByID(nodeID, userID)
	if err != nil {
		return err
	}

	// Only proceed if this is the user's node
	if node.UserID != userID {
		return fmt.Errorf("node not found or you don't have permission")
	}

	// Ensure there's an instance ID
	if node.InstanceID == "" {
		return fmt.Errorf("no EC2 instance associated with this node")
	}

	// Get AWS session
	sess, err := GetAWSSession(userID)
	if err != nil {
		return err
	}

	ec2Client := ec2.New(sess)

	// Stop the EC2 instance
	_, err = ec2Client.StopInstances(&ec2.StopInstancesInput{
		InstanceIds: []*string{
			aws.String(node.InstanceID),
		},
	})

	if err != nil {
		return fmt.Errorf("failed to stop instance: %v", err)
	}

	// Update node status
	updateNodeStatus(nodeID, "stopping", "Stopping the EC2 instance...")

	// Start monitoring the instance state
	go monitorInstanceStateChange(nodeID, node.InstanceID, ec2Client, "stop")

	return nil
}

// RebootNode reboots a running EC2 instance
func RebootNode(nodeID, userID string) error {
	// Get node details
	node, err := repository.GetNodeByID(nodeID, userID)
	if err != nil {
		return err
	}

	// Only proceed if this is the user's node
	if node.UserID != userID {
		return fmt.Errorf("node not found or you don't have permission")
	}

	// Ensure there's an instance ID
	if node.InstanceID == "" {
		return fmt.Errorf("no EC2 instance associated with this node")
	}

	// Get AWS session
	sess, err := GetAWSSession(userID)
	if err != nil {
		return err
	}

	ec2Client := ec2.New(sess)

	// Reboot the EC2 instance
	_, err = ec2Client.RebootInstances(&ec2.RebootInstancesInput{
		InstanceIds: []*string{
			aws.String(node.InstanceID),
		},
	})

	if err != nil {
		return fmt.Errorf("failed to reboot instance: %v", err)
	}

	// Update node status
	updateNodeStatus(nodeID, "rebooting", "Rebooting the EC2 instance...")

	// Start monitoring the instance state
	go monitorInstanceStateChange(nodeID, node.InstanceID, ec2Client, "reboot")

	return nil
}

// Helper function to monitor instance state changes
func monitorInstanceStateChange(nodeID, instanceID string, ec2Client *ec2.EC2, actionType string) {
	for {
		// Wait a bit before checking status
		time.Sleep(10 * time.Second)

		// Get instance status
		result, err := ec2Client.DescribeInstances(&ec2.DescribeInstancesInput{
			InstanceIds: []*string{aws.String(instanceID)},
		})

		if err != nil {
			updateNodeWithLog(nodeID, "failed", "error", fmt.Sprintf("Failed to get instance status: %v", err), 0)
			return
		}

		if len(result.Reservations) == 0 || len(result.Reservations[0].Instances) == 0 {
			updateNodeWithLog(nodeID, "failed", "error", "Instance not found", 0)
			return
		}

		instance := result.Reservations[0].Instances[0]
		state := *instance.State.Name

		// Update status based on state and action
		switch state {
		case "running":
			if actionType == "start" || actionType == "reboot" {
				// If we were starting or rebooting, update to running
				updateNodeWithLog(nodeID, "running", "running", "Instance is now running", 100)

				// Update IP address in case it changed
				if instance.PublicIpAddress != nil {
					updateNodeIP(nodeID, *instance.PublicIpAddress)

					// Update RPC endpoint
					rpcEndpoint := fmt.Sprintf("http://%s:8899", *instance.PublicIpAddress)
					updateNodeRPCEndpoint(nodeID, rpcEndpoint)
				}
				return
			}
		case "stopped":
			if actionType == "stop" {
				// If we were stopping, update to stopped
				updateNodeWithLog(nodeID, "stopped", "stopped", "Instance is now stopped", 0)
				return
			}
		}
	}
}
