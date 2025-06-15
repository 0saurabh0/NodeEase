import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Server, 
  Activity, 
  Check, 
  AlertTriangle,
  Clock,
  Terminal,
  Zap,
  PlugZap,
  ChevronRight,
} from 'lucide-react';
import api from '../../services/api';

interface NodeSummary {
  total: number;
  running: number;
  deploying: number;
  failed: number;
}

interface RecentDeployment {
  id: string;
  name: string;
  status: string;
  type: string;
  timestamp: string;
}

const OverviewContent: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [nodeSummary, setNodeSummary] = useState<NodeSummary>({
    total: 0,
    running: 0,
    deploying: 0,
    failed: 0
  });
  const [recentDeployments, setRecentDeployments] = useState<RecentDeployment[]>([]);
  const [awsConnected, setAwsConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    // Animation delay
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const fetchData = async () => {
    try {
      // Fetch nodes data
      const nodesResponse = await api.get('/api/nodes');
      
      if (nodesResponse.data) {
        const nodes = nodesResponse.data;
        
        // Calculate node statistics
        setNodeSummary({
          total: nodes.length,
          running: nodes.filter((node: any) => node.status === 'running').length,
          deploying: nodes.filter((node: any) => node.status === 'deploying').length,
          failed: nodes.filter((node: any) => node.status === 'failed').length
        });
        
        // Get 5 most recent deployments
        const sorted = [...nodes].sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 5);
        
        setRecentDeployments(sorted.map((node: any) => ({
          id: node.id,
          name: node.name,
          status: node.status,
          type: node.nodeType === 'base' ? 'Base RPC' : 'Extended RPC',
          timestamp: node.createdAt
        })));
      }
      
      // Check AWS integration status
      const awsResponse = await api.get('/api/aws/status');
      setAwsConnected(awsResponse.data && awsResponse.data.integrated);
      
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return { dot: 'bg-green-400', text: 'text-green-400' };
      case 'deploying':
        return { dot: 'bg-amber-400 animate-pulse', text: 'text-amber-400' };
      case 'failed':
        return { dot: 'bg-red-400', text: 'text-red-400' };
      default:
        return { dot: 'bg-gray-400', text: 'text-gray-400' };
    }
  };

  return (
    <div className="max-w-7xl space-y-8">
      {/* Welcome message & quick stats row */}
      <div className={`transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-[#111827]/50 backdrop-blur-xl rounded-2xl p-8 border border-[#1E2D4A]">
          <h2 className="text-2xl font-semibold text-white mb-6">Welcome to NodeEase Dashboard</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total nodes */}
            <div className="bg-[#151C2C] rounded-xl p-6 border border-[#1E2D4A]">
              <div className="flex items-center mb-3">
                <Server className="w-5 h-5 text-blue-400 mr-2" />
                <h3 className="text-white font-medium">Total Nodes</h3>
              </div>
              <p className="text-3xl font-bold text-white">{nodeSummary.total}</p>
            </div>
            
            {/* Running nodes */}
            <div className="bg-[#151C2C] rounded-xl p-6 border border-[#1E2D4A]">
              <div className="flex items-center mb-3">
                <Check className="w-5 h-5 text-green-400 mr-2" />
                <h3 className="text-white font-medium">Running</h3>
              </div>
              <p className="text-3xl font-bold text-green-400">{nodeSummary.running}</p>
            </div>
            
            {/* Deploying nodes */}
            <div className="bg-[#151C2C] rounded-xl p-6 border border-[#1E2D4A]">
              <div className="flex items-center mb-3">
                <Clock className="w-5 h-5 text-amber-400 mr-2" />
                <h3 className="text-white font-medium">Deploying</h3>
              </div>
              <p className="text-3xl font-bold text-amber-400">{nodeSummary.deploying}</p>
            </div>
            
            {/* Failed nodes */}
            <div className="bg-[#151C2C] rounded-xl p-6 border border-[#1E2D4A]">
              <div className="flex items-center mb-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                <h3 className="text-white font-medium">Failed</h3>
              </div>
              <p className="text-3xl font-bold text-red-400">{nodeSummary.failed}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions & System Status row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className={`lg:col-span-1 transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-[#111827]/50 backdrop-blur-xl rounded-2xl p-6 border border-[#1E2D4A] h-full">
            <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/dashboard/nodes')} 
                className="w-full flex items-center justify-between bg-[#1A2235] hover:bg-[#243050] transition-colors p-4 rounded-xl text-white"
              >
                <div className="flex items-center">
                  <Server className="w-5 h-5 text-blue-400 mr-3" />
                  <span>Deploy New Node</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              
              <button 
                onClick={() => navigate('/dashboard/rpc-playground')} 
                className="w-full flex items-center justify-between bg-[#1A2235] hover:bg-[#243050] transition-colors p-4 rounded-xl text-white"
              >
                <div className="flex items-center">
                  <Terminal className="w-5 h-5 text-purple-400 mr-3" />
                  <span>RPC Playground</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              
              <button 
                onClick={() => navigate('/dashboard/integrate')} 
                className="w-full flex items-center justify-between bg-[#1A2235] hover:bg-[#243050] transition-colors p-4 rounded-xl text-white"
              >
                <div className="flex items-center">
                  <PlugZap className="w-5 h-5 text-green-400 mr-3" />
                  <span>Manage Integrations</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
        
        {/* System Status */}
        <div className={`lg:col-span-2 transition-all duration-500 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-[#111827]/50 backdrop-blur-xl rounded-2xl p-6 border border-[#1E2D4A] h-full">
            <h3 className="text-xl font-semibold text-white mb-4">System Status</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#151C2C] rounded-xl border border-[#1E2D4A]">
                <div className="flex items-center">
                  <PlugZap className="w-5 h-5 text-blue-400 mr-3" />
                  <span className="text-white">AWS Integration</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full ${awsConnected ? 'bg-green-400' : 'bg-red-400'} mr-2`} />
                  <span className={awsConnected ? 'text-green-400' : 'text-red-400'}>
                    {awsConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-[#151C2C] rounded-xl border border-[#1E2D4A]">
                <div className="flex items-center">
                  <Activity className="w-5 h-5 text-blue-400 mr-3" />
                  <span className="text-white">API Status</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-400 mr-2" />
                  <span className="text-green-400">Operational</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-[#151C2C] rounded-xl border border-[#1E2D4A]">
                <div className="flex items-center">
                  <Zap className="w-5 h-5 text-blue-400 mr-3" />
                  <span className="text-white">Solana Network</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-400 mr-2" />
                  <span className="text-green-400">Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Deployments */}
      <div className={`transition-all duration-500 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-[#111827]/50 backdrop-blur-xl rounded-2xl p-6 border border-[#1E2D4A]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Recent Deployments</h3>
            
            <button 
              onClick={() => navigate('/dashboard/nodes')} 
              className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          {recentDeployments.length > 0 ? (
            <div className="space-y-3">
              {recentDeployments.map((node) => {
                const statusColors = getStatusColor(node.status);
                
                return (
                  <div 
                    key={node.id} 
                    className="flex items-center justify-between bg-[#151C2C] rounded-xl p-4 border border-[#1E2D4A] hover:border-[#2E3D5A] transition-colors cursor-pointer"
                    onClick={() => navigate(`/dashboard/nodes/${node.id}/progress`)}
                  >
                    <div className="flex items-center">
                      <Server className="w-5 h-5 text-blue-400 mr-3" />
                      <div>
                        <h4 className="text-white font-medium">{node.name}</h4>
                        <p className="text-gray-400 text-sm">{node.type}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <p className="text-gray-400 text-sm hidden md:block">
                        {new Date(node.timestamp).toLocaleString()}
                      </p>
                      
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${statusColors.dot} mr-2`} />
                        <span className={statusColors.text}>{node.status}</span>
                      </div>
                      
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#151C2C] rounded-xl p-6 border border-[#1E2D4A] text-center">
              <Server className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-300">No deployments yet</p>
              <button 
                onClick={() => navigate('/dashboard/nodes')} 
                className="mt-4 px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-sm rounded-md inline-flex items-center"
              >
                Deploy your first node <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewContent;