import React, { useState } from 'react';
import { X, AlertCircle, Check } from 'lucide-react';

interface AWSIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'connect' | 'manage'; // Add this
  existingConfig?: {  // Add this
    region: string;
    accessKeyId: string;
  };
  onDisconnect?: () => void; // Add this
}

const AWSIntegrationModal: React.FC<AWSIntegrationModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  mode = 'connect', 
  existingConfig,
  onDisconnect
}) => {
  // Initialize form data with existing config if in manage mode
  const [formData, setFormData] = useState({
    accessKeyId: mode === 'manage' && existingConfig ? existingConfig.accessKeyId : '',
    secretAccessKey: '',
    region: mode === 'manage' && existingConfig ? existingConfig.region : 'us-east-1',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const testConnection = async () => {
    setTestStatus('testing');
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8080/api/aws/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: JSON.stringify({
          integrationType: 'accessKey',
          ...formData
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to test AWS connection');
      }
      
      setTestStatus('success');
    } catch (err) {
      setTestStatus('failed');
      setError(err instanceof Error ? err.message : 'Failed to test AWS connection');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8080/api/aws/integrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: JSON.stringify({
          integrationType: 'accessKey',
          ...formData
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to integrate AWS');
      }
      
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to integrate AWS');
    } finally {
      setLoading(false);
    }
  };

  // Add a disconnect handler
  const handleDisconnect = async () => {
    if (confirm("Are you sure you want to disconnect from AWS?")) {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8080/api/aws/disconnect', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to disconnect from AWS');
        }
        
        if (onDisconnect) onDisconnect();
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to disconnect');
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  // Modify your render logic to show different UI based on mode
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-[#111827]/95 border border-[#1E2D4A] rounded-2xl shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-[#1E2D4A]">
          <h2 className="text-xl font-semibold text-white">
            {mode === 'connect' ? 'Connect AWS Account' : 'Manage AWS Connection'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === 'manage' ? (
          <div className="p-6">
            <div className="space-y-4 mb-6">
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">AWS Region</label>
                <div className="w-full bg-[#151C2C] border border-[#1E2D4A] rounded-xl px-4 py-3 text-white">
                  {formData.region}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Access Key ID</label>
                <div className="w-full bg-[#151C2C] border border-[#1E2D4A] rounded-xl px-4 py-3 text-white">
                  {formData.accessKeyId}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Secret Access Key</label>
                <div className="w-full bg-[#151C2C] border border-[#1E2D4A] rounded-xl px-4 py-3 text-white">
                  ••••••••••••••••••••••
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              >
                {loading ? (
                  <span className="animate-spin h-4 w-4 border-2 border-white/20 border-l-white rounded-full"></span>
                ) : (
                  'Disconnect'
                )}
              </button>
              <button
                type="button"
                onClick={() => onClose()}
                className="flex-1 py-3 px-4 rounded-xl bg-[#1E2D4A] text-white hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div className="mb-4">
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
                  <option value="us-east-1">US East (N. Virginia)</option>
                  <option value="us-east-2">US East (Ohio)</option>
                  <option value="us-west-1">US West (N. California)</option>
                  <option value="us-west-2">US West (Oregon)</option>
                  <option value="eu-west-1">EU (Ireland)</option>
                  <option value="eu-central-1">EU (Frankfurt)</option>
                  <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                  <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                  <option value="ap-southeast-2">Asia Pacific (Sydney)</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="accessKeyId" className="block text-gray-300 mb-2">
                  Access Key ID
                </label>
                <input
                  id="accessKeyId"
                  name="accessKeyId"
                  type="text"
                  value={formData.accessKeyId}
                  onChange={handleInputChange}
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                  className="w-full bg-[#151C2C] border border-[#1E2D4A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="secretAccessKey" className="block text-gray-300 mb-2">
                  Secret Access Key
                </label>
                <input
                  id="secretAccessKey"
                  name="secretAccessKey"
                  type="password"
                  value={formData.secretAccessKey}
                  onChange={handleInputChange}
                  placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                  className="w-full bg-[#151C2C] border border-[#1E2D4A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="mt-6 flex gap-4">
              <button
                type="button"
                onClick={testConnection}
                disabled={loading || testStatus === 'testing'}
                className="flex-1 py-3 px-4 rounded-xl bg-[#1E2D4A]/70 text-white hover:bg-[#1E2D4A] transition-colors flex justify-center items-center gap-2"
              >
                {testStatus === 'testing' ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white/20 border-l-white rounded-full"></span>
                    Testing...
                  </>
                ) : testStatus === 'success' ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    Connection Verified
                  </>
                ) : (
                  'Test Connection'
                )}
              </button>
              <button
                type="submit"
                disabled={loading || testStatus !== 'success'}
                className={`flex-1 py-3 px-4 rounded-xl flex justify-center items-center
                  ${testStatus === 'success'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-90'
                    : 'bg-[#1E2D4A]/30 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {loading ? (
                  <span className="animate-spin h-4 w-4 border-2 border-white/20 border-l-white rounded-full"></span>
                ) : (
                  'Connect AWS'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AWSIntegrationModal;