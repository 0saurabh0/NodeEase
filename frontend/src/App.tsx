import React, { useState } from 'react';
import { Terminal, Server, Globe, Github, Chrome, Code, Zap, Lock, Clock } from 'lucide-react';

function OnboardingModal({ onClose }: { onClose: () => void }) {
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
          <button className="w-full group flex items-center justify-center gap-3 bg-black text-white py-5 px-6 rounded-2xl hover:scale-[1.02] transition-all duration-300 text-lg font-medium">
            <Github className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
            Continue with GitHub
          </button>
          
          <button className="w-full group flex items-center justify-center gap-3 bg-white text-gray-700 py-5 px-6 rounded-2xl border border-gray-100 hover:border-gray-200 hover:scale-[1.02] transition-all duration-300 text-lg font-medium">
            <Chrome className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
            Continue with Google
          </button>
          
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400 font-medium">or continue with email</span>
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

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  return (
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
                onClick={() => setShowOnboarding(true)}
                className="group bg-black/10 backdrop-blur-xl text-white px-8 py-3 rounded-2xl font-medium hover:scale-105 transition-all duration-300"
              >
                Get Started
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
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
              onClick={() => setShowOnboarding(true)}
              className="group inline-flex items-center bg-black/10 backdrop-blur-xl text-white px-10 py-5 rounded-2xl text-lg font-medium hover:scale-105 transition-all duration-300"
            >
              Deploy Now
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
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
                  src="https://www.gstatic.com/devrel-devsite/prod/v45f61267c97d455df97aa5b850d3b103f3471868e595c3e71bc48d5d8226c170/cloud/images/cloud-logo.svg"
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
          <div className="flex flex-col items-center gap-6 mb-8">
            <a 
              href="https://twitter.com/sellhighdierich" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/90 hover:text-white text-sm font-medium transition-colors"
            >
              @sellhighdierich
            </a>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-white/70 font-medium text-sm">
              © 2025 NodeEase. All rights reserved.
            </div>
            <div className="flex gap-8">
              <a href="#" className="text-white/70 hover:text-white text-sm font-medium transition-colors">Terms</a>
              <a href="#" className="text-white/70 hover:text-white text-sm font-medium transition-colors">Privacy</a>
              <a href="#" className="text-white/70 hover:text-white text-sm font-medium transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>

      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
    </div>
  );
}

export default App;