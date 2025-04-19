import React, { useState } from 'react';
import { Terminal, Server, Globe, Github, Code, Zap, Lock, Clock } from 'lucide-react';
import OnboardingModal from './components/OnBoadingModel';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const navigate = useNavigate();

  const handleStartClick = async () => {
    setIsCheckingAuth(true);
    
    const token = localStorage.getItem('jwtToken');
    
    if (!token) {
      // No token found, show onboarding modal
      setShowOnboarding(true);
      setIsCheckingAuth(false);
      return;
    }
    
    try {
      // Verify if the token is valid
      await axios.get('http://localhost:8080/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Token is valid, redirect to dashboard
      navigate('/dashboard');
    } catch {
      // Token is invalid, show onboarding modal
      localStorage.removeItem('jwtToken'); // Clear invalid token
      setShowOnboarding(true);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-gradient-to-br from-[#9945FF] to-[#14F195] relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-[#14F195] rounded-full opacity-20 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-[#9945FF] rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative">
          <nav className="container mx-auto px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/logo.svg" alt="NodeEase" className="w-12 h-12" />
                <div className="text-3xl font-semibold text-white tracking-tight drop-shadow-lg">NodeEase</div>
              </div>
              <div className="flex items-center gap-6">
                <a 
                  href="https://github.com/nodeease/nodeease"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/90 hover:text-white transition-colors"
                >
                  <Github className="w-6 h-6" />
                </a>
                <button 
                  onClick={handleStartClick}
                  disabled={isCheckingAuth}
                  className="group bg-black/10 backdrop-blur-xl text-white px-8 py-3 rounded-2xl font-medium hover:scale-105 transition-all duration-300"
                >
                  {isCheckingAuth ? (
                    <span className="inline-flex items-center">
                      <span className="w-4 h-4 mr-2 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                      Loading...
                    </span>
                  ) : (
                    <>
                      Get Started
                      <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </nav>

          <main className="container mx-auto px-8 pt-20 pb-32">
            <div className="max-w-4xl mx-auto text-center">
              {/* Solana Integration Banner */}
              <div className="mb-12 inline-flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-full px-6 py-3">
                <img 
                  src="https://solana.com/src/img/branding/solanaLogoMark.svg"
                  alt="Solana"
                  className="h-6 w-6"
                />
                <span className="text-white font-medium">Powered by Solana</span>
              </div>

              <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight tracking-tight drop-shadow-lg">
                Deploy Solana RPC Nodes with{' '}
                <span className="text-[#14F195] drop-shadow-[0_4px_8px_rgba(20,241,149,0.3)]">Ease</span>
              </h1>
              <p className="text-xl text-white mb-12 font-medium leading-relaxed max-w-2xl mx-auto drop-shadow-lg">
                NodeEase simplifies blockchain infrastructure deployment. Set up your Solana RPC node on any cloud provider in minutes, not days.
              </p>
              <button 
                onClick={handleStartClick}
                disabled={isCheckingAuth}
                className="group inline-flex items-center bg-black/10 backdrop-blur-xl text-white px-10 py-5 rounded-2xl text-lg font-medium hover:scale-105 transition-all duration-300"
              >
                {isCheckingAuth ? (
                  <span className="inline-flex items-center">
                    <span className="w-4 h-4 mr-2 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                    Loading...
                  </span>
                ) : (
                  <>
                    Deploy Now
                    <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </>
                )}
              </button>

              {/* Cloud Providers Section */}
              <div className="mt-16 flex flex-col items-center">
                <p className="text-white/70 text-sm font-medium mb-8">Supported Cloud Providers</p>
                <div className="grid grid-cols-3 gap-8 items-center">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg"
                    alt="AWS"
                    className="h-8 opacity-70 hover:opacity-100 transition-opacity"
                  />
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/a/a8/Microsoft_Azure_Logo.svg"
                    alt="Azure"
                    className="h-6 opacity-70 hover:opacity-100 transition-opacity"
                  />
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg"
                    alt="Google Cloud"
                    className="h-8 opacity-70 hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
            </div>

            {/* Steps Section */}
            <div className="mt-32 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent backdrop-blur-sm rounded-[3rem] -mx-8"></div>
              <div className="relative grid md:grid-cols-3 gap-8 px-8 py-16">
                {[
                  { icon: Terminal, title: "1. Connect", desc: "Link your cloud provider account or use our managed infrastructure." },
                  { icon: Server, title: "2. Configure", desc: "Choose your node specifications and region with our simple interface." },
                  { icon: Globe, title: "3. Launch", desc: "Click deploy and your node will be live within minutes." }
                ].map((item, i) => (
                  <div key={i} className="group">
                    <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-10 text-white border border-white/10 transition-all duration-500 hover:scale-105 hover:bg-white/10">
                      <div className="bg-gradient-to-br from-[#9945FF] to-[#14F195] rounded-2xl w-14 h-14 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                        {React.createElement(item.icon, { className: "h-6 w-6 text-white" })}
                      </div>
                      <h3 className="text-2xl font-semibold mb-4 drop-shadow-lg">{item.title}</h3>
                      <p className="text-white/90 font-medium leading-relaxed drop-shadow">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features Section with Heading */}
            <div className="mt-32 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent backdrop-blur-sm rounded-[3rem] -mx-8"></div>
              <div className="relative px-8 py-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16 drop-shadow-lg">
                  Why Choose <span className="text-[#14F195]">NodeEase</span>?
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { 
                      icon: Code, 
                      title: "Open Source", 
                      desc: "100% transparent and community-driven. Audit our code, contribute, and help us improve." 
                    },
                    { 
                      icon: Lock, 
                      title: "Fully Transparent", 
                      desc: "No hidden fees or surprise costs. Clear pricing and complete control over your infrastructure." 
                    },
                    { 
                      icon: Zap, 
                      title: "Lightning Fast", 
                      desc: "Deploy in minutes with our optimized setup process and high-performance infrastructure." 
                    },
                    { 
                      icon: Clock, 
                      title: "Hassle Free", 
                      desc: "Focus on building, not infrastructure. We handle the complex setup and maintenance." 
                    }
                  ].map((feature, i) => (
                    <div key={i} className="group">
                      <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-8 text-white border border-white/10 transition-all duration-500 hover:scale-105 hover:bg-white/10">
                        <div className="bg-gradient-to-br from-[#9945FF] to-[#14F195] rounded-xl w-12 h-12 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                          {React.createElement(feature.icon, { className: "h-5 w-5 text-white" })}
                        </div>
                        <h3 className="text-xl font-semibold mb-3 drop-shadow-lg">{feature.title}</h3>
                        <p className="text-white/90 font-medium leading-relaxed text-sm drop-shadow">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>

          <footer className="container mx-auto px-8 pb-8">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"></div>
            <div className="flex justify-center">
              <a 
                href="https://x.com/sellhighdierich" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/90 hover:text-white text-sm font-medium transition-colors"
              >
                @sellhighdierich
              </a>
            </div>
          </footer>

        </div>

        {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;