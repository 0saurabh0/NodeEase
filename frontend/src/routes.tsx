import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import App from './App';
import DashboardLayout from './pages/dashboard';
import api from './services/api';
// import OverviewContent from './components/dashboard/overview';
import IntegrateView from './components/dashboard/integrate/Integrate';
import NodeDeploymentView from './components/dashboard/nodes/nodes';
import RPCPlaygroundView from './components/dashboard/rpc-testing/RPCTesting';
import SettingsView from './components/dashboard/settings/settings';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('jwtToken');
      
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      try {
        // Make a request to your backend to verify the token
        await api.get('/api/auth/verify');
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Token verification failed', error);
        localStorage.removeItem('jwtToken'); // Clear invalid token
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  if (isLoading) {
    // Return a loading spinner or skeleton screen
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="integrate" replace />} />
          {/* <Route path="overview" element={<OverviewContent />} /> */}
          <Route path="integrate" element={<IntegrateView />} />
          <Route path="nodes" element={<NodeDeploymentView />} />
          <Route path="rpc-playground" element={<RPCPlaygroundView />} />
          <Route path="monitoring" element={<div>Monitoring (Coming Soon)</div>} />
          <Route path="settings" element={<SettingsView />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default AppRoutes;