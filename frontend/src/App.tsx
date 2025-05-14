import React, { useState, useEffect } from 'react';
import { Terminal, Cloud, Server, Globe, Github, Code, Lock } from 'lucide-react';
import OnboardingModal from './components/OnBoadingModel';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import api from './services/api';

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger entrance animations after component mounts
    setIsLoaded(true);
  }, []);

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
          <nav className={`container mx-auto px-8 py-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
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
            <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="mb-12 inline-flex items-center gap-4 bg-gradient-to-r from-[#9945FF]/30 to-[#14F195]/30 backdrop-blur-lg rounded-full px-7 py-4 border border-white/20 shadow-lg animate-pulse hover:animate-none hover:from-[#9945FF]/40 hover:to-[#14F195]/40 transition-all duration-300 cursor-pointer">
                <img 
                  src="./sol-pink.png" 
                  alt="Solana"
                  className="h-8 w-8 rounded-full"
                />
                <span className="text-white font-medium text-lg drop-shadow-md">Powered by Solana</span>
              </div>

              <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight tracking-tight drop-shadow-lg">
                Self-Host Solana Nodes with{' '}
                <span className="text-[#14F195] drop-shadow-[0_4px_8px_rgba(20,241,149,0.3)]">Ease</span>
              </h1>
              <p className="text-xl text-white mb-12 font-medium leading-relaxed max-w-2xl mx-auto drop-shadow-lg">
                NodeEase simplifies blockchain infrastructure deployment. Set up your Solana RPC node on AWS or Bare Metal in minutes, not hours.
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
              <div className={`mt-16 flex flex-col items-center transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
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
            <div className={`mt-32 relative transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="relative px-8 py-16">
                <div className="relative flex flex-col md:flex-row gap-8">
                  {/* Connection lines between steps (visible on md screens and up) */}
                  <div className="absolute top-1/3 left-0 right-0 h-1 bg-gradient-to-r from-[#9945FF] to-[#14F195] hidden md:block"></div>
                  
                  {[
                    { 
                      icon: Terminal, 
                      title: "Connect", 
                      desc: "Easily link your cloud — no API fuss.",
                      gradient: "from-[#3B82F6] to-[#60A5FA]" // Blue gradient
                    },
                    { 
                      icon: Server, 
                      title: "Configure", 
                      desc: "Choose node specs and region, we handle the complexity.",
                      gradient: "from-[#10B981] to-[#34D399]" // Green gradient
                    },
                    { 
                      icon: Globe, 
                      title: "Launch", 
                      desc: "Your node is live in minutes — you focus on your app.",
                      gradient: "from-[#3B82F6] to-[#A78BFA]" // Orange to red gradient
                    }
                  ].map((item, i) => (
                    <div key={i} className="group flex-1 relative z-10">
                      <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-8 text-white border border-white/10 transition-all duration-300 hover:bg-white/10 min-h-[300px] flex flex-col">
                        <div className={`bg-gradient-to-br ${item.gradient} rounded-xl w-14 h-14 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                          {React.createElement(item.icon, { className: "h-6 w-6 text-white" })}
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
            <div className={`mt-32 relative transition-all duration-1000 delay-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="relative px-8 py-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16 drop-shadow-lg">
                  Why Choose <span className="bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] text-transparent bg-clip-text">NodeEase</span>?
                </h2>
                
                <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-8 text-white border border-white/10 transition-all duration-300 hover:bg-white/10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left side - Bullet points */}
                    <div className="space-y-8">
                      {/* Open & Transparent */}
                      <div className="flex items-start gap-4 group">
                        <div className={`bg-gradient-to-br from-[#3B82F6] to-[#A78BFA] rounded-xl w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 flex-shrink-0`}>
                          {React.createElement(Code, { className: "h-5 w-5 text-white" })}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2 text-white">Open & Transparent</h3>
                          <p className="text-white/90 font-medium leading-relaxed text-sm">
                            100% open source. No hidden fees or surprise costs. Audit our code and help us improve.
                          </p>
                        </div>
                      </div>

                      {/* Full Control */}
                      <div className="flex items-start gap-4 group">
                        <div className={`bg-gradient-to-br from-[#10B981] to-[#34D399] rounded-xl w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 flex-shrink-0`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-5.656 0 4 4 0 010-5.656l6.586-6.586" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2 text-white">Full Control</h3>
                          <p className="text-white/90 font-medium leading-relaxed text-sm">
                            You're the owner — monitor, restart, or destroy anytime.
                          </p>
                        </div>
                      </div>

                      {/* Runs in Your Cloud */}
                      <div className="flex items-start gap-4 group">
                        <div className={`bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] rounded-xl w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 flex-shrink-0`}>
                          {React.createElement(Cloud, { className: "h-5 w-5 text-white" })}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2 text-white">Runs in Your Cloud</h3>
                          <p className="text-white/90 font-medium leading-relaxed text-sm">
                            Choose region, instance type, and setup — all from a simple UI.
                          </p>
                        </div>
                      </div>

                      {/* No Lock In */}
                      <div className="flex items-start gap-4 group">
                        <div className={`bg-gradient-to-br from-[#F59E0B] to-[#EF4444] rounded-xl w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 flex-shrink-0`}>
                          {React.createElement(Lock, { className: "h-5 w-5 text-white" })}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2 text-white">No Lock In</h3>
                          <p className="text-white/90 font-medium leading-relaxed text-sm">
                            No SaaS. No subscriptions. Just a tool to launch & manage your own nodes.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Animated Solana logo */}
                    <div className="relative h-[400px] flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#9945FF]/20 to-[#14F195]/20 rounded-full blur-3xl animate-pulse"></div>
                      <div className="relative w-64 h-64">
                        <img 
                          src="./sol-blue-grad.jpeg" 
                          alt="Solana" 
                          className="w-full h-full object-contain rounded-full"
                          style={{
                            filter: 'drop-shadow(0 0 20px rgba(20, 241, 149, 0.3))',
                            animation: 'float 6s ease-in-out infinite'
                          }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "https://solana.com/src/img/branding/solanaLogoMark.svg";
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Add custom animations to the global styles */}
            <style>
              {`
                @keyframes float {
                  0%, 100% {
                    transform: translateY(0) scale(1);
                  }
                  50% {
                    transform: translateY(-20px) scale(1.05);
                  }
                }
              `}
            </style>
          </main>

          <footer className={`container mx-auto px-8 pb-8 transition-all duration-1000 delay-1200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="w-full h-px bg-gradient-to-r from-[#000080]/40 via-[#800000]/60 to-[#14F195]/40 mb-8"></div>
            <div className="flex justify-center">
              <a 
                href="https://x.com/sellhighdierich" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/90 hover:text-[#3B82F6] text-sm font-medium transition-colors"
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