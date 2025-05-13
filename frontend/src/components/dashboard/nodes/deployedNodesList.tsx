import React from 'react';
import { Server, RefreshCw, ExternalLink } from 'lucide-react';

interface DeployedNodesListProps {
  deployedNodes: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    statusDetail?: string;
  }>;
  onDeployAnother: () => void;
  onViewNode: (nodeId: string) => void;
}

const DeployedNodesList: React.FC<DeployedNodesListProps> = ({
  deployedNodes,
  onDeployAnother,
  onViewNode
}) => {
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
      default:
        return { dot: 'bg-gray-400', text: 'text-gray-400' };
    }
  };

  return (
    <div className="mb-10">
      <h3 className="text-xl font-semibold text-white mb-6">Your Deployed Nodes</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deployedNodes.map(node => {
          const statusColors = getStatusColor(node.status);
          return (
            <div key={node.id} className="bg-[#151C2C] rounded-xl p-6 border border-[#1E2D4A]">
              <div className="flex items-center gap-3 mb-3">
                <Server className="w-5 h-5 text-blue-400" />
                <h5 className="text-white font-medium">{node.name}</h5>
                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400">
                  {node.type}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm mb-6">
                <div className={`w-2 h-2 rounded-full ${statusColors.dot}`} />
                <span className={statusColors.text}>
                  {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
                </span>
                
                {node.statusDetail && (
                  <span className="text-xs text-gray-400 ml-2">
                    {node.statusDetail}
                  </span>
                )}
              </div>
              
              <button
                onClick={() => onViewNode(node.id)}
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
    </div>
  );
};

export default DeployedNodesList;