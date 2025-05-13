import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Server, Check, Info, ExternalLink } from 'lucide-react';
import DeployedNodesList from './deployedNodesList';

// AWS Blog reference
const AWS_BLOG_URL = 'https://aws.amazon.com/blogs/web3/run-solana-nodes-on-aws/';

// Configuration presets based on RPC type
const RECOMMENDED_CONFIGS = {
  'base': {
    instanceType: 'r7a.16xlarge',
    diskSize: 500,
    historyLength: 'minimal',
    snapshots: true,
    networkType: 'mainnet',
  },
  'extended': {
    instanceType: 'r7a.24xlarge',
    diskSize: 2000,
    historyLength: 'full',
    snapshots: true,
    networkType: 'mainnet',
  }
};

// AWS instance types with descriptions
const INSTANCE_TYPES = {
  'r7a.16xlarge': { vCPU: 64, memory: '512 GB', description: 'Memory optimized', recommended: 'Base RPC' },
  'r7a.24xlarge': { vCPU: 96, memory: '768 GB', description: 'Memory optimized', recommended: 'Extended RPC' },
  'i7ie.16xlarge': { vCPU: 64, memory: '576 GB', description: 'Memory optimized', recommended: 'Base RPC (Alternative)' },
  'i7ie.24xlarge': { vCPU: 96, memory: '768 GB', description: 'Memory optimized', recommended: 'Extended RPC (Alternative)' },
};

const INSTANCE_COSTS = {
  'r7a.16xlarge': 250,
  'r7a.24xlarge': 350,
  'i7ie.16xlarge': 300,
  'i7ie.24xlarge': 400,
};

interface NodeDeploymentViewProps {
  navigateToIntegrate?: () => void;
}

const NodeDeploymentView: React.FC<NodeDeploymentViewProps> = ({ navigateToIntegrate }) => {
  // AWS Integration check
  const [awsIntegrated, setAwsIntegrated] = useState(false);
  const [awsRegion, setAwsRegion] = useState('');
  const [loading, setLoading] = useState(false);
  const [deploymentSuccess, setDeploymentSuccess] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [deployedNodes, setDeployedNodes] = useState<Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    statusDetail?: string;
  }>>([]);

  // Form state
  const [formData, setFormData] = useState({
    rpcType: 'base',
    configMode: 'recommended',
    instanceType: 'r7a.16xlarge',
    diskSize: 500,
    snapshots: true,
    historyLength: 'minimal', // minimal, recent, full
    networkType: 'mainnet', // mainnet, testnet, devnet
    region: '',
    nodeName: `solana-rpc-${Math.floor(Math.random() * 10000)}`
  });

  const [showDeploymentForm, setShowDeploymentForm] = useState(true);

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

  // Calculate estimated cost whenever relevant form values change
  useEffect(() => {
    const calculateCost = () => {
      const instanceCost = INSTANCE_COSTS[formData.instanceType as keyof typeof INSTANCE_COSTS] || 0;
      const storageCost = formData.diskSize * 0.1;
      const dataCost = 80;
      const snapshotCost = formData.snapshots ? 25 : 0;
      
      return instanceCost + storageCost + dataCost + snapshotCost;
    };
    
    setEstimatedCost(calculateCost());
  }, [formData.instanceType, formData.diskSize, formData.snapshots]);

  // Handle changes to RPC type
  const handleRPCTypeChange = (type: string) => {
    if (formData.configMode === 'recommended') {
      // Apply all recommended settings for this RPC type
      setFormData({
        ...formData,
        rpcType: type,
        ...RECOMMENDED_CONFIGS[type as keyof typeof RECOMMENDED_CONFIGS],
      });
    } else {
      // Just change the RPC type in custom mode
      setFormData({
        ...formData,
        rpcType: type,
      });
    }
  };

  // Handle changes to config mode
  const handleConfigModeChange = (mode: string) => {
    if (mode === 'recommended') {
      // Apply all recommended settings for the current RPC type
      setFormData({
        ...formData,
        configMode: mode,
        ...RECOMMENDED_CONFIGS[formData.rpcType as keyof typeof RECOMMENDED_CONFIGS],
      });
    } else {
      // Switch to custom mode but keep current values
      setFormData({
        ...formData,
        configMode: mode,
      });
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let updatedValue = value;
    
    // Handle numeric inputs
    if (name === 'diskSize') {
      updatedValue = Math.max(parseInt(value) || 0, 0).toString();
    }
    
    setFormData(prev => ({ ...prev, [name]: updatedValue }));
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
    setDeploymentSuccess(false);
    
    try {
      const response = await api.post('/api/nodes/deploy', formData);
      setDeploymentSuccess(true);
      setShowDeploymentForm(false);

      // Add the new node to the list
      const newNode = {
        id: response.data.nodeId,
        name: formData.nodeName,
        type: formData.rpcType === 'base' ? 'Base RPC' : 'Extended RPC',
        status: 'deploying',
      };
      
      setDeployedNodes(prev => [newNode, ...prev]);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      console.error('Failed to deploy node:', error.response?.data?.error || error.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Add these handler functions
  const handleDeployAnother = () => {
    setDeploymentSuccess(false);
    setShowDeploymentForm(true);
    window.scrollTo({
      top: document.getElementById('deployment-form')?.offsetTop || 0,
      behavior: 'smooth'
    });
  };

  const handleViewNode = (nodeId: string) => {
    // Navigate to node details page
    window.location.href = `/dashboard/nodes/${nodeId}`;
  };

  // Fetch existing nodes when the component mounts
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const response = await api.get('/api/nodes');
        if (response.data) {
          const formattedNodes = response.data.map((node: { id: string; name: string; nodeType: string; status: string; statusDetail?: string }) => ({
            id: node.id,
            name: node.name,
            type: node.nodeType === 'base' ? 'Base RPC' : 'Extended RPC',
            status: node.status,
            statusDetail: node.statusDetail || undefined,
          }));
          setDeployedNodes(formattedNodes);
        }
      } catch (error) {
        console.error('Failed to fetch nodes:', error);
      }
    };
    
    if (awsIntegrated) {
      fetchNodes();
    }
  }, [awsIntegrated]);

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
          onClick={navigateToIntegrate} 
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white font-medium"
        >
          Go to Integration
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      {/* AWS Blog Link - Enhanced */}
      <div className="mb-8 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/40 rounded-xl p-5 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="bg-blue-500/20 p-3 rounded-xl">
            <Info className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">Solana on AWS Resources</h3>
            <p className="text-gray-300 text-sm">
              Learn about node types, infrastructure requirements, and best practices for running production-grade Solana nodes.
            </p>
            <div className="mt-3">
              <a 
                href={AWS_BLOG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 hover:text-blue-200 transition-all px-4 py-2 rounded-lg font-medium"
              >
                Read the AWS guide <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* List of Deployed Nodes */}
      <DeployedNodesList 
        deployedNodes={deployedNodes}
        onDeployAnother={handleDeployAnother}
        onViewNode={handleViewNode}
      />

      {/* Deployment Form */}
      {showDeploymentForm && (
        <form id="deployment-form" className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          <div className="bg-[#111827]/50 backdrop-blur-xl rounded-2xl p-8 border border-[#1E2D4A]">
            <h3 className="text-xl font-semibold text-white mb-6">1. Select Node Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Standard RPC node that processes most JSON RPC API calls, except for full account scans and SPL token queries. Exposes HTTP and WebSocket endpoints for dApp interaction.
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
                  Advanced node with secondary indexes that can process all JSON RPC API methods, including full account scans and SPL token queries. Requires 512GB-1TB RAM.
                </p>
                <div className="mt-auto text-sm text-blue-400">
                  Recommended for: DeFi platforms, NFT marketplaces, data analytics
                </div>
              </div>
            </div>
          </div>

          {/* Configuration and Summary side by side */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            {/* 2. Configuration (left) */}
            <div className="xl:col-span-3">
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

                  {/* Always visible mandatory fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="nodeName" className="block text-gray-300 mb-2">
                        Node Name <span className="text-blue-400">*</span>
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
                    
                    <div>
                      <label htmlFor="networkType" className="block text-gray-300 mb-2">
                        Network <span className="text-blue-400">*</span>
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
                  </div>

                  {/* Recommended Configuration Details */}
                  {formData.configMode === 'recommended' && (
                    <div className="bg-[#151C2C] rounded-xl p-6 border border-[#1E2D4A]">
                      <h4 className="text-white font-medium mb-4">Recommended Configuration for {formData.rpcType === 'base' ? 'Base' : 'Extended'} RPC</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div>
                          <span className="text-gray-400">Instance Type:</span>
                          <span className="text-white ml-2">
                            {formData.instanceType} ({INSTANCE_TYPES[formData.instanceType as keyof typeof INSTANCE_TYPES]?.vCPU || '64'} vCPU, {INSTANCE_TYPES[formData.instanceType as keyof typeof INSTANCE_TYPES]?.memory || '512 GB'})
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              {/* 3. Estimated Monthly Cost (left, below config) */}
              <div className="bg-[#111827]/50 backdrop-blur-xl rounded-2xl p-8 border border-[#1E2D4A] mt-8">
                <div className="flex items-center gap-2 mb-6">
                  <h3 className="text-xl font-semibold text-white">3. Estimated Monthly Cost</h3>
                  <div className="relative group">
                    <Info className="w-5 h-5 text-blue-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-4 bg-[#151C2C] border border-[#1E2D4A] rounded-xl w-80 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-10 text-sm text-gray-300">
                      <p>This is an estimated monthly cost based on AWS on-demand pricing.</p>
                      <p className="mt-2">Costs may vary based on:</p>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li>Actual usage patterns</li>
                        <li>Data transfer volume</li>
                        <li>AWS region selected</li>
                        <li>AWS pricing changes</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-[#151C2C] rounded-xl p-6 border border-[#1E2D4A]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">EC2 Instance:</span>
                      <span className="text-white font-medium">
                        ${INSTANCE_COSTS[formData.instanceType as keyof typeof INSTANCE_COSTS]?.toFixed(2) || '250.00'}/month
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">EBS Storage:</span>
                        <span className="text-xs text-gray-500">({formData.diskSize} GB)</span>
                      </div>
                      <span className="text-white font-medium">
                        ${(formData.diskSize * 0.1).toFixed(2)}/month
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Data Transfer:</span>
                      <span className="text-white font-medium">~$80.00/month</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Snapshots:</span>
                      <span className="text-white font-medium">
                        ${formData.snapshots ? '25.00' : '0.00'}/month
                      </span>
                    </div>
                    
                    <div className="col-span-1 md:col-span-2 pt-4 mt-2 border-t border-[#1E2D4A]">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <span className="text-gray-300 font-semibold mb-1 sm:mb-0">Total Estimated:</span>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-white">
                            ${estimatedCost.toFixed(2)}
                          </span>
                          <span className="text-gray-400 text-sm ml-1">/month</span>
                        </div>
                      </div>
                      <p className="text-amber-400/70 text-xs mt-3">
                        * These are approximate costs. Consider reserved instances for production deployments to reduce costs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Summary (right, next to config and cost) */}
            <div className="xl:col-span-2">
              <div className="bg-gradient-to-tr from-[#b993f4] to-[#43e97b] rounded-2xl p-8 shadow-lg sticky top-6 relative">
                {/* Absolutely positioned Solana logo in the top right */}
                <div className="absolute top-6 right-6">
                  <div className="w-20 h-20">
                    <img 
                      src="/sol-blue-grad.jpeg" 
                      alt="Solana" 
                      className="w-20 h-20 object-contain rounded-full drop-shadow-lg"
                      style={{
                        filter: 'drop-shadow(0 0 12px rgba(0, 255, 255, 0.45))'
                      }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://solana.com/src/img/branding/solanaLogoMark.svg";
                      }}
                    />
                  </div>
                </div>
                
                {/* Summary content starts at the top with no extra space */}
                <h2 className="text-2xl font-bold mb-6 text-black/80">Summary</h2>
                <div className="space-y-4 text-black/80 pr-24">
                  <div>
                    <span className="font-semibold">Node Name:</span>
                    <span className="ml-2">{formData.nodeName}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Protocol:</span>
                    <span className="ml-2">Solana</span>
                  </div>
                  <div>
                    <span className="font-semibold">Network:</span>
                    <span className="ml-2">{formData.networkType}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Node Type:</span>
                    <span className="ml-2">{formData.rpcType === 'base' ? 'Base RPC' : 'Extended RPC'}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Instance:</span>
                    <span className="ml-2">{formData.instanceType}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Storage:</span>
                    <span className="ml-2">{formData.diskSize} GB</span>
                  </div>
                  <div>
                    <span className="font-semibold">History:</span>
                    <span className="ml-2">
                      {formData.historyLength === 'minimal'
                        ? 'Minimal'
                        : formData.historyLength === 'recent'
                        ? 'Recent'
                        : 'Full'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Snapshots:</span>
                    <span className="ml-2">{formData.snapshots ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Region:</span>
                    <span className="ml-2">{formData.region || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="mt-8">
                  <span className="font-semibold">Est. Monthly Cost:</span>
                  <span className="ml-2 text-lg font-bold">${estimatedCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Deploy Button (full width, below everything) */}
          <div className="flex justify-center mt-10">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || deploymentSuccess}
              className={`
                px-12 py-4 rounded-xl font-medium text-lg max-w-md
                ${loading || deploymentSuccess
                  ? 'bg-[#1E2D4A]/50 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-90 hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-blue-500/20'
                }
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                  Deploying...
                </span>
              ) : deploymentSuccess ? (
                <span className="flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  Deployment Started
                </span>
              ) : (
                "Deploy Solana Node"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default NodeDeploymentView;