import { useState } from 'react';
import AWSIntegrationModal from './awsIntegrationModel';

const CLOUD_PROVIDERS = [
  {
    name: 'AWS',
    description: 'Connect your AWS account to deploy and manage nodes using your own infrastructure.',
    status: 'available',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg', 
  },
  {
    name: 'Google Cloud',
    description: 'Deploy nodes using Google Cloud Platform\'s robust infrastructure.',
    status: 'coming-soon',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg',
  },
  {
    name: 'Azure',
    description: 'Launch nodes on Microsoft Azure\'s enterprise-grade cloud platform.',
    status: 'coming-soon',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Microsoft_Azure_Logo.svg',
  },
];

const IntegrateView = () => {
  const [isAWSModalOpen, setIsAWSModalOpen] = useState(false);
  const [awsConnected, setAwsConnected] = useState(false);
  
  const handleConnectAWS = () => {
    setIsAWSModalOpen(true);
  };
  
  const handleAWSSuccess = () => {
    setIsAWSModalOpen(false);
    setAwsConnected(true);
    // You might want to update the state or fetch the updated integration status
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Cloud Provider Integration
        </h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {CLOUD_PROVIDERS.map((provider) => (
          <div 
            key={provider.name}
            className={`
              relative group
              bg-[#111827]/50 backdrop-blur-xl rounded-2xl p-8
              border border-[#1E2D4A] hover:border-[#2E3D5A]
              transition-all duration-300 ease-in-out
              ${provider.status === 'coming-soon' ? 'opacity-75' : 'hover:bg-[#111827]/70'}
            `}
          >
            {/* Gradient Backdrop */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Content */}
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <img 
                  src={provider.imageUrl} 
                  alt={`${provider.name} logo`}
                  className="h-8 object-contain"
                />
                <span 
                  className={`
                    px-4 py-1.5 rounded-full text-sm font-medium
                    transition-colors duration-300
                    ${provider.status === 'available' 
                      ? (provider.name === 'AWS' && awsConnected 
                         ? 'bg-blue-500/10 text-blue-400' 
                         : 'bg-green-500/10 text-green-400 group-hover:bg-green-500/15') 
                      : 'bg-gray-500/10 text-gray-400'}
                  `}
                >
                  {provider.status === 'available'
                    ? (provider.name === 'AWS' && awsConnected ? 'Connected' : 'Available')
                    : 'Coming Soon'}
                </span>
              </div>
              
              <p className="text-gray-400 mb-8 min-h-[3rem] leading-relaxed">
                {provider.description}
              </p>
              
              <button 
                className={`
                  w-full py-3 rounded-xl font-medium
                  transition-all duration-300 ease-in-out
                  ${provider.status === 'available'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-90 hover:scale-[1.02]'
                    : 'bg-[#1E2D4A]/50 text-gray-400 cursor-not-allowed'}
                `}
                disabled={provider.status === 'coming-soon'}
                onClick={provider.name === 'AWS' ? handleConnectAWS : undefined}
              >
                {provider.name === 'AWS' && awsConnected 
                  ? 'Manage Connection' 
                  : `Connect ${provider.name}`}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AWS Integration Modal */}
      <AWSIntegrationModal 
        isOpen={isAWSModalOpen} 
        onClose={() => setIsAWSModalOpen(false)}
        onSuccess={handleAWSSuccess}
      />
    </div>
  );
};

export default IntegrateView;