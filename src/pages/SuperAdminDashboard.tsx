import { useState, useEffect } from 'react';
import { Building, PlusCircle } from 'lucide-react';

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

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Building color="var(--primary-light)" /> Gestión de Cooperativas / Bancos
      </h2>

      <div className="glass-panel text-left">
        <h3 className="mb-4">Crear Nueva Institución</h3>
        <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
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
          <button type="submit" className="btn btn-primary h-full">
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
              </tr>
            </thead>
            <tbody>
              {orgs.map(org => (
                <tr key={org.id}>
                  <td>{org.id}</td>
                  <td style={{ fontWeight: 'bold' }}>{org.institutionName}</td>
                  <td>{org.adminUser}</td>
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
