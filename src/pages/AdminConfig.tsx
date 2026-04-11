import React, { useState, useEffect } from 'react';
import { Settings, Save, Image as ImageIcon, Trash2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const AdminConfig = () => {
  const { config, updateConfig } = useAuth();

  const [institutionName, setInstitutionName] = useState('');

  const [credits, setCredits] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [insuranceRate, setInsuranceRate] = useState<number | string>(0);
  const [donationSolca, setDonationSolca] = useState<number | string>(0);
  const [logoBase64, setLogoBase64] = useState<string>('');
  const [showToast, setShowToast] = useState({ show: false, message: '', isReminder: false });

  const triggerToast = (msg: string, isReminder: boolean = false) => {
    setShowToast({ show: true, message: msg, isReminder });
    setTimeout(() => setShowToast({ show: false, message: '', isReminder: false }), 3000);
  };

  const defaultCredits = [
    { id: 1, name: 'Crédito de Consumo', minRate: 10, maxRate: 16.5, minAmount: 500, maxAmount: 20000 },
    { id: 2, name: 'Crédito Hipotecario', minRate: 8, maxRate: 11, minAmount: 20000, maxAmount: 500000 },
    { id: 3, name: 'Crédito Educativo', minRate: 7, maxRate: 9, minAmount: 1000, maxAmount: 30000 }
  ];

  const defaultInvestments = [
    { id: 1, name: 'Corto Plazo', minAmount: 100, maxAmount: 10000, minTerm: 1, maxTerm: 12 },
    { id: 2, name: 'Largo Plazo', minAmount: 5000, maxAmount: 100000, minTerm: 12, maxTerm: 120 },
    { id: 3, name: 'Ahora Flex', minAmount: 50, maxAmount: 50000, minTerm: 1, maxTerm: 60 }
  ];

  useEffect(() => {
    if (config) {
      setInstitutionName(config.institutionName || 'Sistema Financiero DB');
      setCredits(config.credits && config.credits.length > 0 ? config.credits : defaultCredits);
      setInvestments(config.investments && config.investments.length > 0 ? config.investments : defaultInvestments);
      setInsuranceRate(config.insuranceRate || 0);
      setDonationSolca(config.donationSolca || 0);
      setLogoBase64(config.logoBase64 || '');
    }
  }, [config]);
  const hasChanges = () => {
    if (!config) return false;
    const configCredits = (config.credits && config.credits.length > 0) ? config.credits : defaultCredits;
    const configInvestments = (config.investments && config.investments.length > 0) ? config.investments : defaultInvestments;

    // Normalización para comparación profunda
    const normalize = (arr: any[]) => JSON.stringify(arr.map(c => ({
      name: String(c.name).trim(),
      minRate: c.minRate !== undefined ? Number(c.minRate) : undefined,
      maxRate: c.maxRate !== undefined ? Number(c.maxRate) : undefined,
      minAmount: Number(c.minAmount),
      maxAmount: Number(c.maxAmount),
      minTerm: c.minTerm !== undefined ? Number(c.minTerm) : undefined,
      maxTerm: c.maxTerm !== undefined ? Number(c.maxTerm) : undefined
    })));

    const isNameDiff = institutionName !== (config.institutionName || 'Sistema Financiero DB');
    const isLogoDiff = logoBase64 !== (config.logoBase64 || '');
    const isInsDiff = Number(insuranceRate) !== Number(config.insuranceRate || 0);
    const isDonDiff = Number(donationSolca) !== Number(config.donationSolca || 0);
    const isCreditsDiff = normalize(credits) !== normalize(configCredits);
    const isInvestsDiff = normalize(investments) !== normalize(configInvestments);

    return isNameDiff || isLogoDiff || isInsDiff || isDonDiff || isCreditsDiff || isInvestsDiff;
  };

  const LEGAL_LIMITS: Record<string, { max: number }> = {
    'Consumo': { max: 17.30 },
    'Hipotecario': { max: 11.33 },
    'Educativo': { max: 9.50 },
    'Inversión': { max: 10.00 },
    'Default': { max: 25.00 }
  };

  const validateSingleRate = (credit: any) => {
    const limitKey = Object.keys(LEGAL_LIMITS).find(key => credit.name.includes(key)) || 'Default';
    const limit = LEGAL_LIMITS[limitKey];
    
    if (Number(credit.maxRate) > limit.max) {
      triggerToast(`⚠️ TASA ILEGAL: El "${credit.name}" no puede superar el ${limit.max}% legal.`, true);
      return false;
    }
    return true;
  };

  const validateLegalRates = () => {
    for (const credit of credits) {
      if (!validateSingleRate(credit)) return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateLegalRates()) return;

    await updateConfig({
       institutionName,
       logoBase64,
       credits,
       investments,
       insuranceRate: Number(insuranceRate),
       donationSolca: Number(donationSolca)
    });
    triggerToast("Los cambios fueron realizados con éxito.", false);
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
    <div className="flex flex-col gap-4 max-w-6xl">
      <div className="flex justify-between items-center">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings color="var(--primary-light)" /> Configuración de la Institución
        </h2>
        <button 
          className="btn btn-primary" 
          onClick={handleSave}
          disabled={!hasChanges()}
          style={{ 
            opacity: hasChanges() ? 1 : 0.5, 
            cursor: hasChanges() ? 'pointer' : 'not-allowed',
            filter: hasChanges() ? 'none' : 'grayscale(1)'
          }}
        >
          <Save size={18} /> Guardar Cambios
        </button>
      </div>

      <div style={{ background: 'rgba(var(--primary-rgb), 0.1)', borderLeft: '4px solid var(--primary)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'var(--text)', fontSize: '0.95rem', fontWeight: '500' }}>
        Recuerda siempre guardar los cambios en el botón superior para que se reflejen en tu sistema.
      </div>

      <AnimatePresence>
        {showToast.show && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ 
              position: 'fixed', 
              top: '10%', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              padding: '1.2rem 2.5rem', 
              background: 'var(--surface)', 
              color: 'var(--text)', 
              borderRadius: 'var(--radius-lg)', 
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              borderBottom: showToast.isReminder ? '4px solid var(--primary)' : '4px solid #10b981',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              minWidth: '400px'
            }}
          >
            {!showToast.isReminder && (
              <div style={{ background: '#d1fae5', padding: '0.8rem', borderRadius: '50%' }}>
                <CheckCircle size={28} color="#10b981" />
              </div>
            )}
            <div>
              <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.2rem' }}>{showToast.message}</div>
              {showToast.isReminder && (
                <div style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600' }}>
                  * Recuerde pulsar 'Guardar Cambios' para aplicar permanentemente.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>



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
                <th style={{ minWidth: '250px' }}>Tipo de Crédito</th>
                <th>Tasa Min (%)</th>
                <th>Tasa Max (%)</th>
                <th>Monto Min ($)</th>
                <th>Monto Max ($)</th>
                <th style={{ minWidth: '200px' }}>Acciones</th>
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
                    <td><input type="text" style={{ minWidth: '230px' }} value={credit.name} onChange={(e) => {
                      setCredits(prev => prev.map((c, i) => i === index ? { ...c, name: e.target.value } : c));
                    }} /></td>
                    <td><input type="number" step="0.1" value={credit.minRate} onChange={(e) => {
                      setCredits(prev => prev.map((c, i) => i === index ? { ...c, minRate: e.target.value } : c));
                    }} /></td>
                    <td><input type="number" step="0.1" value={credit.maxRate} onChange={(e) => {
                      setCredits(prev => prev.map((c, i) => i === index ? { ...c, maxRate: e.target.value } : c));
                    }} /></td>
                    <td><input type="number" value={credit.minAmount} onChange={(e) => {
                      setCredits(prev => prev.map((c, i) => i === index ? { ...c, minAmount: e.target.value } : c));
                    }} /></td>
                    <td><input type="number" value={credit.maxAmount} onChange={(e) => {
                      setCredits(prev => prev.map((c, i) => i === index ? { ...c, maxAmount: e.target.value } : c));
                    }} /></td>
                    <td style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', background: '#d1fae5', color: '#059669', border: 'none' }} onClick={() => {
                        if (validateSingleRate(credit)) {
                          triggerToast(`Fila "${credit.name}" validada correctamente.`, true);
                        }
                      }}>
                        <CheckCircle size={14} /> Aceptar
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', background: '#fee2e2', color: 'var(--danger)', border: 'none' }} onClick={() => {
                        setCredits(credits.filter((_, i) => i !== index));
                      }}>
                        <Trash2 size={14} /> Eliminar
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
        <div className="flex justify-between items-center mb-4">
          <h3 style={{ margin: 0 }}>Configuración de Tipos de Inversión</h3>
          <button className="btn btn-secondary" onClick={() => {
            const nextId = investments.length > 0 ? Math.max(...investments.map(c => c.id || 0)) + 1 : 1;
            setInvestments([...investments, { id: nextId, name: 'Nueva Inversión', minAmount: 100, maxAmount: 10000, minTerm: 1, maxTerm: 12 }]);
          }}>
            + Agregar Tipo
          </button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ minWidth: '250px' }}>Tipo de Inversión</th>
                <th>Monto Min ($)</th>
                <th>Monto Max ($)</th>
                <th>Plazo Min (Meses)</th>
                <th>Plazo Max (Meses)</th>
                <th style={{ minWidth: '200px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {investments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No hay tipos de inversión configurados. Haga clic en "+ Agregar Tipo" para comenzar.
                  </td>
                </tr>
              ) : (
                investments.map((inv, index) => (
                  <tr key={inv.id}>
                    <td><input type="text" style={{ minWidth: '230px' }} value={inv.name} onChange={(e) => {
                      setInvestments(prev => prev.map((c, i) => i === index ? { ...c, name: e.target.value } : c));
                    }} /></td>
                    <td><input type="number" value={inv.minAmount} onChange={(e) => {
                      setInvestments(prev => prev.map((c, i) => i === index ? { ...c, minAmount: e.target.value } : c));
                    }} /></td>
                    <td><input type="number" value={inv.maxAmount} onChange={(e) => {
                      setInvestments(prev => prev.map((c, i) => i === index ? { ...c, maxAmount: e.target.value } : c));
                    }} /></td>
                    <td><input type="number" value={inv.minTerm} onChange={(e) => {
                      setInvestments(prev => prev.map((c, i) => i === index ? { ...c, minTerm: e.target.value } : c));
                    }} /></td>
                    <td><input type="number" value={inv.maxTerm} onChange={(e) => {
                      setInvestments(prev => prev.map((c, i) => i === index ? { ...c, maxTerm: e.target.value } : c));
                    }} /></td>
                    <td style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', background: '#d1fae5', color: '#059669', border: 'none' }} onClick={() => {
                        triggerToast(`Fila "${inv.name}" validada correctamente.`, true);
                      }}>
                        <CheckCircle size={14} /> Aceptar
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', background: '#fee2e2', color: 'var(--danger)', border: 'none' }} onClick={() => {
                        setInvestments(investments.filter((_, i) => i !== index));
                      }}>
                        <Trash2 size={14} /> Eliminar
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
