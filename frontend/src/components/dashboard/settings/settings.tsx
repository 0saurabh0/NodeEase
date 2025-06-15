import React, { useState, useEffect } from 'react';
import { Save, User, Loader2, Check, AlertTriangle } from 'lucide-react';
import api from '../../../services/api';
import { useNavigate } from 'react-router-dom';

const SettingsView = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form data for profile
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    picture: ''
  });
  
  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        // Check if we have a JWT token
        const token = localStorage.getItem('jwtToken');
        if (!token) {
          throw new Error('Not authenticated');
        }
        
        // Fetch user profile from API - using the correct endpoint from routes.go
        const response = await api.get('/api/user/profile');
        
        if (response.data) {
          setProfileData({
            displayName: response.data.name || '',
            email: response.data.email || '',
            picture: response.data.picture || ''
          });
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setError('Failed to load profile data');
        
        // Redirect to login if authentication fails
        if ((err as any).response?.status === 401) {
          localStorage.removeItem('jwtToken');
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [navigate]);
  
  // Profile data change handler
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };
  
  // Save profile handler
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      // Save profile to API
      await api.put('/api/user/profile', {
        name: profileData.displayName,
      });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError('Failed to save profile settings');
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  // Handle sign out
  const handleSignOut = () => {
    localStorage.removeItem('jwtToken');
    navigate('/');
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white">User Settings</h2>
        <button
          onClick={handleSave}
          disabled={saving || saved || loading}
          className={`
            px-6 py-2.5 rounded-xl font-medium flex items-center gap-2
            ${saved 
              ? 'bg-green-600/20 text-green-400' 
              : loading
                ? 'bg-[#1E2D4A]/50 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-90 transition-all'}
          `}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-800/40 rounded-lg">
          <p className="text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </p>
        </div>
      )}

      <div className="bg-[#111827]/50 backdrop-blur-xl rounded-2xl p-8 border border-[#1E2D4A]">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Profile Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="displayName" className="block text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  value={profileData.displayName}
                  onChange={handleProfileChange}
                  className="w-full bg-[#151C2C] border border-[#1E2D4A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="w-full bg-[#151C2C] border border-[#1E2D4A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  disabled
                />
                <p className="text-xs text-gray-400 mt-1">Email address from your account</p>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-gray-300 mb-2">
                Profile Picture
              </label>
              <div className="flex items-center gap-4">
                {profileData.picture ? (
                  <img 
                    src={`/api/proxy/image?url=${encodeURIComponent(profileData.picture)}`}
                    alt="Profile" 
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-blue-500/30"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = ''; // Set to empty to show fallback
                      e.currentTarget.style.display = 'none';
                      document.getElementById('profile-fallback')!.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  id="profile-fallback"
                  className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center"
                  style={{ display: profileData.picture ? 'none' : 'flex' }}
                >
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="text-sm text-gray-400">
                  Profile picture from your Google account
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-[#1E2D4A]">
              <h3 className="text-xl font-semibold text-white mb-4">Account Management</h3>
              
              <button 
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsView;