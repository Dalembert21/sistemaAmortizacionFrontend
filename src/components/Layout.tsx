import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Calculator, Settings, PieChart, LayoutDashboard, Building2, Lock, LogOut, FileCode, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const location = useLocation();
  const { role, logout, config } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Logo Dinámico según config
  const logoSrc = config?.logoBase64 || '/logo.png';
  const institutionName = config?.institutionName || 'Sistema Financiero DB';

  const menuItems = [
    { path: '/dashboard', label: 'Inicio', icon: <LayoutDashboard size={20} /> },
    { path: '/simulator', label: 'Simulador Crédito', icon: <Calculator size={20} /> },
    { path: '/investment', label: 'Inversiones', icon: <PieChart size={20} /> },
    { 
      path: role === 'ADMIN' ? '/admin' : '/login', 
      label: 'Configuración Institución', 
      icon: role === 'ADMIN' ? <Settings size={20} /> : <Lock size={20} /> 
    },
    ...(role === 'SUPERADMIN' ? [{ path: '/superadmin', label: 'Gestión SuperAdmin', icon: <FileCode size={20} /> }] : [])
  ];

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between" style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', width: '100%' }}>
        <div className="flex items-center gap-4">
          <img src={logoSrc} alt="Logo" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%' }} onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            const fallback = (e.target as HTMLImageElement).parentElement?.querySelector('.fallback-icon') as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }} />
          <div className="fallback-icon" style={{ display: 'none', background: 'var(--primary)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
            <Building2 size={24} color="white" />
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0' }}>{institutionName}</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Módulo Financiero</span>
          </div>
        </div>
        {/* Close Button UI solo logica móvil */}
        <button className="mobile-only btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => setIsMobileMenuOpen(false)}>
          <X size={20} />
        </button>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, marginTop: '1rem', width: '100%' }}>
        {menuItems.map((item) => (
          <Link 
            key={item.label} 
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: location.pathname === item.path ? 'var(--surface)' : 'transparent',
              color: location.pathname === item.path ? 'var(--primary-dark)' : 'var(--text-muted)',
              fontWeight: location.pathname === item.path ? '600' : '500',
              transition: 'var(--transition)',
              position: 'relative'
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
                  width: '4px',
                  height: '24px',
                  background: 'var(--primary)',
                  borderRadius: '0 4px 4px 0'
                }}
              />
            )}
          </Link>
        ))}
      </nav>

      {role !== 'GUEST' && (
         <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', width: '100%' }}>
           <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="btn w-full hover:bg-surface-light" style={{ background: 'transparent', color: 'var(--danger)', display: 'flex', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}>
              <LogOut size={20} /> Cerrar Sesión
           </button>
         </div>
      )}
    </>
  );

  return (
    <div className="layout-wrapper" style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {/* Mobile Topbar */}
      <div className="mobile-topbar glass-panel" style={{ display: 'none', justifyContent: 'space-between', alignItems: 'center', margin: '1rem', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {logoSrc ? <img src={logoSrc} alt="Logo" style={{ width: '30px' }} /> : <Building2 color="var(--primary)" />}
          <strong style={{ color: 'var(--primary-dark)' }}>{institutionName}</strong>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
          <Menu size={24} />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar glass-panel" style={{ width: '280px', margin: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.aside 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              onClick={e => e.stopPropagation()}
              className="glass-panel" 
              style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '80%', maxWidth: '300px', display: 'flex', flexDirection: 'column', borderRadius: 0, zIndex: 50 }}
            >
               <SidebarContent />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="main-content" style={{ flex: 1, padding: '1rem 2rem 1rem 0', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {/* Header */}
        <header className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '600', color: 'var(--text)' }}>
                 {role === 'SUPERADMIN' ? 'SuperAdmin' : role === 'ADMIN' ? 'Usuario Administrador' : 'Cliente / Público'}
              </div>
              <div style={{ fontSize: '0.8rem', color: role !== 'GUEST' ? 'var(--primary)' : 'var(--secondary)' }}>
                 {role !== 'GUEST' ? 'Sesión Autorizada' : 'Modo Abierto'}
              </div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: role !== 'GUEST' ? 'var(--primary)' : 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               {role !== 'GUEST' ? <Settings color="white" size={20} /> : <Lock color="var(--text-muted)" size={20} />}
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', paddingBottom: '2rem' }}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ height: '100%' }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
