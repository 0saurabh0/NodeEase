import { Github } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


export default function OnboardingModal({ onClose }: { onClose: () => void }) {
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Function to handle Google login success
  const handleGoogleSuccess = async (credentialResponse: any) => {
    console.log('Google login successful:', credentialResponse);
    
    try {
      // here still need to send the token to the backend
      // something like this:
      // const response = await fetch('/api/auth/google', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token: credentialResponse.credential })
      // });
      // const data = await response.json();
      
      // For now, simulating a successful authentication
      // In a real app, we'll be verifying the token on your backend first
      
      // 1. Store user info or token in localStorage/sessionStorage
      localStorage.setItem('isAuthenticated', 'true');
      
      onClose();
      
      // 3. Redirect to dashboard
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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50 backdrop-blur-md">
      <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-12 max-w-md w-full relative border border-white/20">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ×
        </button>
        <h2 className="text-4xl font-semibold text-gray-800 mb-10">Welcome</h2>
        
        <div className="space-y-6">
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
          <div className="w-full">
            <div className="google-login-container" style={{ height: '50px' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="100%"
                logo_alignment="center"
              />
            </div>
            <style>{`
              .google-login-container {
                display: flex;
                justify-content: center;
              }
              .google-login-container > div {
                width: 100% !important;
              }
              .google-login-container iframe {
                scale: 1.15;
                transform-origin: center;
              }
            `}</style>
          </div>
          
          {/* Display auth errors if any */}
          {authError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              Error: {authError}
            </div>
          )}
          
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400 font-medium">Or Continue with E-mail</span>
            </div>
          </div>
          
          <form className="space-y-5">
            <input
              type="email"
              placeholder="Email address"
              className="w-full px-8 py-5 rounded-2xl bg-gray-50/50 border-0 focus:ring-2 focus:ring-purple-500/20 text-lg transition-all duration-300 font-medium placeholder:text-gray-400"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-8 py-5 rounded-2xl bg-gray-50/50 border-0 focus:ring-2 focus:ring-purple-500/20 text-lg transition-all duration-300 font-medium placeholder:text-gray-400"
            />
            <button className="w-full bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white py-5 rounded-2xl font-medium text-lg hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group">
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#14F195] to-[#9945FF] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}