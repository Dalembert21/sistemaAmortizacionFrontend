import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';

type Role = 'GUEST' | 'ADMIN' | 'SUPERADMIN';

interface AuthContextType {
  role: Role;
  orgId: string;
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => void;
  config: any;
  fetchConfig: (forcedOrgId?: string) => Promise<void>;
  updateConfig: (newConfig: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>('GUEST');
  const [orgId, setOrgId] = useState<string>('11111111-1111-1111-1111-111111111111'); // Organización por defecto para clientes
  const [config, setConfig] = useState<any>(() => {
    const savedConfig = localStorage.getItem('auth_config');
    return savedConfig ? JSON.parse(savedConfig) : {
      institutionName: 'Sistema Financiero DB',
      primaryColor: '#E6621F',
      logoBase64: '',
      credits: []
    };
  });

  const fetchConfig = async (forcedOrgId?: string) => {
    try {
      const targetOrg = forcedOrgId || orgId;
      const res = await fetch(`http://localhost:3000/api/config/${targetOrg}`);
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        localStorage.setItem('auth_config', JSON.stringify(data));
      }
    } catch (e) {
      console.warn("Backend not running or org missing");
    }
  };

  useEffect(() => {
    const savedRole = localStorage.getItem('auth_role') as Role;
    const savedOrgId = localStorage.getItem('auth_orgId');
    if (savedRole && savedOrgId) {
      setRole(savedRole);
      setOrgId(savedOrgId);
      fetchConfig(savedOrgId);
    } else {
      fetchConfig();
    }
  }, []);

  const login = async (user: string, pass: string) => {
    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, pass })
      });
      if (res.ok) {
        const data = await res.json();
        setRole(data.role);
        if (data.orgId) {
          setOrgId(data.orgId);
          localStorage.setItem('auth_role', data.role);
          localStorage.setItem('auth_orgId', data.orgId);
          fetchConfig(data.orgId);
        }
        return true;
      }
    } catch(e) {
      console.error(e);
    }
    return false;
  };

  const updateConfig = async (newConfig: any) => {
    if (role !== 'ADMIN') return;
    try {
      const res = await fetch(`http://localhost:3000/api/config/${orgId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      if (res.ok) {
        setConfig(newConfig); // Actualización inmediata local
        localStorage.setItem('auth_config', JSON.stringify(newConfig));
      }
    } catch(e) {
      console.error("Error al actualizar config:", e);
      setConfig(newConfig);
      localStorage.setItem('auth_config', JSON.stringify(newConfig));
    }
  };

  const logout = () => {
    setRole('GUEST');
    setOrgId('11111111-1111-1111-1111-111111111111');
    localStorage.removeItem('auth_role');
    localStorage.removeItem('auth_orgId');
    localStorage.removeItem('auth_config');
    fetchConfig('11111111-1111-1111-1111-111111111111');
  };

  return (
    <AuthContext.Provider value={{ role, orgId, login, logout, config, fetchConfig, updateConfig }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
