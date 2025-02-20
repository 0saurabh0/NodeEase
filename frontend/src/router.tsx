import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import NodeEaseDashboard from './dashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/dashboard',
    element: <NodeEaseDashboard />
  }
]);