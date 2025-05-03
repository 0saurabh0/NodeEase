import React, { useState } from 'react';
import { Terminal, Server, Globe, Github, Code, Zap, Lock, Clock } from 'lucide-react';
import OnboardingModal from './components/OnBoadingModel';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import api from './services/api';

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
      await api.get('/api/auth/verify');
      
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
              {/* Solana Integration Banner - Enhanced styling */}
              <div className="mb-12 inline-flex items-center gap-3 bg-gradient-to-r from-[#9945FF]/30 to-[#14F195]/30 backdrop-blur-lg rounded-full px-6 py-3 border border-white/20 shadow-lg animate-pulse hover:animate-none hover:from-[#9945FF]/40 hover:to-[#14F195]/40 transition-all duration-300 cursor-pointer">
                <div className="bg-white/20 p-1.5 rounded-full">
                  <img 
                    src="https://solana.com/src/img/branding/solanaLogoMark.svg"
                    alt="Solana"
                    className="h-5 w-5"
                  />
                </div>
                <span className="text-white font-medium drop-shadow-md">Powered by Solana</span>
              </div>

              <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight tracking-tight drop-shadow-lg">
              Self-Host Solana Nodes with{' '}
                <span className="text-[#14F195] drop-shadow-[0_4px_8px_rgba(20,241,149,0.3)]">Ease</span>
              </h1>
              <p className="text-xl text-white mb-12 font-medium leading-relaxed max-w-2xl mx-auto drop-shadow-lg">
                NodeEase simplifies blockchain infrastructure deployment. Set up your Solana RPC node on AWS or Bare Metal in minutes, not days.
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
                    Start Free Deployment
                    <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </>
                )}
              </button>

              {/* Cloud Providers Section */}
              <div className="mt-16 flex flex-col items-center">
                <p className="text-white/70 text-sm font-medium mb-8">Supported Providers</p>
                <div className="flex justify-center gap-20 items-center w-full">
                  {/* AWS Logo */}
                  <div className="relative flex flex-col items-center justify-center w-48">
                    <div className="h-28 flex items-center justify-center mb-3">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg"
                        alt="AWS"
                        className="h-14 opacity-70 hover:opacity-100 transition-opacity"
                      />
                    </div>
                    <span className="text-white font-medium text-lg">AWS</span>
                  </div>
                  
                  {/* Bare Metal Logo with Coming Soon banner */}
                  <div className="relative flex flex-col items-center justify-center w-48">
                    <div className="h-28 flex items-center justify-center mb-3 relative">
                      <img 
                        src="https://www.matroft.com/img/bare-metal-safe.svg"
                        alt="Bare Metal"
                        className="h-14 opacity-70 hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute -top-3 right-0 bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white text-xs font-bold py-1 px-3 rounded-full transform rotate-12 animate-pulse">
                        Coming Soon
                      </div>
                    </div>
                    <span className="text-white font-medium text-lg">Bare Metal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Steps Section */}
            <div className="mt-32 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent backdrop-blur-sm rounded-[3rem] -mx-8"></div>
              <div className="relative px-8 py-16">
                <div className="relative flex flex-col md:flex-row gap-8">
                  {/* Connection lines between steps (visible on md screens and up) */}
                  <div className="absolute top-1/3 left-0 right-0 h-1 bg-gradient-to-r from-[#9945FF] to-[#14F195] hidden md:block"></div>
                  
                  {[
                    { icon: Terminal, title: "Connect", desc: "Easily link your cloud — no API fuss." },
                    { icon: Server, title: "Configure", desc: "Choose node specs and region, we handle the complexity." },
                    { icon: Globe, title: "Launch", desc: "Your node is live in minutes — you focus on your app." }
                  ].map((item, i) => (
                    <div key={i} className="group flex-1 relative z-10">
                      <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-8 text-white border border-white/10 transition-all duration-300 hover:bg-white/10 min-h-[300px] flex flex-col">
                        <div className="bg-gradient-to-br from-[#9945FF] to-[#14F195] rounded-2xl p-4 w-14 h-14 flex items-center justify-center mb-6 shadow-lg">
                          {React.createElement(item.icon, { className: "h-7 w-7 text-white" })}
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-white">
                          <span className="text-[#14F195] mr-2">{i+1}.</span>{item.title}
                        </h3>
                        <p className="text-white/90 text-lg font-medium leading-relaxed flex-grow">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
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