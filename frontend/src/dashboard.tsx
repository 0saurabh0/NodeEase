import { useState } from 'react';
import { BarChart3, Server, Zap, Clock, Database, Shield, Terminal, Menu, Settings, Loader, ArrowRight, Activity, Cloud } from 'lucide-react';

const NodeEaseDashboard = () => {
  const [deploymentCount, setDeploymentCount] = useState(0);
  
  const handleDeploy = () => {
    setDeploymentCount(prevCount => prevCount + 1);
  };

  // Custom logo component
  const NodeEaseLogo = () => (
    <div className="relative w-8 h-8 mr-2">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-md animate-pulse" style={{animationDuration: '3s'}}></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-4 h-4 bg-gray-900 rounded-sm rotate-45 flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-300 rounded-sm rotate-45 animate-spin" style={{animationDuration: '6s'}}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-950 p-4 flex flex-col">
        <div className="flex items-center mb-8">
          <NodeEaseLogo />
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">NodeEase</h1>
        </div>
        
        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <a href="#" className="flex items-center p-2 rounded-md bg-gray-800 text-blue-300">
                <BarChart3 className="w-5 h-5 mr-3" />
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition-colors">
                <Server className="w-5 h-5 mr-3" />
                <span>Deployments</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition-colors">
                <Zap className="w-5 h-5 mr-3" />
                <span>Performance</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition-colors">
                <Database className="w-5 h-5 mr-3" />
                <span>Storage</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition-colors">
                <Shield className="w-5 h-5 mr-3" />
                <span>Security</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition-colors">
                <Settings className="w-5 h-5 mr-3" />
                <span>Settings</span>
              </a>
            </li>
          </ul>
        </nav>
        
        <div className="mt-auto p-4 bg-gray-800 rounded-md">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">user@nodeease</p>
              <p className="text-xs text-gray-400">Free Tier</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center">
          <div className="flex items-center">
            <Menu className="w-6 h-6 mr-4 cursor-pointer" />
            <h2 className="text-xl font-semibold">Dashboard</h2>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-md hover:bg-gray-800">
              <Clock className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-md hover:bg-gray-800">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
              <span className="text-gray-900 font-medium">NE</span>
            </div>
          </div>
        </header>
        
        <main className="p-6">
          {/* Hero */}
          <div className="rounded-lg overflow-hidden mb-8">
            <div className="relative bg-gray-800 p-8 rounded-lg border border-gray-700 overflow-hidden">
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-indigo-900/20"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-700/10 to-indigo-700/10 blur-3xl"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
              
              <div className="relative max-w-3xl">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                  Deploy Solana RPC Nodes with One Click
                </h1>
                <p className="text-gray-300 mb-6">
                  NodeEase simplifies blockchain infrastructure deployment. Set up your Solana RPC node on any cloud provider in minutes, not days.
                </p>
                <button 
                  onClick={handleDeploy}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-gray-100 font-medium rounded-md hover:from-blue-600 hover:to-indigo-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                >
                  Deploy Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-blue-800/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center mb-4 relative">
                <div className="p-2 bg-blue-500/10 rounded-md mr-4">
                  <Server className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-medium">Active Deployments</h3>
              </div>
              <div className="flex items-baseline relative">
                <span className="text-3xl font-bold mr-2">{deploymentCount}</span>
                <span className="text-gray-400">nodes</span>
              </div>
              <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden relative">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${Math.min(deploymentCount * 10, 100)}%` }}></div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-indigo-800/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center mb-4 relative">
                <div className="p-2 bg-indigo-500/10 rounded-md mr-4">
                  <Activity className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-lg font-medium">Average Response</h3>
              </div>
              <div className="flex items-baseline relative">
                <span className="text-3xl font-bold mr-2">48</span>
                <span className="text-gray-400">ms</span>
              </div>
              <div className="mt-4 flex justify-between text-xs text-gray-400 relative">
                <span>Last 24h</span>
                <span className="text-indigo-400">↓ 12% from avg</span>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 relative overflow-hidden group hover:border-blue-400/50 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center mb-4 relative">
                <div className="p-2 bg-blue-400/10 rounded-md mr-4">
                  <Database className="w-6 h-6 text-blue-300" />
                </div>
                <h3 className="text-lg font-medium">RPC Requests</h3>
              </div>
              <div className="flex items-baseline relative">
                <span className="text-3xl font-bold mr-2">98.7%</span>
                <span className="text-gray-400">success rate</span>
              </div>
              <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden relative">
                <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full" style={{ width: '98.7%' }}></div>
              </div>
            </div>
          </div>
          
          {/* Cloud Providers */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
            <h3 className="text-lg font-medium mb-6 relative">Supported Cloud Providers</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
              <div className="flex items-center bg-gray-750 p-4 rounded-md border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer group">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-800 rounded-md mr-4 group-hover:from-blue-700 group-hover:to-blue-600 transition-colors">
                  <span className="text-sm font-medium">AWS</span>
                </div>
                <div>
                  <h4 className="font-medium">Amazon Web Services</h4>
                  <p className="text-xs text-gray-400 mt-1">East & West US, Europe, Asia</p>
                </div>
              </div>
              
              <div className="flex items-center bg-gray-750 p-4 rounded-md border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer group">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-800 rounded-md mr-4 group-hover:from-blue-700 group-hover:to-blue-600 transition-colors">
                  <span className="text-sm font-medium">GCP</span>
                </div>
                <div>
                  <h4 className="font-medium">Google Cloud Platform</h4>
                  <p className="text-xs text-gray-400 mt-1">All regions supported</p>
                </div>
              </div>
              
              <div className="flex items-center bg-gray-750 p-4 rounded-md border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer group">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-800 rounded-md mr-4 group-hover:from-blue-700 group-hover:to-blue-600 transition-colors">
                  <span className="text-sm font-medium">AZ</span>
                </div>
                <div>
                  <h4 className="font-medium">Microsoft Azure</h4>
                  <p className="text-xs text-gray-400 mt-1">US, EU, and APAC regions</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
              <h3 className="flex items-center text-lg font-medium mb-4 relative">
                <Zap className="w-5 h-5 mr-2 text-blue-400" />
                Core Features
              </h3>
              <ul className="space-y-3 relative">
                <li className="flex items-start">
                  <div className="mt-1 mr-3 w-4 h-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-medium">One-click Deployment</h4>
                    <p className="text-sm text-gray-400">Deploy production-ready nodes in minutes</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 mr-3 w-4 h-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-medium">Multi-cloud Support</h4>
                    <p className="text-sm text-gray-400">Deploy to AWS, GCP, or Azure</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 mr-3 w-4 h-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-medium">Performance Monitoring</h4>
                    <p className="text-sm text-gray-400">Real-time metrics and alerts</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl"></div>
              <h3 className="flex items-center text-lg font-medium mb-4 relative">
                <Cloud className="w-5 h-5 mr-2 text-indigo-400" />
                Get Started
              </h3>
              <div className="space-y-4 relative">
                <div className="px-4 py-3 rounded-md bg-gray-900 border border-gray-700 flex items-center group hover:border-blue-500/40 transition-colors">
                  <div className="mr-4 w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-400">1</span>
                  </div>
                  <span>Select cloud provider and region</span>
                </div>
                <div className="px-4 py-3 rounded-md bg-gray-900 border border-gray-700 flex items-center group hover:border-blue-500/40 transition-colors">
                  <div className="mr-4 w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-400">2</span>
                  </div>
                  <span>Configure node specifications</span>
                </div>
                <div className="px-4 py-3 rounded-md bg-gray-900 border border-gray-700 flex items-center group hover:border-blue-500/40 transition-colors">
                  <div className="mr-4 w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-400">3</span>
                  </div>
                  <span>Deploy with one click</span>
                </div>
              </div>
              <button 
                onClick={handleDeploy}
                className="mt-6 w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-gray-100 font-medium rounded-md hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center justify-center shadow-lg hover:shadow-blue-500/20"
              >
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Deploy Now
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NodeEaseDashboard;