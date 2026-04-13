import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, DollarSign, Calendar, Building, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface InvestmentRecord {
  id: string;
  client_name: string;
  client_identification: string;
  client_phone?: string;
  investment_type: string;
  amount: number;
  period_months: number;
  annual_rate: number;
  interest_earned: number;
  total_return: number;
  selected_bank: string;
  identity_validated: boolean;
  facial_recognition_score: number;
  status: string;
  created_at: string;
  processed_at: string;
}

interface InvestmentStats {
  totalInvestments: number;
  totalAmount: number;
  totalReturns: number;
  avgInvestment: number;
  investmentsByType: { [key: string]: { count: number; totalAmount: number } };
}

const InvestmentHistory = () => {
  const { role, orgId, config } = useAuth();
  const [investments, setInvestments] = useState<InvestmentRecord[]>([]);
  const [stats, setStats] = useState<InvestmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchInvestmentHistory();
    fetchInvestmentStats();
  }, []);

  const fetchInvestmentHistory = async () => {
    try {
      setLoading(true);
      // Los SuperAdmins ven todas las inversiones de todas las instituciones
      const endpoint = role === 'SUPERADMIN' 
        ? `${API_URL}/api/investment/all/history` 
        : `${API_URL}/api/investment/${orgId}/history`;
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Error al obtener historial de inversiones');
      }
      const data = await response.json();
      setInvestments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvestmentStats = async () => {
    try {
      // Los SuperAdmins ven estadísticas de todas las instituciones
      const endpoint = role === 'SUPERADMIN' 
        ? `${API_URL}/api/investment/all/stats` 
        : `${API_URL}/api/investment/${orgId}/stats`;
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Error al obtener estadísticas');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error al obtener estadísticas:', err);
    }
  };

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="spinner"></div>
        <p className="mt-4 text-muted">Cargando historial de inversiones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel text-center">
        <h3 className="text-red-500 mb-4">Error</h3>
        <p>{error}</p>
        <button className="btn btn-primary mt-4" onClick={fetchInvestmentHistory}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2">
          <TrendingUp color="var(--primary-light)" />
          Historial de Inversiones
        </h2>
        <div className="text-sm text-muted">
          {role === 'SUPERADMIN' ? 'SuperAdmin' : 'Administrador'} - {config?.institutionName || 'Sistema Financiero DB'}
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="glass-panel">
            <div className="flex items-center gap-2 text-muted text-sm">
              <TrendingUp size={16} />
              Total Inversiones
            </div>
            <div className="text-2xl font-bold mt-1">{stats.totalInvestments}</div>
          </div>
          <div className="glass-panel">
            <div className="flex items-center gap-2 text-muted text-sm">
              <DollarSign size={16} />
              Monto Total
            </div>
            <div className="text-2xl font-bold mt-1">{formatCurrency(stats.totalAmount)}</div>
          </div>
          <div className="glass-panel">
            <div className="flex items-center gap-2 text-muted text-sm">
              <TrendingUp size={16} />
              Retorno Total
            </div>
            <div className="text-2xl font-bold mt-1 text-green-500">{formatCurrency(stats.totalReturns)}</div>
          </div>
          <div className="glass-panel">
            <div className="flex items-center gap-2 text-muted text-sm">
              <DollarSign size={16} />
              Inversión Promedio
            </div>
            <div className="text-2xl font-bold mt-1">{formatCurrency(stats.avgInvestment)}</div>
          </div>
        </div>
      )}

      {/* Tabla de inversiones */}
      <div className="glass-panel">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Inversiones Registradas ({investments.length})</h3>
        </div>

        {investments.length === 0 ? (
          <div className="text-center py-8 text-muted">
            <Building size={48} className="mx-auto mb-4 opacity-50" />
            <p>No se encontraron inversiones</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Cliente</th>
                  <th className="text-left p-3">Contacto</th>
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-right p-3">Monto</th>
                  <th className="text-right p-3">Tasa</th>
                  <th className="text-right p-3">Retorno</th>
                  <th className="text-left p-3">Banco</th>
                  <th className="text-left p-3">Fecha</th>
                  <th className="text-center p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {investments.map((investment, index) => (
                    <motion.tr
                      key={investment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{investment.client_name}</span>
                          <span className="text-sm text-muted">{investment.client_identification}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col">
                          {investment.client_phone ? (
                            <>
                              <span className="text-sm font-medium">{investment.client_phone}</span>
                              <a 
                                href={`https://wa.me/593${investment.client_phone.substring(1)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-green-600 hover:text-green-700 underline"
                              >
                                WhatsApp
                              </a>
                            </>
                          ) : (
                            <span className="text-sm text-muted">No registrado</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {investment.investment_type}
                        </span>
                      </td>
                      <td className="p-3 text-right font-medium">
                        {formatCurrency(investment.amount)}
                      </td>
                      <td className="p-3 text-right">
                        {investment.annual_rate.toFixed(2)}%
                      </td>
                      <td className="p-3 text-right text-green-600 font-medium">
                        +{formatCurrency(investment.interest_earned)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Building size={16} className="text-muted" />
                          {investment.selected_bank}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <Calendar size={14} />
                          {formatDate(investment.created_at)}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleRowExpansion(investment.id)}
                          className="p-1 hover:bg-muted rounded transition-colors"
                        >
                          {expandedRows.has(investment.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            {/* Detalles expandidos */}
            <AnimatePresence>
              {Array.from(expandedRows).map(id => {
                const investment = investments.find(inv => inv.id === id);
                if (!investment) return null;

                return (
                  <motion.tr
                    key={`details-${id}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-muted/30"
                  >
                    <td colSpan={8} className="p-4">
                      <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                        <div>
                          <div className="text-sm text-muted">Plazo</div>
                          <div className="font-medium">{investment.period_months} meses</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted">Total a Recibir</div>
                          <div className="font-medium text-green-600">{formatCurrency(investment.total_return)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted">Validación Facial</div>
                          <div className="font-medium">{investment.facial_recognition_score}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted">Estado</div>
                          <div className="font-medium text-green-600">{investment.status}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted">Procesado</div>
                          <div className="font-medium">{formatDate(investment.processed_at)}</div>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentHistory;
