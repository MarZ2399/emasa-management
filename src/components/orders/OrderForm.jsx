// src/components/orders/OrderForm.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom'; // 🆕 IMPORT
import { 
  ShoppingCart, FileText, DollarSign, Truck, MapPin, 
  Calendar, MessageSquare, Save, X, Package, AlertCircle 
} from 'lucide-react';
import ShippingAgencyForm from './ShippingAgencyForm';
import { 
  paymentMethods, deliveryTypes, transportResponsible, transportZones 
} from '../../data/ordersData';
import { 
  shippingAddresses, provincias, distritosByProvincia 
} from '../../data/shippingAddresses';
import toast from 'react-hot-toast';

const OrderForm = ({ quotation, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    ordenCompra: '',
    pagoTransporte: 'empresa',
    transporteZona: 'lima_callao',
    plazos: '15 días',
    metodoPago: 'transferencia',
    tipoEntrega: 'despacho',
    direccionDespacho: '',
    provinciaDespacho: 'Lima',
    distritoDespacho: '',
    observaciones: '',
    fechaEntrega: '',
    agenciaDespacho: {
      nombre: '',
      dni: '',
      telefono: ''
    }
  });

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🆕 useEffect para bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // 🆕 Cerrar con tecla ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Cargar direcciones del cliente
  const clientAddresses = shippingAddresses.filter(
    addr => addr.clienteId === quotation.clienteId
  );

  // Obtener distritos según provincia seleccionada
  const availableDistricts = distritosByProvincia[formData.provinciaDespacho] || [];

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    
    if (addressId === 'new') {
      // Nueva dirección - limpiar campos
      setFormData(prev => ({
        ...prev,
        direccionDespacho: '',
        provinciaDespacho: 'Lima',
        distritoDespacho: ''
      }));
    } else if (addressId) {
      // Dirección existente - cargar datos
      const address = clientAddresses.find(addr => addr.id === parseInt(addressId));
      if (address) {
        setFormData(prev => ({
          ...prev,
          direccionDespacho: address.direccion,
          provinciaDespacho: address.provincia,
          distritoDespacho: address.distrito
        }));
      }
    }
  };

  const handleProvinciaChange = (provincia) => {
    setFormData(prev => ({
      ...prev,
      provinciaDespacho: provincia,
      distritoDespacho: '' // Reset distrito al cambiar provincia
    }));
  };

  const handleAgencyChange = (agencyData) => {
    setFormData(prev => ({
      ...prev,
      agenciaDespacho: agencyData
    }));
  };

  const validate = () => {
    const newErrors = {};

    // Validación de Orden de Compra
    if (!formData.ordenCompra.trim()) {
      newErrors.ordenCompra = 'N° de Orden de Compra es requerido';
    }

    // Validación de Fecha de Entrega
    if (!formData.fechaEntrega) {
      newErrors.fechaEntrega = 'Fecha de entrega es requerida';
    } else {
      const selectedDate = new Date(formData.fechaEntrega);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.fechaEntrega = 'La fecha debe ser posterior a hoy';
      }
    }

    // Validaciones específicas para despacho
    if (formData.tipoEntrega !== 'retiro') {
      if (!formData.direccionDespacho.trim()) {
        newErrors.direccionDespacho = 'Dirección de despacho es requerida';
      }
      if (!formData.distritoDespacho) {
        newErrors.distritoDespacho = 'Distrito es requerido';
      }

      // Validar datos de agencia
      if (!formData.agenciaDespacho.nombre.trim()) {
        newErrors.agenciaNombre = 'Nombre de contacto es requerido';
      }
      if (!formData.agenciaDespacho.dni.trim() || formData.agenciaDespacho.dni.length !== 8) {
        newErrors.agenciaDni = 'DNI debe tener 8 dígitos';
      }
      if (!formData.agenciaDespacho.telefono.trim() || formData.agenciaDespacho.telefono.length !== 9) {
        newErrors.agenciaTelefono = 'Teléfono debe tener 9 dígitos';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generar número de pedido
      const numeroPedido = `PED-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;

      const orderData = {
        ...formData,
        numeroPedido,
        quotationId: quotation.id,
        clienteId: quotation.clienteId,
        clienteNombre: quotation.clienteNombre,
        clienteRuc: quotation.clienteRuc,
        productos: quotation.productos,
        subtotal: quotation.subtotal,
        igv: quotation.igv,
        total: quotation.total,
        asesor: quotation.asesor,
        status: 'pending',
        fechaPedido: new Date().toISOString(),
        createdBy: 'admin@emasa.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Si es retiro, limpiar datos de agencia
        agenciaDespacho: formData.tipoEntrega === 'retiro' ? null : formData.agenciaDespacho
      };

      await onSave(orderData);
      toast.success(`Pedido ${numeroPedido} generado exitosamente`);
      onClose();
    } catch (error) {
      toast.error('Error al generar el pedido');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🆕 Contenido del modal
  const modalContent = (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Evitar cerrar al hacer click dentro del modal
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#2ecc70] to-[#27ae60] text-white px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Generar Pedido</h2>
              <p className="text-sm text-green-100">Cotización: {quotation.numeroCotizacion}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información del Cliente */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Información del Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Cliente:</span>
                <span className="ml-2 text-gray-900">{quotation.clienteNombre}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">RUC:</span>
                <span className="ml-2 text-gray-900">{quotation.clienteRuc}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Total Cotización:</span>
                <span className="ml-2 text-gray-900 font-bold">S/ {quotation.total.toFixed(2)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Asesor:</span>
                <span className="ml-2 text-gray-900">{quotation.asesor}</span>
              </div>
            </div>
          </div>

          {/* Sección 1: Datos de la Orden */}
          <div className="border border-gray-200 rounded-lg p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-700" />
              Datos de la Orden
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* N° Orden de Compra */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° Orden de Compra <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.ordenCompra}
                  onChange={(e) => handleChange('ordenCompra', e.target.value)}
                  placeholder="OC-2025-0001"
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#2ecc70] focus:border-transparent transition ${
                    errors.ordenCompra ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.ordenCompra && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.ordenCompra}
                  </p>
                )}
              </div>

              {/* Fecha de Entrega */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Entrega <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.fechaEntrega}
                    onChange={(e) => handleChange('fechaEntrega', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#2ecc70] focus:border-transparent transition ${
                      errors.fechaEntrega ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.fechaEntrega && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.fechaEntrega}
                  </p>
                )}
              </div>

              {/* Plazos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plazos de Pago
                </label>
                <input
                  type="text"
                  value={formData.plazos}
                  onChange={(e) => handleChange('plazos', e.target.value)}
                  placeholder="15 días, 30 días, etc."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ecc70] focus:border-transparent"
                />
              </div>

              {/* Método de Pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.metodoPago}
                    onChange={(e) => handleChange('metodoPago', e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ecc70] focus:border-transparent appearance-none bg-white"
                  >
                    {paymentMethods.map(method => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Sección 2: Transporte */}
          <div className="border border-gray-200 rounded-lg p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-gray-700" />
              Datos de Transporte
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pago de Transporte */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pago de Transporte
                </label>
                <select
                  value={formData.pagoTransporte}
                  onChange={(e) => handleChange('pagoTransporte', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ecc70] focus:border-transparent appearance-none bg-white"
                >
                  {transportResponsible.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Zona de Transporte */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zona de Transporte
                </label>
                <select
                  value={formData.transporteZona}
                  onChange={(e) => handleChange('transporteZona', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ecc70] focus:border-transparent appearance-none bg-white"
                >
                  {transportZones.map(zone => (
                    <option key={zone.value} value={zone.value}>
                      {zone.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sección 3: Entrega */}
          <div className="border border-gray-200 rounded-lg p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-700" />
              Datos de Entrega
            </h3>

            {/* Tipo de Entrega */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Entrega
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {deliveryTypes.map(type => (
                  <label
                    key={type.value}
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                      formData.tipoEntrega === type.value
                        ? 'border-[#2ecc70] bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tipoEntrega"
                      value={type.value}
                      checked={formData.tipoEntrega === type.value}
                      onChange={(e) => handleChange('tipoEntrega', e.target.value)}
                      className="w-4 h-4 text-[#2ecc70] focus:ring-[#2ecc70]"
                    />
                    <span className="text-sm font-medium text-gray-900">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Campos de dirección - solo si NO es retiro */}
            {formData.tipoEntrega !== 'retiro' && (
              <>
                {/* Selector de Dirección */}
                {formData.tipoEntrega === 'despacho' && clientAddresses.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Seleccionar Dirección Registrada
                    </label>
                    <select
                      value={selectedAddressId}
                      onChange={(e) => handleAddressSelect(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ecc70] focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">-- Seleccionar dirección --</option>
                      {clientAddresses.map(addr => (
                        <option key={addr.id} value={addr.id}>
                          {addr.direccion} - {addr.distrito}, {addr.provincia}
                          {addr.isDefault && ' (Principal)'}
                        </option>
                      ))}
                      <option value="new">+ Nueva dirección</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  {/* Dirección de Despacho */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección de Despacho <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.direccionDespacho}
                      onChange={(e) => handleChange('direccionDespacho', e.target.value)}
                      placeholder="Av. Ejemplo 123, Oficina 501..."
                      rows={2}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#2ecc70] focus:border-transparent resize-none ${
                        errors.direccionDespacho ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.direccionDespacho && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.direccionDespacho}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Provincia */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Provincia
                      </label>
                      <select
                        value={formData.provinciaDespacho}
                        onChange={(e) => handleProvinciaChange(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ecc70] focus:border-transparent appearance-none bg-white"
                      >
                        {provincias.map(provincia => (
                          <option key={provincia} value={provincia}>
                            {provincia}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Distrito */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Distrito <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.distritoDespacho}
                        onChange={(e) => handleChange('distritoDespacho', e.target.value)}
                        className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#2ecc70] focus:border-transparent appearance-none bg-white ${
                          errors.distritoDespacho ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      >
                        <option value="">-- Seleccionar distrito --</option>
                        {availableDistricts.map(distrito => (
                          <option key={distrito} value={distrito}>
                            {distrito}
                          </option>
                        ))}
                      </select>
                      {errors.distritoDespacho && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.distritoDespacho}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Datos de Agencia de Despacho */}
                <div className="mt-4">
                  <ShippingAgencyForm
                    agencyData={formData.agenciaDespacho}
                    onChange={handleAgencyChange}
                    errors={{
                      nombre: errors.agenciaNombre,
                      dni: errors.agenciaDni,
                      telefono: errors.agenciaTelefono
                    }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Observaciones */}
          <div className="border border-gray-200 rounded-lg p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-700" />
              Observaciones
            </h3>
            <textarea
              value={formData.observaciones}
              onChange={(e) => handleChange('observaciones', e.target.value)}
              placeholder="Indicaciones especiales, horarios de entrega, etc..."
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ecc70] focus:border-transparent resize-none"
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-[#2ecc70] to-[#27ae60] text-white rounded-lg hover:shadow-lg transition font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {isSubmitting ? 'Generando...' : 'Generar Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // 🆕 Renderizar usando createPortal
  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
};

export default OrderForm;
