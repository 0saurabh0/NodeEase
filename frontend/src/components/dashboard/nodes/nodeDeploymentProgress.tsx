import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Server, TerminalSquare, Terminal, RefreshCw, Copy, Eye, EyeOff, ArrowLeft, ExternalLink, CheckCircle, X, Download, BookOpen } from 'lucide-react';
import api from '../../../services/api';

interface NodeDeploymentProgressProps {
  nodeId?: string;
  onDeploymentComplete?: () => void;
  standalone?: boolean;
}

interface LogEntry {
  timestamp: string;
  step: string;
  message: string;
  progress: number;
}

interface NodeDetails {
  id: string;
  name: string;
  instanceType: string;
  region: string;
  ipAddress?: string;
  rpcEndpoint?: string;
  status: string;
}

const NodeDeploymentProgress: React.FC<NodeDeploymentProgressProps> = ({ 
  nodeId: propNodeId, 
  onDeploymentComplete,
  standalone = false
}) => {
  // Get nodeId from either props or URL params
  const { nodeId: paramNodeId } = useParams<{ nodeId: string }>();
  const navigate = useNavigate();
  const nodeId = propNodeId || paramNodeId;

  const [status, setStatus] = useState('deploying');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState('');
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);
  const [failureCount, setFailureCount] = useState(0);
  const MAX_FAILURES = 3; // After 3 consecutive failures, give up

  const [sshKey, setSSHKey] = useState<string | null>(null);
  const [showSSHKey, setShowSSHKey] = useState(false);
  const [loadingSSHKey, setLoadingSSHKey] = useState(false);
  const [nodeDetails, setNodeDetails] = useState<NodeDetails | null>(null);
  const [refreshingDetails, setRefreshingDetails] = useState(false);
  
  // Function to refresh node details
  const refreshNodeDetails = async () => {
    if (!nodeId || refreshingDetails) return;
    
    setRefreshingDetails(true);
    try {
      const response = await api.get(`/api/nodes/${nodeId}`);
      setNodeDetails(response.data);
    } catch (error) {
      console.error('Failed to refresh node details:', error);
    } finally {
      setRefreshingDetails(false);
    }
  };
  
  useEffect(() => {
    const pollStatus = async () => {
      try {
        console.log("Polling status for node:", nodeId);
        const response = await api.get(`/api/nodes/${nodeId}/status`);
        
        // Reset failure count on successful API call
        setFailureCount(0);
        
        if (response.data) {
          console.log("Node status response:", response.data);
          setStatus(response.data.status);
          setLogs(response.data.deploymentLogs || []);
          
          // Check if there's a status detail with an error message
          if (response.data.statusDetail && response.data.statusDetail.includes("Failed to deploy")) {
            setError(response.data.statusDetail);
          }
          
          // Get the latest log entry for current progress
          if (response.data.deploymentLogs && response.data.deploymentLogs.length > 0) {
            const latestLog = response.data.deploymentLogs[response.data.deploymentLogs.length - 1];
            setProgress(latestLog.progress);
            setCurrentStep(latestLog.step);
          }
          
          // Check if deployment is complete
          if (['running', 'failed', 'stopped'].includes(response.data.status)) {
            // Deployment is done (success or failure), no need to poll anymore
            if (onDeploymentComplete && response.data.status === 'running') {
              onDeploymentComplete();
            }
            
            if (response.data.status === 'failed') {
              setError("Deployment failed. Check the logs for details.");
            }
            
            // Fetch additional node details for running nodes
            if (response.data.status !== 'failed') {
              try {
                const nodeResponse = await api.get(`/api/nodes/${nodeId}`);
                setNodeDetails(nodeResponse.data);
              } catch (err) {
                console.error("Failed to fetch node details:", err);
              }
            }
            
            return;
          }
        }
      } catch (err) {
        console.error("Error polling node status:", err);
        setFailureCount(prev => prev + 1);
      } finally {
        setRefreshing(false);
      }
    };

    // Initial load
    pollStatus();
    
    // Set up polling interval
    const interval = setInterval(() => {
      if (failureCount < MAX_FAILURES) {
        pollStatus();
      } else {
        console.error("Too many failures, stopping polling");
        clearInterval(interval);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [nodeId, failureCount, onDeploymentComplete]);

  useEffect(() => {
    // Estimate time remaining based on current progress
    if (progress > 0 && progress < 100) {
      // Simple calculation: if progress is at 25% after 2 minutes, then total time is ~8 minutes
      // So remaining time would be 6 minutes
      const deployTime = logs.length > 0 ? 
        (new Date().getTime() - new Date(logs[0].timestamp).getTime()) / 1000 / 60 : 0;
      
      if (deployTime > 0) {
        const estimatedTotal = (deployTime / progress) * 100;
        const remaining = Math.max(0, estimatedTotal - deployTime);
        setEstimatedTimeRemaining(Math.round(remaining));
      }
    }
  }, [progress, logs]);

  const fetchSSHKey = async () => {
    if (loadingSSHKey || !nodeId) return;
    
    setLoadingSSHKey(true);
    try {
      const response = await api.get(`/api/nodes/${nodeId}/ssh-key`);
      if (response.data && response.data.sshKey) {
        setSSHKey(response.data.sshKey);
        setShowSSHKey(true);
      }
    } catch (error) {
      console.error("Failed to fetch SSH key:", error);
    } finally {
      setLoadingSSHKey(false);
    }
  };

  const copySSHKey = () => {
    if (sshKey) {
      navigator.clipboard.writeText(sshKey);
    }
  };

  const downloadSSHKey = () => {
    if (!sshKey) return;
    
    const element = document.createElement('a');
    const file = new Blob([sshKey], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `node-key-${nodeId}.pem`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <>
      {standalone && (
        <div className="mb-8">
          <button 
            onClick={() => navigate('/dashboard/nodes')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Nodes
          </button>
        </div>
      )}
    
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Deployment progress (2/3 width) */}
        <div className="lg:col-span-2 bg-[#111827]/50 backdrop-blur-xl rounded-2xl p-6 border border-[#1E2D4A]">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-white">Node Deployment Progress</h3>
          </div>
          
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300">{currentStep ? currentStep.replace('_', ' ').toUpperCase() : 'Initializing...'}</span>
              <span className="text-gray-300">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-[#1A2235] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                style={{ width: `${progress}%`, transition: 'width 1s ease-in-out' }}
              ></div>
            </div>
            {estimatedTimeRemaining !== null && progress < 100 && (
              <div className="text-right text-xs text-gray-400 mt-1">
                Estimated time remaining: ~{estimatedTimeRemaining} {estimatedTimeRemaining === 1 ? 'minute' : 'minutes'}
              </div>
            )}
          </div>

          {/* Deployment logs */}
          <div>
            <h4 className="text-white font-medium mb-3">Deployment Logs</h4>
            
            {status === 'running' ? (
              <div className="bg-[#0A0F1A] rounded-xl border border-[#1E2D4A] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-500/20 p-2 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <h3 className="text-lg font-medium text-white">Node Deployed Successfully!</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Your Solana node has been successfully deployed and is now running. It will take some time to synchronize with the network.
                </p>
                
                {/* RPC Endpoint Section - Moved here from right column */}
                {nodeDetails?.ipAddress && (
                  <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700/30 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <ExternalLink className="w-4 h-4 text-blue-400" />
                      <h4 className="text-white font-medium">RPC Endpoint</h4>
                    </div>
                    
                    {nodeDetails.rpcEndpoint ? (
                      <div>
                        <div className="text-sm text-gray-400 mb-2">Your node's RPC endpoint:</div>
                        <div className="bg-[#0A0F1A] p-2 rounded-md text-gray-300 text-sm font-mono flex justify-between items-center">
                          <span>{nodeDetails.rpcEndpoint}</span>
                          <button 
                            onClick={() => {navigator.clipboard.writeText(nodeDetails.rpcEndpoint || '')}}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-300">
                        <p>RPC endpoint will be available soon.</p>
                        <p className="mt-2">You can also access the RPC directly via: <span className="font-mono">http://{nodeDetails.ipAddress}:8899</span></p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700/30">
                  <h4 className="text-blue-400 font-medium mb-2">What happens next?</h4>
                  <ul className="list-disc list-inside text-gray-300 space-y-2">
                    <li>Your node is now catching up with the Solana blockchain</li>
                    <li>This synchronization process can take several hours depending on network conditions</li>
                    <li>Once sync is complete, your node will be fully operational</li>
                    <li>You can monitor sync progress by SSH'ing into your node and checking the logs</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-[#0A0F1A] rounded-xl border border-[#1E2D4A] h-96 overflow-y-auto p-4">
                {logs.length > 0 ? (
                  logs.map((log, index) => (
                    <div key={index} className="mb-3 last:mb-0">
                      <div className="flex items-start">
                        <div className="mr-3 pt-0.5">
                          <TerminalSquare className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              log.step === 'error' ? 'bg-red-900/30 text-red-400' : 'bg-blue-900/30 text-blue-400'
                            }`}>
                              {log.step.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm mt-1">{log.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No logs available yet...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right column - Node Details (1/3 width) */}
        <div className="bg-[#111827]/50 backdrop-blur-xl rounded-2xl p-6 border border-[#1E2D4A] h-fit">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-blue-400" />
              <h3 className="text-xl font-semibold text-white">Node Details</h3>
            </div>
            <button 
              onClick={refreshNodeDetails} 
              className={`flex items-center gap-2 px-3 py-1 bg-[#1A2235] hover:bg-[#243050] transition-colors rounded-lg text-white ${refreshingDetails ? 'opacity-50' : ''}`}
              disabled={refreshingDetails}
            >
              <RefreshCw className={`w-3 h-3 ${refreshingDetails ? 'animate-spin' : ''}`} />
              <span className="text-xs">{refreshingDetails ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
          
          {nodeDetails ? (
            <div className="space-y-6">
              {/* Node information */}
              <div className="space-y-4">
                {nodeDetails.instanceType && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Instance Type</span>
                    <span className="text-white font-medium">{nodeDetails.instanceType}</span>
                  </div>
                )}
                {nodeDetails.region && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Region</span>
                    <span className="text-white font-medium">{nodeDetails.region}</span>
                  </div>
                )}
                {nodeDetails.ipAddress && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">IP Address</span>
                    <span className="text-white font-medium">{nodeDetails.ipAddress}</span>
                  </div>
                )}
              </div>
              
              {/* SSH Connection */}
              {nodeDetails.ipAddress && (status === 'running' || logs.some(log => log.step === 'vm_ready')) && (
                <div className="bg-[#151C2C] rounded-xl border border-[#1E2D4A] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Terminal className="w-4 h-4 text-purple-400" />
                    <h4 className="text-white font-medium">SSH Connection</h4>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-2">Connect to your node using SSH:</div>
                    <div className="bg-[#0A0F1A] p-2 rounded-md text-gray-300 text-sm font-mono flex justify-between items-center">
                      <span>ssh -i your-key.pem ubuntu@{nodeDetails.ipAddress}</span>
                      <button 
                        onClick={() => {navigator.clipboard.writeText(`ssh -i your-key.pem ubuntu@${nodeDetails.ipAddress}`)}}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* SSH Key Button */}
                  <button
                    onClick={fetchSSHKey}
                    disabled={loadingSSHKey}
                    className={`w-full flex justify-center items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-lg text-white hover:from-purple-700 hover:to-indigo-800 transition-colors ${loadingSSHKey ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loadingSSHKey ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Loading...
                      </>
                    ) : (
                      <>
                        <Terminal className="w-4 h-4" /> View SSH Key
                      </>
                    )}
                  </button>
                </div>
              )}
              
              {/* Get Started Guide */}
              {status === 'running' && (
                <div className="bg-[#151C2C] rounded-xl border border-[#1E2D4A] p-4 mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-green-400" />
                    <h4 className="text-white font-medium">Get Started</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-2">View Validator Logs:</div>
                      <div className="bg-[#0A0F1A] p-2 rounded-md text-gray-300 text-sm font-mono flex justify-between items-center">
                        <span>sudo journalctl -u solana-validator -f</span>
                        <button 
                          onClick={() => {navigator.clipboard.writeText("sudo journalctl -u solana-validator -f")}}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Check Sync Status:</div>
                      <div className="bg-[#0A0F1A] p-2 rounded-md text-gray-300 text-sm font-mono flex justify-between items-center">
                        <span>sudo su - solana -c "agave-validator --ledger /data/solana/ledger catchup"</span>
                        <button 
                          onClick={() => {navigator.clipboard.writeText("sudo su - solana -c \"agave-validator --ledger /data/solana/ledger catchup\"")}}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Restart Validator:</div>
                      <div className="bg-[#0A0F1A] p-2 rounded-md text-gray-300 text-sm font-mono flex justify-between items-center">
                        <span>sudo systemctl restart solana-validator</span>
                        <button 
                          onClick={() => {navigator.clipboard.writeText("sudo systemctl restart solana-validator")}}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40">
              <RefreshCw className="w-8 h-8 text-blue-400 mb-3 animate-spin" />
              <p className="text-gray-400">Loading node details...</p>
            </div>
          )}
        </div>
      </div>

      {/* Error message alert */}
      {error && (
        <div className="mt-6 bg-red-900/30 border border-red-700/50 rounded-xl p-4">
          <h4 className="text-red-400 font-medium mb-2">Deployment Error</h4>
          <p className="text-gray-300">{error}</p>
        </div>
      )}
      
      {/* SSH Key Modal */}
      {showSSHKey && sshKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#111827]/95 border border-[#1E2D4A] rounded-2xl shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-[#1E2D4A]">
              <h2 className="text-xl font-semibold text-white">SSH Private Key</h2>
              <button onClick={() => setShowSSHKey(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <h3 className="text-white font-medium">Private Key (PEM format)</h3>
                </div>
                <div className="flex gap-2">
                  <button onClick={copySSHKey} className="text-blue-400 hover:text-blue-300 p-1 flex items-center gap-1">
                    <Copy className="w-4 h-4" /> Copy
                  </button>
                  <button 
                    onClick={() => downloadSSHKey()} 
                    className="text-green-400 hover:text-green-300 p-1 flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" /> Download .pem
                  </button>
                </div>
              </div>
              <div className="bg-[#0A0F1E] p-4 rounded-xl mb-4 overflow-auto max-h-80">
                <pre className="text-gray-300 text-xs font-mono whitespace-pre-wrap">{sshKey}</pre>
              </div>
              <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-700/30">
                <p className="text-amber-200 text-sm">
                  After downloading the key file, you can connect to your node using:
                </p>
                <code className="block bg-black/30 p-2 rounded mt-2 text-amber-200 font-mono text-sm">
                  ssh -i node-key.pem ubuntu@{nodeDetails?.ipAddress}
                </code>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NodeDeploymentProgress;