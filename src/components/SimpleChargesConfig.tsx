import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const SimpleChargesConfig = ({ onChangesMade }: { onChangesMade: (hasChanges: boolean) => void }) => {
  const { config } = useAuth();
  const [insuranceRate, setInsuranceRate] = useState(config?.insuranceRate || 0);
  const [donationSolca, setDonationSolca] = useState(config?.donationSolca || 0);
  const [tempInsuranceRate, setTempInsuranceRate] = useState(config?.insuranceRate || 0);
  const [tempDonationSolca, setTempDonationSolca] = useState(config?.donationSolca || 0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (config) {
      setInsuranceRate(config.insuranceRate || 0);
      setDonationSolca(config.donationSolca || 0);
      setTempInsuranceRate(config.insuranceRate || 0);
      setTempDonationSolca(config.donationSolca || 0);
    }
  }, [config]);

  useEffect(() => {
    const hasChanges = tempInsuranceRate !== insuranceRate || tempDonationSolca !== donationSolca;
    setHasUnsavedChanges(hasChanges);
    onChangesMade(hasChanges);
  }, [tempInsuranceRate, tempDonationSolca, insuranceRate, donationSolca, onChangesMade]);

  const handleAccept = () => {
    // Solo acepta los cambios localmente, no guarda en el sistema
    setInsuranceRate(tempInsuranceRate);
    setDonationSolca(tempDonationSolca);
    setHasUnsavedChanges(false);
    onChangesMade(false);
  };

  
  return (
    <div className="glass-panel">
      <h3 className="mb-4">Configuración de Cobros Adicionales</h3>
      
      <div style={{ display: 'grid', gap: '2rem' }}>
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'var(--surface-light)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: 'var(--primary)' }}>
            Seguro de Desgravamen
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
              value={tempInsuranceRate || ''}
              onChange={(e) => setTempInsuranceRate(parseFloat(e.target.value) || 0)}
              onFocus={(e) => e.target.select()}
              style={{ 
                width: '80px', 
                padding: '0.5rem', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--radius-sm)',
                textAlign: 'center'
              }}
            />
          </div>
        </div>

        <div style={{
          padding: '1.5rem',
          backgroundColor: 'var(--surface-light)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: 'var(--primary)' }}>
            Donación SOLCA / Fundaciones
          </h4>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Porcentaje opcional para donaciones benéficas
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ minWidth: '120px' }}>Porcentaje (%):</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={tempDonationSolca || ''}
              onChange={(e) => setTempDonationSolca(parseFloat(e.target.value) || 0)}
              onFocus={(e) => e.target.select()}
              style={{ 
                width: '80px', 
                padding: '0.5rem', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--radius-sm)',
                textAlign: 'center'
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Botón Guardar para este apartado */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        alignItems: 'center', 
        padding: '1rem 0', 
        borderTop: '1px solid var(--border)',
        marginTop: '1rem'
      }}>
        {hasUnsavedChanges && (
          <button 
            onClick={handleAccept}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}
          >
            Aceptar
          </button>
        )}
        {!hasUnsavedChanges && (
          <button 
            disabled
            className="btn btn-secondary"
            style={{ 
              padding: '0.5rem 1.5rem', 
              fontSize: '0.9rem',
              opacity: 0.6,
              cursor: 'not-allowed'
            }}
          >
            Aceptar
          </button>
        )}
      </div>
    </div>
  );
};

export default SimpleChargesConfig;
