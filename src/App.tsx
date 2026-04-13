import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Simulator from './pages/Simulator';
import AdminConfig from './pages/AdminConfig';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import Investment from './pages/Investment';
import InvestmentHistory from './pages/InvestmentHistory';
import Login from './pages/Login';
import './index.css';

const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactElement, requiredRole: string }) => {
  const { role, isLoading } = useAuth();
  
  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Cargando...</div>;
  }
  
  if (role === 'GUEST') {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole === 'ADMIN' && role !== 'ADMIN' && role !== 'SUPERADMIN') {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole === 'SUPERADMIN' && role !== 'SUPERADMIN') {
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
        <Route
          path="investment-history"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <InvestmentHistory />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

function AppContent() {
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
