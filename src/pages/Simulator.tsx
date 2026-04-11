import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { AmortizationRow } from '../utils/amortization';
import { calculateAmortization } from '../utils/amortization';
import { generatePDF } from '../utils/pdfGenerator';
import { Download, Calculator } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Simulator = () => {
  const { config } = useAuth();

  const [selectedCreditId, setSelectedCreditId] = useState<number | null>(null);
  const [amount, setAmount] = useState(5000);
  const [months, setMonths] = useState(12);
  const [interest, setInterest] = useState(10.0);
  const [system, setSystem] = useState<'FRENCH' | 'GERMAN'>('FRENCH');
  const [table, setTable] = useState<AmortizationRow[]>([]);
  const [clientName, setClientName] = useState('Consumidor Final');

  // Fallback de créditos si no hay en el backend aún
  const defaultCredits = [
    { id: 1, name: 'Crédito de Consumo', minRate: 10, maxRate: 16.5, minAmount: 500, maxAmount: 20000 },
    { id: 2, name: 'Crédito Hipotecario', minRate: 8, maxRate: 11, minAmount: 20000, maxAmount: 500000 },
    { id: 3, name: 'Crédito Educativo', minRate: 7, maxRate: 9, minAmount: 1000, maxAmount: 30000 }
  ];

  const credits = (config && config.credits && config.credits.length > 0) ? config.credits : defaultCredits;
  const activeCreditType = credits.find((c: any) => c.id === selectedCreditId) || credits[0];

  React.useEffect(() => {
    if (credits.length > 0 && selectedCreditId === null) {
      setSelectedCreditId(credits[0].id);
      setAmount(credits[0].minAmount);
      setInterest(credits[0].minRate);
    }
  }, [credits, selectedCreditId]);

  React.useEffect(() => {
    // Si cambian los parámetros financieros, resetear la tabla para obligar a generarla de nuevo
    setTable([]);
  }, [amount, months, interest, system, selectedCreditId]);

  const [simError, setSimError] = useState('');

  const handleSimulate = () => {
    setSimError('');
    
    // Validaciones de límites configurados
    if (amount < activeCreditType.minAmount || amount > activeCreditType.maxAmount) {
      setSimError(`El monto debe estar entre $${activeCreditType.minAmount} y $${activeCreditType.maxAmount}`);
      return;
    }

    if (interest < activeCreditType.minRate || interest > activeCreditType.maxRate) {
      setSimError(`La tasa de interés debe estar entre ${activeCreditType.minRate}% y ${activeCreditType.maxRate}%`);
      return;
    }

    const indirectCosts = {
      insurancePercentage: config?.insuranceRate || 0,
      fixedCosts: config?.donationSolca || 0
    };

    const result = calculateAmortization({
      amount,
      months,
      annualInterestRate: interest,
      system,
      indirectCosts
    });
    setTable(result);
  };

  const handleDownload = () => {
    if (table.length > 0) {
      const systemName = system === 'FRENCH' ? 'Francés (Cuota Fija)' : 'Alemán (Cuota Decreciente)';
      const instName = config?.institutionName || 'Sistema Financiero DB';
      const logoBase64 = config?.logoBase64 || null;
      generatePDF(table, instName, clientName, systemName, logoBase64);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Calculator color="var(--primary-light)" /> Simulador de Créditos
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' }}>
        <div className="glass-panel h-fit">
          <h3 className="mb-4">Parámetros</h3>

          <div className="mb-4">
            <label>Tipo de Crédito</label>
            <select value={selectedCreditId || ''} onChange={(e) => {
              const cid = Number(e.target.value);
              setSelectedCreditId(cid);
              const c = credits.find((x: any) => x.id === cid);
              if (c) {
                setAmount(c.minAmount);
                setInterest(c.minRate);
              }
            }}>
              {credits.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label>Nombre del Cliente</label>
            <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>

          <div className="mb-4">
            <label>Monto a Solicitar ($)</label>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(Number(e.target.value))} 
              min={activeCreditType?.minAmount}
              max={activeCreditType?.maxAmount}
            />
            <small style={{ color: 'var(--text-muted)' }}>Sugerido: ${activeCreditType?.minAmount} - ${activeCreditType?.maxAmount}</small>
          </div>

          <div className="mb-4">
            <label>Plazo (Meses)</label>
            <input type="number" min="1" max="360" value={months} onChange={(e) => setMonths(Number(e.target.value))} />
          </div>

          <div className="mb-4">
            <label>Tasa de Interés Anual (%)</label>
            <input 
              type="number" 
              step="0.1" 
              value={interest} 
              onChange={(e) => setInterest(Number(e.target.value))} 
              min={activeCreditType?.minRate}
              max={activeCreditType?.maxRate}
            />
            <small style={{ color: 'var(--text-muted)' }}>Sugerido: {activeCreditType?.minRate}% - {activeCreditType?.maxRate}%</small>
          </div>

          <div className="mb-4">
            <label>Sistema de Amortización</label>
            <select value={system} onChange={(e) => setSystem(e.target.value as any)}>
              <option value="FRENCH">Sistema Francés (Cuota Fija)</option>
              <option value="GERMAN">Sistema Alemán (Cuota Decreciente)</option>
            </select>
          </div>

          {simError && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: '500' }}>
              ⚠️ {simError}
            </motion.div>
          )}

          <button className="btn btn-primary w-full mt-4" onClick={handleSimulate}>
            Generar Tabla
          </button>
        </div>

        <div className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 style={{ margin: 0 }}>Tabla de Pagos</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {table.length === 0 && (
                <div style={{ background: 'rgba(var(--primary-rgb), 0.1)', borderLeft: '4px solid var(--primary)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '0.9rem', fontWeight: '500' }}>
                  se habilita el boton descargar tabla si primero se genera una
                </div>
              )}
              <button className="btn btn-success" onClick={handleDownload} disabled={table.length === 0}>
                Descargar PDF
              </button>
            </div>
          </div>

          {table.length > 0 ? (
            <div className="table-container" style={{ maxHeight: '600px' }}>
              <motion.table initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <thead>
                  <tr>
                    <th>Mes</th>
                    <th>Saldo Inicial</th>
                    <th>Capital</th>
                    <th>Interés</th>
                    <th>Seguros/Otros</th>
                    <th>Cuota Total</th>
                    <th>Saldo Final</th>
                  </tr>
                </thead>
                <tbody>
                  {table.map((row) => (
                    <tr key={row.period}>
                      <td>{row.period}</td>
                      <td>${row.initialBalance.toFixed(2)}</td>
                      <td>${row.principal.toFixed(2)}</td>
                      <td>${row.interest.toFixed(2)}</td>
                      <td>${row.insurance.toFixed(2)}</td>
                      <td style={{ fontWeight: 'bold', color: 'var(--primary-dark)' }}>${row.totalPayment.toFixed(2)}</td>
                      <td>${row.finalBalance.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </motion.table>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Ingrese los parámetros y haga clic en "Generar Tabla"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Simulator;
