import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, PieChart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { config } = useAuth();
  const institutionName = config?.institutionName || 'Sistema Financiero DB';

  return (
    <div className="flex flex-col gap-4">
      <div className="glass-panel" style={{ padding: '3rem', position: 'relative' }}>
        <div style={{ maxWidth: '800px' }}>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--text)', lineHeight: 1.2, fontWeight: 700 }}>
            Bienvenido a <span style={{ color: 'var(--primary)' }}>{institutionName}</span>
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Tu plataforma integral para simulaciones de crédito e inversiones. 
            Configura, simula o invierte en un solo lugar.
          </p>
          <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
            <Link to="/simulator" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem', flex: '1 1 200px' }}>
              Simular Crédito <Calculator size={18} />
            </Link>
            <Link to="/investment" className="btn btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem', flex: '1 1 200px' }}>
              Inversiones <PieChart size={18} />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
        <div className="glass-panel">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)' }}>
            <Calculator color="var(--primary)" size={22} /> Tipos de Crédito
          </h3>
          <p>Ofrecemos simulación con sistema Francés y Alemán. Cotiza créditos de consumo, hipotecarios, de educación y más.</p>
          <Link to="/simulator" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', fontWeight: 600, color: 'var(--primary)' }}>
            Iniciar simulación <ArrowRight size={16} />
          </Link>
        </div>
        <div className="glass-panel">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)' }}>
            <PieChart color="var(--primary)" size={22} /> Inversiones
          </h3>
          <p>Módulo de inversión y rendimiento. Conoce las opciones disponibles y realiza la validación de identidad en línea.</p>
          <Link to="/investment" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', fontWeight: 600, color: 'var(--primary)' }}>
            Ver planes <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
