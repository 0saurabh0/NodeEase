import React, { useState } from 'react';
import { Server, RefreshCw, ExternalLink, Download, MoreVertical, Trash2, X, Play, Square, RotateCw } from 'lucide-react';
import api from '../../../services/api';
import { useNavigate } from 'react-router-dom';

interface DeployedNodesListProps {
  deployedNodes: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    statusDetail?: string;
    latestProgress?: number;
    latestStep?: string;
    latestMessage?: string;
    ipAddress?: string;
  }>;
  onDeployAnother: () => void;
  onViewNode: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void; 
  onNodeAction?: (nodeId: string, status: string) => void; // New prop for node actions
}

const DeployedNodesList: React.FC<DeployedNodesListProps> = ({
  deployedNodes,
  onDeployAnother,
  onViewNode,
  onDeleteNode,
  onNodeAction,
}) => {
  const [sshKey, setSSHKey] = useState<string | null>(null);
  const [loadingSSHKey, setLoadingSSHKey] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const navigate = useNavigate();

  if (deployedNodes.length === 0) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'deploying':
        return { dot: 'bg-amber-400 animate-pulse', text: 'text-amber-400' };
      case 'running':
        return { dot: 'bg-green-400', text: 'text-green-400' };
      case 'initializing':
        return { dot: 'bg-blue-400 animate-pulse', text: 'text-blue-400' };
      case 'failed':
        return { dot: 'bg-red-400', text: 'text-red-400' };
      case 'stopped':
        return { dot: 'bg-gray-400', text: 'text-gray-400' };
      case 'stopping':
        return { dot: 'bg-gray-400 animate-pulse', text: 'text-gray-400' };
      case 'starting':
        return { dot: 'bg-amber-400 animate-pulse', text: 'text-amber-400' };
      case 'rebooting':
        return { dot: 'bg-blue-400 animate-pulse', text: 'text-blue-400' };
      default:
        return { dot: 'bg-gray-400', text: 'text-gray-400' };
    }
  };

  const getSSHKey = async (nodeId: string) => {
    setLoadingSSHKey(true);
    setSelectedNodeId(nodeId);
    try {
      const response = await api.get(`/api/nodes/${nodeId}/ssh-key`);
      setSSHKey(response.data.sshKey);
    } catch (error) {
      console.error('Failed to get SSH key:', error);
    } finally {
      setLoadingSSHKey(false);
    }
  };

  const downloadSSHKey = () => {
    if (!sshKey) return;
    
    const element = document.createElement('a');
    const file = new Blob([sshKey], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `node_${selectedNodeId}_private_key.pem`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const toggleMenu = (nodeId: string) => {
    setOpenMenuId(openMenuId === nodeId ? null : nodeId);
  };

  const handleDeleteClick = async (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    setOpenMenuId(null); // Close the dropdown
    
    // Use browser's native confirm dialog
    const confirmed = window.confirm('Are you sure you want to delete this node? This will terminate the instance and remove all associated resources.');
    
    if (confirmed) {
      try {
        await api.delete(`/api/nodes/${nodeId}`);
        
        // Call the onDeleteNode callback to update the UI
        if (onDeleteNode) {
          onDeleteNode(nodeId);
        }
      } catch (error) {
        console.error('Failed to delete node:', error);
      }
    }
  };

  const handleNodeAction = async (nodeId: string, action: 'start' | 'stop' | 'reboot', e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    setOpenMenuId(null); // Close the dropdown
    
    const actionLabels = {
      'start': 'start',
      'stop': 'stop',
      'reboot': 'reboot'
    };
    
    // Use browser's native confirm dialog
    const confirmed = window.confirm(`Are you sure you want to ${actionLabels[action]} this node?`);
    
    if (confirmed) {
      try {
        await api.post(`/api/nodes/${nodeId}/${action}`);
        
        // Update the node status locally to provide immediate feedback
        const updatedStatus = action === 'start' ? 'starting' : 
                            action === 'stop' ? 'stopping' : 
                            'rebooting';
                            
        // Call the onNodeAction callback to update the UI
        if (onNodeAction) {
          onNodeAction(nodeId, updatedStatus);
        }
      } catch (error) {
        console.error(`Failed to ${action} node:`, error);
        alert(`Failed to ${action} the node. Please try again.`);
      }
    }
  };

  return (
    <div className="mb-10">
      <h3 className="text-xl font-semibold text-white mb-6">Your Deployed Nodes</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deployedNodes.map(node => {
          const statusColors = getStatusColor(node.status);
          
          return (
            <div key={node.id} className="bg-[#151C2C] rounded-xl p-6 border border-[#1E2D4A] relative">
              {/* 3-dot menu button */}
              <div className="absolute top-4 right-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMenu(node.id);
                  }} 
                  className="p-1 hover:bg-[#243050] rounded-md transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
                
                {/* Dropdown menu */}
                {openMenuId === node.id && (
                  <div className="absolute right-0 mt-1 w-40 bg-[#151C2C] border border-[#1E2D4A] rounded-md shadow-lg z-10">
                    {/* Only show start action if node is stopped */}
                    {node.status === 'stopped' && (
                      <button
                        onClick={(e) => handleNodeAction(node.id, 'start', e)}
                        className="w-full text-left px-4 py-2 text-green-400 hover:bg-[#1A2235] flex items-center gap-2 text-sm"
                      >
                        <Play className="w-4 h-4" /> Start
                      </button>
                    )}
                    
                    {/* Only show stop and reboot actions if node is running */}
                    {node.status === 'running' && (
                      <>
                        <button
                          onClick={(e) => handleNodeAction(node.id, 'stop', e)}
                          className="w-full text-left px-4 py-2 text-amber-400 hover:bg-[#1A2235] flex items-center gap-2 text-sm"
                        >
                          <Square className="w-4 h-4" /> Stop
                        </button>
                        <button
                          onClick={(e) => handleNodeAction(node.id, 'reboot', e)}
                          className="w-full text-left px-4 py-2 text-blue-400 hover:bg-[#1A2235] flex items-center gap-2 text-sm"
                        >
                          <RotateCw className="w-4 h-4" /> Reboot
                        </button>
                      </>
                    )}
                    
                    {/* Delete action always available */}
                    <button
                      onClick={(e) => handleDeleteClick(node.id, e)}
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-[#1A2235] flex items-center gap-2 text-sm border-t border-[#1E2D4A]"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3 mb-3">
                <Server className="w-5 h-5 text-blue-400" />
                <h5 className="text-white font-medium">{node.name}</h5>
                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400">
                  {node.type}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm mb-3">
                <div className={`w-2 h-2 rounded-full ${statusColors.dot}`} />
                <span className={statusColors.text}>
                  {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
                </span>
                
                {/* SSH Key Button - Moved to right side and changed color to purple */}
                {node.status === 'running' && (
                  <div className="ml-auto">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        getSSHKey(node.id);
                      }}
                      className="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-xs rounded-md flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3 h-3" /> SSH Key
                    </button>
                  </div>
                )}
              </div>
              
              {/* Status detail for all nodes */}
              {node.statusDetail && (
                <div className="text-xs text-gray-400 mb-4">
                  {node.statusDetail}
                </div>
              )}

              <button
                onClick={() => navigate(`/dashboard/nodes/${node.id}/progress`)}
                className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-[#1A2235] border border-[#2A3B5A] rounded-lg text-white hover:bg-[#243050] transition-colors mb-2"
              >
                <ExternalLink className="w-4 h-4" /> View Details
              </button>
            </div>
          );
        })}
        
        {/* Deploy Another Node block */}
        <div 
          className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-xl p-6 border border-blue-500/30 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gradient-to-br hover:from-blue-900/40 hover:to-indigo-900/40 transition-all"
          onClick={onDeployAnother}
        >
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
            <RefreshCw className="w-6 h-6 text-blue-400" />
          </div>
          <h5 className="text-white font-medium mb-2">Deploy Another Node</h5>
          <p className="text-gray-400 text-sm">Add a new Solana node to your infrastructure</p>
        </div>
      </div>

      {sshKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#111827]/95 border border-[#1E2D4A] rounded-2xl shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-[#1E2D4A]">
              <h2 className="text-xl font-semibold text-white">SSH Private Key</h2>
              <button onClick={() => setSSHKey(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-[#0A0F1E] p-4 rounded-xl mb-4 overflow-auto max-h-96">
                <pre className="text-gray-300 text-xs font-mono">{sshKey}</pre>
              </div>
              <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-700/30 mb-6">
                <p className="text-amber-200 text-sm">
                  This is your private SSH key. Save it securely as it won't be shown again. Use it to connect to your node with:
                  <br />
                  <code className="bg-black/30 px-2 py-1 rounded mt-2 inline-block">
                    ssh -i path/to/key.pem ubuntu@{deployedNodes.find(node => node.id === selectedNodeId)?.ipAddress || 'your-node-ip'}
                  </code>
                </p>
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={downloadSSHKey}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 hover:from-purple-600 hover:to-indigo-700 transition-colors"
                >
                  <Download className="w-4 h-4" /> Download Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeployedNodesList;