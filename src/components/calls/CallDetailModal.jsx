import React from 'react';
import ReactDOM from 'react-dom';
import { X, User, Phone, Calendar, MessageSquare } from 'lucide-react';

const Field = ({ label, value }) => (
  <div className="px-4 first:pl-0 last:pr-0">
    <div className="text-xs text-gray-500 mb-0.5">{label}</div>
    <div className="text-sm font-medium text-gray-900">{value || '—'}</div>
  </div>
);

const formatFecha = (fecha) => {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const CallDetailModal = ({ isOpen, onClose, record }) => {
  if (!isOpen || !record) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-[#334a5e] text-white px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5" />
            <div>
              <h2 className="text-lg font-bold">Detalle del Contacto</h2>
              <p className="text-xs text-blue-200">
                {new Date(record.fecha_registro).toLocaleDateString('es-PE', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Empresa Contactada */}
          <div className="border border-gray-200 rounded-lg p-4">
  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm border-b pb-2">
    <User className="w-4 h-4 text-gray-600" />
    Empresa Contactada
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-gray-200">
    <Field label="RUC"              value={record.ruc_emp_contacto} />
    <Field label="Razón Social"     value={record.raz_social} />
    <Field label="Nombre Contactado" value={record.nombre_contactado} />
  </div>
</div>

          {/* Comunicación — 3 columnas igual que el modal de registro */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm border-b pb-2">
              <Phone className="w-4 h-4 text-gray-600" />
              Comunicación
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-gray-200">
              <Field label="Tipo de Contacto" value={record.tipo_contacto_nom} />
              <Field label="Teléfono 1"       value={record.telefono_1} />
              <Field label="Teléfono 2"       value={record.telefono_2} />
            </div>
          </div>

          {/* Gestión y Seguimiento */}
          <div className="border border-gray-200 rounded-lg p-4">
  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm border-b pb-2">
    <Calendar className="w-4 h-4 text-gray-600" />
    Gestión y Seguimiento
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-gray-200">
    <Field label="Resultado de Gestión" value={record.resultado_gestion_nom} />
    <Field label="Próxima Llamada"      value={formatFecha(record.fecha_prox_llamada)} />
    <Field label="Asesor"               value={
      record.codigo_vend && record.nom_asesor
        ? `${record.codigo_vend} · ${record.nom_asesor}`
        : record.nom_asesor
    } />
  </div>
</div>

          {/* Observaciones */}
          {record.observaciones && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm border-b pb-2">
                <MessageSquare className="w-4 h-4 text-gray-600" />
                Observaciones
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 border border-gray-200">
                {record.observaciones}
              </p>
            </div>
          )}

          {/* Botón Cerrar */}
          <div className="flex justify-end pt-2 border-t">
            <button onClick={onClose}
              className="px-6 py-2.5 bg-[#334a5e] text-white rounded-lg hover:bg-blue-700 transition font-medium">
              Cerrar
            </button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};

export default CallDetailModal;
