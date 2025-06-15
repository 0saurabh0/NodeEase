import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  BarChart, 
  Clock, 
  Server, 
  AlarmClock, 
  Cpu,
  HardDrive,
  Network,
  ArrowRight,
  AlertTriangle,
  Info,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import api from '../../services/api';

interface NodeMetrics {
  id: string;
  name: string;
  status: string;
  cpu: number;
  memory: number;
  disk: number;
  transactions: number;
  uptime: string;
  lastUpdated: string;
  alerts: number;
}

const MonitoringView: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nodes, setNodes] = useState<NodeMetrics[]>([]);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const response = await api.get('/api/nodes');
      
      if (response.data) {
        // Transform node data into metrics format
        // In a real application, you would have a dedicated endpoint for node metrics
        const nodesWithMetrics = response.data.map((node: any) => ({
          id: node.id,
          name: node.name,
          status: node.status,
          cpu: Math.floor(Math.random() * 100), // Placeholder for real metrics
          memory: Math.floor(Math.random() * 100), // Placeholder for real metrics
          disk: Math.floor(Math.random() * 100), // Placeholder for real metrics
          transactions: Math.floor(Math.random() * 1000) + 500, // Placeholder for real metrics
          uptime: formatUptime(Math.floor(Math.random() * 864000)), // Placeholder for real metrics (max 10 days in seconds)
          lastUpdated: new Date().toISOString(),
          alerts: node.status === 'running' ? Math.floor(Math.random() * 2) : 0 // Placeholder for real alerts
        }));
        
        setNodes(nodesWithMetrics);
        setErrorMessage(null);
      }
    } catch (error) {
      console.error("Failed to fetch monitoring data:", error);
      setErrorMessage("Failed to fetch node monitoring data. Please try again later.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Animation delay
    setTimeout(() => setIsLoaded(true), 100);
    
    // Set up regular polling for fresh metrics
    const intervalId = setInterval(fetchData, 30000); // Update every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
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

  const getUsageColor = (percentage: number) => {
    if (percentage < 70) return 'text-green-400';
    if (percentage < 90) return 'text-amber-400';
    return 'text-red-400';
  };

  const toggleNodeDetails = (nodeId: string) => {
    if (activeNodeId === nodeId) {
      setActiveNodeId(null);
    } else {
      setActiveNodeId(nodeId);
    }
  };

  return (
    <div className="max-w-7xl space-y-8">
      {/* Header with refresh button */}
      <div className={`transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Node Monitoring</h2>
          <button 
            onClick={() => fetchData()} 
            className={`flex items-center gap-2 px-4 py-2 bg-[#1A2235] hover:bg-[#243050] transition-colors rounded-lg text-white ${refreshing ? 'opacity-50' : ''}`}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Error message if any */}
        {errorMessage && (
          <div className="mb-6 bg-red-900/30 backdrop-blur-sm rounded-xl p-4 border border-red-700/30">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-red-200">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Information panel */}
        <div className="bg-[#111827]/50 backdrop-blur-xl rounded-2xl p-6 border border-[#1E2D4A] mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-blue-500/20 p-3 rounded-xl">
              <Info className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Node Monitoring</h3>
              <p className="text-gray-300">
                Monitor the health and performance of your deployed Solana nodes. 
                View real-time metrics and receive alerts when issues are detected.
              </p>
              {/* Coming soon badge */}
              <div className="mt-3 inline-block px-3 py-1 bg-amber-500/20 text-amber-400 text-sm rounded-md border border-amber-500/30">
                🚀 Detailed AWS CloudWatch metrics integration coming soon!
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary metrics */}
      <div className={`transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total nodes */}
          <div className="bg-[#111827]/50 backdrop-blur-xl rounded-2xl p-6 border border-[#1E2D4A]">
            <div className="flex items-center mb-3">
              <Server className="w-5 h-5 text-blue-400 mr-3" />
              <h3 className="text-white font-medium">Total Nodes</h3>
            </div>
            <p className="text-3xl font-bold text-white">{nodes.length}</p>
          </div>

          {/* Active nodes */}
          <div className="bg-[#111827]/50 backdrop-blur-xl rounded-2xl p-6 border border-[#1E2D4A]">
            <div className="flex items-center mb-3">
              <Activity className="w-5 h-5 text-green-400 mr-3" />
              <h3 className="text-white font-medium">Active Nodes</h3>
            </div>
            <p className="text-3xl font-bold text-green-400">
              {nodes.filter(node => node.status === 'running').length}
            </p>
          </div>
        </div>
      </div>

      {/* Node monitoring list */}
      <div className={`transition-all duration-500 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-[#111827]/50 backdrop-blur-xl rounded-2xl p-6 border border-[#1E2D4A]">
          <h3 className="text-xl font-semibold text-white mb-6">Node Status & Metrics</h3>

          {nodes.length > 0 ? (
            <div className="space-y-4">
              {nodes.map(node => {
                const statusColors = getStatusColor(node.status);
                const isActive = activeNodeId === node.id;
                
                return (
                  <div key={node.id} className="bg-[#151C2C] rounded-xl border border-[#1E2D4A]">
                    {/* Node header - always visible */}
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#1A2235] transition-colors"
                      onClick={() => toggleNodeDetails(node.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Server className="w-5 h-5 text-blue-400" />
                        <div>
                          <h4 className="text-white font-medium">{node.name}</h4>
                          <div className="flex items-center mt-1">
                            <div className={`w-2 h-2 rounded-full ${statusColors.dot} mr-2`} />
                            <span className={`text-sm ${statusColors.text}`}>
                              {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
                            </span>
                            {node.alerts > 0 && (
                              <span className="ml-3 px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-400">
                                {node.alerts} {node.alerts === 1 ? 'Alert' : 'Alerts'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isActive ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    {/* Expanded metrics - visible when active */}
                    {isActive && (
                      <div className="px-4 pb-4 pt-2 border-t border-[#1E2D4A]">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* CPU Usage */}
                          <div className="bg-[#111827]/50 backdrop-blur-sm rounded-xl p-4 border border-[#1E2D4A]">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <Cpu className="w-4 h-4 text-blue-400 mr-2" />
                                <span className="text-gray-300 text-sm">CPU Usage</span>
                              </div>
                              <span className={`text-sm font-medium ${getUsageColor(node.cpu)}`}>
                                {node.cpu}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-[#1E2D4A] rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  node.cpu < 70 ? 'bg-green-500' : 
                                  node.cpu < 90 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${node.cpu}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          {/* Memory Usage */}
                          <div className="bg-[#111827]/50 backdrop-blur-sm rounded-xl p-4 border border-[#1E2D4A]">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <HardDrive className="w-4 h-4 text-purple-400 mr-2" />
                                <span className="text-gray-300 text-sm">Memory Usage</span>
                              </div>
                              <span className={`text-sm font-medium ${getUsageColor(node.memory)}`}>
                                {node.memory}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-[#1E2D4A] rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  node.memory < 70 ? 'bg-green-500' : 
                                  node.memory < 90 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${node.memory}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          {/* Disk Usage */}
                          <div className="bg-[#111827]/50 backdrop-blur-sm rounded-xl p-4 border border-[#1E2D4A]">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <HardDrive className="w-4 h-4 text-green-400 mr-2" />
                                <span className="text-gray-300 text-sm">Disk Usage</span>
                              </div>
                              <span className={`text-sm font-medium ${getUsageColor(node.disk)}`}>
                                {node.disk}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-[#1E2D4A] rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  node.disk < 70 ? 'bg-green-500' : 
                                  node.disk < 90 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${node.disk}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          {/* Network/TPS */}
                          <div className="bg-[#111827]/50 backdrop-blur-sm rounded-xl p-4 border border-[#1E2D4A]">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <Network className="w-4 h-4 text-blue-400 mr-2" />
                                <span className="text-gray-300 text-sm">Transactions/s</span>
                              </div>
                              <span className="text-sm font-medium text-blue-400">
                                {node.transactions}
                              </span>
                            </div>
                            <div className="w-full h-2 bg-[#1E2D4A] rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full bg-blue-500"
                                style={{ width: `${Math.min(node.transactions / 10, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Additional data */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          {/* Uptime */}
                          <div className="bg-[#111827]/50 backdrop-blur-sm rounded-xl p-4 border border-[#1E2D4A] flex items-center">
                            <Clock className="w-4 h-4 text-blue-400 mr-3" />
                            <div>
                              <p className="text-gray-300 text-xs">Uptime</p>
                              <p className="text-white font-medium">{node.uptime}</p>
                            </div>
                          </div>
                          
                          {/* Last Updated */}
                          <div className="bg-[#111827]/50 backdrop-blur-sm rounded-xl p-4 border border-[#1E2D4A] flex items-center">
                            <AlarmClock className="w-4 h-4 text-blue-400 mr-3" />
                            <div>
                              <p className="text-gray-300 text-xs">Last Updated</p>
                              <p className="text-white font-medium">
                                {new Date(node.lastUpdated).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          
                          {/* View Details Button */}
                          <div className="bg-[#111827]/50 backdrop-blur-sm rounded-xl p-4 border border-[#1E2D4A] flex items-center justify-center">
                            <button
                              onClick={() => navigate(`/dashboard/nodes/${node.id}/progress`)}
                              className="px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-sm rounded-md inline-flex items-center"
                            >
                              View Details <ArrowRight className="w-3 h-3 ml-1" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#151C2C] rounded-xl p-6 border border-[#1E2D4A] text-center">
              <Server className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-300">No nodes deployed yet</p>
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

export default MonitoringView;