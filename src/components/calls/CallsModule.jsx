// src/components/calls/CallsModule.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Phone, Plus, Search, Filter, Package, FileText, ShoppingCart } from 'lucide-react';
import { initialCallRecords } from '../../data/callsData';
import CallModal from './CallModal';
import ClientSearchPanel from './ClientSearchPanel';
import CallTableRow from './CallTableRow';
import ProductsTab from './ProductsTab';
import PurchaseHistoryTab from './PurchaseHistoryTab';
//import QuotationsList from './QuotationsList';
import QuotationTab from './QuotationTab';
import ConfirmDialog from '../common/ConfirmDialog';
import SectionHeader from '../common/SectionHeader';

const CallsModule = () => {
  // Estado para tabs
  const [activeTab, setActiveTab] = useState('calls');
  const [selectedClientRUC, setSelectedClientRUC] = useState(null); // ✅ NUEVO: Estado para RUC
  
  const [quotationItems, setQuotationItems] = useState([]);

  const [codigoProducto, setCodigoProducto] = useState('');
const [nombreProducto, setNombreProducto] = useState('');
const [hasSearched, setHasSearched] = useState(false);

  const [callRecords, setCallRecords] = useState(initialCallRecords);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(15);
  
  const [filters, setFilters] = useState({
    fechaInicio: '',
    fechaFin: '',
    asesor: '',
    tipoContacto: '',
    resultado: ''
  });
  
  const [formData, setFormData] = useState({
    estatusLlamada: '',
    contacto: '',
    telef1: '',
    telef2: '',
    usuario: '',
    clave: '',
    proxLlamada: '',
    observaciones: '',
    resultadoGestion: '',
    asesor: 'Usuario Actual'
  });

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    recordId: null
  });

  const handleClientSelect = (clientData) => {
    setSelectedClient(clientData);
    setSelectedClientRUC(clientData?.ruc || null); // ✅ Guardar RUC
    setCurrentPage(1);
    if (clientData) {
      setFormData(prev => ({
        ...prev,
        telef1: clientData.telefPadron || '',
        telef2: clientData.telefTV || '',
        usuario: clientData.usuario || '',
        asesor: clientData.vendedor || 'Usuario Actual'
      }));
    }
  };

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        estatusLlamada: record.estatusLlamada || '',
        contacto: record.contacto || '',
        telef1: record.telef1 || '',
        telef2: record.telef2 || '',
        usuario: record.usuario || '',
        clave: record.clave || '',
        proxLlamada: record.proxLlamada || '',
        observaciones: record.observaciones || '',
        resultadoGestion: record.resultadoGestion || '',
        asesor: record.asesor || 'Usuario Actual'
      });
    } else {
      setEditingRecord(null);
      if (selectedClient) {
        setFormData({
          estatusLlamada: '',
          contacto: '',
          telef1: selectedClient.telefPadron || '',
          telef2: selectedClient.telefTV || '',
          usuario: selectedClient.usuario || '',
          clave: '',
          proxLlamada: '',
          observaciones: '',
          resultadoGestion: '',
          asesor: selectedClient.vendedor || 'Usuario Actual'
        });
      } else {
        setFormData({
          estatusLlamada: '',
          contacto: '',
          telef1: '',
          telef2: '',
          usuario: '',
          clave: '',
          proxLlamada: '',
          observaciones: '',
          resultadoGestion: '',
          asesor: 'Usuario Actual'
        });
      }
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.contacto || !formData.telef1 || !formData.resultadoGestion) {
      toast.error('Por favor completa los campos obligatorios (*)');
      return;
    }

    if (!selectedClient) {
      toast.error('Debe seleccionar un cliente primero');
      return;
    }

    const now = new Date();
    const fechaGestion = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    if (editingRecord) {
      setCallRecords(prev => prev.map(record => 
        record.id === editingRecord.id 
          ? { ...record, ...formData, fechaGestion }
          : record
      ));
      toast.success('Llamada actualizada exitosamente');
    } else {
      const newRecord = {
        id: callRecords.length + 1,
        fechaGestion,
        ...formData,
        clienteRuc: selectedClient.ruc,
        clienteNombre: selectedClient.nombreCliente
      };
      setCallRecords(prev => [newRecord, ...prev]);
      toast.success('Llamada registrada exitosamente');
    }

    handleCloseModal();
  };

  const handleDelete = (id) => {
    setConfirmDialog({
      isOpen: true,
      recordId: id
    });
  };

  const confirmDelete = () => {
    if (confirmDialog.recordId) {
      setCallRecords(prev => prev.filter(record => record.id !== confirmDialog.recordId));
      toast.success('Llamada eliminada exitosamente');
    }
  };

  const handleClearFilters = () => {
    setFilters({
      fechaInicio: '',
      fechaFin: '',
      asesor: '',
      tipoContacto: '',
      resultado: ''
    });
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters({ ...filters, [filterName]: value });
    setCurrentPage(1);
  };

  const clientCallRecords = selectedClient 
    ? callRecords.filter(record => record.clienteRuc === selectedClient.ruc)
    : [];

  const filteredRecords = clientCallRecords.filter(record => {
    const matchesSearch = 
      record.asesor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.contacto && record.contacto.toLowerCase().includes(searchTerm.toLowerCase())) ||
      record.resultadoGestion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.observaciones && record.observaciones.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.telef1 && record.telef1.includes(searchTerm)) ||
      (record.usuario && record.usuario.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAsesor = !filters.asesor || record.asesor === filters.asesor;
    const matchesTipoContacto = !filters.tipoContacto || record.contacto === filters.tipoContacto;
    const matchesResultado = !filters.resultado || record.resultadoGestion === filters.resultado;

    return matchesSearch && matchesAsesor && matchesTipoContacto && matchesResultado;
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-6">
      {/* Header con título */}
      {/* <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Phone className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
            <p className="text-sm text-gray-500">Buscar cliente y gestionar llamadas</p>
          </div>
        </div>
      </div> */}
      {/* Reemplaza el header anterior con: */}
      <SectionHeader
        icon={Phone}
        title="Gestión de Clientes"
        subtitle="Buscar cliente y gestionar llamadas"
        showButton={false}
      />

      {/* Panel de Búsqueda de Cliente */}
      <ClientSearchPanel onClientSelect={handleClientSelect} />

      {/* Sistema de Tabs */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Tabs Header */}
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto whitespace-nowrap no-scrollbar">
            <button
              onClick={() => setActiveTab('calls')}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'calls'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Phone className="w-5 h-5" />
                <span>Historial de Llamadas</span>
              </div>
            </button>

            {/* ✅ NUEVO TAB: Últimas Compras */}
            <button
              onClick={() => setActiveTab('purchases')}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'purchases'
                  ? 'border-green-600 text-green-600 bg-green-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <span>Últimas Compras</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'products'
                  ? 'border-purple-600 text-purple-600 bg-purple-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Package className="w-5 h-5" />
                <span>Consulta de Productos</span>
              </div>
            </button>

            <button
  onClick={() => setActiveTab('quotations')}
  className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition ${
    activeTab === 'quotations'
      ? 'border-green-600 text-green-600 bg-green-50'
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
  }`}
>
  <div className="flex items-center justify-center gap-2">
    <FileText className="w-5 h-5" />
    <span>Cotización</span>
    {quotationItems.length > 0 && (
      <span className="ml-2 px-2.5 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
        {quotationItems.length}
      </span>
    )}
  </div>
</button>

            {/* <button
              onClick={() => setActiveTab('quotations')}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'quotations'
                  ? 'border-green-600 text-green-600 bg-green-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                <span>Cotizaciones</span>
              </div>
            </button> */}
          </nav>
        </div>

        {/* Tabs Content */}
        <div>
          {/* Tab: Historial de Llamadas */}
          {activeTab === 'calls' && (
            <>
              {selectedClient ? (
                <div>
                  {/* Header con título y botón */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">Historial de Contacto</h2>
                        <p className="text-sm text-gray-500 mt-1">
                          {filteredRecords.length} registro{filteredRecords.length !== 1 ? 's' : ''} encontrado{filteredRecords.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleOpenModal()}
                        className="bg-[#334a5e] hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2 shadow-sm"
                      >
                        <Plus className="w-5 h-5" />
                        Nueva Llamada
                      </button>
                    </div>
                  </div>

                  {/* Barra de búsqueda y filtros */}
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Buscar por asesor, resultado, teléfono u observaciones..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          />
                        </div>
                        <button 
                          onClick={() => setShowFilters(!showFilters)}
                          className={`px-4 py-2.5 border rounded-lg font-medium transition flex items-center gap-2 ${
                            showFilters 
                              ? 'bg-blue-50 border-blue-300 text-blue-700' 
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Filter className="w-5 h-5" />
                          Filtros
                        </button>
                      </div>

                      {/* Panel de Filtros Expandible */}
                      {showFilters && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Fecha Inicio
                              </label>
                              <input
                                type="date"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={filters.fechaInicio}
                                onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Fecha Fin
                              </label>
                              <input
                                type="date"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={filters.fechaFin}
                                onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Asesor
                              </label>
                              <select 
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={filters.asesor}
                                onChange={(e) => handleFilterChange('asesor', e.target.value)}
                              >
                                <option value="">Todos</option>
                                <option value="Yessir Florian">Yessir Florian</option>
                                <option value="Giancarlo Nicho">Giancarlo Nicho</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Tipo Contacto
                              </label>
                              <select 
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={filters.tipoContacto}
                                onChange={(e) => handleFilterChange('tipoContacto', e.target.value)}
                              >
                                <option value="">Todos</option>
                                <option value="Inbound">Inbound</option>
                                <option value="Outbound">Outbound</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Resultado
                              </label>
                              <select 
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={filters.resultado}
                                onChange={(e) => handleFilterChange('resultado', e.target.value)}
                              >
                                <option value="">Todos</option>
                                <option value="Venta">Venta</option>
                                <option value="- Cotización">Cotización</option>
                                <option value="Seguimiento / Consulta De Pedido">Seguimiento</option>
                                <option value="No Contesta">No Contesta</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="flex justify-end gap-2 mt-4">
                            <button 
                              onClick={handleClearFilters}
                              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white transition"
                            >
                              Limpiar Filtros
                            </button>
                            <button 
                              onClick={() => setShowFilters(false)}
                              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                              Aplicar Filtros
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tabla de Registros */}
                  <div className="overflow-hidden">
                    <div className="overflow-x-auto px-6 py-4">
                      <table className="w-full min-w-[1200px]">
                        <thead className="bg-[#334a5e] text-white">
                          <tr>
                            <th className="pl-6 pr-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-40 min-w-[160px]">
                              Fecha Gestión
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-80 min-w-[320px]">
                              Resultados Gestión
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-36 min-w-[140px]">
                              Asesor
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-28 min-w-[110px]">
                              Contacto
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-32 min-w-[120px]">
                              Telef 1
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-32 min-w-[120px]">
                              Telef 2
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-32 min-w-[120px]">
                              Usuario
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-72 min-w-[280px]">
                              Observaciones
                            </th>
                            <th className="pl-4 pr-6 py-3 text-center text-xs font-semibold uppercase tracking-wider w-28 min-w-[100px]">
                              Acciones
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200 bg-white">
                          {currentRecords.length > 0 ? (
                            currentRecords.map((record, index) => (
                              <CallTableRow
                                key={record.id}
                                record={record}
                                index={index}
                                onEdit={handleOpenModal}
                                onDelete={handleDelete}
                              />
                            ))
                          ) : (
                            <tr>
                              <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                                No se encontraron registros de llamadas
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Paginación */}
                  {filteredRecords.length > 0 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-gray-600">
                        Mostrando <span className="font-semibold">{indexOfFirstRecord + 1}</span> a{' '}
                        <span className="font-semibold">
                          {Math.min(indexOfLastRecord, filteredRecords.length)}
                        </span>{' '}
                        de <span className="font-semibold">{filteredRecords.length}</span> registros
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Anterior
                        </button>
                        
                        <div className="flex gap-1">
                          {[...Array(totalPages)].map((_, index) => {
                            const pageNumber = index + 1;
                            
                            if (
                              pageNumber === 1 ||
                              pageNumber === totalPages ||
                              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={pageNumber}
                                  onClick={() => handlePageChange(pageNumber)}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                    currentPage === pageNumber
                                      ? 'bg-blue-600 text-white'
                                      : 'border border-gray-300 hover:bg-white'
                                  }`}
                                >
                                  {pageNumber}
                                </button>
                              );
                            } else if (
                              pageNumber === currentPage - 2 ||
                              pageNumber === currentPage + 2
                            ) {
                              return <span key={pageNumber} className="px-2 text-gray-400">...</span>;
                            }
                            return null;
                          })}
                        </div>
                        
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Siguiente
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Busca un cliente para comenzar</h3>
                  <p className="text-gray-600">Ingresa el RUC o Razón Social en el panel de búsqueda superior</p>
                </div>
              )}
            </>
          )}

           {/* ✅ NUEVO TAB: Últimas Compras */}
          {activeTab === 'purchases' && (
            <div className="p-6">
              <PurchaseHistoryTab clienteRUC={selectedClientRUC} />
            </div>
          )}
          
          {/* Tab: Consulta de Productos */}
          {/* {activeTab === 'products' && (
            <div className="p-6">
              <ProductsTab />
            </div>
          )} */}
          {activeTab === 'products' && (
  <div className="p-6">
    <ProductsTab
    codigoProducto={codigoProducto}
    setCodigoProducto={setCodigoProducto}
    nombreProducto={nombreProducto}
    setNombreProducto={setNombreProducto}
    hasSearched={hasSearched}
    setHasSearched={setHasSearched}
    onAddToQuotation={prodData => {
      setQuotationItems(items => [...items, prodData]);
      setActiveTab('quotations'); // Cambia automáticamente al tab Cotización
    }}
  />
  </div>
)}

          {/* Tab: Cotizaciones */}
          {activeTab === 'quotations' && (
  <div className="p-6">
    <QuotationTab
      quotationItems={quotationItems}
      setQuotationItems={setQuotationItems}
      onBackToProducts={() => setActiveTab('products')}
      selectedClient={selectedClient} // Solo si tu QuotationTab espera este prop para mostrar en PDF
    />
  </div>
)}
          {/* {activeTab === 'quotations' && (
  <div className="p-6">
   <QuotationTab
  quotationItems={quotationItems}
  setQuotationItems={setQuotationItems}
/>
  </div>
)} */}

          {/* {activeTab === 'quotations' && (
            <div className="p-6">
              <QuotationsList selectedClient={selectedClient} />
            </div>
          )} */}
        </div>
      </div>

      {/* Modal */}
      <CallModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        formData={formData}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        isEditing={!!editingRecord}
      />

      {/* Modal de Confirmación */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, recordId: null })}
        onConfirm={confirmDelete}
        title="¿Estás seguro de eliminar este registro de llamada?"
        message="Esta acción no se puede deshacer. El registro será eliminado permanentemente."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default CallsModule;
