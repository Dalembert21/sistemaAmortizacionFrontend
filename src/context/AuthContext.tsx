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

// ✅ Organización por defecto: configurable por empresa compradora
// Cuando una empresa compra el sistema, solo cambia VITE_DEFAULT_ORG_ID en .env
const DEFAULT_ORG_ID = import.meta.env.VITE_DEFAULT_ORG_ID || '11111111-1111-1111-1111-111111111111';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>('GUEST');
  const [orgId, setOrgId] = useState<string>(DEFAULT_ORG_ID);
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

  // Buscar orgId por identificador de empresa (ej: "banco-pichincha")
  const fetchOrgIdByName = async (orgIdentifier: string): Promise<string | null> => {
    try {
      const res = await fetch(`${API_URL}/api/org/by-name/${orgIdentifier}`);
      if (res.ok) {
        const data = await res.json();
        return data.orgId;
      }
    } catch (e) {
      console.warn("Error buscando organización por nombre:", e);
    }
    return null;
  };

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
      console.warn("Backend not running or org missing:", e);
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
      // Revisar si tenemos un org guardado en sessionStorage (de la URL inicial)
      let orgParam = sessionStorage.getItem('url_org_param');
      
      if (!orgParam) {
        // Intentar leer de la URL actual (por si acaso)
        const urlParams = new URLSearchParams(window.location.search);
        orgParam = urlParams.get('org');
        
        // Método alternativo: parsear manualmente
        if (!orgParam && window.location.href.includes('?org=')) {
          const urlParts = window.location.href.split('?org=');
          if (urlParts.length > 1) {
            orgParam = urlParts[1].split('&')[0];
          }
        }
        
        // Guardar en sessionStorage para persistencia
        if (orgParam) {
          sessionStorage.setItem('url_org_param', orgParam);
        }
      }
      
      if (orgParam) {
        // Es una empresa compradora: buscar su orgId por nombre/identificador
        fetchOrgIdByName(orgParam).then(orgId => {
          if (orgId) {
            setOrgId(orgId);
            fetchConfig(orgId);
          } else {
            // Empresa no encontrada: mostrar branding por defecto
            setOrgId(DEFAULT_ORG_ID);
            fetchConfig(DEFAULT_ORG_ID);
          }
        });
      } else {
        // Sistema público: tu branding por defecto
        setOrgId(DEFAULT_ORG_ID);
        fetchConfig(DEFAULT_ORG_ID);
      }
    }
  }, []);

  useEffect(() => {
    
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
          // Guardamos el último orgId activo para persistencia
          localStorage.setItem('last_active_orgId', data.orgId);
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
    if (role !== 'ADMIN' && role !== 'SUPERADMIN') return;
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
    setOrgId(DEFAULT_ORG_ID);
    localStorage.removeItem('auth_role');
    localStorage.removeItem('auth_orgId');
    // Al cerrar sesión: volver a tu branding por defecto para usuarios invitados
    fetchConfig(DEFAULT_ORG_ID);
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
