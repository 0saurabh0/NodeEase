package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/0saurabh0/NodeEase/middleware"
	"github.com/0saurabh0/NodeEase/models"
	"github.com/0saurabh0/NodeEase/services"
	"github.com/0saurabh0/NodeEase/utils"
	"github.com/gorilla/mux"
)

// DeployNodeHandler handles node deployment requests
func DeployNodeHandler(w http.ResponseWriter, r *http.Request) {
	// Parse request body
	var req models.NodeDeployRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// Get user ID from context
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusInternalServerError, "Could not get user ID")
		return
	}

	// Basic validation
	if req.NodeName == "" || req.InstanceType == "" || req.Region == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Missing required fields")
		return
	}

	// Deploy the node
	nodeID, err := services.DeployNode(userID, req)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to deploy node: "+err.Error())
		return
	}

	// Return the node ID
	utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Node deployment started",
		"nodeId":  nodeID,
	})
}

// GetNodeHandler retrieves details of a specific node
func GetNodeHandler(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusInternalServerError, "Could not get user ID")
		return
	}

	// Get node ID from URL
	vars := mux.Vars(r)
	nodeID := vars["id"]

	// Get node details
	node, err := services.GetNodeByID(nodeID, userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get node: "+err.Error())
		return
	}

	// Check if node exists
	if node.ID == "" {
		utils.RespondWithError(w, http.StatusNotFound, "Node not found")
		return
	}

	// Return node details
	utils.RespondWithJSON(w, http.StatusOK, node)
}

// ListNodesHandler retrieves all nodes for a user
func ListNodesHandler(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusInternalServerError, "Could not get user ID")
		return
	}

	// Get all nodes for user
	nodes, err := services.GetNodesByUserID(userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get nodes: "+err.Error())
		return
	}

	if nodes == nil {
		nodes = []models.Node{} // Return empty array instead of nil
	}

	// Return nodes list
	utils.RespondWithJSON(w, http.StatusOK, nodes)
}

// DeleteNodeHandler deletes a node and terminates the associated AWS instance
func DeleteNodeHandler(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusInternalServerError, "Could not get user ID")
		return
	}

	// Get node ID from URL
	vars := mux.Vars(r)
	nodeID := vars["id"]

	// Delete the node
	err := services.DeleteNode(nodeID, userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to delete node: "+err.Error())
		return
	}

	// Return success
	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Node deleted successfully"})
}

// GetNodeStatusHandler retrieves detailed status and deployment logs for a node
func GetNodeStatusHandler(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusInternalServerError, "Could not get user ID")
		return
	}

	// Get node ID from URL
	vars := mux.Vars(r)
	nodeID := vars["id"]

	// Get node status and logs
	node, err := services.GetNodeWithDeploymentLogs(nodeID, userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get node status: "+err.Error())
		return
	}

	if node.ID == "" {
		utils.RespondWithError(w, http.StatusNotFound, "Node not found")
		return
	}

	// Return status and logs
	utils.RespondWithJSON(w, http.StatusOK, node)
}

// UpdateNodeStatusHandler receives status updates from nodes during deployment
func UpdateNodeStatusHandler(w http.ResponseWriter, r *http.Request) {
	// Get node ID and token from URL
	vars := mux.Vars(r)
	nodeID := vars["id"]
	token := vars["token"]

	// Parse request body
	var statusUpdate models.NodeStatusUpdate
	if err := json.NewDecoder(r.Body).Decode(&statusUpdate); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// Ensure the node ID in the URL matches the one in the body
	if statusUpdate.NodeID != nodeID {
		utils.RespondWithError(w, http.StatusBadRequest, "Node ID mismatch")
		return
	}

	// Update node status
	err := services.UpdateNodeDeploymentStatus(nodeID, token, statusUpdate)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Failed to update node status: "+err.Error())
		return
	}

	// Return success
	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Status updated successfully"})
}

// GetNodeSSHKeyHandler retrieves the SSH key for a specific node
func GetNodeSSHKeyHandler(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID := r.Context().Value(middleware.UserIDKey).(string)

	// Get node ID from URL
	vars := mux.Vars(r)
	nodeID := vars["id"]

	// Get SSH key
	sshKey, err := services.GetNodeSSHKey(nodeID, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return SSH key
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"sshKey": sshKey,
	})
}

// StartNodeHandler starts a stopped EC2 instance for a node
func StartNodeHandler(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusInternalServerError, "Could not get user ID")
		return
	}

	// Get node ID from URL
	vars := mux.Vars(r)
	nodeID := vars["id"]

	// Start the node
	err := services.StartNode(nodeID, userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to start node: "+err.Error())
		return
	}

	// Return success
	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Node start initiated"})
}

// StopNodeHandler stops a running EC2 instance for a node
func StopNodeHandler(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusInternalServerError, "Could not get user ID")
		return
	}

	// Get node ID from URL
	vars := mux.Vars(r)
	nodeID := vars["id"]

	// Stop the node
	err := services.StopNode(nodeID, userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to stop node: "+err.Error())
		return
	}

	// Return success
	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Node stop initiated"})
}

// RebootNodeHandler reboots a running EC2 instance for a node
func RebootNodeHandler(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusInternalServerError, "Could not get user ID")
		return
	}

	// Get node ID from URL
	vars := mux.Vars(r)
	nodeID := vars["id"]

	// Reboot the node
	err := services.RebootNode(nodeID, userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to reboot node: "+err.Error())
		return
	}

	// Return success
	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Node reboot initiated"})
}
