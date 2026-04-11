import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, PieChart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { config } = useAuth();
  const institutionName = config?.institutionName || 'Financiero DB';

  return (
    <div className="flex flex-col gap-4">
      <div className="glass-panel" style={{ padding: '3rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          <h1 style={{ fontSize: '3rem', background: 'linear-gradient(to right, var(--primary-light), var(--secondary-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>
            Bienvenido a {institutionName}
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            Tu plataforma integral para simulaciones de crédito e inversiones. 
            Configura, simula o invierte en un solo lugar.
          </p>
          <div className="flex gap-4">
            <Link to="/simulator" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Simular Crédito <Calculator size={20} />
            </Link>
            <Link to="/investment" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Inversiones <PieChart size={20} />
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div style={{ position: 'absolute', right: '-10%', top: '-20%', width: '400px', height: '400px', background: 'var(--primary)', filter: 'blur(100px)', opacity: 0.2, borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', right: '10%', bottom: '-20%', width: '300px', height: '300px', background: 'var(--secondary)', filter: 'blur(100px)', opacity: 0.2, borderRadius: '50%' }}></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
        <div className="glass-panel">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calculator color="var(--primary-light)" /> Tipos de Crédito</h3>
          <p>Ofrecemos simulación con sistema Francés y Alemán. Cotiza créditos de consumo, hipotecarios, de educación y más.</p>
          <Link to="/simulator" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', fontWeight: 600 }}>
            Iniciar simulación <ArrowRight size={16} />
          </Link>
        </div>
        <div className="glass-panel">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><PieChart color="var(--secondary-light)" /> Inversiones Flex</h3>
          <p>Módulo de inversión inteligente. Sube tus documentos mediante un proceso fácil con validación biométrica en línea.</p>
          <Link to="/investment" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', fontWeight: 600 }}>
            Ver planes <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
