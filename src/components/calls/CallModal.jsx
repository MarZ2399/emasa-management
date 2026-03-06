// CallModal.jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Loader2, AlertTriangle } from 'lucide-react';

const CallModal = ({
  isOpen, onClose, formData, setFormData,
  onSubmit, saving, isEditing,
  tiposContacto = [], resultados = [], clienteContactos = []
}) => {
  if (!isOpen) return null;

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  // ✅ Convertir a Number para que el find() haga match integer === integer
  const handleTipoContacto = (e) => {
    const idSeleccionado = Number(e.target.value);
    const selected       = tiposContacto.find(t => t.value === idSeleccionado);
    setFormData(prev => ({
      ...prev,
      id_tipo_contacto:  idSeleccionado,
      tipo_contacto_nom: selected?.label ?? ''
    }));
  };

  const handleResultado = (e) => {
    const idSeleccionado = Number(e.target.value);
    const selected       = resultados.find(r => r.value === idSeleccionado);
    setFormData(prev => ({
      ...prev,
      id_resultado_gestion:  idSeleccionado,
      resultado_gestion_nom: selected?.label ?? ''
    }));
  };

  const handleContactoSelect = (e) => {
    const selected = clienteContactos.find(c => c.fullName === e.target.value);
    setFormData(prev => ({
      ...prev,
      nombre_contactado: e.target.value,
      telefono_1:        selected?.phone || prev.telefono_1
    }));
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';
  const [showConfirm, setShowConfirm] = useState(false);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="bg-[#334a5e] text-white px-6 py-4 flex items-center justify-between rounded-t-lg sticky top-0 z-10">
          <h2 className="text-xl font-bold">
            {isEditing ? 'Editar Registro de Contacto' : 'Nuevo Registro de Contacto'}
          </h2>
          <button onClick={onClose} className="text-white hover:bg-gray-700 rounded p-1 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* ── Empresa Contactada ── */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3 pb-1 border-b">Empresa Contactada</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>RUC</label>
                <input className={inputCls} value={formData.ruc_emp_contacto}
                  onChange={e => set('ruc_emp_contacto', e.target.value)} placeholder="20100154138" />
              </div>
              <div>
                <label className={labelCls}>Razón Social</label>
                <input className={inputCls} value={formData.raz_social}
                  onChange={e => set('raz_social', e.target.value)} placeholder="Empresa SAC" />
              </div>

              <div className="md:col-span-2">
                <label className={labelCls}>Nombre Contactado <span className="text-red-500">*</span></label>
                {clienteContactos.length > 0 ? (
                  <select className={inputCls} value={formData.nombre_contactado} onChange={handleContactoSelect}>
                    <option value="">Seleccionar contacto...</option>
                    {clienteContactos.map((c, i) => (
                      <option key={i} value={c.fullName}>{c.fullName} — {c.phone}</option>
                    ))}
                  </select>
                ) : (
                  <input className={inputCls} value={formData.nombre_contactado}
                    onChange={e => set('nombre_contactado', e.target.value)}
                    placeholder="Juan Pérez" />
                )}
              </div>
            </div>
          </div>

          {/* ── Comunicación ── */}
<div>
  <h3 className="text-sm font-bold text-gray-800 mb-3 pb-1 border-b">Comunicación</h3>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <label className={labelCls}>Tipo de Contacto <span className="text-red-500">*</span></label>
      <select
        className={inputCls}
        value={formData.id_tipo_contacto ?? ''}
        onChange={handleTipoContacto}
      >
        <option value="">Seleccione...</option>
        {tiposContacto.map(t => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
    </div>
    <div>
      <label className={labelCls}>Teléfono 1 <span className="text-red-500">*</span></label>
      <input className={inputCls} value={formData.telefono_1 ?? ''}
        onChange={e => set('telefono_1', e.target.value)} placeholder="999888777" />
    </div>
    <div>
      <label className={labelCls}>Teléfono 2</label>
      <input className={inputCls} value={formData.telefono_2 ?? ''}
        onChange={e => set('telefono_2', e.target.value)} placeholder="01-2345678" />
    </div>
  </div>
</div>


          {/* ── Gestión y Seguimiento ── */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3 pb-1 border-b">Gestión y Seguimiento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Resultado de Gestión <span className="text-red-500">*</span></label>
                {/* ✅ Mismo patrón que Tipo de Contacto */}
                <select
                  className={inputCls}
                  value={formData.id_resultado_gestion ?? ''}
                  onChange={handleResultado}
                >
                  <option value="">Seleccione...</option>
                  {resultados.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Próxima Llamada</label>
                <input type="datetime-local" className={inputCls}
                  value={formData.fecha_prox_llamada ?? ''}
                  onChange={e => set('fecha_prox_llamada', e.target.value)} />
              </div>

              {/* ✅ Campo Asesor */}
              <div className="md:col-span-2">
                <label className={labelCls}>Asesor</label>
                <input className={inputCls} value={formData.nom_asesor ?? ''}
                  onChange={e => set('nom_asesor', e.target.value)}
                  placeholder="Nombre del asesor" />
              </div>

              <div className="md:col-span-2">
                <label className={labelCls}>Observaciones</label>
                <textarea className={inputCls} rows={3} value={formData.observaciones ?? ''}
                  onChange={e => set('observaciones', e.target.value)}
                  placeholder="Detalles de la llamada..." />
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium">
              Cancelar
            </button>
            <button type="button" onClick={() => setShowConfirm(true)} disabled={saving}
  className="w-full sm:w-auto px-6 py-2 bg-[#334a5e] text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2">
  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
  {isEditing ? 'Actualizar' : 'Guardar'}
</button>
          </div>
        </div>
      </div>
      {showConfirm && (
  <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">
            {isEditing ? '¿Actualizar registro?' : '¿Seguro de guardar registro?'}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEditing
              ? 'Se guardarán los cambios realizados en este contacto.'
              : 'Se registrará un nuevo registro de contacto hacia el cliente con los datos ingresados.'}
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowConfirm(false)}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm">
          Cancelar
        </button>
        <button
          onClick={() => { setShowConfirm(false); onSubmit(); }}
          disabled={saving}
          className="px-4 py-2 bg-[#334a5e] text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm disabled:opacity-50 flex items-center gap-2">
          {saving && <Loader2 className="w-3 h-3 animate-spin" />}
          {isEditing ? 'Sí, actualizar' : 'Sí, guardar'}
        </button>
      </div>
    </div>
  </div>
)}
    </div>,
    document.body
  );
};

export default CallModal;
