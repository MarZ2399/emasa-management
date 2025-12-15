// src/components/orders/ShippingAgencyForm.jsx
import React from 'react';
import { User, Phone, CreditCard } from 'lucide-react';

const ShippingAgencyForm = ({ agencyData, onChange, errors = {} }) => {
  const handleChange = (field, value) => {
    onChange({
      ...agencyData,
      [field]: value
    });
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-5">
      <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-blue-600" />
        Datos de Contacto para Despacho
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Nombre Completo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre Completo <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={agencyData?.nombre || ''}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder="Ej: Juan Pérez García"
              className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                errors.nombre ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.nombre && (
            <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>
          )}
        </div>

        {/* DNI */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            DNI <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={agencyData?.dni || ''}
              onChange={(e) => handleChange('dni', e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder="12345678"
              maxLength={8}
              className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                errors.dni ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.dni && (
            <p className="mt-1 text-xs text-red-600">{errors.dni}</p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              value={agencyData?.telefono || ''}
              onChange={(e) => handleChange('telefono', e.target.value.replace(/\D/g, '').slice(0, 9))}
              placeholder="987654321"
              maxLength={9}
              className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                errors.telefono ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.telefono && (
            <p className="mt-1 text-xs text-red-600">{errors.telefono}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShippingAgencyForm;
