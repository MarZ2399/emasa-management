// src/components/quotations/QuotationsModule.jsx
import React, { useState, useEffect } from 'react';
import {
  FileText, Search, Calendar, DollarSign, Package,
  Eye, Pencil, Loader, RefreshCw, ChevronLeft, ChevronRight, Copy, Ban
} from 'lucide-react';
import QuotationEditModal from './QuotationEditModal';
import QuotationStatusBadge from './QuotationStatusBadge';
import QuotationPDFModal from './QuotationPDFModal';
import GenerateOrderModal from './GenerateOrderModal';
import SectionHeader from '../common/SectionHeader';
import quotationService from '../../services/quotationService';
import toast from 'react-hot-toast';
import Tooltip from '../common/Tooltip';
import { logActivity, EVENTOS } from '../../services/activityLogService';

const PAGE_SIZE = 10;

const QuotationsModule = () => {
  const [quotations, setQuotations]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // ── Filtros de fecha ──────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString().split('T')[0];
  const [dateFrom, setDateFrom] = useState(firstDayOfMonth);
  const [dateTo,   setDateTo]   = useState(today);

  // ── Paginación ────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);

  // ── Modales ───────────────────────────────────────────────────
  const [selectedQuotationForOrder, setSelectedQuotationForOrder] = useState(null);
  const [isOrderModalOpen,  setIsOrderModalOpen]  = useState(false);
  const [editingQuotation,  setEditingQuotation]  = useState(null);
  const [isEditModalOpen,   setIsEditModalOpen]   = useState(false);
  const [pdfQuotation,      setPdfQuotation]      = useState(null);
  const [isPdfModalOpen,    setIsPdfModalOpen]    = useState(false);

  useEffect(() => {
    fetchQuotations();
  }, []);

  // ── Helpers ───────────────────────────────────────────────────
  const mapEstadoBackendToFrontend = (estadoBackend) => {
  const estadoMap = {
    'PENDIENTE': 'pendiente',
    'ENVIADO':   'enviado',
    'ANULADO':   'anulado',
  };
  return estadoMap[estadoBackend] || 'pendiente';
};

  const formatDateFromInt = (dateInt) => {
    if (!dateInt) return new Date().toISOString().split('T')[0];
    const dateStr = String(dateInt).padStart(8, '0');
    return `${dateStr.substring(0,4)}-${dateStr.substring(4,6)}-${dateStr.substring(6,8)}`;
  };

  const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

const parseFecha = (fechaRaw) => {
  if (!fechaRaw) return new Date().toISOString().split('T')[0];

  // Si ya viene como string ISO "2026-02-23T05:00:00.000Z"
  if (typeof fechaRaw === 'string' && fechaRaw.includes('T')) {
    return fechaRaw.split('T')[0]; // ✅ toma solo "2026-02-23", sin timezone
  }

  // Si viene como string ISO sin T "2026-02-23"
  if (typeof fechaRaw === 'string' && fechaRaw.includes('-')) {
    return fechaRaw; // ✅ ya está bien
  }

  // Si viene como entero 20260223
  return formatDateFromInt(fechaRaw);
};

  // ── Fetch ─────────────────────────────────────────────────────
  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const response = await quotationService.listQuotations({ limit: 500, offset: 0 });

      if (response.success) {
        console.log('🔍 Primera cotización RAW:', response.data[0]);         // ← AQUÍ
      console.log('🔍 fechac RAW:', response.data[0]?.fechac);             // ← AQUÍ
      console.log('🔍 typeof fechac:', typeof response.data[0]?.fechac);   // ← AQUÍ
        const transformed = response.data.map(q => ({
          id:               q.id_cotizac,
          numeroCotizacion: q.correlativo_cotiza,
          fecha:            parseFecha(q.fechac),
          cliente:          q.cliente_nombre,
          ruc:              q.cliente_ruc,
          asesor:           q.vendedor || 'N/A',
          total:            parseFloat(q.total) || 0,
          estado:           mapEstadoBackendToFrontend(q.estado_transmision),
          monedc:           q.monedc,
          currency:         q.monedc === 2 ? 'USD' : 'PEN'
        }));
        setQuotations(transformed);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error al cargar cotizaciones:', error);
      toast.error('Error al cargar las cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    toast.promise(fetchQuotations(), {
      loading: 'Actualizando...',
      success: 'Lista actualizada',
      error:   'Error al actualizar'
    });
  };

  // ── Editar ────────────────────────────────────────────────────
  const handleEditQuotation = async (quotation) => {
    try {
      setLoading(true);
      const response = await quotationService.getQuotationById(quotation.id);

      if (response.success) {
        const { cabecera, detalles } = response.data;

        const productos = detalles.map((d, idx) => {
          const esUSD           = cabecera.monedc === 'USD' || cabecera.monedc === 2;
          const precioLista     = parseFloat(esUSD ? d.dprun_usd : d.dpruns) || 0;
          const precioNetoTotal = parseFloat(esUSD ? d.dinet_usd : d.dinets) || 0;
          const cantidad        = d.qaprbd || 0;
          const precioNetoUnitario = cantidad > 0
            ? parseFloat((precioNetoTotal / cantidad).toFixed(2))
            : 0;

          return {
            id:          idx + 1,
            codigo:      d.codigd,
            nombre:      d.nom_prod || d.nombre_producto || 'Producto sin nombre',
            descripcion: d.nom_prod || d.nombre_producto || 'Producto sin nombre',
            precioLista,
            precioUnitario: precioNetoUnitario,
            precioNeto:     precioNetoUnitario,
            cantidad,
            quantity:    cantidad,
            discount1:   d.pdsc1d || 0,
            discount2:   d.pdsc2d || 0,
            discount3:   d.pdsc3d || 0,
            discount4:   d.pdsc4d || 0,
            discount5:   d.pdsc5d || 0,
            descuento:   d.pdsc1d || 0,
            descuento5to: d.pdsc5d || 0,
            subtotal:    precioNetoTotal
          };
        });

        const subtotal = productos.reduce((s, p) => s + (p.subtotal || 0), 0);
        const igv      = subtotal * 0.18;
        const total    = subtotal + igv;

        setEditingQuotation({
          id:               quotation.id,
          numeroCotizacion: cabecera.correlativo_cotiza,
          fecha:            formatDateFromInt(cabecera.fechac),
          cliente:          cabecera.nomc,
          ruc:              String(cabecera.rucc),
          direccion:        cabecera.dirc || '',
          contacto:         cabecera.contac || '',
          telefono:         cabecera.telef1 || '',
          asesor:           cabecera.vend || 'N/A',
          moneda:           cabecera.monedc,
          currency:         cabecera.monedc === 'USD' || cabecera.monedc === 2 ? 'USD' : 'PEN',
          tipoCambio:       cabecera.tcvta || 3.75,
          formaPago:        cabecera.forpag || 'ADE',
          productos,
          subtotal, igv, total,
          observaciones:          cabecera.observaciones || '',
          observacionesCreditos:  cabecera.observaciones_creditos || '',
          observacionesLogistica: cabecera.observaciones_logistica || '',
          selectedClient: {
            nombreCliente: cabecera.nomc,
            ruc:           String(cabecera.rucc),
            direccion:     cabecera.dirc,
            distrito:      cabecera.disc,
            contacto:      cabecera.contac,
            telefono:      cabecera.telef1,
            vendedor:      cabecera.vend,
            fpago:         cabecera.forpag
          },
          estado: quotation.estado
        });
        setIsEditModalOpen(true);
      }
    } catch (error) {
      console.error('❌ Error al cargar detalle:', error);
      toast.error('Error al cargar el detalle de la cotización');
    } finally {
      setLoading(false);
    }
  };

  // ── Guardar edición ───────────────────────────────────────────
  const handleSaveEditedQuotation = async (updatedQuotation) => {
    try {
      setLoading(true);

      if (!updatedQuotation.productos?.length) {
        toast.error('❌ No hay productos para actualizar');
        return;
      }

      const productosValidos = updatedQuotation.productos.every(p =>
        Number(p.precioNeto || p.precioUnitario || 0) > 0 &&
        Number(p.cantidad   || p.quantity       || 0) > 0
      );

      if (!productosValidos) {
        toast.error('❌ Algunos productos tienen precio o cantidad en 0');
        return;
      }

      const { cabecera, detalles } = quotationService.prepareUpdatePayload(
        updatedQuotation,
        editingQuotation?.numeroCotizacion
      );

      if (cabecera.imporc === 0) {
        toast.error('❌ Error: El total calculado es 0');
        return;
      }

      const response = await quotationService.updateQuotation(
        editingQuotation.id, cabecera, detalles
      );

      if (response.success) {
        logActivity(EVENTOS.COTIZACION_EDITADA, editingQuotation.id);

        toast.success('✅ Cotización actualizada exitosamente');
        setIsEditModalOpen(false);
        setEditingQuotation(null);
        await fetchQuotations();
      } else {
        toast.error(`❌ ${response.error || 'Error al actualizar'}`);
      }
    } catch (error) {
      const msg = error.response?.data?.error || error.message || 'Error al actualizar';
      toast.error(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // ── Duplicar ──────────────────────────────────────────────────
const handleDuplicateQuotation = async (quotation) => {
  try {
    setLoading(true);
    const response = await quotationService.duplicateQuotation(quotation.id);

    if (response.success) {

       logActivity(EVENTOS.COTIZACION_DUPLICADA, response.data.id_cotizac);
       
      toast.success(
        `Cotización duplicada como ${response.data.correlativo_cotiza}`,
        { duration: 4000 }
      );
      await fetchQuotations();
    } else {
      toast.error(response.error || 'Error al duplicar la cotización');
    }
  } catch (err) {
    toast.error(err.response?.data?.error || err.message || 'Error al duplicar');
  } finally {
    setLoading(false);
  }
};

// Agregar después de handleDuplicateQuotation
const handleCancelQuotation = async (quotation) => {
  // Confirmación antes de anular
  const confirmar = window.confirm(
    `¿Estás seguro de anular la cotización ${quotation.numeroCotizacion}?\nEsta acción no se puede deshacer.`
  );
  if (!confirmar) return;

  try {
    setLoading(true);
    const response = await quotationService.cancelQuotation(quotation.id);

    if (response.success) {
      logActivity(EVENTOS.COTIZACION_ANULADA, quotation.id);
      toast.success(`Cotización ${quotation.numeroCotizacion} anulada correctamente`);
      // ✅ Actualizar estado localmente sin refetch
      setQuotations(prev =>
        prev.map(q => q.id === quotation.id ? { ...q, estado: 'anulado' } : q)
      );
    }
  } catch (error) {
    const msg = error.response?.data?.error || 'Error al anular la cotización';
    toast.error(msg);
  } finally {
    setLoading(false);
  }
};


  // ── Ver PDF ───────────────────────────────────────────────────
  const handleViewPDF = async (quotation) => {
    try {
      setLoading(true);
      const response = await quotationService.getQuotationById(quotation.id);

      if (response.success) {
        const { cabecera, detalles } = response.data;

        const productos = detalles.map((d, idx) => ({
          id:          idx + 1,
          codigo:      d.codigd,
          nombre:      d.nom_prod || d.nombre_producto || 'Producto sin nombre',
          precioLista: parseFloat(d.dprun_usd || d.dpruns || 0),
          precioNeto:  parseFloat((parseFloat(d.dinet_usd || d.dinets || 0) / (d.qaprbd || 1)).toFixed(2)),
          quantity:    d.qaprbd || 0,
          discount1:   d.pdsc1d || 0,
          discount5:   d.pdsc5d || 0
        }));

        const subtotal = productos.reduce((s, p) => s + p.precioNeto * p.quantity, 0);
        const igv      = subtotal * 0.18;
        const total    = subtotal + igv;

        setPdfQuotation({
          id:               quotation.id,
          numeroCotizacion: cabecera.correlativo_cotiza,
          fecha:            formatDateFromInt(cabecera.fechac),
          productos, subtotal, igv, total,
          selectedClient: {
            nombreCliente: cabecera.nomc,
            ruc:           String(cabecera.rucc),
            direccion:     cabecera.dirc,
            distrito:      cabecera.disc,
            contacto:      cabecera.contac,
            telefono:      cabecera.telef1
          },
          currency: cabecera.monedc === 2 ? 'USD' : 'PEN'
        });
        setIsPdfModalOpen(true);
      }
    } catch (error) {
      console.error('Error al cargar PDF:', error);
      toast.error('Error al cargar el PDF');
    } finally {
      setLoading(false);
    }
  };

  // ── Generar pedido ────────────────────────────────────────────
  const handleGenerateOrder = (orderData) => {
  setQuotations(prev =>
    prev.map(q =>
      q.id === selectedQuotationForOrder.id
        ? { ...q, estado: 'enviado' }  // ✅ antes era 'convertida'
        : q
    )
  );
  toast.success('¡Pedido generado y enviado al AS400 exitosamente!');
  setIsOrderModalOpen(false);
  setSelectedQuotationForOrder(null);
};

  const openGenerateOrderModal = (quotation) => {
  if (quotation.estado === 'enviado') {  // ✅ antes era 'convertida'
    toast.error('Esta cotización ya fue enviada al AS400');
    return;
  }
  setSelectedQuotationForOrder({
    ...quotation,
    clienteId:     quotation.id,
    clienteNombre: quotation.cliente,
    clienteRuc:    quotation.ruc
  });
  setIsOrderModalOpen(true);
};

  // ── Filtrado por búsqueda + estado + fecha ────────────────────
  const filteredQuotations = quotations.filter(q => {
    const matchesSearch =
      q.numeroCotizacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(q.ruc).includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || q.estado === statusFilter;

    const qDate = q.fecha; // "YYYY-MM-DD"
    const matchesDateFrom = !dateFrom || qDate >= dateFrom;
    const matchesDateTo   = !dateTo   || qDate <= dateTo;

    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  // ── Paginación ────────────────────────────────────────────────
  const totalPages  = Math.max(1, Math.ceil(filteredQuotations.length / PAGE_SIZE));
  const safePage    = Math.min(currentPage, totalPages);
  const pageStart   = (safePage - 1) * PAGE_SIZE;
  const pageEnd     = pageStart + PAGE_SIZE;
  const paginatedQuotations = filteredQuotations.slice(pageStart, pageEnd);

  // Resetear a página 1 cuando cambian filtros
  const handleSearchChange  = (v) => { setSearchTerm(v);    setCurrentPage(1); };
  const handleStatusChange  = (v) => { setStatusFilter(v);  setCurrentPage(1); };
  const handleDateFromChange = (v) => { setDateFrom(v);     setCurrentPage(1); };
  const handleDateToChange   = (v) => { setDateTo(v);       setCurrentPage(1); };

  // ── Página de carga inicial ───────────────────────────────────
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

      {/* ── Filtros ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col gap-3">

          {/* Fila 1: búsqueda + estado + botón actualizar */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por N° cotización, cliente o RUC..."
                value={searchTerm}
                onChange={e => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>

            <div className="md:w-56">
              <select
                value={statusFilter}
                onChange={e => handleStatusChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="enviado">Enviado al AS400</option>
                <option value="anulado">Cotización Anulada</option>
              </select>
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm disabled:opacity-50 whitespace-nowrap"
              title="Actualizar lista"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>

          {/* Fila 2: rango de fechas */}
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="font-medium whitespace-nowrap">Rango de fechas:</span>
            </div>

            <div className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2 flex-1">
                <label className="text-xs text-gray-500 whitespace-nowrap">Desde</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => handleDateFromChange(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
              
              <div className="flex items-center gap-2 flex-1">
                <label className="text-xs text-gray-500 whitespace-nowrap">Hasta</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => handleDateToChange(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>

              {/* Limpiar fechas */}
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => { setDateFrom(''); setDateTo(''); setCurrentPage(1); }}
                  className="px-3 py-2 text-xs text-gray-500 hover:text-red-500 border border-gray-300 rounded-lg hover:border-red-300 transition"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Cotizaciones</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{filteredQuotations.length}</p>
            </div>
            <FileText className="w-10 h-10 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">
                {filteredQuotations.filter(q => q.estado === 'pendiente').length}
              </p>
            </div>
            <Calendar className="w-10 h-10 text-yellow-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Enviadas al AS400</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {filteredQuotations.filter(q => q.estado === 'enviado').length}
              </p>
            </div>
            <Package className="w-10 h-10 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Anuladas</p>
              <p className="text-2xl font-bold text-red-900 mt-1">
                {filteredQuotations.filter(q => q.estado === 'anulado').length}
              </p>
            </div>
            <FileText className="w-10 h-10 text-red-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Valor Total</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                ${filteredQuotations.reduce((s, q) => s + q.total, 0).toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-purple-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                {['N° Cotización','Fecha','Cliente','RUC','Asesor','Total','Estado','Acciones'].map(h => (
                  <th
                    key={h}
                    className={`px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider ${h === 'Acciones' ? 'text-center' : 'text-left'}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedQuotations.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-lg font-medium">No se encontraron cotizaciones</p>
                    <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                  </td>
                </tr>
              ) : (
                paginatedQuotations.map(quotation => (
                  <tr key={quotation.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-green-600">{quotation.numeroCotizacion}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
  {formatDisplayDate(quotation.fecha)}  
</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{quotation.cliente}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{quotation.ruc}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{quotation.asesor}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-green-600">${quotation.total.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <QuotationStatusBadge estado={quotation.estado} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        
                        <Tooltip text="Duplicar cotización">
                          <button
                            onClick={() => handleDuplicateQuotation(quotation)}
                            disabled={loading}
                            className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 hover:scale-105 transition inline-flex items-center gap-2 text-sm font-bold shadow disabled:opacity-50"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </Tooltip>

                        <Tooltip text={quotation.estado === 'enviado' ? 'Cotización ya enviada al AS400' : 'Editar cotización'}>
                          <button
                            onClick={() => handleEditQuotation(quotation)}
                            disabled={loading || quotation.estado === 'enviado' || quotation.estado === 'anulado'}  
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:scale-105 transition inline-flex items-center gap-2 text-sm font-bold shadow disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </Tooltip>

                        <Tooltip text="Vista previa PDF">
                        <button
                          onClick={() => handleViewPDF(quotation)}
                          disabled={loading}
                          className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 hover:scale-105 transition inline-flex items-center gap-2 text-sm font-bold shadow disabled:opacity-50"
                          title="Previsualizar PDF"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        </Tooltip>

                        <Tooltip
                          text={quotation.estado === 'enviado' ? 'Ya enviada al AS400' : 'Generar pedido'}
                          position="top"
                        >
                          <button
                            onClick={() => openGenerateOrderModal(quotation)}
                            disabled={quotation.estado === 'enviado' || quotation.estado === 'anulado'}  
                            className={`px-3 py-2 rounded-lg font-medium transition inline-flex items-center gap-2 text-sm ${
                              quotation.estado === 'enviado'
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg'
                            }`}
                          >
                            <Package className="w-4 h-4" />
                          </button>
                        </Tooltip>


{/*                          
                        <Tooltip text={
                          quotation.estado === 'anulado' ? 'Ya anulada' :
                          quotation.estado === 'enviado' ? 'No se puede anular' :
                          'Anular cotización'
                        }>
                          <button
                            onClick={() => handleCancelQuotation(quotation)}
                            disabled={loading || quotation.estado === 'anulado' || quotation.estado === 'enviado'}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 hover:scale-105 transition inline-flex items-center gap-2 text-sm font-bold shadow disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        </Tooltip> */}
   

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Paginación ── */}
        {filteredQuotations.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              Mostrando{' '}
              <span className="font-semibold">{pageStart + 1}</span>
              {' – '}
              <span className="font-semibold">{Math.min(pageEnd, filteredQuotations.length)}</span>
              {' de '}
              <span className="font-semibold">{filteredQuotations.length}</span>
              {' cotizaciones'}
            </p>

            <div className="flex items-center gap-1">
              {/* Anterior */}
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Números de página */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p =>
                  p === 1 || p === totalPages ||
                  Math.abs(p - safePage) <= 1
                )
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition border ${
                        safePage === p
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-gray-300 hover:bg-white text-gray-700'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )
              }

              {/* Siguiente */}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modales ── */}
      <GenerateOrderModal
        quotation={selectedQuotationForOrder}
        isOpen={isOrderModalOpen}
        onClose={() => { setIsOrderModalOpen(false); setSelectedQuotationForOrder(null); }}
        onSave={handleGenerateOrder}
      />

      <QuotationEditModal
        isOpen={isEditModalOpen}
        quotation={editingQuotation}
        onClose={() => { setIsEditModalOpen(false); setEditingQuotation(null); }}
        onSave={handleSaveEditedQuotation}
      />

      <QuotationPDFModal
        quotation={pdfQuotation}
        isOpen={isPdfModalOpen}
        onClose={() => { setIsPdfModalOpen(false); setPdfQuotation(null); }}
      />
    </div>
  );
};

export default QuotationsModule;
