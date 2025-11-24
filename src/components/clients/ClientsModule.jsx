import React, { useState } from 'react';
import { Users, Plus, Search } from 'lucide-react';
import { initialClients } from '../../data/clientsData';
import ClientCard from './ClientCard';
import ClientModal from './ClientModal';
import StatsCard from '../common/StatsCard';

const ClientsModule = () => {
  const [clients, setClients] = useState(initialClients);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    nombre: '',
    telefono1: '',
    telefono2: '',
    email: '',
    empresa: '',
    direccion: '',
    activo: true
  });

  const handleOpenModal = (client = null) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        nombre: client.nombre || '',
        telefono1: client.telefono1 || '',
        telefono2: client.telefono2 || '',
        email: client.email || '',
        empresa: client.empresa || '',
        direccion: client.direccion || '',
        activo: client.activo
      });
    } else {
      setEditingClient(null);
      setFormData({
        nombre: '',
        telefono1: '',
        telefono2: '',
        email: '',
        empresa: '',
        direccion: '',
        activo: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = () => {
    const now = new Date();
    const created_at = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    if (editingClient) {
      setClients(prev => prev.map(client => 
        client.id === editingClient.id 
          ? { ...client, ...formData }
          : client
      ));
    } else {
      const newClient = {
        id: clients.length + 1,
        ...formData,
        created_at
      };
      setClients(prev => [newClient, ...prev]);
    }

    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      setClients(prev => prev.filter(client => client.id !== id));
    }
  };

  const toggleStatus = (id) => {
    setClients(prev => prev.map(client => 
      client.id === id ? { ...client, activo: !client.activo } : client
    ));
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.telefono1.includes(searchTerm);
    
    const matchesStatus = 
      filterStatus === 'all' ? true :
      filterStatus === 'active' ? client.activo :
      !client.activo;

    return matchesSearch && matchesStatus;
  });

  const totalClientes = clients.length;
  const clientesActivos = clients.filter(c => c.activo).length;
  const clientesInactivos = clients.filter(c => !c.activo).length;

  return (
    <div className="mx-auto">
      <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 mb-4 lg:mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Users className="text-blue-600 w-6 h-6 lg:w-8 lg:h-8" />
            <h1 className="text-xl lg:text-3xl font-bold text-gray-800">Gestión de Clientes</h1>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full lg:w-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Cliente</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <StatsCard title="Total Clientes" value={totalClientes} color="blue" icon={Users} />
          <StatsCard title="Clientes Activos" value={clientesActivos} color="green" icon={Users} />
          <StatsCard title="Clientes Inactivos" value={clientesInactivos} color="red" icon={Users} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-4 lg:mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, email, empresa o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            onEdit={handleOpenModal}
            onDelete={handleDelete}
            onToggleStatus={toggleStatus}
          />
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No se encontraron clientes</h3>
          <p className="text-gray-500">Intenta con otros criterios de búsqueda o agrega un nuevo cliente.</p>
        </div>
      )}

      <ClientModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        formData={formData}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        isEditing={!!editingClient}
      />
    </div>
  );
};

export default ClientsModule;