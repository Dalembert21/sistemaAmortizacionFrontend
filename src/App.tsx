import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Simulator from './pages/Simulator';
import AdminConfig from './pages/AdminConfig';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import Investment from './pages/Investment';
import Login from './pages/Login';
import './index.css';

const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactElement, requiredRole: string }) => {
  const { role } = useAuth();
  if (role !== requiredRole && role !== 'SUPERADMIN') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="simulator" element={<Simulator />} />
        <Route path="investment" element={<Investment />} />
        <Route path="login" element={<Login />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminConfig />
            </ProtectedRoute>
          }
        />
        <Route
          path="superadmin"
          element={
            <ProtectedRoute requiredRole="SUPERADMIN">
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

function AppContent() {
  const { config } = useAuth();

  React.useEffect(() => {
    if (config?.primaryColor) {
      document.documentElement.style.setProperty('--primary', config.primaryColor);

      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      };

      const rgb = hexToRgb(config.primaryColor);
      if (rgb) {
        document.documentElement.style.setProperty('--primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
        // Also update primary-dark and primary-light roughly
        document.documentElement.style.setProperty('--primary-dark', `rgb(${Math.max(0, rgb.r - 30)}, ${Math.max(0, rgb.g - 30)}, ${Math.max(0, rgb.b - 30)})`);
        document.documentElement.style.setProperty('--primary-light', `rgb(${Math.min(255, rgb.r + 30)}, ${Math.min(255, rgb.g + 30)}, ${Math.min(255, rgb.b + 30)})`);
      }
    }
  }, [config]);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
