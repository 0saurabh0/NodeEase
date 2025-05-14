import React, { useState, useEffect } from 'react';
import { Terminal, Server, Settings, Activity, PlugZap, Bell, LogOut, User, Code } from 'lucide-react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const DashboardLayout = () => {
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    picture: ''
  });
  const [profileImageError, setProfileImageError] = useState(false);
  const [profileImageLoading, setProfileImageLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Get current section title from the URL path
  const getCurrentPageTitle = () => {
    const path = location.pathname.split('/').pop() || 'overview';
    
    // Special case for RPC
    if (path === 'rpc-playground') {
      return 'RPC Playground';
    }
    
    return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
  };

  const fetchUserProfile = async () => {
    try {
      setProfileImageLoading(true);
      const response = await api.get('/api/user/profile');      
      
      if (response.data) {
        const originalPictureUrl = response.data.picture || '';
        const profilePicture = originalPictureUrl
          ? `/api/proxy/image?url=${encodeURIComponent(originalPictureUrl)}` 
          : '';
        
        setUserProfile({
          name: response.data.name || '',
          email: response.data.email || '',
          picture: profilePicture
        });
        
        setProfileImageError(false);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setProfileImageError(true);
    } finally {
      setProfileImageLoading(false); // Make sure loading state is always set to false
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    
    if (token) {
      fetchUserProfile();
    } else {
      navigate('/');
    }
  }, []); // Empty dependency array to run only once on mount

  const handleSignOut = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userProfile');
    setUserProfile({ name: '', email: '', picture: '' });
    setProfileImageError(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen transition-all duration-300 bg-[#111827]/70 backdrop-blur-xl border-r border-[#1E2D4A] w-16 sm:w-20 lg:w-64">
        <div className="p-6 flex items-center gap-3">
          <img src="/logo.svg" alt="NodeEase" className="w-8 h-8" />
          <span className="text-xl font-semibold text-white hidden lg:block">NodeEase</span>
        </div>
        <nav className="mt-6 px-2 lg:px-3">
          {[
            { icon: Terminal, label: 'Overview', path: 'overview' },
            { icon: PlugZap, label: 'Integrate', path: 'integrate' },
            { icon: Server, label: 'Nodes', path: 'nodes' },
            { icon: Code, label: 'RPC Testing', path: 'rpc-playground' },
            { icon: Activity, label: 'Monitoring', path: 'monitoring' },
            { icon: Settings, label: 'Settings', path: 'settings' },
          ].map((item) => (
            <NavLink
              key={item.path}
              to={`/dashboard/${item.path}`}
              className={({ isActive }) => `w-full flex items-center gap-3 rounded-xl mb-1 
                justify-center px-2 lg:justify-start lg:px-4 py-3
                ${isActive
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                } transition-all duration-300`}
              title={item.label}
            >
              {React.createElement(item.icon, { className: "h-5 w-5" })}
              <span className="font-medium hidden lg:block">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-16 sm:ml-20 lg:ml-64 p-8 min-h-screen bg-black/30 backdrop-blur-xl transition-all duration-300">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">
            {getCurrentPageTitle()}
          </h1>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="relative group">
              {userProfile.picture && !profileImageError ? (
                <>
                  {profileImageLoading && (
                    <div className="absolute inset-0 h-10 w-10 rounded-full bg-[#111827] flex items-center justify-center z-10">
                      <div className="h-5 w-5 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <img 
                    src={userProfile.picture}
                    alt="Profile"
                    className="h-10 w-10 rounded-full object-cover cursor-pointer ring-2 ring-blue-500/50"
                    style={profileImageLoading ? { display: 'none' } : {}}
                    onLoad={() => {
                      setProfileImageLoading(false);
                      setProfileImageError(false);
                    }}
                    onError={() => {
                      setProfileImageLoading(false);
                      setProfileImageError(true);
                    }}
                  />
                </>
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              
              {/* User dropdown menu */}
              <div className="absolute right-0 mt-2 w-48 bg-[#111827]/95 backdrop-blur-xl rounded-xl shadow-lg border border-[#1E2D4A] 
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="p-3 border-b border-[#1E2D4A]">
                  <p className="text-white font-medium truncate">{userProfile.name || 'User'}</p>
                  <p className="text-gray-400 text-sm truncate">{userProfile.email || 'No email'}</p>
                </div>
                <div className="p-2">
                  <button 
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;