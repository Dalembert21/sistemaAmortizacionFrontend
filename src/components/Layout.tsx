import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Calculator, Settings, PieChart, LayoutDashboard, Building2, Lock, LogOut, FileCode, Menu, X, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const location = useLocation();
  const { role, logout, config } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);

  React.useEffect(() => {
    setIsPageLoading(true);
    const timer = setTimeout(() => setIsPageLoading(false), 500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Logo Dinámico según config
  const logoSrc = config?.logoBase64 || '/logo.png';
  const institutionName = config?.institutionName || 'Sistema Financiero DB';

  const menuItems = [
    { path: '/dashboard', label: 'Inicio', icon: <LayoutDashboard size={18} /> },
    { path: '/simulator', label: 'Simulador Crédito', icon: <Calculator size={18} /> },
    { path: '/investment', label: 'Inversiones', icon: <PieChart size={18} /> },
    ...(role === 'ADMIN' || role === 'SUPERADMIN' ? [{ path: '/investment-history', label: 'Historial Inversiones', icon: <TrendingUp size={18} /> }] : []),
    {
      path: (role === 'ADMIN' || role === 'SUPERADMIN') ? '/admin' : '/login',
      label: 'Configuración Institución',
      icon: (role === 'ADMIN' || role === 'SUPERADMIN') ? <Settings size={18} /> : <Lock size={18} />
    },
    ...(role === 'SUPERADMIN' ? [{ path: '/superadmin', label: 'Gestión SuperAdmin', icon: <FileCode size={18} /> }] : [])
  ];

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div className="sidebar-header" style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="flex items-center gap-3">
          <div className="logo-container" style={{ flexShrink: 0 }}>
            {logoSrc ? (
              <img src={logoSrc} alt="Logo" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              <div style={{ background: 'var(--primary)', padding: '0.6rem', borderRadius: 'var(--radius-md)', display: 'flex' }}>
                <Building2 size={28} color="white" />
              </div>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0', color: 'var(--text)', lineHeight: '1.2' }}>{institutionName}</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Módulo Financiero</span>
          </div>
        </div>
        <button className="mobile-only" style={{ background: 'transparent', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsMobileMenuOpen(false)}>
          <X size={20} color="var(--text-muted)" />
        </button>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, padding: '1rem 0.5rem', width: '100%' }}>
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: location.pathname === item.path ? 'var(--surface)' : 'transparent',
              color: location.pathname === item.path ? 'var(--primary-dark)' : 'var(--text-muted)',
              fontWeight: location.pathname === item.path ? '600' : '500',
              transition: 'var(--transition)',
              position: 'relative',
              fontSize: '0.9rem'
            }}
            className="hover:bg-surface-light"
          >
            {item.icon}
            {item.label}
            {location.pathname === item.path && (
              <motion.div
                layoutId="sidebar-active-indicator"
                style={{
                  position: 'absolute',
                  left: 0,
                  width: '3px',
                  height: '20px',
                  background: 'var(--primary)',
                  borderRadius: '0 4px 4px 0'
                }}
              />
            )}
          </Link>
        ))}
      </nav>

      {role !== 'GUEST' && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '1rem 0.5rem', width: '100%' }}>
          <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="btn w-full hover:bg-surface-light" style={{ background: 'transparent', color: 'var(--danger)', display: 'flex', justifyContent: 'flex-start', padding: '0.75rem 1rem', fontSize: '0.9rem', gap: '0.75rem' }}>
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="layout-wrapper" style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex' }}>
      <AnimatePresence>
        {isPageLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
               <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
               <h3 style={{ fontSize: '1rem', letterSpacing: '2px', color: 'var(--primary)', margin: 0 }}>{institutionName.toUpperCase()}</h3>
            </div>
            <style>{`
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Topbar */}
      <div className="mobile-topbar glass-panel" style={{ position: 'fixed', top: '1rem', left: '1rem', right: '1rem', zIndex: 30, display: 'none', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
          {logoSrc ? <img src={logoSrc} alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} /> : <Building2 size={22} color="var(--primary)" />}
          <strong style={{ color: 'var(--primary-dark)', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>{institutionName}</strong>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="glass-panel" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
          <Menu size={20} color="var(--text)" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar glass-panel" style={{ width: '280px', margin: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', position: 'sticky', top: '1rem', height: 'calc(100vh - 2rem)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', zIndex: 90 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
              className="glass-panel"
              style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '85%', maxWidth: '320px', display: 'flex', flexDirection: 'column', borderRadius: 0, zIndex: 100, padding: 0 }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="main-content" style={{ 
        flex: 1, 
        padding: '1rem 1rem 1rem 0', 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh', 
        overflow: 'hidden'
      }}>
        {/* Header (UserInfo) */}
        <header className="glass-panel header-desktop-only" style={{ padding: '0.75rem 1.25rem', marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginRight: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '600', color: 'var(--text)', fontSize: '0.85rem', lineHeight: '1.2' }}>
                {role === 'SUPERADMIN' ? 'SuperAdmin' : role === 'ADMIN' ? 'Usuario Administrador' : 'Cliente / Público'}
              </div>
              <div style={{ fontSize: '0.7rem', color: role !== 'GUEST' ? 'var(--primary)' : 'var(--text-muted)' }}>
                {role !== 'GUEST' ? 'Sesión Autorizada' : 'Modo Abierto'}
              </div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: role !== 'GUEST' ? 'var(--primary)' : 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border)' }}>
              {role !== 'GUEST' ? <Settings color="white" size={16} /> : <Lock color="var(--text-muted)" size={16} />}
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="content-scroll-area" style={{ flex: 1, overflowY: 'auto', paddingRight: '1rem', paddingBottom: '2rem' }}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ width: '100%' }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
