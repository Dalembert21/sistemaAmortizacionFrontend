import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

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
      logoBase64: '',
      credits: [],
      investments: []
    };
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchConfig = async (forcedOrgId?: string) => {
    try {
      const targetOrg = forcedOrgId || orgId;
      const res = await fetch(`${API_URL}/api/config/${targetOrg}`);
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

  useEffect(() => {
    // Limpieza de caché forzada: Si el sistema detecta el nombre viejo guardado
    // lo sobreescribe con el nuevo default para evitar confusión visual.
    if (config?.institutionName === 'Financiera Financo') {
      setConfig({ ...config, institutionName: 'Sistema Financiero DB' });
    }

    if (config?.institutionName) {
      document.title = config.institutionName;
    } else {
      document.title = 'Plataforma Financiera';
    }

    if (config?.logoBase64) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = config.logoBase64;
    } else {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (link) {
        link.href = '/db.svg';
      }
    }
  }, [config]);

  const login = async (user: string, pass: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
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
      const res = await fetch(`${API_URL}/api/config/${orgId}`, {
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
