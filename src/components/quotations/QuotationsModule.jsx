// src/components/quotations/QuotationsModule.jsx
import React, { useState, useRef } from 'react';
import { FileText, Search, Filter, Plus, Calendar, DollarSign, Package, Eye } from 'lucide-react';
import { initialQuotations } from '../../data/quotationsData';
import QuotationStatusBadge from './QuotationStatusBadge';
import GenerateOrderModal from './GenerateOrderModal';
import PDFPreview from '../calls/PDFPreview';
import { previewQuotationPDF } from '../../utils/pdfGenerator';
import SectionHeader from '../common/SectionHeader';
import toast from 'react-hot-toast';

const QuotationsModule = () => {
  const [quotations, setQuotations] = useState(initialQuotations);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Ref para los PDFs ocultos
  const pdfRefs = useRef({});

  // Filtrado de cotizaciones
  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = 
      quotation.numeroCotizacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.ruc.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || quotation.estado === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleGenerateOrder = (orderData) => {
    console.log('Pedido generado:', orderData);
    
    // Actualizar estado de la cotización a "convertida"
    setQuotations(prev => 
      prev.map(q => 
        q.id === selectedQuotation.id 
          ? { ...q, estado: 'convertida' }
          : q
      )
    );

    // Aquí deberías enviar el pedido al backend
    // await createOrder(orderData);
    
    toast.success('¡Pedido generado exitosamente!');
    setIsModalOpen(false);
    setSelectedQuotation(null);
  };

  const openGenerateOrderModal = (quotation) => {
    if (quotation.estado === 'convertida') {
      toast.error('Esta cotización ya fue convertida a pedido');
      return;
    }
    
    // TRANSFORMAR datos para que coincidan con el modal
    const quotationForModal = {
      ...quotation,
      clienteId: quotation.id,
      clienteNombre: quotation.cliente,
      clienteRuc: quotation.ruc
    };
    
    setSelectedQuotation(quotationForModal);
    setIsModalOpen(true);
  };

  // Función para previsualizar PDF en nueva pestaña
  const handlePreviewPDF = async (quotation) => {
    const pdfRef = pdfRefs.current[quotation.id];
    
    if (!pdfRef) {
      toast.error('No se pudo generar la vista previa');
      return;
    }

    try {
      await previewQuotationPDF(pdfRef);
      toast.success('Vista previa PDF generada', { position: 'top-right' });
    } catch (error) {
      console.error('Error al generar vista previa:', error);
      toast.error('Error al generar la vista previa');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header usando SectionHeader */}
      <SectionHeader
        icon={FileText}
        title="Gestión de Cotizaciones"
        subtitle="Administra y visualiza todas las cotizaciones realizadas"
        showButton={false}
      />

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por N° cotización, cliente o RUC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Filtro por Estado */}
          <div className="md:w-64">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="convertida">Convertida a Pedido</option>
              <option value="rechazada">Rechazada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Cotizaciones</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{quotations.length}</p>
            </div>
            <FileText className="w-10 h-10 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">
                {quotations.filter(q => q.estado === 'pendiente').length}
              </p>
            </div>
            <Calendar className="w-10 h-10 text-yellow-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Convertidas</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {quotations.filter(q => q.estado === 'convertida').length}
              </p>
            </div>
            <Package className="w-10 h-10 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Valor Total</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                S/ {quotations.reduce((sum, q) => sum + q.total, 0).toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-purple-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Tabla de Cotizaciones */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  N° Cotización
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  RUC
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Asesor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-lg font-medium">No se encontraron cotizaciones</p>
                    <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((quotation) => (
                  <tr key={quotation.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-green-600">
                        #{quotation.numeroCotizacion}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(quotation.fecha).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {quotation.cliente}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {quotation.ruc}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {quotation.asesor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-green-600">
                        S/ {quotation.total.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <QuotationStatusBadge estado={quotation.estado} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Botón Ver PDF */}
                        <button
                          onClick={() => handlePreviewPDF(quotation)}
                          className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 hover:scale-105 transition inline-flex items-center gap-2 text-sm font-bold shadow"
                          title="Previsualizar PDF"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden lg:inline">PDF</span>
                        </button>

                        {/* Botón Generar Pedido */}
                        <button
                          onClick={() => openGenerateOrderModal(quotation)}
                          disabled={quotation.estado === 'convertida'}
                          className={`px-3 py-2 rounded-lg font-medium transition inline-flex items-center gap-2 text-sm ${
                            quotation.estado === 'convertida'
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg'
                          }`}
                        >
                          <Package className="w-4 h-4" />
                          <span className="hidden lg:inline">Generar Pedido</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDFPreview ocultos para cada cotización */}
      {quotations.map((quotation) => (
        <PDFPreview
          key={quotation.id}
          ref={(el) => (pdfRefs.current[quotation.id] = el)}
          selectedClient={quotation.selectedClient}
          quotationItems={quotation.productos}
          subtotal={quotation.subtotal}
          igv={quotation.igv}
          total={quotation.total}
          quotationNumber={quotation.numeroCotizacion}
        />
      ))}

      {/* Modal de Generar Pedido */}
      <GenerateOrderModal
        quotation={selectedQuotation}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedQuotation(null);
        }}
        onSave={handleGenerateOrder}
      />
    </div>
  );
};

export default QuotationsModule;
