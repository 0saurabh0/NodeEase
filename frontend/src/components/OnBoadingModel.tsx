import { Chrome,  Github,} from 'lucide-react';


export default function OnboardingModal({ onClose }: { onClose: () => void }) {
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