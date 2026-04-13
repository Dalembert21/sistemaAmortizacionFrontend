import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface IndirectCharge {
  id: number;
  name: string;
  chargeType: 'PERCENTAGE' | 'FIXED';
  value: number;
  calculationBase: 'INITIAL_BALANCE' | 'CURRENT_BALANCE' | 'FIXED_AMOUNT';
  isActive: boolean;
}

const IndirectChargesConfig = ({ 
  onChangesMade, 
  onChargesUpdate, 
  initialCharges 
}: { 
  onChangesMade: (hasChanges: boolean) => void;
  onChargesUpdate: (charges: IndirectCharge[]) => void;
  initialCharges?: IndirectCharge[];
}) => {
  const [charges, setCharges] = useState<IndirectCharge[]>([]);
  const [originalCharges, setOriginalCharges] = useState<IndirectCharge[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentCharge, setCurrentCharge] = useState<Partial<IndirectCharge>>({
    name: '',
    chargeType: 'PERCENTAGE',
    value: 0,
    calculationBase: 'INITIAL_BALANCE',
    isActive: true
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chargeToDelete, setChargeToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (initialCharges && initialCharges.length > 0) {
      const chargesList = initialCharges.map((ch: any) => ({
        ...ch,
        id: ch.id || Math.random(),
        value: typeof ch.value === 'string' ? parseFloat(ch.value.replace(',', '.')) : (typeof ch.value === 'number' ? ch.value : parseFloat(String(ch.value).replace(',', '.')))
      }));
      setCharges(chargesList);
      setOriginalCharges(JSON.parse(JSON.stringify(chargesList)));
    } else {
      // Si no hay cargos iniciales, dejar vacío
      setCharges([]);
      setOriginalCharges([]);
    }
  }, [initialCharges]);

  useEffect(() => {
    const hasChanges = JSON.stringify(charges) !== JSON.stringify(originalCharges);
    onChangesMade(hasChanges);
  }, [charges, originalCharges, onChangesMade]);

  // useEffect(() => {
  //   // Solo actualizar si los cargos han cambiado realmente
  //   if (JSON.stringify(charges) !== JSON.stringify(initialCharges || [])) {
  //     onChargesUpdate(charges);
  //   }
  // }, [charges, initialCharges, onChargesUpdate]);

  const handleAddCharge = () => {
    setModalMode('add');
    setCurrentCharge({
      name: '',
      chargeType: 'PERCENTAGE',
      value: 0,
      calculationBase: 'INITIAL_BALANCE',
      isActive: true
    });
    setShowModal(true);
  };

  const handleEditChargeModal = (charge: IndirectCharge) => {
    setModalMode('edit');
    setCurrentCharge(charge);
    setEditingId(charge.id);
    setShowModal(true);
  };

  const handleSaveModal = () => {
    if (modalMode === 'add') {
      if (currentCharge.name && currentCharge.value !== undefined && currentCharge.value >= 0) {
        const charge: IndirectCharge = {
          id: Date.now(),
          name: currentCharge.name!,
          chargeType: currentCharge.chargeType!,
          value: currentCharge.value!,
          calculationBase: currentCharge.calculationBase!,
          isActive: true
        };
        const newCharges = [...charges, charge];
        setCharges(newCharges);
        onChargesUpdate(newCharges);
      }
    } else if (modalMode === 'edit' && editingId !== null) {
      const updatedCharges = charges.map(c => 
        c.id === editingId 
          ? { ...c, ...currentCharge, id: editingId }
          : c
      );
      setCharges(updatedCharges);
      onChargesUpdate(updatedCharges);
      setEditingId(null);
    }
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleDeleteCharge = (id: number) => {
    setChargeToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteCharge = () => {
    if (chargeToDelete !== null) {
      const newCharges = charges.filter(charge => charge.id !== chargeToDelete);
      setCharges(newCharges);
      onChargesUpdate(newCharges);
      setShowDeleteModal(false);
      setChargeToDelete(null);
    }
  };

  const cancelDeleteCharge = () => {
    setShowDeleteModal(false);
    setChargeToDelete(null);
  };

  const handleToggleActive = (id: number) => {
    const updatedCharges = charges.map(charge => 
      charge.id === id ? { ...charge, isActive: !charge.isActive } : charge
    );
    setCharges(updatedCharges);
    onChargesUpdate(updatedCharges);
  };

  const handleEditCharge = (id: number, field: keyof IndirectCharge, value: any) => {
    setCharges(charges.map(charge => 
      charge.id === id ? { ...charge, [field]: value } : charge
    ));
  };

  const handleSaveEdit = (id: number) => {
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    // Restaurar valores originales
    const original = originalCharges.find(ch => ch.id === editingId);
    if (original) {
      setCharges(charges.map(charge => 
        charge.id === editingId ? original : charge
      ));
    }
  };

  const getCalculationBaseLabel = (base: string) => {
    switch (base) {
      case 'INITIAL_BALANCE': return 'Saldo Inicial';
      case 'CURRENT_BALANCE': return 'Saldo Actual';
      case 'FIXED_AMOUNT': return 'Monto Fijo';
      default: return base;
    }
  };

  const formatValue = (charge: IndirectCharge) => {
    if (charge.chargeType === 'PERCENTAGE') {
      return `${charge.value}%`;
    }
    return `$${charge.value.toFixed(2)}`;
  };

  return (
    <div className="glass-panel">
      <h3 className="mb-4">Configuración de Cobros Indirectos</h3>
      
      <div className="space-y-6">
        {charges.map((charge) => (
          <div key={charge.id} className="charge-item" style={{
            padding: '1.5rem',
            backgroundColor: 'var(--surface-light)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            opacity: charge.isActive ? 1 : 0.6
          }}>
            <div className="flex justify-between items-center">
              <div>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                  {charge.name}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {charge.chargeType === 'PERCENTAGE' ? `${charge.value}%` : `$${charge.value.toFixed(2)}`} 
                  {' '} sobre {charge.calculationBase === 'INITIAL_BALANCE' ? 'Saldo Inicial' : 
                            charge.calculationBase === 'CURRENT_BALANCE' ? 'Saldo Actual' : 'Monto Fijo'}
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={charge.isActive}
                    onChange={() => handleToggleActive(charge.id)}
                    style={{ cursor: 'pointer' }}
                  />
                  Activo
                </label>
                <button
                  onClick={() => handleEditChargeModal(charge)}
                  className="btn btn-secondary"
                  style={{ padding: '0.25rem 0.5rem' }}
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDeleteCharge(charge.id)}
                  className="btn btn-danger"
                  style={{ padding: '0.25rem 0.5rem' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        <button
          onClick={handleAddCharge}
          className="btn btn-secondary w-full"
          style={{ padding: '0.75rem' }}
        >
          <Plus size={16} /> Agregar Nuevo Cobro
        </button>

        {/* Modal */}
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'var(--surface)',
              padding: '2rem',
              borderRadius: 'var(--radius-lg)',
              width: '95%',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--text)' }}>
                {modalMode === 'add' ? 'Agregar Nuevo Cobro' : 'Editar Cobro'}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '1rem', color: 'var(--text)' }}>
                    Nombre del cobro
                  </label>
                  <input
                    type="text"
                    value={currentCharge.name || ''}
                    onChange={(e) => setCurrentCharge({ ...currentCharge, name: e.target.value })}
                    placeholder="Nombre del cobro"
                    style={{
                      padding: '0.75rem',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      width: '100%',
                      backgroundColor: 'var(--surface-light)',
                      color: 'var(--text)'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '1rem', color: 'var(--text)' }}>
                    Tipo de cobro
                  </label>
                  <select
                    value={currentCharge.chargeType}
                    onChange={(e) => setCurrentCharge({ ...currentCharge, chargeType: e.target.value as 'PERCENTAGE' | 'FIXED' })}
                    style={{
                      padding: '0.75rem',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      width: '100%',
                      backgroundColor: 'var(--surface-light)',
                      color: 'var(--text)'
                    }}
                  >
                    <option value="PERCENTAGE">Porcentaje</option>
                    <option value="FIXED">Monto Fijo</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '1rem', color: 'var(--text)' }}>
                    {currentCharge.chargeType === 'PERCENTAGE' ? 'Porcentaje' : 'Monto'}
                  </label>
                  <input
                    type="number"
                    value={currentCharge.value || ''}
                    onChange={(e) => setCurrentCharge({ ...currentCharge, value: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step={currentCharge.chargeType === 'PERCENTAGE' ? '0.1' : '0.01'}
                    placeholder={currentCharge.chargeType === 'PERCENTAGE' ? 'Porcentaje' : 'Monto'}
                    style={{
                      padding: '0.75rem',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      width: '100%',
                      backgroundColor: 'var(--surface-light)',
                      color: 'var(--text)'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '1rem', color: 'var(--text)' }}>
                    Base de cálculo
                  </label>
                  <select
                    value={currentCharge.calculationBase}
                    onChange={(e) => setCurrentCharge({ ...currentCharge, calculationBase: e.target.value as 'INITIAL_BALANCE' | 'CURRENT_BALANCE' | 'FIXED_AMOUNT' })}
                    style={{
                      padding: '0.75rem',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      width: '100%',
                      backgroundColor: 'var(--surface-light)',
                      color: 'var(--text)'
                    }}
                  >
                    <option value="INITIAL_BALANCE">Saldo Inicial</option>
                    <option value="CURRENT_BALANCE">Saldo Actual</option>
                    <option value="FIXED_AMOUNT">Monto Fijo</option>
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleCloseModal}
                  className="btn btn-secondary"
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveModal}
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  {modalMode === 'add' ? 'Agregar' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        {showDeleteModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'var(--surface)',
              padding: '2rem',
              borderRadius: 'var(--radius-lg)',
              width: '90%',
              maxWidth: '400px',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Trash2 size={28} color="#ef4444" />
                </div>
              </div>
              <h3 style={{ marginBottom: '1rem', color: 'var(--text)', fontSize: '1.25rem', fontWeight: '600' }}>
                ¿Seguro que quieres eliminar?
              </h3>
              <p style={{ marginBottom: '2rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Esta acción removerá este cobro indirecto. Recuerda "Guardar Cambios" al finalizar
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  onClick={cancelDeleteCharge}
                  className="btn btn-secondary"
                  style={{ padding: '0.75rem 2rem', fontSize: '0.95rem' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteCharge}
                  className="btn btn-danger"
                  style={{ 
                    padding: '0.75rem 2rem', 
                    fontSize: '0.95rem',
                    background: '#ef4444',
                    border: '1px solid #ef4444',
                    color: 'white'
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndirectChargesConfig;
