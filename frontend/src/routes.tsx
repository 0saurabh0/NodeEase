import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import App from './App';
import DashboardLayout from './pages/dashboard';
import api from './services/api';

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
        } />
      </Routes>
    </Router>
  );
}

export default AppRoutes;