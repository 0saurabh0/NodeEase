import { Github } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function OnboardingModal({ onClose }: { onClose: () => void }) {
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);

  // Function to handle background click
  const handleBackgroundClick = (e: React.MouseEvent) => {
    // Only close if the click is on the background (not the modal content)
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Function to handle Google login success
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const token = credentialResponse.credential;

      // Send token to backend
      const res = await api.post("/api/auth/google", {
        token,
      });
      localStorage.setItem("jwtToken", res.data.token);
      
      onClose();
      
      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthError('Failed to authenticate with Google. Please try again.');
    }
  };

  // Function to handle Google login error
  const handleGoogleError = () => {
    console.error('Google login failed');
    setAuthError('Google login failed. Please try again.');
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50 backdrop-blur-md" onClick={handleBackgroundClick}>
      <div ref={modalRef} className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-12 max-w-md w-full relative border border-white/20">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ×
        </button>
        <h2 className="text-4xl font-semibold text-gray-800 mb-10">Welcome</h2>
        
        <div className="space-y-8">
          {/* GitHub button with "Coming Soon" banner */}
          <div className="relative">
            <button disabled className="w-full group flex items-center justify-center gap-3 bg-black/80 text-white py-5 px-6 rounded-2xl transition-all duration-300 text-lg font-medium opacity-80 cursor-not-allowed">
              <Github className="h-5 w-5" />
              Continue with GitHub
            </button>
            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white text-xs font-bold py-1 px-3 rounded-full transform rotate-12">
              Coming Soon
            </div>
          </div>
          
          {/* Google login with consistent styling */}
          <div className="w-full relative">
            <div className="google-login-container">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_blue"
                shape="rectangular"
                size='large'
              />
            </div>
            <style>{`
              .google-login-container {
                display: flex;
                justify-content: center;
                width: 100%;
              }
            `}</style>
          </div>
          
          {/* Display auth errors if any */}
          {authError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              Error: {authError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}