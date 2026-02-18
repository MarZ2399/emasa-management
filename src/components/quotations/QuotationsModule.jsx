// src/components/quotations/QuotationsModule.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FileText, Search, Calendar, DollarSign, Package, Eye, Pencil, Loader } from 'lucide-react';
import QuotationEditModal from './QuotationEditModal';
import QuotationStatusBadge from './QuotationStatusBadge';
import QuotationPDFModal from './QuotationPDFModal';
import GenerateOrderModal from './GenerateOrderModal';
import SectionHeader from '../common/SectionHeader';
import quotationService from '../../services/quotationService';
import toast from 'react-hot-toast';

const QuotationsModule = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modales
  const [selectedQuotationForOrder, setSelectedQuotationForOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [pdfQuotation, setPdfQuotation] = useState(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const response = await quotationService.listQuotations({
        limit: 100,
        offset: 0
      });

      if (response.success) {
        const transformedQuotations = response.data.map(q => ({
          id: q.id_cotizac,
          numeroCotizacion: q.correlativo_cotiza,
          fecha: formatDateFromInt(q.fechac),
          cliente: q.cliente_nombre,
          ruc: q.cliente_ruc,
          asesor: q.vendedor || 'N/A',
          total: parseFloat(q.total) || 0,
          estado: mapEstadoBackendToFrontend(q.estado_transmision),
          monedc: q.monedc,
          currency: q.monedc === 2 ? 'USD' : 'PEN'
        }));

        setQuotations(transformedQuotations);
      }
    } catch (error) {
      console.error('Error al cargar cotizaciones:', error);
      toast.error('Error al cargar las cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  const mapEstadoBackendToFrontend = (estadoBackend) => {
    const estadoMap = {
      'PENDIENTE': 'pendiente',
      'APROBADO': 'convertida',
      'RECHAZADO': 'rechazada',
      'ANULADO': 'rechazada'
    };
    return estadoMap[estadoBackend] || 'pendiente';
  };

  const formatDateFromInt = (dateInt) => {
    if (!dateInt) return new Date().toISOString().split('T')[0];
    const dateStr = String(dateInt).padStart(8, '0');
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}-${month}-${day}`;
  };

  // ✅ Obtener detalle completo de la cotización para editar
  const handleEditQuotation = async (quotation) => {
    try {
      setLoading(true);
      console.log('📝 === ABRIENDO COTIZACIÓN PARA EDITAR ===');
      console.log('ID:', quotation.id);

      const response = await quotationService.getQuotationById(quotation.id);

      if (response.success) {
        const { cabecera, detalles } = response.data;

        console.log('📦 Datos recibidos del backend:');
        console.log('  - Cabecera:', cabecera);
        console.log('  - Detalles:', detalles);

        // ✅ Transformar detalles a formato de productos CON TODOS LOS CAMPOS
        const productos = detalles.map((d, idx) => {
          // Determinar si es USD o PEN
          const esUSD = cabecera.monedc === 'USD' || cabecera.monedc === 2;
          
          // Obtener valores según moneda
          const precioLista = parseFloat(esUSD ? d.dprun_usd : d.dpruns) || 0;
          const precioNetoTotal = parseFloat(esUSD ? d.dinet_usd : d.dinets) || 0;
          const cantidad = d.qaprbd || 0;
          
          // Calcular precio neto UNITARIO
          const precioNetoUnitario = cantidad > 0
  ? parseFloat((precioNetoTotal / cantidad).toFixed(2))  // ✅ igual que normalizeAndCalculate
  : 0;

          const producto = {
            id: idx + 1,
            codigo: d.codigd,
            nombre: d.nombre_producto || 'Producto sin nombre',
            descripcion: d.nombre_producto || 'Producto sin nombre',
            precioLista: precioLista,
            precioUnitario: precioNetoUnitario,
            precioNeto: precioNetoUnitario,  // ✅ PRECIO UNITARIO
            cantidad: cantidad,
            quantity: cantidad,
            discount1: d.pdsc1d || 0,
            discount2: d.pdsc2d || 0,
            discount3: d.pdsc3d || 0,
            discount4: d.pdsc4d || 0,
            discount5: d.pdsc5d || 0,
            descuento: d.pdsc1d || 0,
            descuento5to: d.pdsc5d || 0,
            subtotal: precioNetoTotal  // ✅ TOTAL DE LA LÍNEA
          };

          console.log(`  Producto ${idx + 1}:`, producto);
          return producto;
        });

        // Calcular totales
        const subtotal = productos.reduce((sum, p) => sum + (p.subtotal || 0), 0);
        const igv = subtotal * 0.18;
        const total = subtotal + igv;

        console.log('💰 Totales calculados:', { subtotal, igv, total });

        // Preparar datos completos para edición
        const quotationForEdit = {
          id: quotation.id,
          numeroCotizacion: cabecera.correlativo_cotiza,
          fecha: formatDateFromInt(cabecera.fechac),
          cliente: cabecera.nomc,
          ruc: String(cabecera.rucc),
          direccion: cabecera.dirc || '',
          contacto: cabecera.contac || '',
          telefono: cabecera.telef1 || '',
          asesor: cabecera.vend || 'N/A',
          moneda: cabecera.monedc,  // ✅ MANTENER FORMATO ORIGINAL
          currency: cabecera.monedc === 'USD' || cabecera.monedc === 2 ? 'USD' : 'PEN',
          tipoCambio: cabecera.tcvta || 3.75,
          formaPago: cabecera.forpag || 'ADE',
          productos,  // ✅ CON TODOS LOS CAMPOS CORRECTOS
          subtotal,
          igv,
          total,
          observaciones: cabecera.observaciones || '',
          observacionesCreditos: cabecera.observaciones_creditos || '',
          observacionesLogistica: cabecera.observaciones_logistica || '',
          selectedClient: {
            nombreCliente: cabecera.nomc,
            ruc: String(cabecera.rucc),
            direccion: cabecera.dirc,
            distrito: cabecera.disc,
            contacto: cabecera.contac,
            telefono: cabecera.telef1,
            vendedor: cabecera.vend,
            fpago: cabecera.forpag
          },
          estado: quotation.estado
        };

        console.log('✅ Cotización preparada para edición:', quotationForEdit);
        setEditingQuotation(quotationForEdit);
        setIsEditModalOpen(true);
      }
    } catch (error) {
      console.error('❌ Error al cargar detalle de cotización:', error);
      toast.error('Error al cargar el detalle de la cotización');
    } finally {
      setLoading(false);
    }
  };

  // ✅ ACTUALIZADO: Guardar cambios de la cotización editada
  const handleSaveEditedQuotation = async (updatedQuotation) => {
    try {
      setLoading(true);
      
      console.log('💾 === GUARDANDO COTIZACIÓN ACTUALIZADA ===');
      console.log('ID de cotización:', editingQuotation?.id);
      console.log('📦 Datos completos del modal:', updatedQuotation);
      console.log('📦 Productos del modal:', updatedQuotation.productos);

      // ✅ VALIDAR que los productos tengan valores válidos
      if (!updatedQuotation.productos || updatedQuotation.productos.length === 0) {
        toast.error('❌ No hay productos para actualizar');
        return;
      }

      const productosValidos = updatedQuotation.productos.every((p, idx) => {
        const precioNeto = Number(p.precioNeto || p.precioUnitario || 0);
        const cantidad = Number(p.cantidad || p.quantity || 0);
        const valido = precioNeto > 0 && cantidad > 0;
        
        if (!valido) {
          console.error(`❌ Producto ${idx + 1} inválido:`, p);
          console.error(`   - precioNeto: ${precioNeto}`);
          console.error(`   - cantidad: ${cantidad}`);
        }
        
        return valido;
      });

      if (!productosValidos) {
        toast.error('❌ Algunos productos tienen valores inválidos (precio o cantidad en 0)');
        return;
      }

      // ✅ Preparar payload usando la función helper del servicio
      const { cabecera, detalles } = quotationService.prepareUpdatePayload(updatedQuotation, editingQuotation?.numeroCotizacion)

      console.log('📤 === PAYLOAD PREPARADO PARA ENVIAR ===');
      console.log('Cabecera:', cabecera);
      console.log('  - IMPORC:', cabecera.imporc);
      console.log('  - MONEDC:', cabecera.monedc);
      console.log('Detalles:', detalles.length, 'productos');
      console.log('Primer detalle:', detalles[0]);

      // ✅ Validación final antes de enviar
      if (cabecera.imporc === 0) {
        console.error('❌ ERROR: Total es 0 antes de enviar');
        toast.error('❌ Error: El total calculado es 0');
        return;
      }

      // Enviar actualización al backend
      const response = await quotationService.updateQuotation(
        editingQuotation.id,
        cabecera,
        detalles
      );

      console.log('📥 Respuesta del servidor:', response);

      if (response.success) {
        toast.success('✅ Cotización actualizada exitosamente');
        setIsEditModalOpen(false);
        setEditingQuotation(null);
        
        // Recargar lista de cotizaciones
        await fetchQuotations();
      } else {
        toast.error(`❌ ${response.error || 'Error al actualizar la cotización'}`);
      }
    } catch (error) {
      console.error('❌ Error al actualizar cotización:', error);
      
      const errorMessage = error.response?.data?.error || error.message || 'Error al actualizar la cotización';
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Ver PDF de la cotización
  const handleViewPDF = async (quotation) => {
    try {
      setLoading(true);
      const response = await quotationService.getQuotationById(quotation.id);

      if (response.success) {
        const { cabecera, detalles } = response.data;

        const productos = detalles.map((d, idx) => ({
          id: idx + 1,
          codigo: d.codigd,
          nombre: d.nombre_producto || 'Producto sin nombre',
          precioLista: parseFloat(d.dprun_usd || d.dpruns || 0),
          precioNeto: parseFloat(d.dinet_usd || d.dinets || 0) / (d.qaprbd || 1),
          quantity: d.qaprbd || 0,
          discount1: d.pdsc1d || 0,
          discount5: d.pdsc5d || 0
        }));

        const subtotal = productos.reduce((sum, p) => sum + (p.precioNeto * p.quantity), 0);
        const igv = subtotal * 0.18;
        const total = subtotal + igv;

        const pdfData = {
          id: quotation.id,
          numeroCotizacion: cabecera.correlativo_cotiza,
          fecha: formatDateFromInt(cabecera.fechac),
          productos,
          subtotal,
          igv,
          total,
          selectedClient: {
            nombreCliente: cabecera.nomc,
            ruc: String(cabecera.rucc),
            direccion: cabecera.dirc,
            distrito: cabecera.disc,
            contacto: cabecera.contac,
            telefono: cabecera.telef1
          },
          currency: cabecera.monedc === 2 ? 'USD' : 'PEN'
        };

        setPdfQuotation(pdfData);
        setIsPdfModalOpen(true);
      }
    } catch (error) {
      console.error('Error al cargar PDF:', error);
      toast.error('Error al cargar el PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOrder = (orderData) => {
    console.log('📦 Pedido generado:', orderData);
    
    setQuotations(prev => 
      prev.map(q => 
        q.id === selectedQuotationForOrder.id 
          ? { ...q, estado: 'convertida' }
          : q
      )
    );

    toast.success('¡Pedido generado exitosamente!');
    setIsOrderModalOpen(false);
    setSelectedQuotationForOrder(null);
  };

  const openGenerateOrderModal = (quotation) => {
    if (quotation.estado === 'convertida') {
      toast.error('Esta cotización ya fue convertida a pedido');
      return;
    }
    
    const quotationForModal = {
      ...quotation,
      clienteId: quotation.id,
      clienteNombre: quotation.cliente,
      clienteRuc: quotation.ruc
    };
    
    setSelectedQuotationForOrder(quotationForModal);
    setIsOrderModalOpen(true);
  };

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = 
      quotation.numeroCotizacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(quotation.ruc).includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || quotation.estado === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading && quotations.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando cotizaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={FileText}
        title="Gestión de Cotizaciones"
        subtitle="Administra y visualiza todas las cotizaciones realizadas"
        showButton={false}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
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
                ${quotations.reduce((sum, q) => sum + q.total, 0).toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-purple-600 opacity-50" />
          </div>
        </div>
      </div>

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
                        {quotation.numeroCotizacion}
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
                        ${quotation.total.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <QuotationStatusBadge estado={quotation.estado} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditQuotation(quotation)}
                          disabled={loading}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:scale-105 transition inline-flex items-center gap-2 text-sm font-bold shadow disabled:opacity-50"
                          title="Editar cotización"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleViewPDF(quotation)}
                          disabled={loading}
                          className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 hover:scale-105 transition inline-flex items-center gap-2 text-sm font-bold shadow disabled:opacity-50"
                          title="Previsualizar PDF"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openGenerateOrderModal(quotation)}
                          disabled={quotation.estado === 'convertida'}
                          className={`px-3 py-2 rounded-lg font-medium transition inline-flex items-center gap-2 text-sm ${
                            quotation.estado === 'convertida'
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg'
                          }`}
                          title="Generar Pedido"
                        >
                          <Package className="w-4 h-4" />
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

      <GenerateOrderModal
        quotation={selectedQuotationForOrder}
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedQuotationForOrder(null);
        }}
        onSave={handleGenerateOrder}
      />

      <QuotationEditModal
        isOpen={isEditModalOpen}
        quotation={editingQuotation}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingQuotation(null);
        }}
        onSave={handleSaveEditedQuotation}
      />

      <QuotationPDFModal
        quotation={pdfQuotation}
        isOpen={isPdfModalOpen}
        onClose={() => {
          setIsPdfModalOpen(false);
          setPdfQuotation(null);
        }}
      />
    </div>
  );
};

export default QuotationsModule;
