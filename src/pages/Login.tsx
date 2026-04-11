import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, LogIn, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(user, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Credenciales incorrectas.');
    }
  };

  return (
    <div className="flex" style={{ minHeight: '60vh', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
      <div className="glass-panel text-center animate-fade-in" style={{ width: '100%', maxWidth: '400px', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <img
            src="/logo.png"
            alt="Logo Sistema"
            style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              if ((e.target as HTMLImageElement).parentElement) {
                const fallback = (e.target as HTMLImageElement).parentElement!.querySelector('.fallback-icon') as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }
            }}
          />
          <div className="fallback-icon" style={{ display: 'none', width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary)', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(var(--primary-rgb), 0.2)' }}>
            <Lock size={30} color="white" />
          </div>
        </div>
        <h2>Acceso Plataforma</h2>
        <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>Ingrese sus credenciales para continuar.</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div>
            <input
              type="text"
              placeholder="Usuario"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingRight: '3rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--secondary)',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && <span style={{ color: 'var(--danger)', fontSize: '0.85rem', display: 'block', textAlign: 'left', marginTop: '-1rem' }}>{error}</span>}

          <button type="submit" className="btn btn-primary w-full mt-2">
            Ingresar <LogIn size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;