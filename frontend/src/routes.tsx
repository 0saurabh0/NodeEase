import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import DashboardLayout from './pages/dashboard';

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard" element={<DashboardLayout />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;