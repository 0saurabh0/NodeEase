import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Send, Code, AlertCircle, Info } from 'lucide-react';

const RPCPlaygroundView = () => {
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState('');
  const [rpcMethod, setRpcMethod] = useState('getVersion');
  const [rpcParams, setRpcParams] = useState('[]');
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Common Solana RPC methods
  const commonMethods = [
    'getVersion',
    'getHealth',
    'getBlockHeight',
    'getSlot',
    'getBalance',
    'getBlockTime',
    'getRecentBlockhash',
  ];

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const response = await api.get('/api/nodes');
        setNodes(response.data || []);
        if (response.data && response.data.length > 0) {
          setSelectedNode(response.data[0].id);
        }
      } catch (err) {
        setError('Failed to fetch nodes');
        // Ensure nodes is at least an empty array on error
        setNodes([]);
      }
    };

    fetchNodes();
  }, []);

  useEffect(() => {
    // This ensures the button is always disabled when no node is selected
    if (nodes.length === 0) {
      setSelectedNode('');
    }
  }, [nodes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResponse(null);

    try {
      let parsedParams = [];
      try {
        parsedParams = JSON.parse(rpcParams);
      } catch (err) {
        throw new Error('Invalid JSON parameters');
      }

      const response = await api.post('/api/rpc/test', {
        nodeId: selectedNode,
        method: rpcMethod,
        params: parsedParams
      });

      setResponse(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Request failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="max-w-3xl space-y-6">
        {/* Title and Explanatory Note */}
        <div>
          <div className="bg-blue-900/30 backdrop-blur-sm rounded-lg p-3 border border-blue-800/50 flex items-start">
            <Info size={19} className="text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-blue-100 text-md">
              Test your Solana RPC endpoints with common methods. Select a node, choose a method, 
              add parameters if needed, and execute the request to verify your endpoints.
            </p>
          </div>
        </div>
        
        {/* Form Container */}
        <div className="bg-[#111827]/50 backdrop-blur-xl rounded-2xl p-6 border border-[#1E2D4A] shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-gray-300 mb-1 text-sm font-medium">Select Node</label>
                <select 
                  className="w-full bg-[#0A0F1E] border border-[#1E2D4A] text-white rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedNode}
                  onChange={(e) => setSelectedNode(e.target.value)}
                >
                  {nodes.length === 0 && <option value="">No nodes available</option>}
                  {nodes.map(node => (
                    <option key={node.id} value={node.id}>{node.name} ({node.status})</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-300 mb-1 text-sm font-medium">RPC Method</label>
              <div className="flex gap-2">
                <input
                  list="rpc-methods"
                  className="flex-1 bg-[#0A0F1E] border border-[#1E2D4A] text-white rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={rpcMethod}
                  onChange={(e) => setRpcMethod(e.target.value)}
                  placeholder="Enter RPC method"
                />
                <datalist id="rpc-methods">
                  {commonMethods.map(method => (
                    <option key={method} value={method} />
                  ))}
                </datalist>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-300 mb-1 text-sm font-medium">Parameters</label>
              <textarea
                className="w-full bg-[#0A0F1E] border border-[#1E2D4A] text-white rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                value={rpcParams}
                onChange={(e) => setRpcParams(e.target.value)}
                rows={3}
                placeholder="[]"
              />
              <p className="mt-1 text-xs text-gray-400">Enter parameters as JSON array</p>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !selectedNode}
              className="flex items-center justify-center w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium hover:from-blue-600 hover:to-indigo-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : (
                <>
                  <Send className="mr-2" size={16} />
                  Execute Request
                </>
              )}
            </button>
          </form>
        </div>
        
        {error && (
          <div className="bg-red-900/30 backdrop-blur-xl rounded-2xl p-4 border border-red-800 shadow-lg">
            <div className="flex items-center mb-2">
              <AlertCircle className="text-red-400 mr-2" size={18} />
              <h3 className="text-red-400 font-semibold">Error</h3>
            </div>
            <pre className="text-white text-sm overflow-x-auto">{error}</pre>
          </div>
        )}
        
        {response && (
          <div className="bg-[#111827]/50 backdrop-blur-xl rounded-2xl p-4 border border-[#1E2D4A] shadow-lg">
            <h3 className="text-blue-400 font-semibold mb-2 flex items-center">
              <Code className="mr-2" size={18} />
              Response
            </h3>
            <pre className="bg-[#0A0F1E] p-4 rounded-xl overflow-x-auto text-white text-sm">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default RPCPlaygroundView;