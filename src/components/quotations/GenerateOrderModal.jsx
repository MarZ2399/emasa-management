// src/components/quotations/GenerateOrderModal.jsx
import React, { useState, useEffect, useRef } from 'react'; // ✅ agregar useRef
import ReactDOM from 'react-dom';
import {
  ShoppingCart, FileText, Truck, MapPin,
  Calendar, MessageSquare, Save, X, Package, AlertCircle
} from 'lucide-react';
import ShippingAgencyForm            from '../orders/ShippingAgencyForm';
import SearchableSelect              from '../common/SearchableSelect';
import { deliveryTypes, transportZones } from '../../data/ordersData';
import useTransportistas             from '../../hooks/useTransportistas';
import useUbigeo                     from '../../hooks/useUbigeo';
import useClientShippingAddresses    from '../../hooks/useClientShippingAddresses';
import { transmitOrder }             from '../../services/orderRequestService';
import toast                         from 'react-hot-toast';

const GenerateOrderModal = ({ quotation, isOpen, onClose, onSave }) => {

  const [formData, setFormData] = useState({
    ordenCompra:            '',
    pagoTransporte:         '',
    transporteZona:         'lima_callao',
    tipoEntrega:            'despacho',
    direccionDespacho:      '',
    deptoDespacho:          '',
    provinciaDespacho:      '',
    distritoDespacho:       '',
    deptoNombre:            '',
    provinciaNombre:        '',
    distritoNombre:         '',
    observaciones:          '',
    observacionesCreditos:  '',
    observacionesLogistica: '',
    fechaEntrega:           '',
    agenciaDespacho: { nombre: '', dni: '', telefono: '' }
  });

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [errors, setErrors]                       = useState({});
  const [isSubmitting, setIsSubmitting]           = useState(false);
  const isSubmittingRef                           = useRef(false); // ✅ guard doble submit

  const rucCli = String(quotation?.clienteRuc ?? quotation?.ruc ?? '').substring(0, 10);

  const { options: transportOptions, loading: loadingTransport, error: transportError } =
    useTransportistas(formData.transporteZona);

  const {
    departamentos, provincias, distritos,
    codDepto,     setCodDepto,
    codProvincia, setCodProvincia,
    loadingDeptos, loadingProvs, loadingDistritos,
    reset: resetUbigeo,
  } = useUbigeo();

  const {
    addresses: clientAddresses,
    loading:   loadingAddresses,
    error:     addressError,
  } = useClientShippingAddresses(isOpen ? rucCli : null);

  // ── Auto-seleccionar Lima-Callao cuando llegan las options ────────────
  useEffect(() => {
    if (!isOpen) return;
    if (transportOptions.length === 0) return;
    if (formData.transporteZona === 'lima_callao' && !formData.pagoTransporte) {
      setFormData(prev => ({ ...prev, pagoTransporte: transportOptions[0].value }));
    }
  }, [transportOptions]); // solo depende de transportOptions

  // ── Bloquear scroll ───────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // ── Cerrar con ESC ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, isOpen]);

  // ── Reset form al abrir ───────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      isSubmittingRef.current = false; // ✅ resetear ref al abrir
      setFormData({
        ordenCompra:            '',
        // ✅ precarga transportista si options ya están disponibles (2da+ apertura)
        pagoTransporte: transportOptions.length > 0 ? transportOptions[0].value : '',
        transporteZona:         'lima_callao',
        tipoEntrega:            'despacho',
        direccionDespacho:      '',
        deptoDespacho:          '',
        provinciaDespacho:      '',
        distritoDespacho:       '',
        deptoNombre:            '',
        provinciaNombre:        '',
        distritoNombre:         '',
        observaciones:          '',
        observacionesCreditos:  '',
        observacionesLogistica: '',
        fechaEntrega:           '',
        agenciaDespacho: { nombre: '', dni: '', telefono: '' }
      });
      setSelectedAddressId('');
      setErrors({});
      resetUbigeo();
    }
  }, [isOpen]);

  if (!isOpen || !quotation) return null;

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleChange = (field, value) => {
    if (field === 'tipoEntrega') {
      setFormData(prev => ({
        ...prev,
        tipoEntrega:       value,
        direccionDespacho: '',
        deptoDespacho:     '',
        provinciaDespacho: '',
        distritoDespacho:  '',
        agenciaDespacho:   { nombre: '', dni: '', telefono: '' }
      }));
      setSelectedAddressId('');
      resetUbigeo();
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    if (errors[field]) {
      setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
    }
  };

  const handleTransportZoneChange = (zona) => {
    setFormData(prev => ({
      ...prev,
      transporteZona: zona,
      pagoTransporte: '', // limpia — el useEffect lo rellenará si es lima_callao
    }));
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    if (!addressId) {
      setFormData(prev => ({
        ...prev,
        direccionDespacho: '',
        provinciaDespacho: '',
        distritoDespacho:  '',
        agenciaDespacho:   { nombre: '', dni: '', telefono: '' }
      }));
      return;
    }
    const address = clientAddresses.find(addr => String(addr.id) === String(addressId));
    if (address) {
      setFormData(prev => ({
        ...prev,
        direccionDespacho: address.direccion,
        provinciaDespacho: address.provinciaNombre,
        distritoDespacho:  address.distritoNombre,
      }));
    }
  };

  const handleDeptoChange = (codDep) => {
    const depto = departamentos.find(d => d.codigo === codDep);
    setCodDepto(codDep);
    setCodProvincia('');
    setFormData(prev => ({
      ...prev,
      deptoDespacho:     codDep,
      deptoNombre:       depto?.descripcion || '',
      provinciaDespacho: '',
      provinciaNombre:   '',
      distritoDespacho:  '',
      distritoNombre:    '',
    }));
  };

  const handleProvinciaChange = (codProv) => {
    const prov = provincias.find(p => p.codigo === codProv);
    setCodProvincia(codProv);
    setFormData(prev => ({
      ...prev,
      provinciaDespacho: codProv,
      provinciaNombre:   prov?.descripcion || '',
      distritoDespacho:  '',
      distritoNombre:    '',
    }));
  };

  const handleAgencyChange = (agencyData) => {
    setFormData(prev => ({ ...prev, agenciaDespacho: agencyData }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fechaEntrega) {
      newErrors.fechaEntrega = 'Fecha de entrega es requerida';
    } else {
      const selectedDate = new Date(formData.fechaEntrega);
      const tomorrow     = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      if (selectedDate < tomorrow)
        newErrors.fechaEntrega = 'La fecha debe ser a partir de mañana';
    }

    if (!formData.pagoTransporte)
      newErrors.pagoTransporte = 'Debe seleccionar responsable de transporte';

    if (formData.tipoEntrega !== 'retiro') {
      if (!formData.direccionDespacho.trim())
        newErrors.direccionDespacho = 'Dirección de despacho es requerida';
      if (!formData.distritoDespacho)
        newErrors.distritoDespacho = 'Distrito es requerido';
      if (!formData.agenciaDespacho.nombre.trim())
        newErrors.agenciaNombre = 'Nombre de contacto es requerido';
      if (!formData.agenciaDespacho.dni.trim() || formData.agenciaDespacho.dni.length !== 8)
        newErrors.agenciaDni = 'DNI debe tener 8 dígitos';
      if (!formData.agenciaDespacho.telefono.trim() || formData.agenciaDespacho.telefono.length !== 9)
        newErrors.agenciaTelefono = 'Teléfono debe tener 9 dígitos';
    }

    if (formData.tipoEntrega === 'despacho' && !selectedAddressId)
      newErrors.direccionDespacho = 'Debe seleccionar una dirección registrada';

    if (formData.tipoEntrega === 'nueva_direccion') {
      if (!formData.deptoDespacho)
        newErrors.deptoDespacho = 'Departamento es requerido';
      if (!formData.provinciaDespacho)
        newErrors.provinciaDespacho = 'Provincia es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Guard imperativo — bloquea doble submit sin importar re-renders
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    if (!validate()) {
      toast.error('Por favor complete todos los campos requeridos');
      isSubmittingRef.current = false; // ✅ liberar si no pasa validación
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await transmitOrder(quotation.id, formData);
      toast.success(`Pedido generado — Folio: ${result.folio_as400}`);
      onSave?.(result);
      onClose();
    } catch (error) {
      const msg = error.response?.data?.error || 'Error al generar el pedido';
      toast.error(msg);
      console.error(error);
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false; // ✅ liberar al terminar
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
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
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
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
                <span className="ml-2 text-gray-900">{quotation.clienteNombre ?? quotation.cliente}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">RUC:</span>
                <span className="ml-2 text-gray-900">{quotation.clienteRuc ?? quotation.ruc}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Total Cotización:</span>
                <span className="ml-2 text-gray-900 font-bold">${(quotation.total ?? 0).toFixed(2)}</span>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° Orden de Compra
                </label>
                <input
                  type="text"
                  value={formData.ordenCompra}
                  onChange={(e) => handleChange('ordenCompra', e.target.value)}
                  placeholder="OC-2025-0001"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ecc70] focus:border-transparent transition"
                />
              </div>
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
                    min={getTomorrowDate()}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#2ecc70] focus:border-transparent transition ${
                      errors.fechaEntrega ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.fechaEntrega && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{errors.fechaEntrega}
                  </p>
                )}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zona de Transporte <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.transporteZona}
                  onChange={(e) => handleTransportZoneChange(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ecc70] focus:border-transparent appearance-none bg-white"
                >
                  {transportZones.map(zone => (
                    <option key={zone.value} value={zone.value}>{zone.label}</option>
                  ))}
                </select>
              </div>
              <SearchableSelect
                value={formData.pagoTransporte}
                onChange={(value) => handleChange('pagoTransporte', value)}
                options={transportOptions}
                label="Responsable de Transporte"
                placeholder={loadingTransport ? 'Cargando...' : 'Buscar agencia o responsable...'}
                required={true}
                error={errors.pagoTransporte}
                disabled={loadingTransport || formData.transporteZona === 'lima_callao'}
              />
            </div>
            {transportError ? (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                ⚠ No se pudieron cargar los transportistas. Intente nuevamente.
              </div>
            ) : (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                {formData.transporteZona === 'lima_callao'
                  ? <p>✓ Para Lima y Callao, EMASA se encarga del transporte.</p>
                  : <p>✓ Para envíos a provincia, seleccione la agencia de transporte preferida.</p>
                }
              </div>
            )}
          </div>

          {/* Sección 3: Entrega */}
          <div className="border border-gray-200 rounded-lg p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-700" />
              Datos de Entrega
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Entrega</label>
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

            {formData.tipoEntrega === 'retiro' && (
              <div className="mt-4">
                <ShippingAgencyForm
                  agencyData={formData.agenciaDespacho}
                  onChange={handleAgencyChange}
                  errors={{ nombre: errors.agenciaNombre, dni: errors.agenciaDni, telefono: errors.agenciaTelefono }}
                />
              </div>
            )}

            {formData.tipoEntrega === 'despacho' && (
              <>
                {loadingAddresses ? (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 animate-pulse">
                    Cargando direcciones del cliente...
                  </div>
                ) : addressError ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    ⚠ Error al cargar direcciones. Intente nuevamente.
                  </div>
                ) : clientAddresses.length > 0 ? (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Seleccionar Dirección <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedAddressId}
                        onChange={(e) => handleAddressSelect(e.target.value)}
                        className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#2ecc70] focus:border-transparent appearance-none bg-white ${
                          errors.direccionDespacho ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      >
                        <option value="">-- Seleccionar dirección --</option>
                        {clientAddresses.map(addr => (
                          <option key={addr.id} value={String(addr.id)}>
                            {addr.source === 'as400' ? '📍' : '📦'} {addr.direccion} — {addr.distritoNombre}, {addr.provinciaNombre}
                            {addr.source === 'as400' && ' (Dirección registrada)'}
                            {addr.source === 'bd' && addr.isDefault === 1 && ' (Principal)'}
                          </option>
                        ))}
                      </select>
                      {errors.direccionDespacho && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />{errors.direccionDespacho}
                        </p>
                      )}
                    </div>
                    {selectedAddressId && (() => {
                      const addr = clientAddresses.find(a => String(a.id) === String(selectedAddressId));
                      if (!addr) return null;
                      return (
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de Despacho</label>
                            <textarea value={formData.direccionDespacho} readOnly rows={2}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed resize-none" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                              <input readOnly value={addr.deptoNombre}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                              <input readOnly value={addr.provinciaNombre}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Distrito</label>
                              <input readOnly value={addr.distritoNombre}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" />
                            </div>
                          </div>
                          <div className="mt-2">
                            <ShippingAgencyForm
                              agencyData={formData.agenciaDespacho}
                              onChange={handleAgencyChange}
                              errors={{ nombre: errors.agenciaNombre, dni: errors.agenciaDni, telefono: errors.agenciaTelefono }}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    ⚠️ No hay direcciones registradas para este cliente. Selecciona "Despacho a Otra Dirección".
                  </div>
                )}
              </>
            )}

            {formData.tipoEntrega === 'nueva_direccion' && (
              <div className="grid grid-cols-1 gap-4">
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
                      <AlertCircle className="w-3 h-3" />{errors.direccionDespacho}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departamento <span className="text-red-500">*</span>
                    </label>
                    <select value={formData.deptoDespacho} onChange={(e) => handleDeptoChange(e.target.value)}
                      disabled={loadingDeptos}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#2ecc70] focus:border-transparent appearance-none bg-white disabled:bg-gray-100 disabled:cursor-wait ${
                        errors.deptoDespacho ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">{loadingDeptos ? 'Cargando...' : '-- Seleccionar departamento --'}</option>
                      {departamentos.map(d => <option key={d.codigo} value={d.codigo}>{d.descripcion}</option>)}
                    </select>
                    {errors.deptoDespacho && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />{errors.deptoDespacho}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Provincia <span className="text-red-500">*</span>
                    </label>
                    <select value={formData.provinciaDespacho} onChange={(e) => handleProvinciaChange(e.target.value)}
                      disabled={!formData.deptoDespacho || loadingProvs}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#2ecc70] focus:border-transparent appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${
                        errors.provinciaDespacho ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">{loadingProvs ? 'Cargando...' : '-- Seleccionar provincia --'}</option>
                      {provincias.map(p => <option key={p.codigo} value={p.codigo}>{p.descripcion}</option>)}
                    </select>
                    {errors.provinciaDespacho && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />{errors.provinciaDespacho}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Distrito <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.distritoDespacho}
                      onChange={(e) => {
                        const dist = distritos.find(d => d.codigo === e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          distritoDespacho: e.target.value,
                          distritoNombre:   dist?.descripcion || '',
                        }));
                        if (errors.distritoDespacho) {
                          setErrors(prev => { const er = { ...prev }; delete er.distritoDespacho; return er; });
                        }
                      }}
                      disabled={!formData.provinciaDespacho || loadingDistritos}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#2ecc70] focus:border-transparent appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${
                        errors.distritoDespacho ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">{loadingDistritos ? 'Cargando...' : '-- Seleccionar distrito --'}</option>
                      {distritos.map(d => <option key={d.codigo} value={d.codigo}>{d.descripcion}</option>)}
                    </select>
                    {errors.distritoDespacho && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />{errors.distritoDespacho}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  <ShippingAgencyForm
                    agencyData={formData.agenciaDespacho}
                    onChange={handleAgencyChange}
                    errors={{ nombre: errors.agenciaNombre, dni: errors.agenciaDni, telefono: errors.agenciaTelefono }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Observaciones */}
          <div className="border border-gray-200 rounded-lg p-5 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-700" />
              Observaciones
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Observaciones Generales</label>
              <textarea value={formData.observaciones} onChange={(e) => handleChange('observaciones', e.target.value)}
                placeholder="Indicaciones especiales, horarios de entrega, etc..." rows={3}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ecc70] focus:border-transparent resize-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Observaciones de Créditos</label>
              <textarea value={formData.observacionesCreditos} onChange={(e) => handleChange('observacionesCreditos', e.target.value)}
                placeholder="Condiciones de pago, plazos, garantías..." rows={2}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Observaciones de Logística</label>
              <textarea value={formData.observacionesLogistica} onChange={(e) => handleChange('observacionesLogistica', e.target.value)}
                placeholder="Dirección de entrega, contacto, instrucciones de despacho..." rows={2}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm" />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
              Cancelar
            </button>
            <button type="submit"
              disabled={isSubmitting || loadingTransport}
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

  return ReactDOM.createPortal(modalContent, document.body);
};

export default GenerateOrderModal;
