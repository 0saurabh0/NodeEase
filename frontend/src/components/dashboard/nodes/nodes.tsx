import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { AlertCircle, Server, Check, Info } from 'lucide-react';

// Configuration presets based on RPC type
const RECOMMENDED_CONFIGS = {
  'base': {
    instanceType: 't3.2xlarge',
    diskSize: 500,
    historyLength: 'minimal',
    networkType: 'mainnet',
  },
  'extended': {
    instanceType: 'c5.4xlarge',
    diskSize: 2000,
    historyLength: 'full',
    networkType: 'mainnet',
  }
};

// AWS instance types with descriptions
const INSTANCE_TYPES = {
  't3.2xlarge': { vCPU: 8, memory: '32 GB', description: 'General purpose', recommended: 'Base RPC' },
  't3.xlarge': { vCPU: 4, memory: '16 GB', description: 'General purpose', recommended: 'Minimal' },
  'c5.4xlarge': { vCPU: 16, memory: '32 GB', description: 'Compute optimized', recommended: 'Extended RPC' },
  'm5.2xlarge': { vCPU: 8, memory: '32 GB', description: 'Memory optimized', recommended: '' },
  'r5.2xlarge': { vCPU: 8, memory: '64 GB', description: 'Memory optimized', recommended: 'Archive nodes' },
};

const NodeDeploymentView = () => {
  // AWS Integration check
  const [awsIntegrated, setAwsIntegrated] = useState(false);
  const [awsRegion, setAwsRegion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deploymentSuccess, setDeploymentSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    rpcType: 'base',
    configMode: 'recommended',
    instanceType: 't3.2xlarge',
    diskSize: 500,
    snapshots: true,
    historyLength: 'minimal', // minimal, recent, full
    networkType: 'mainnet', // mainnet, testnet, devnet
    region: '',
    nodeName: `solana-rpc-${Math.floor(Math.random() * 10000)}`
  });

  // Check AWS integration status on load
  useEffect(() => {
    const checkAWSStatus = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        if (!token) return;
        
        const response = await api.get('/api/aws/status');
        
        if (response.data && response.data.integrated) {
          setAwsIntegrated(true);
          setAwsRegion(response.data.region);
          setFormData(prev => ({ ...prev, region: response.data.region }));
        }
      } catch (error) {
        console.error('Error checking AWS status:', error);
      }
    };
    
    checkAWSStatus();
  }, []);

  // Handle changes to RPC type
  const handleRPCTypeChange = (type: string) => {
    setFormData(prevData => {
      if (prevData.configMode === 'recommended') {
        return {
          ...prevData,
          rpcType: type,
          ...RECOMMENDED_CONFIGS[type as keyof typeof RECOMMENDED_CONFIGS]
        };
      } else {
        return {
          ...prevData,
          rpcType: type
        };
      }
    });
  };

  // Handle changes to config mode
  const handleConfigModeChange = (mode: string) => {
    setFormData(prevData => {
      if (mode === 'recommended') {
        return {
          ...prevData,
          configMode: mode,
          ...RECOMMENDED_CONFIGS[prevData.rpcType as keyof typeof RECOMMENDED_CONFIGS]
        };
      } else {
        return {
          ...prevData,
          configMode: mode
        };
      }
    });
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDeploymentSuccess(false);
    
    try {
      const response = await api.post('/api/nodes/deploy', formData);
      
      setDeploymentSuccess(true);
      // Reset form or redirect to node details page
      console.log('Node deployment started:', response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to deploy node');
      console.error('Deployment error:', err);
    } finally {
      setLoading(false);
    }
  };

  // If AWS isn't integrated, show a message
  if (!awsIntegrated) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <Server className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">AWS Integration Required</h2>
        <p className="text-gray-300 mb-6">
          You need to connect your AWS account before deploying Solana nodes.
        </p>
        <button 
          onClick={() => window.location.hash = '#integrate'}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white font-medium"
        >
          Go to Integration
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white">Deploy Solana Node</h2>
      </div>

      {/* Success message */}
      {deploymentSuccess && (
        <div className="mb-8 bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-start gap-3">
          <Check className="w-5 h-5 text-green-400 mt-0.5" />
          <div>
            <p className="text-green-400 font-medium">Node deployment started successfully!</p>
            <p className="text-gray-300 text-sm mt-1">
              Your node is being provisioned. This process may take 10-15 minutes.
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-8 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Failed to start deployment</p>
            <p className="text-gray-300 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Node Type Selection */}
        <div className="bg-[#111827]/50 backdrop-blur-xl rounded-2xl p-8 border border-[#1E2D4A]">
          <h3 className="text-xl font-semibold text-white mb-6">1. Select Node Type</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div 
              className={`
                flex flex-col p-6 rounded-xl border cursor-pointer transition-all
                ${formData.rpcType === 'base' 
                  ? 'bg-blue-600/10 border-blue-500/50' 
                  : 'bg-[#151C2C] border-[#1E2D4A] hover:border-[#2E3D5A]'}
              `}
              onClick={() => handleRPCTypeChange('base')}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-4 h-4 rounded-full ${formData.rpcType === 'base' ? 'bg-blue-500' : 'border-2 border-gray-400'}`} />
                <h4 className="text-lg font-medium text-white">Base RPC</h4>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Standard RPC node with essential functionality for most dApps
              </p>
              <div className="mt-auto text-sm text-blue-400">
                Recommended for: Standard dApps, wallets, basic integrations
              </div>
            </div>
            
            <div 
              className={`
                flex flex-col p-6 rounded-xl border cursor-pointer transition-all
                ${formData.rpcType === 'extended' 
                  ? 'bg-blue-600/10 border-blue-500/50' 
                  : 'bg-[#151C2C] border-[#1E2D4A] hover:border-[#2E3D5A]'}
              `}
              onClick={() => handleRPCTypeChange('extended')}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-4 h-4 rounded-full ${formData.rpcType === 'extended' ? 'bg-blue-500' : 'border-2 border-gray-400'}`} />
                <h4 className="text-lg font-medium text-white">Extended RPC</h4>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Advanced node with full history and enhanced functionality
              </p>
              <div className="mt-auto text-sm text-blue-400">
                Recommended for: DeFi platforms, NFT marketplaces, data analytics
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Mode */}
        <div className="bg-[#111827]/50 backdrop-blur-xl rounded-2xl p-8 border border-[#1E2D4A]">
          <h3 className="text-xl font-semibold text-white mb-6">2. Configuration</h3>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="configMode"
                  className="sr-only"
                  checked={formData.configMode === 'recommended'}
                  onChange={() => handleConfigModeChange('recommended')}
                />
                <div className={`w-4 h-4 rounded-full ${formData.configMode === 'recommended' ? 'bg-blue-500' : 'border-2 border-gray-400'}`} />
                <span className="text-white">Recommended settings</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="configMode"
                  className="sr-only"
                  checked={formData.configMode === 'custom'}
                  onChange={() => handleConfigModeChange('custom')}
                />
                <div className={`w-4 h-4 rounded-full ${formData.configMode === 'custom' ? 'bg-blue-500' : 'border-2 border-gray-400'}`} />
                <span className="text-white">Custom settings</span>
              </label>
            </div>

            {/* Recommended Configuration Details */}
            {formData.configMode === 'recommended' && (
              <div className="bg-[#151C2C] rounded-xl p-6 border border-[#1E2D4A]">
                <h4 className="text-white font-medium mb-4">Recommended Configuration for {formData.rpcType === 'base' ? 'Base' : 'Extended'} RPC</h4>
                
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <span className="text-gray-400">Instance Type:</span>
                    <span className="text-white ml-2">
                      {formData.instanceType} ({INSTANCE_TYPES[formData.instanceType as keyof typeof INSTANCE_TYPES].vCPU} vCPU, {INSTANCE_TYPES[formData.instanceType as keyof typeof INSTANCE_TYPES].memory})
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Storage:</span>
                    <span className="text-white ml-2">{formData.diskSize} GB</span>
                  </div>
                  <div>
                    <span className="text-gray-400">History:</span>
                    <span className="text-white ml-2">{formData.historyLength === 'minimal' ? 'Minimal (recent slots)' : formData.historyLength === 'recent' ? 'Recent (90 days)' : 'Full'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Network:</span>
                    <span className="text-white ml-2">{formData.networkType.charAt(0).toUpperCase() + formData.networkType.slice(1)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Snapshots:</span>
                    <span className="text-white ml-2">{formData.snapshots ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Region:</span>
                    <span className="text-white ml-2">{awsRegion}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Configuration Options */}
            {formData.configMode === 'custom' && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="instanceType" className="block text-gray-300 mb-2">
                    Instance Type
                  </label>
                  <select
                    id="instanceType"
                    name="instanceType"
                    value={formData.instanceType}
                    onChange={handleInputChange}
                    className="w-full bg-[#151C2C] border border-[#1E2D4A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    {Object.entries(INSTANCE_TYPES).map(([type, details]) => (
                      <option key={type} value={type}>
                        {type} - {details.vCPU} vCPU, {details.memory}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="region" className="block text-gray-300 mb-2">
                    AWS Region
                  </label>
                  <select
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className="w-full bg-[#151C2C] border border-[#1E2D4A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value={awsRegion}>
                      {awsRegion} (From AWS Integration)
                    </option>
                    <option value="us-east-1">US East (N. Virginia)</option>
                    <option value="us-east-2">US East (Ohio)</option>
                    <option value="us-west-1">US West (N. California)</option>
                    <option value="us-west-2">US West (Oregon)</option>
                    <option value="eu-west-1">EU (Ireland)</option>
                    <option value="eu-central-1">EU (Frankfurt)</option>
                    <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="diskSize" className="block text-gray-300 mb-2">
                    Storage Size (GB)
                  </label>
                  <input
                    id="diskSize"
                    name="diskSize"
                    type="number"
                    min="500"
                    max="16000"
                    value={formData.diskSize}
                    onChange={handleInputChange}
                    className="w-full bg-[#151C2C] border border-[#1E2D4A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    {formData.rpcType === 'base' ? 'Minimum 500GB recommended' : 'Minimum 2000GB recommended for extended RPC'}
                  </p>
                </div>
                
                <div>
                  <label htmlFor="historyLength" className="block text-gray-300 mb-2">
                    History Length
                  </label>
                  <select
                    id="historyLength"
                    name="historyLength"
                    value={formData.historyLength}
                    onChange={handleInputChange}
                    className="w-full bg-[#151C2C] border border-[#1E2D4A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="minimal">Minimal (recent slots only)</option>
                    <option value="recent">Recent (90 days)</option>
                    <option value="full">Full history</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="networkType" className="block text-gray-300 mb-2">
                    Network
                  </label>
                  <select
                    id="networkType"
                    name="networkType"
                    value={formData.networkType}
                    onChange={handleInputChange}
                    className="w-full bg-[#151C2C] border border-[#1E2D4A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="mainnet">Mainnet</option>
                    <option value="testnet">Testnet</option>
                    <option value="devnet">Devnet</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="nodeName" className="block text-gray-300 mb-2">
                    Node Name
                  </label>
                  <input
                    id="nodeName"
                    name="nodeName"
                    type="text"
                    value={formData.nodeName}
                    onChange={handleInputChange}
                    className="w-full bg-[#151C2C] border border-[#1E2D4A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div className="flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="snapshots"
                      checked={formData.snapshots}
                      onChange={handleCheckboxChange}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded flex items-center justify-center ${formData.snapshots ? 'bg-blue-500' : 'bg-[#151C2C] border border-[#1E2D4A]'}`}>
                      {formData.snapshots && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-white">Enable snapshots (recommended)</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cost Estimation */}
        <div className="bg-[#111827]/50 backdrop-blur-xl rounded-2xl p-8 border border-[#1E2D4A]">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-xl font-semibold text-white">3. Estimated Cost</h3>
            <div className="relative group">
              <Info className="w-5 h-5 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-[#151C2C] border border-[#1E2D4A] rounded-xl w-64 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-10 text-sm text-gray-300">
                This is an estimated monthly cost based on AWS pricing. Actual costs may vary.
              </div>
            </div>
          </div>
          
          <div className="bg-[#151C2C] rounded-xl p-6 border border-[#1E2D4A]">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <span className="text-gray-400">EC2 Instance:</span>
                <span className="text-white ml-2">$250.00/month</span>
              </div>
              <div>
                <span className="text-gray-400">Storage:</span>
                <span className="text-white ml-2">${(formData.diskSize * 0.1).toFixed(2)}/month</span>
              </div>
              <div>
                <span className="text-gray-400">Data Transfer:</span>
                <span className="text-white ml-2">$50.00/month (estimated)</span>
              </div>
              <div>
                <span className="text-gray-400">Snapshots:</span>
                <span className="text-white ml-2">${formData.snapshots ? '15.00' : '0.00'}/month</span>
              </div>
              <div className="col-span-2 pt-3 mt-3 border-t border-[#1E2D4A]">
                <span className="text-gray-300 font-semibold">Total Estimated:</span>
                <span className="text-white font-bold ml-2">
                  ${(formData.diskSize * 0.1 + (formData.snapshots ? 315 : 300)).toFixed(2)}/month
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Deploy Button */}
        <div className="flex justify-center mt-10">
          <button
            type="submit"
            disabled={loading || deploymentSuccess}
            className={`
              px-10 py-4 rounded-xl font-medium text-lg
              ${loading || deploymentSuccess
                ? 'bg-[#1E2D4A]/50 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-90 hover:scale-[1.02] transition-all duration-300'
              }
            `}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                Deploying...
              </span>
            ) : deploymentSuccess ? (
              <span className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                Deployment Started
              </span>
            ) : (
              'Deploy Solana Node'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NodeDeploymentView;