// CallHistoryTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, Search, Filter, Loader2 } from 'lucide-react';
import {
  getCalls,
  createCall,
  updateCall,
  deleteCall,
  prepareCallPayload
} from '../../services/callService';
import { getCatalogos } from '../../services/catalogoService';  //  NUEVO
import CallModal    from './CallModal';
import CallTableRow from './CallTableRow';
import ConfirmDialog from '../common/ConfirmDialog';
import { logActivity, EVENTOS } from '../../services/activityLogService';
import CallDetailModal from './CallDetailModal';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

// ── Formulario vacío alineado al schema ems.llamada ───────────────────────────
const EMPTY_FORM = {
  ruc_emp_contacto:      '',
  raz_social:            '',
  nombre_contactado:     '',
  estatus_llamada:       '',
  id_tipo_contacto:      '',
  tipo_contacto_nom:     '',
  telefono_1:            '',
  telefono_2:            '',
  id_resultado_gestion:  '',
  resultado_gestion_nom: '',
  fecha_prox_llamada:    '',
  observaciones:         '',
  nom_asesor:            '',
  codigo_vend:           ''
};

const CallHistoryTab = ({ selectedClient }) => {

  const { user } = useContext(AuthContext);

  // ── Estado principal ──────────────────────────────────────────────────────────
  const [calls,         setCalls]         = useState([]);
  const [total,         setTotal]         = useState(0);
  const [loading,       setLoading]       = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchTerm,    setSearchTerm]    = useState('');
  const [showFilters,   setShowFilters]   = useState(false);
  const [currentPage,   setCurrentPage]   = useState(1);
  const [tiposContacto, setTiposContacto] = useState([]);
  const [resultados,    setResultados]    = useState([]);
  const [recordsPerPage]                  = useState(15);
  const [detailRecord, setDetailRecord] = useState(null);

  const [filters, setFilters] = useState({
    fecha_desde: '',
    fecha_hasta: '',
    resultado:   ''
  });

  const [formData,      setFormData]      = useState(EMPTY_FORM);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, recordId: null });

  // ── Catálogos — un solo request para ambos ────────────────────────────────────
  useEffect(() => {
    getCatalogos(['TIPO_CONTACTO', 'RESULTADO_GESTION'])
      .then(r => {
        setTiposContacto(r.data?.TIPO_CONTACTO     ?? []);
        setResultados(
  (r.data?.RESULTADO_GESTION ?? []).map(r => ({
    value:        r.value,
    nombre_largo: r.descripcion ?? r.label,  // ← descripcion es el alias de nombre_largo
  }))
);
      })
      .catch(() => toast.error('Error al cargar catálogos', { position: 'top-right' }));
  }, []);

  // ── Fetch llamadas ────────────────────────────────────────────────────────────
  const fetchCalls = useCallback(async () => {
    if (!selectedClient?.ruc) return;

    setLoading(true);
    try {
      console.log('📋 Cargando llamadas del cliente:', selectedClient.ruc);

      const result = await getCalls({
        ruc:         selectedClient.ruc,
        fecha_desde: filters.fecha_desde || undefined,
        fecha_hasta: filters.fecha_hasta || undefined,
        page:        currentPage,
        limit:       recordsPerPage
      });

      console.log(' Llamadas cargadas:', result.total);
      setCalls(result.data  ?? []);
      setTotal(result.total ?? 0);
    } catch (error) {
      console.error('❌ Error al cargar llamadas:', error);
      toast.error('Error al cargar las llamadas', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  }, [selectedClient, filters, currentPage, recordsPerPage]);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  // ── Resetear cuando cambia el cliente ─────────────────────────────────────────
  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm('');
    setFilters({ fecha_desde: '', fecha_hasta: '', resultado: '' });
  }, [selectedClient?.ruc]);

  // ── Modal — abrir ─────────────────────────────────────────────────────────────
  const handleOpenModal = (record = null) => {
    if (record) {
      console.log('✏️ Editando llamada ID:', record.id_llamada);
      console.log('🔍 selectedClient completo:', selectedClient);
      setEditingRecord(record);
      setFormData({
        ruc_emp_contacto:      record.ruc_emp_contacto      || selectedClient?.ruc           || '',
        raz_social:            record.raz_social            || selectedClient?.nombreCliente  || '',
        nombre_contactado:     record.nombre_contactado     || '',
        estatus_llamada:       record.estatus_llamada       || '',
        id_tipo_contacto:      record.id_tipo_contacto      ? Number(record.id_tipo_contacto)     : '',
        tipo_contacto_nom:     record.tipo_contacto_nom     || '',
        telefono_1:            record.telefono_1            || '',
        telefono_2:            record.telefono_2            || '',
        id_resultado_gestion:  record.id_resultado_gestion  ? Number(record.id_resultado_gestion) : '',
        resultado_gestion_nom: record.resultado_gestion_nom || '',
        fecha_prox_llamada:    record.fecha_prox_llamada
          ? new Date(record.fecha_prox_llamada).toISOString().slice(0, 16)
          : '',
        observaciones:         record.observaciones         || '',
        codigo_vend: selectedClient?.raw?.VENDEDORCOD?.trim() || '',
  nom_asesor:  selectedClient?.raw?.VENDEDORNOM?.trim() || '',
        
      });
    } else {
  console.log('➕ Nueva llamada para cliente:', selectedClient?.ruc);
  setEditingRecord(null);

  const codVend   = user?.empresa?.codigo_vendedor?.trim() ?? user?.codigo_sis?.trim() ?? '';
  const nomAsesor = codVend && user?.nombreCompleto
    ? `${codVend} - ${user.nombreCompleto.toUpperCase()}`
    : user?.nombreCompleto?.toUpperCase() ?? '';

  setFormData({
    ...EMPTY_FORM,
    ruc_emp_contacto: selectedClient?.ruc           || '',
    raz_social:       selectedClient?.nombreCliente || '',
    telefono_1:       selectedClient?.telefPadron   || '',
    telefono_2:       selectedClient?.telefTV       || '',
    id_asesor:        user?.id_usuario              ?? '',  // → 4
    codigo_vend:      codVend,                              // → "DM1"
    nom_asesor:       nomAsesor,                            // → "DM1 - DAVID MEJIA"
  });
    }
    setIsModalOpen(true);
  };

  // ── Modal — cerrar ────────────────────────────────────────────────────────────
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const handleViewRecord = (record) => setDetailRecord(record);

  // ── Submit — crear / actualizar ───────────────────────────────────────────────
  const handleSubmit = async () => {

    console.log('🔍 formData al hacer submit:', {
    id_tipo_contacto:     formData.id_tipo_contacto,
    typeof_tipo:          typeof formData.id_tipo_contacto,
    id_resultado_gestion: formData.id_resultado_gestion,
    typeof_resultado:     typeof formData.id_resultado_gestion,
  });
    if (!formData.nombre_contactado?.trim()) {
      toast.error('El nombre del contactado es requerido', { position: 'top-right' });
      return;
    }
    if (!formData.telefono_1?.trim()) {
      toast.error('El teléfono 1 es requerido', { position: 'top-right' });
      return;
    }
    if (!formData.id_tipo_contacto) {
      toast.error('El tipo de contacto es requerido', { position: 'top-right' });
      return;
    }
    if (!formData.id_resultado_gestion) {
      toast.error('El resultado de gestión es requerido', { position: 'top-right' });
      return;
    }

    setSaving(true);
    try {
      const payload = prepareCallPayload(formData, selectedClient);

      const result = editingRecord
        ? await updateCall(editingRecord.id_llamada, payload)
        : await createCall(payload);

      if (!result.success) {
        toast.error(result.msgerror ?? 'Error al guardar', { position: 'top-right' });
        return;
      }

      //Log según si es creación o edición
      if (editingRecord) {
        logActivity(EVENTOS.LLAMADA_EDITADA, editingRecord.id_llamada);
      } else {
        logActivity(EVENTOS.LLAMADA_REGISTRADA, result.data?.id_llamada ?? null);
      }

      toast.success(
        editingRecord ? 'Llamada actualizada exitosamente' : 'Llamada registrada exitosamente',
        { position: 'top-right' }
      );
      handleCloseModal();
      fetchCalls();
    } catch (error) {
      console.error('❌ Error en handleSubmit llamada:', error);
      toast.error('Error de conexión', { position: 'top-right' });
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDelete = (id) => {
    console.log('🗑️ Solicitando eliminar llamada ID:', id);
    setConfirmDialog({ isOpen: true, recordId: id });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.recordId) return;
    try {
      const result = await deleteCall(confirmDialog.recordId);
      if (result.success) {
        logActivity(EVENTOS.LLAMADA_ELIMINADA, confirmDialog.recordId); 
        toast.success('Llamada eliminada exitosamente', { position: 'top-right' });
        fetchCalls();
      } else {
        toast.error(result.msgerror ?? 'Error al eliminar', { position: 'top-right' });
      }
    } catch (error) {
      console.error('❌ Error al eliminar llamada:', error);
      toast.error('Error de conexión', { position: 'top-right' });
    }
  };

  // ── Filtros ───────────────────────────────────────────────────────────────────
  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchCalls();
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({ fecha_desde: '', fecha_hasta: '', resultado: '' });
    setCurrentPage(1);
  };

  // ── Búsqueda local ────────────────────────────────────────────────────────────
  const filteredCalls = calls.filter(r => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      r.nombre_contactado?.toLowerCase().includes(q)     ||
      r.tipo_contacto_nom?.toLowerCase().includes(q)     ||
      r.resultado_gestion_nom?.toLowerCase().includes(q) ||
      r.observaciones?.toLowerCase().includes(q)        ||
      r.telefono_1?.includes(searchTerm)                ||
      r.nom_asesor?.toLowerCase().includes(q)
    );
  });

  const totalPages   = Math.ceil(total / recordsPerPage);
  const indexOfFirst = (currentPage - 1) * recordsPerPage;
  const indexOfLast  = indexOfFirst + recordsPerPage;

  // ── Sin cliente seleccionado ──────────────────────────────────────────────────
  if (!selectedClient) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Busca un cliente para comenzar</h3>
        <p className="text-gray-600">Ingresa el RUC o Razón Social en el panel de búsqueda superior</p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Header ── */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Historial de Contacto</h2>
            <p className="text-sm text-gray-500 mt-1">
              {total} registro{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-[#334a5e] hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" /> Nuevo Contacto
          </button>
        </div>
      </div>

      {/* ── Búsqueda y filtros ── */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por contactado, asesor, resultado, teléfono..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
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
              <Filter className="w-5 h-5" /> Filtros
            </button>
          </div>

          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Desde</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filters.fecha_desde}
                    onChange={e => setFilters(f => ({ ...f, fecha_desde: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Hasta</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filters.fecha_hasta}
                    onChange={e => setFilters(f => ({ ...f, fecha_hasta: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Resultado</label>
                  <select
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filters.resultado}
                    onChange={e => setFilters(f => ({ ...f, resultado: e.target.value }))}
                  >
                    <option value="">Todos</option>
                    {resultados.map(r => (
  <option key={r.value} value={r.value}>{r.nombre_largo}</option>
))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white transition"
                >
                  Limpiar
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className="overflow-x-auto px-6 py-4">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <table className="w-full min-w-[1200px]">
            <thead className="bg-[#334a5e] text-white">
              <tr>
                {[
                  'Fecha', 'Contactado', 'Tipo', 'Resultado',
                  'Asesor', 'Teléf. 1', 'Teléf. 2',
                  'Próx. Llamada', 'Observaciones', 'Det.'
                ].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredCalls.length > 0 ? (
                filteredCalls.map((record, index) => (
                  <CallTableRow
                    key={record.id_llamada}
                    record={record}
                    index={index}
                    onEdit={handleOpenModal}
                    onDelete={handleDelete}
                     onView={handleViewRecord} 
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron registros de llamadas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Paginación ── */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Mostrando <span className="font-semibold">{indexOfFirst + 1}</span> a{' '}
            <span className="font-semibold">{Math.min(indexOfLast, total)}</span>{' '}
            de <span className="font-semibold">{total}</span> registros
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const p = i + 1;
                if (
                  p === 1 || p === totalPages ||
                  (p >= currentPage - 1 && p <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        currentPage === p
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-white'
                      }`}
                    >
                      {p}
                    </button>
                  );
                } else if (p === currentPage - 2 || p === currentPage + 2) {
                  return <span key={p} className="px-2 text-gray-400">...</span>;
                }
                return null;
              })}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* ── Modal ── */}
      <CallModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        saving={saving}
        isEditing={!!editingRecord}
        tiposContacto={tiposContacto}
        resultados={resultados}
        clienteContactos={selectedClient?.contactos || []}
      />

      <CallDetailModal
  isOpen={!!detailRecord}
  onClose={() => setDetailRecord(null)}
  record={detailRecord}
/>

      {/* ── Confirm Delete ── */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, recordId: null })}
        onConfirm={confirmDelete}
        title="¿Eliminar este registro de llamada?"
        message="Esta acción no se puede deshacer. El registro será eliminado permanentemente."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </>
  );
};

export default CallHistoryTab;
