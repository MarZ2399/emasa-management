import React from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

const CallModal = ({ isOpen, onClose, formData, onChange, onSubmit, isEditing }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-[#334a5e] text-white px-6 py-4 flex items-center justify-between rounded-t-lg sticky top-0 z-10">
          <h2 className="text-xl font-bold">
            {isEditing ? 'Editar Registro de Llamada' : 'Nuevo Registro de Llamada'}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="text-white hover:bg-gray-700 rounded p-1 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estatus Llamada
              </label>
              <input
                type="text"
                name="estatusLlamada"
                value={formData.estatusLlamada}
                onChange={onChange}
                placeholder="Ej: Completada"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contacto (In/Out) *
              </label>
              <select
                name="contacto"
                value={formData.contacto}
                onChange={onChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar...</option>
                <option value="Inbound">Inbound</option>
                <option value="Outbound">Outbound</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono 1 *
              </label>
              <input
                type="text"
                name="telef1"
                value={formData.telef1}
                onChange={onChange}
                required
                placeholder="Ej: 987654321"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono 2
              </label>
              <input
                type="text"
                name="telef2"
                value={formData.telef2}
                onChange={onChange}
                placeholder="Ej: 912345678"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario
              </label>
              <input
                type="text"
                name="usuario"
                value={formData.usuario}
                onChange={onChange}
                placeholder="Ej: jperez"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clave
              </label>
              <input
                type="password"
                name="clave"
                value={formData.clave}
                onChange={onChange}
                placeholder="****"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Próx. Llamada
              </label>
              <input
                type="datetime-local"
                name="proxLlamada"
                value={formData.proxLlamada}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resultado Gestión *
              </label>
              <select
                name="resultadoGestion"
                value={formData.resultadoGestion}
                onChange={onChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar...</option>
                <option value="Venta">Venta</option>
                <option value="- Cotización">- Cotización</option>
                <option value="Seguimiento / Consulta De Pedido">Seguimiento / Consulta De Pedido</option>
                <option value="No Contesta">No Contesta</option>
                <option value="Ocupado">Ocupado</option>
                <option value="Buzón de Voz">Buzón de Voz</option>
                <option value="Reagendar">Reagendar</option>
                <option value="No Interesado">No Interesado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asesor
              </label>
              <input
                type="text"
                name="asesor"
                value={formData.asesor}
                onChange={onChange}
                placeholder="Nombre del asesor"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={onChange}
              rows="4"
              placeholder="Escriba aquí las observaciones de la llamada..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="w-full sm:w-auto px-6 py-2 bg-[#334a5e] text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              {isEditing ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CallModal;
