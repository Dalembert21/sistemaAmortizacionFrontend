import React, { useState, useEffect } from 'react';
import { Settings, Save, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminConfig = () => {
  const { config, updateConfig } = useAuth();
  
  const [institutionName, setInstitutionName] = useState('');
  const [showBanner, setShowBanner] = useState(false);
  const [credits, setCredits] = useState<any[]>([]);
  const [insuranceRate, setInsuranceRate] = useState<number | string>(0);
  const [donationSolca, setDonationSolca] = useState<number | string>(0);
  const [primaryColor, setPrimaryColor] = useState('#E6621F');

  const [logoBase64, setLogoBase64] = useState<string>('');

  useEffect(() => {
    if (config) {
      setInstitutionName(config.institutionName || 'Financiera Financo');
      setCredits(config.credits || []);
      setInsuranceRate(config.insuranceRate || 0);
      setDonationSolca(config.donationSolca || 0);
      setLogoBase64(config.logoBase64 || '');
      setPrimaryColor(config.primaryColor || '#E6621F');
    }
  }, [config]);
  
  const handleSave = async () => {
    await updateConfig({
       institutionName,
       logoBase64,
       credits,
       insuranceRate: Number(insuranceRate),
       donationSolca: Number(donationSolca)
    });
    setShowBanner(true);
    setTimeout(() => { setShowBanner(false); }, 4000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!config) return <div className="p-4">Cargando configuración desde el servidor...</div>;

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <div className="flex justify-between items-center">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings color="var(--primary-light)" /> Configuración de la Institución
        </h2>
        <button className="btn btn-primary" onClick={handleSave}>
          <Save size={18} /> Guardar Cambios
        </button>
      </div>

      {showBanner && (
        <div className="animate-fade-in" style={{ 
          position: 'fixed', 
          top: '20px', 
          right: '20px', 
          padding: '1rem 2rem', 
          background: 'var(--surface)', 
          color: 'var(--text)', 
          borderRadius: 'var(--radius-md)', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          borderLeft: '5px solid #10b981',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ background: '#d1fae5', padding: '0.5rem', borderRadius: '50%' }}>
            <Save size={20} color="#10b981" />
          </div>
          <div>
            <div style={{ fontWeight: '600' }}>¡Éxito!</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Configuración guardada correctamente.</div>
          </div>
        </div>
      )}

      <div className="glass-panel">
        <h3 className="mb-4">Información General</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label>Nombre de la Institución</label>
            <input 
              type="text" 
              value={institutionName} 
              onChange={(e) => setInstitutionName(e.target.value)} 
            />
          </div>
          <div>
            <label>Logo de la Institución</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '50px', height: '50px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {logoBase64 ? <img src={logoBase64} alt="Pre-visualización" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <ImageIcon color="var(--text-muted)" />}
              </div>
              <input type="file" accept="image/*" style={{ padding: '0.5rem' }} onChange={handleLogoUpload} />
            </div>
          </div>
          <div>
            <label>Color Principal de la Plataforma</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input 
                type="color" 
                value={primaryColor} 
                onChange={(e) => setPrimaryColor(e.target.value)} 
                style={{ width: '60px', height: '40px', padding: '2px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{primaryColor}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel">
        <div className="flex justify-between items-center mb-4">
          <h3 style={{ margin: 0 }}>Configuración de Tipos de Crédito</h3>
          <button className="btn btn-secondary" onClick={() => {
            const nextId = credits.length > 0 ? Math.max(...credits.map(c => c.id || 0)) + 1 : 1;
            setCredits([...credits, { id: nextId, name: 'Nuevo Crédito', minRate: 5, maxRate: 15, minAmount: 100, maxAmount: 10000 }]);
          }}>
            + Agregar Tipo
          </button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tipo de Crédito</th>
                <th>Tasa Min (%)</th>
                <th>Tasa Max (%)</th>
                <th>Monto Min ($)</th>
                <th>Monto Max ($)</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {credits.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No hay tipos de crédito configurados. Haga clic en "+ Agregar Tipo" para comenzar.
                  </td>
                </tr>
              ) : (
                credits.map((credit, index) => (
                  <tr key={credit.id}>
                    <td><input type="text" value={credit.name} onChange={(e) => {
                      const newCredits = [...credits];
                      newCredits[index].name = e.target.value;
                      setCredits(newCredits);
                    }} /></td>
                    <td><input type="number" step="0.1" value={credit.minRate} onChange={(e) => {
                      const newCredits = [...credits];
                      newCredits[index].minRate = e.target.value;
                      setCredits(newCredits);
                    }} /></td>
                    <td><input type="number" step="0.1" value={credit.maxRate} onChange={(e) => {
                      const newCredits = [...credits];
                      newCredits[index].maxRate = e.target.value;
                      setCredits(newCredits);
                    }} /></td>
                    <td><input type="number" value={credit.minAmount} onChange={(e) => {
                      const newCredits = [...credits];
                      newCredits[index].minAmount = e.target.value;
                      setCredits(newCredits);
                    }} /></td>
                    <td><input type="number" value={credit.maxAmount} onChange={(e) => {
                      const newCredits = [...credits];
                      newCredits[index].maxAmount = e.target.value;
                      setCredits(newCredits);
                    }} /></td>
                    <td>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--danger)' }} onClick={() => {
                        setCredits(credits.filter((_, i) => i !== index));
                      }}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-panel">
        <h3 className="mb-4">Cobros Indirectos</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label>Seguro de Desgravamen (Porcentaje %)</label>
            <input 
              type="number" 
              step="0.01" 
              value={insuranceRate} 
              onChange={(e) => setInsuranceRate(e.target.value)} 
            />
            <small style={{ color: 'var(--text-muted)' }}>Se cobrará mensualmente este porcentaje</small>
          </div>
          <div>
            <label>Donación SOLCA / Fundaciones (Valor Exacto $)</label>
            <input 
              type="number" 
              step="0.5" 
              value={donationSolca} 
              onChange={(e) => setDonationSolca(e.target.value)} 
            />
            <small style={{ color: 'var(--text-muted)' }}>Costo fijo mensual</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConfig;
