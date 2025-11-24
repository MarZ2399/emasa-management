// src/components/calls/QuotationsList.jsx
import React, { useState } from 'react';
import { FileText, Plus, Search, Filter, Eye, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { initialQuotations, getStatusColor, calculateQuotationTotals } from '../../data/quotationsData';
import { initialProducts } from '../../data/productsData';

const QuotationsList = ({ selectedClient }) => {
  const [quotations, setQuotations] = useState(initialQuotations);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [formData, setFormData] = useState({
    clienteRuc: '',
    clienteNombre: '',
    vendedor: 'Usuario Actual',
    validezDias: 7,
    observaciones: '',
    items: []
  });

  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);

  const filteredQuotations = quotations.filter(quot => {
    const matchesClient = !selectedClient || quot.clienteRuc === selectedClient.ruc;
    const matchesSearch = 
      quot.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quot.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quot.vendedor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || quot.estado === filterStatus;
    return matchesClient && matchesSearch && matchesStatus;
  });

  const handleNewQuotation = () => {
    if (!selectedClient) {
      toast.error('Debe seleccionar un cliente primero');
      return;
    }
    setFormData({
      clienteRuc: selectedClient.ruc,
      clienteNombre: selectedClient.nombreCliente,
      vendedor: selectedClient.vendedor || 'Usuario Actual',
      validezDias: 7,
      observaciones: '',
      items: []
    });
    setIsModalOpen(true);
  };

  const handleAddProduct = () => {
    if (!selectedProduct) {
      toast.error('Seleccione un producto');
      return;
    }
    if (quantity <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    const subtotal = (selectedProduct.precio * quantity) * (1 - discount / 100);
    const newItem = {
      id: formData.items.length + 1,
      codigo: selectedProduct.codigo,
      producto: selectedProduct.nombre,
      cantidad: quantity,
      precioUnitario: selectedProduct.precio,
      descuento: discount,
      subtotal: Number(subtotal.toFixed(2))
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    setSelectedProduct(null);
    setProductSearch('');
    setQuantity(1);
    setDiscount(0);
    toast.success('Producto agregado');
  };

  const handleRemoveItem = (itemId) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
    toast.success('Producto eliminado');
  };

  const handleSaveQuotation = () => {
    if (formData.items.length === 0) {
      toast.error('Debe agregar al menos un producto');
      return;
    }

    const totals = calculateQuotationTotals(formData.items);
    const now = new Date();
    const fecha = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    
    const newQuotation = {
      id: quotations.length + 1,
      numero: `COT-2025-${String(quotations.length + 1).padStart(3, '0')}`,
      fecha,
      ...formData,
      ...totals,
      estado: 'Pendiente'
    };

    setQuotations([newQuotation, ...quotations]);
    setIsModalOpen(false);
    toast.success('Cotización creada exitosamente');
  };

  const handleViewQuotation = (quotation) => {
    setSelectedQuotation(quotation);
    setIsViewModalOpen(true);
  };

  const handleDeleteQuotation = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta cotización?')) {
      setQuotations(quotations.filter(q => q.id !== id));
      toast.success('Cotización eliminada');
    }
  };

  const filteredProducts = initialProducts.filter(p =>
    p.nombre.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.codigo.toLowerCase().includes(productSearch.toLowerCase())
  );

  const totals = formData.items.length > 0 ? calculateQuotationTotals(formData.items) : { subtotal: 0, igv: 0, total: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Cotizaciones</h2>
              <p className="text-green-100 mt-1">Crea y gestiona cotizaciones para clientes</p>
            </div>
          </div>
          <button
            onClick={handleNewQuotation}
            disabled={!selectedClient}
            className="bg-white text-green-600 px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2 shadow-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            Nueva Cotización
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Cotizaciones</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{quotations.length}</p>
            </div>
            <FileText className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {quotations.filter(q => q.estado === 'Pendiente').length}
              </p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aprobadas</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {quotations.filter(q => q.estado === 'Aprobada').length}
              </p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rechazadas</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {quotations.filter(q => q.estado === 'Rechazada').length}
              </p>
            </div>
            <div className="text-4xl">❌</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por número, cliente o vendedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
            >
              <option value="all">Todos los estados</option>
              <option value="Pendiente">Pendientes</option>
              <option value="Aprobada">Aprobadas</option>
              <option value="Rechazada">Rechazadas</option>
              <option value="Vencida">Vencidas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Cotizaciones */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Número</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Vendedor</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase">Total</th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase">Estado</th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredQuotations.length > 0 ? (
                filteredQuotations.map((quotation) => (
                  <tr key={quotation.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {quotation.numero}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {quotation.fecha}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {quotation.clienteNombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {quotation.vendedor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                      S/ {quotation.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(quotation.estado)}`}>
                        {quotation.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewQuotation(quotation)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Ver"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuotation(quotation.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    {!selectedClient ? 'Selecciona un cliente para ver sus cotizaciones' : 'No se encontraron cotizaciones'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales - Continúa en el siguiente mensaje por límite de caracteres */}
    </div>
  );
};

export default QuotationsList;
