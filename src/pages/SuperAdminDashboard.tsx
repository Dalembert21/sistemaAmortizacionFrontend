import { useState, useEffect } from 'react';
import { Building, PlusCircle, Trash2, AlertTriangle } from 'lucide-react';

const SuperAdminDashboard = () => {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [newOrgName, setNewOrgName] = useState('');
  const [newUser, setNewUser] = useState('');
  const [newPass, setNewPass] = useState('');

  const fetchOrgs = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/orgs');
      if (res.ok) setOrgs(await res.json());
    } catch(e) {}
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ institutionName: newOrgName, adminUser: newUser, adminPass: newPass })
      });
      if (res.ok) {
         setNewOrgName(''); setNewUser(''); setNewPass('');
         fetchOrgs();
      }
    } catch(e) {}
  };

  const handleDelete = async (orgId: string, orgName: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${orgName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/orgs/${orgId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        alert('Organización eliminada exitosamente');
        fetchOrgs();
      } else {
        const error = await res.json();
        alert(`Error al eliminar: ${error.message || 'Error desconocido'}`);
      }
    } catch(e) {
      alert('Error de conexión al intentar eliminar la organización');
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Building color="var(--primary-light)" /> Gestión de Cooperativas / Bancos
      </h2>

      <div className="glass-panel text-left">
        <h3 className="mb-4">Crear Nueva Institución</h3>
        <form onSubmit={handleCreate} className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label>Nombre Institución</label>
            <input type="text" value={newOrgName} onChange={e => setNewOrgName(e.target.value)} required />
          </div>
          <div>
            <label>Usuario (Admin)</label>
            <input type="text" value={newUser} onChange={e => setNewUser(e.target.value)} required />
          </div>
          <div>
            <label>Contraseña</label>
            <input type="text" value={newPass} onChange={e => setNewPass(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '45px' }}>
            <PlusCircle size={18} /> Crear
          </button>
        </form>
      </div>

      <div className="glass-panel">
        <h3 className="mb-4">Instituciones Registradas ({orgs.length})</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID Organización</th>
                <th>Nombre</th>
                <th>Usuario Administrador</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map(org => (
                <tr key={org.id}>
                  <td>{org.id}</td>
                  <td style={{ fontWeight: 'bold' }}>{org.institutionName}</td>
                  <td>{org.adminUser}</td>
                  <td>
                    {org.id !== '11111111-1111-1111-1111-111111111111' ? (
                      <button 
                        onClick={() => handleDelete(org.id, org.institutionName)}
                        className="btn btn-danger"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        title="Eliminar organización"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <AlertTriangle size={16} /> Default
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
