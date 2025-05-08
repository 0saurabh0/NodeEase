// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Terminal, Server, Settings, Activity, Database, PlugZap, Bell, LogOut, User } from 'lucide-react';
import IntegrateView from '../components/dashboard/integrate/Integrate';
import NodeDeploymentView from '../components/dashboard/nodes/nodes';
import SettingsView from '../components/dashboard/settings/settings';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DashboardLayout = () => {
  const [activeView, setActiveView] = useState('integrate');
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    picture: ''
  });
  const [profileImageError, setProfileImageError] = useState(false);
  const [profileImageLoading, setProfileImageLoading] = useState(true);
  const navigate = useNavigate();

  // New function to fetch user profile
  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/api/user/profile');
      if (response.data) {
        setUserProfile({
          name: response.data.name || '',
          email: response.data.email || '',
          picture: response.data.picture || ''
        });
        setProfileImageLoading(false);
        setProfileImageError(false);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfileImageError(true);
      setProfileImageLoading(false);
    }
  };

  useEffect(() => {
    // Check for JWT token first
    const token = localStorage.getItem('jwtToken');
    
    if (token) {
      // Fetch profile from server
      fetchUserProfile();
    } else {
      // Redirect to login if no token is found
      navigate('/');
    }
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userProfile');
    setUserProfile({ name: '', email: '', picture: '' });
    setProfileImageError(false);
    // Redirect to login page
    navigate('/');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'integrate':
        return <IntegrateView />;
      case 'nodes':
        return <NodeDeploymentView navigateToIntegrate={() => setActiveView('integrate')} />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Active Nodes', value: '12', change: '+2' },
                { label: 'Total RPC Calls', value: '1.2M', change: '+15%' },
                { label: 'Uptime', value: '99.99%', change: '0%' },
                { label: 'Resources Used', value: '75%', change: '+5%' },
              ].map((stat, i) => (
                <div key={i} className="bg-[#111827]/50 backdrop-blur-xl rounded-2xl p-6 border border-[#1E2D4A] hover:bg-[#111827]/70 transition-all duration-300">
                  <h3 className="text-gray-400 font-medium mb-2">{stat.label}</h3>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-white">{stat.value}</span>
                    <span className="text-blue-400 text-sm font-medium">{stat.change}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Nodes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((node) => (
                <div key={node} className="bg-[#111827]/50 backdrop-blur-xl rounded-2xl p-6 border border-[#1E2D4A] hover:bg-[#111827]/70 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Node {node}</h3>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-green-400">
                      Active
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Region</span>
                      <span className="text-white">US-East</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Provider</span>
                      <span className="text-white">AWS</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Performance</span>
                      <span className="text-white">98%</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 py-2 rounded-xl bg-[#1E2D4A]/50 text-white hover:bg-[#1E2D4A] transition-colors">
                    Manage
                  </button>
                </div>
              ))}
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#111827]/70 backdrop-blur-xl border-r border-[#1E2D4A]">
        <div className="p-6 flex items-center gap-3">
          <img src="/logo.svg" alt="NodeEase" className="w-8 h-8" />
          <span className="text-xl font-semibold text-white">NodeEase</span>
        </div>
        <nav className="mt-6 px-3">
          {[
            { icon: Terminal, label: 'Overview', value: 'overview' },
            { icon: PlugZap, label: 'Integrate', value: 'integrate' },
            { icon: Server, label: 'Nodes', value: 'nodes' },
            { icon: Database, label: 'Resources', value: 'resources' },
            { icon: Activity, label: 'Monitoring', value: 'monitoring' },
            { icon: Settings, label: 'Settings', value: 'settings' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setActiveView(item.value)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 
                ${item.value === activeView
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                } transition-all duration-300`}
            >
              {React.createElement(item.icon, { className: "h-5 w-5" })}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8 min-h-screen bg-black/30 backdrop-blur-xl">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">
            {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
          </h1>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="relative group">
              {userProfile.picture && !profileImageError ? (
                <>
                  {profileImageLoading && (
                    <div className="h-10 w-10 rounded-full bg-[#111827] flex items-center justify-center">
                      <div className="h-5 w-5 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <img 
                    src={userProfile.picture}
                    alt="Profile" 
                    className={`h-10 w-10 rounded-full object-cover cursor-pointer ring-2 ring-blue-500/50 ${profileImageLoading ? 'hidden' : 'block'}`}
                    onLoad={() => setProfileImageLoading(false)}
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
        {renderContent()}
      </main>
    </div>
  );
};

export default DashboardLayout;