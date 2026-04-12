import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const IndirectChargesConfig = () => {
  const { config, updateConfig } = useAuth();
  const [insuranceRate, setInsuranceRate] = useState(config?.insuranceRate || 10);
  const [donationSolca, setDonationSolca] = useState(config?.donationSolca || 2);

  useEffect(() => {
    if (config) {
      setInsuranceRate(config.insuranceRate || 10);
      setDonationSolca(config.donationSolca || 2);
    }
  }, [config]);

  const handleSave = async () => {
    const newConfig = {
      ...config,
      insuranceRate,
      donationSolca
    };
    await updateConfig(newConfig);
  };

  return (
    <div className="glass-panel">
      <h3 className="mb-4">Cobros Indirectos - Leyes Ecuador</h3>
      
      <div style={{ display: 'grid', gap: '2rem' }}>
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'var(--surface-light)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: 'var(--primary)' }}>
            🛡️ Seguro de Desgravamen
          </h4>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Porcentaje mensual cobrado según normativa ecuatoriana
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ minWidth: '120px' }}>Porcentaje (%):</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={insuranceRate}
              onChange={(e) => setInsuranceRate(parseFloat(e.target.value) || 0)}
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                width: '100px'
              }}
            />
            <span style={{ color: 'var(--text-muted)' }}>% mensual</span>
          </div>
        </div>

        <div style={{
          padding: '1.5rem',
          backgroundColor: 'var(--surface-light)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: 'var(--primary)' }}>
            💝 Donación SOLCA / Fundaciones
          </h4>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Costo fijo mensual para donaciones a instituciones benéficas
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ minWidth: '120px' }}>Valor ($):</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={donationSolca}
              onChange={(e) => setDonationSolca(parseFloat(e.target.value) || 0)}
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                width: '100px'
              }}
            />
            <span style={{ color: 'var(--text-muted)' }}>USD mensual</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <strong>Nota:</strong> Estos valores se aplican según la normativa financiera del Ecuador.
          Los cambios se reflejarán en los cálculos de créditos e inversiones.
        </div>
        <button
          onClick={handleSave}
          className="btn btn-primary"
          style={{ padding: '0.75rem 2rem' }}
        >
          Guardar Configuración
        </button>
      </div>

      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(59, 130, 246, 0.2)'
      }}>
        <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>
          📊 Resumen Actual
        </h5>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>Seguro Desgravamen:</strong> {insuranceRate}% mensual
          </div>
          <div>
            <strong>Donación SOLCA:</strong> ${donationSolca.toFixed(2)} mensual
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndirectChargesConfig;
