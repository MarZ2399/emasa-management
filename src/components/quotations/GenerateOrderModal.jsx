// src/components/quotations/GenerateOrderModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import {
  ShoppingCart, FileText, Truck, MapPin,
  Calendar, MessageSquare, Save, X, Package, AlertCircle
} from 'lucide-react';
import ShippingAgencyForm from '../orders/ShippingAgencyForm';
import SearchableSelect from '../common/SearchableSelect';
import { deliveryTypes, transportZones } from '../../data/ordersData';
import useTransportistas from '../../hooks/useTransportistas';
import useUbigeo from '../../hooks/useUbigeo';
import useClientShippingAddresses from '../../hooks/useClientShippingAddresses';
import { transmitOrder, getOrderPreview } from '../../services/orderRequestService';

import toast from 'react-hot-toast';

const FORMAS_PAGO = {
  ADE: 'Adelantos pagos - Contado',
  AD2: 'Adelanto por dscto. 0.02',
  CEF: 'Contado - Marketplace',
  CON: 'Contado',
  F03: 'Factura 3 días',
  F07: 'Factura 7 días',
  F15: 'Factura 15 días',
  F30: 'Factura 30 días',
  F45: 'Factura 45 días',
  F60: 'Factura 60 días',
  F75: 'Factura 75 días',
  F90: 'Factura 90 días',
  F92: 'Factura 120 días',
  PLA: 'Descuento planilla al personal',
  TRA: 'Traslado entre almacenes',
  TTG: 'Transf. a título gratuito',
  210: 'Factura 210 días',
};

const IGV_RATE = 0.18;

const roundTo = (value, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
};

const calcPrecioVisual = (precioLista, discount1, discount5, quantity = 1) => {
  const lista = Number(precioLista) || 0;
  const de01 = (Number(discount1) || 0) / 100;
  const de05 = (Number(discount5) || 0) / 100;
  const qty = Math.max(0, Number(quantity) || 0);

  const despuesPrimerDescuento = lista * (1 - de01);
  const precioNetoExacto = despuesPrimerDescuento * (1 - de05);

  const precioNeto = roundTo(precioNetoExacto, 4);
  const precioNetoTotal = roundTo(precioNetoExacto * qty, 2);
  const igv = roundTo(precioNetoTotal * IGV_RATE, 2);
  const importeTotal = roundTo(precioNetoTotal + igv, 2);

  return {
    precioNeto,
    precioNetoTotal,
    igv,
    importeTotal,
  };
};

const GenerateOrderModal = ({ quotation, isOpen, onClose, onSave }) => {

   const todasLasOpciones = Object.keys(FORMAS_PAGO);

  const fpActual = String(quotation?.formaPago || quotation?.forpag || '').trim().toUpperCase();
   const forpagOpciones = todasLasOpciones.includes(fpActual) || !fpActual
    ? todasLasOpciones
    : [...todasLasOpciones, fpActual];

  const [formData, setFormData] = useState({
    ordenCompra: '',
    formaPago: 'ADE',
    pagoTransporte: '',
    transporteZona: 'lima_callao',
    tipoEntrega: 'despacho',
    direccionDespacho: '',
    deptoDespacho: '',
    provinciaDespacho: '',
    distritoDespacho: '',
    deptoNombre: '',
    provinciaNombre: '',
    distritoNombre: '',
    observaciones: '',
    observacionesCreditos: '',
    observacionesLogistica: '',
    fechaEntrega: '',
    agenciaDespacho: { nombre: '', dni: '', telefono: '' }
  });

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedOtherAddressMode, setSelectedOtherAddressMode] = useState('manual');
  const [selectedOtherAddressId, setSelectedOtherAddressId] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const rucCli = String(quotation?.clienteRuc ?? quotation?.ruc ?? '').substring(0, 10);

  const { options: transportOptions, loading: loadingTransport, error: transportError } =
    useTransportistas(formData.transporteZona);

  const {
    departamentos, provincias, distritos,
    codDepto, setCodDepto,
    codProvincia, setCodProvincia,
    loadingDeptos, loadingProvs, loadingDistritos,
    reset: resetUbigeo,
  } = useUbigeo();

  const {
  addresses: clientAddresses,
  registeredAddresses = [],
  savedAddresses = [],
  registeredAddress,
  loading: loadingAddresses,
  error: addressError,
} = useClientShippingAddresses(isOpen ? rucCli : null);

  useEffect(() => {
    if (!isOpen) return;
    if (transportOptions.length === 0) return;
    if (formData.transporteZona === 'lima_callao' && !formData.pagoTransporte) {
      setFormData(prev => ({ ...prev, pagoTransporte: transportOptions[0].value }));
    }
  }, [transportOptions]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const fpCotizacion = String(quotation?.formaPago || quotation?.forpag || '').trim().toUpperCase();
const fpOpciones = todasLasOpciones.includes(fpCotizacion) || !fpCotizacion
  ? todasLasOpciones
  : [...todasLasOpciones, fpCotizacion];

      isSubmittingRef.current = false;
      setFormData({
        ordenCompra: '',
        formaPago: 'ADE',
        pagoTransporte: transportOptions.length > 0 ? transportOptions[0].value : '',
        transporteZona: 'lima_callao',
        tipoEntrega: 'despacho',
        direccionDespacho: '',
        deptoDespacho: '',
        provinciaDespacho: '',
        distritoDespacho: '',
        deptoNombre: '',
        provinciaNombre: '',
        distritoNombre: '',
        observaciones: '',
        observacionesCreditos: '',
        observacionesLogistica: '',
        fechaEntrega: '',
        agenciaDespacho: { nombre: '', dni: '', telefono: '' }
      });
      setSelectedAddressId('');
      setSelectedOtherAddressMode('manual');
      setSelectedOtherAddressId('');
      setErrors({});
      resetUbigeo();
    }
  }, [isOpen, quotation]);

  useEffect(() => {
    if (!isOpen || !quotation?.id) return;

    const loadPreview = async () => {
      setLoadingPreview(true);
      try {
        const data = await getOrderPreview(quotation.id);
        console.log('🧾 Preview cargado:', data);
        console.log('🧾 Items payload:', data?.payload?.items);
        setPreview(data);
      } catch (error) {
        console.error('❌ Error cargando preview de pedido:', error);
        setPreview(null);
      } finally {
        setLoadingPreview(false);
      }
    };

    loadPreview();
  }, [isOpen, quotation?.id]);

  if (!isOpen || !quotation) return null;

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const clearDeliveryAddressFields = () => {
    setFormData(prev => ({
      ...prev,
      direccionDespacho: '',
      deptoDespacho: '',
      provinciaDespacho: '',
      distritoDespacho: '',
      deptoNombre: '',
      provinciaNombre: '',
      distritoNombre: '',
      agenciaDespacho: { nombre: '', dni: '', telefono: '' }
    }));
  };

  const handleChange = (field, value) => {
    if (field === 'tipoEntrega') {
      setFormData(prev => ({
        ...prev,
        tipoEntrega: value,
        direccionDespacho: '',
        deptoDespacho: '',
        provinciaDespacho: '',
        distritoDespacho: '',
        deptoNombre: '',
        provinciaNombre: '',
        distritoNombre: '',
        agenciaDespacho: { nombre: '', dni: '', telefono: '' }
      }));
      setSelectedAddressId('');
      setSelectedOtherAddressMode('manual');
      setSelectedOtherAddressId('');
      resetUbigeo();
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    if (errors[field]) {
      setErrors(prev => {
        const e = { ...prev };
        delete e[field];
        return e;
      });
    }
  };

  const handleTransportZoneChange = (zona) => {
    setFormData(prev => ({
      ...prev,
      transporteZona: zona,
      pagoTransporte: '',
    }));
  };

const handleAddressSelect = (addressId) => {
  setSelectedAddressId(addressId);

  if (!addressId) {
    setFormData(prev => ({
      ...prev,
      direccionDespacho: '',
      provinciaDespacho: '',
      distritoDespacho: '',
      deptoNombre: '',
      provinciaNombre: '',
      distritoNombre: '',
      agenciaDespacho: { nombre: '', dni: '', telefono: '' }
    }));
    return;
  }

  const address = registeredAddresses.find(addr => String(addr.id) === String(addressId));
  if (address) {
    setFormData(prev => ({
      ...prev,
      direccionDespacho: address.direccion,
      deptoDespacho: address.ubigeoDepto || '',
      provinciaDespacho: address.ubigeoProvinca || '',
      distritoDespacho: address.ubigeoDistrito || '',
      deptoNombre: address.deptoNombre || '',
      provinciaNombre: address.provinciaNombre || '',
      distritoNombre: address.distritoNombre || '',
    }));
  }
};

  const handleOtherAddressModeChange = (mode) => {
    setSelectedOtherAddressMode(mode);
    setSelectedOtherAddressId('');
    clearDeliveryAddressFields();
    resetUbigeo();
  };

  const handleOtherAddressSelect = (addressId) => {
    setSelectedOtherAddressId(addressId);

    if (!addressId) {
    clearDeliveryAddressFields();
    return;
  }

    const address = savedAddresses.find(addr => String(addr.id) === String(addressId));
    if (address) {
      setFormData(prev => ({
        ...prev,
        direccionDespacho: address.direccion || '',
        deptoDespacho: address.ubigeoDepto || '',
        provinciaDespacho: address.ubigeoProvinca || '',
        distritoDespacho: address.ubigeoDistrito || '',
        deptoNombre: address.deptoNombre || '',
        provinciaNombre: address.provinciaNombre || '',
        distritoNombre: address.distritoNombre || '',
      }));
    }
  };

  const handleDeptoChange = (codDep) => {
    const depto = departamentos.find(d => d.codigo === codDep);
    setCodDepto(codDep);
    setCodProvincia('');
    setFormData(prev => ({
      ...prev,
      deptoDespacho: codDep,
      deptoNombre: depto?.descripcion || '',
      provinciaDespacho: '',
      provinciaNombre: '',
      distritoDespacho: '',
      distritoNombre: '',
    }));
  };

  const handleProvinciaChange = (codProv) => {
    const prov = provincias.find(p => p.codigo === codProv);
    setCodProvincia(codProv);
    setFormData(prev => ({
      ...prev,
      provinciaDespacho: codProv,
      provinciaNombre: prov?.descripcion || '',
      distritoDespacho: '',
      distritoNombre: '',
    }));
  };

  const handleAgencyChange = (agencyData) => {
    setFormData(prev => ({ ...prev, agenciaDespacho: agencyData }));
  };

  const validate = () => {
    const newErrors = {};

    if (formData.fechaEntrega) {
      const selectedDate = new Date(formData.fechaEntrega);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      if (selectedDate < tomorrow) {
        newErrors.fechaEntrega = 'La fecha debe ser a partir de mañana';
      }
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
      if (selectedOtherAddressMode === 'manual') {
        if (!formData.deptoDespacho)
          newErrors.deptoDespacho = 'Departamento es requerido';
        if (!formData.provinciaDespacho)
          newErrors.provinciaDespacho = 'Provincia es requerida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (isSubmittingRef.current) return;
  isSubmittingRef.current = true;

  if (!validate()) {
    toast.error('Por favor complete todos los campos requeridos');
    isSubmittingRef.current = false;
    return;
  }

  setIsSubmitting(true);

  try {
    let selectedShippingAddressId = null;

    if (formData.tipoEntrega === 'despacho') {
      selectedShippingAddressId = selectedAddressId || null;
    } else if (
      formData.tipoEntrega === 'nueva_direccion' &&
      selectedOtherAddressMode === 'saved'
    ) {
      selectedShippingAddressId = selectedOtherAddressId || null;
    }

    const payloadToSend = {
      ...formData,
      selectedShippingAddressId,
    };

    const result = await transmitOrder(quotation.id, payloadToSend);
    toast.success(`Pedido generado — Folio: ${result.folio_as400}`);
    onSave?.(result);
    onClose();
  } catch (error) {
    const msg = error.response?.data?.error || 'Error al generar el pedido';
    toast.error(msg);
    console.error(error);
  } finally {
    setIsSubmitting(false);
    isSubmittingRef.current = false;
  }
};

  const quotationProducts = Array.isArray(preview?.payload?.items)
    ? preview.payload.items
    : Array.isArray(preview?.items)
      ? preview.items
      : Array.isArray(preview?.productos)
        ? preview.productos
        : Array.isArray(quotation?.productos)
          ? quotation.productos
          : [];

  const totalsDisplay = quotationProducts.reduce(
    (acc, p) => {
      const qty = Number(p.quantity ?? p.cantidad ?? p.qaprbd ?? 0) || 0;

      const precioLista = Number(
        p.precioLista ??
        p.plistadol ??
        p.preciosDetalle?.importes?.ldol ??
        p.preciosDetalle?.importes?.dola ??
        p.dola ??
        0
      );

      const discount1 = Number(
        p.discount1 ??
        p.descuentos?.[0] ??
        0
      ) || 0;

      const discount5 = Number(
        p.discount5 ??
        p.descuentos?.[4] ??
        0
      ) || 0;

      const calc = calcPrecioVisual(precioLista, discount1, discount5, qty);

      acc.subtotal += calc.precioNetoTotal;
      acc.igv += calc.igv;
      acc.total += calc.importeTotal;
      return acc;
    },
    { subtotal: 0, igv: 0, total: 0 }
  );

  const subtotalDisplay = roundTo(totalsDisplay.subtotal, 2);
  const igvDisplay = roundTo(totalsDisplay.igv, 2);
  const totalDisplay = roundTo(totalsDisplay.total, 2);

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
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
                <span className="ml-2 text-gray-900 font-bold">${(quotation.total ?? 0).toFixed(3)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Asesor:</span>
                <span className="ml-2 text-gray-900">{quotation.asesor}</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-700" />
                  Productos de la Cotización
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Vista referencial de los productos incluidos en la cotización
                </p>
              </div>

              <div className="md:text-right md:shrink-0">
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Almacén seleccionado
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {String(preview?.payload?.codAlmacen ?? '—').trim()}
                  {' / '}
                  {String(preview?.payload?.codigoAlmacen ?? '—').trim()}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-center font-semibold text-gray-700 w-10">#</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Código</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Descripción</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700">Precio Lista</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700">Dscto 1 (%)</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700">Dscto 5 (%)</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700">Precio Neto</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700">Cant.</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700">P. Neto Total</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700">IGV ($)</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white">
                  {loadingPreview ? (
                    [1, 2].map((row) => (
                      <tr key={row} className="animate-pulse">
                        {Array.from({ length: 11 }).map((_, i) => (
                          <td key={i} className="px-3 py-3">
                            <div className="h-4 bg-gray-200 rounded w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : quotationProducts.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="px-4 py-10 text-center text-gray-500 text-sm">
                        No se encontraron productos en la cotización.
                      </td>
                    </tr>
                  ) : (
                    quotationProducts.map((p, index) => {
                      const qty = Number(p.quantity ?? p.cantidad ?? p.qaprbd ?? 0) || 0;

                      const precioLista = Number(
                        p.precioLista ??
                        p.plistadol ??
                        p.preciosDetalle?.importes?.ldol ??
                        p.preciosDetalle?.importes?.dola ??
                        p.dola ??
                        0
                      );

                      const discount1 = Number(
                        p.discount1 ??
                        p.descuentos?.[0] ??
                        0
                      ) || 0;

                      const discount5 = Number(
                        p.discount5 ??
                        p.descuentos?.[4] ??
                        0
                      ) || 0;

                      const {
                        precioNeto,
                        precioNetoTotal,
                        igv,
                        importeTotal
                      } = calcPrecioVisual(precioLista, discount1, discount5, qty);

                      return (
                        <tr key={p.id || `${p.codigo}-${index}`} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-center text-gray-500 font-semibold">
                            {index + 1}
                          </td>
                          <td className="px-3 py-2 text-gray-900 font-medium whitespace-nowrap">
                            {p.codigo || '-'}
                          </td>
                          <td className="px-3 py-2 text-gray-800 min-w-[240px]">
                            {p.descripcion || p.nombre || p.codigo || '-'}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-700">
                            ${precioLista.toFixed(3)}
                          </td>
                          <td className="px-3 py-2 text-right text-indigo-700 font-semibold">
                            {discount1.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right text-orange-700 font-semibold">
                            {discount5.toFixed(3)}
                          </td>
                          <td className="px-3 py-2 text-right text-emerald-700 font-semibold">
                            ${precioNeto.toFixed(4)}
                          </td>
                          <td className="px-3 py-2 text-right text-blue-700 font-bold">
                            {qty}
                          </td>
                          <td className="px-3 py-2 text-right text-blue-800 font-semibold">
                            ${precioNetoTotal.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right text-yellow-700 font-semibold">
                            ${igv.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right text-red-700 font-bold">
                            ${importeTotal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end p-4 bg-gray-50 border-t">
              <div className="space-y-1 w-full max-w-xs bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Subtotal:</span>
                  <span className="font-semibold text-gray-900">
                    ${subtotalDisplay.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">IGV (18%):</span>
                  <span className="font-semibold text-yellow-700">
                    ${igvDisplay.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-base border-t pt-2 mt-2">
                  <span className="font-bold text-gray-900">Total:</span>
                  <span className="font-extrabold text-emerald-700 text-lg">
                    ${totalDisplay.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-700" />
              Datos de la Orden
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° Orden de Compra
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={formData.ordenCompra}
                  onChange={(e) => handleChange('ordenCompra', e.target.value)}
                  placeholder="OC-2025-0001"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ecc70] focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forma de Pago
                </label>
                <select
                  value={formData.formaPago}
                  onChange={(e) => handleChange('formaPago', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ecc70] focus:border-transparent appearance-none bg-white"
                >
                  {forpagOpciones.map(op => (
                    <option key={op} value={op}>
    {FORMAS_PAGO[op] ? `${op} - ${FORMAS_PAGO[op]}` : op}
  </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

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
                ) : registeredAddresses.length > 0 ? (
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
                        {registeredAddresses.map(addr => (
  <option key={addr.id} value={String(addr.id)}>
    📍 {addr.direccion} — {addr.distritoNombre}, {addr.provinciaNombre} (Dirección registrada)
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
                      const addr = registeredAddresses.find(a => String(a.id) === String(selectedAddressId));
                      if (!addr) return null;

                      return (
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de Despacho</label>
                            <textarea
                              value={formData.direccionDespacho}
                              readOnly
                              rows={2}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed resize-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                              <input
                                readOnly
                                value={addr.deptoNombre}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                              <input
                                readOnly
                                value={addr.provinciaNombre}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Distrito</label>
                              <input
                                readOnly
                                value={addr.distritoNombre}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                              />
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
                {loadingAddresses ? (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 animate-pulse">
                    Cargando direcciones guardadas...
                  </div>
                ) : (
                  <>
                    {savedAddresses.length > 0 && (
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Origen de la dirección
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <label
                            className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${
                              selectedOtherAddressMode === 'manual'
                                ? 'border-[#2ecc70] bg-green-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name="otherAddressMode"
                              value="manual"
                              checked={selectedOtherAddressMode === 'manual'}
                              onChange={(e) => handleOtherAddressModeChange(e.target.value)}
                              className="w-4 h-4 text-[#2ecc70] focus:ring-[#2ecc70]"
                            />
                            <span className="text-sm font-medium text-gray-900">Ingresar nueva dirección</span>
                          </label>

                          <label
                            className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${
                              selectedOtherAddressMode === 'saved'
                                ? 'border-[#2ecc70] bg-green-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name="otherAddressMode"
                              value="saved"
                              checked={selectedOtherAddressMode === 'saved'}
                              onChange={(e) => handleOtherAddressModeChange(e.target.value)}
                              className="w-4 h-4 text-[#2ecc70] focus:ring-[#2ecc70]"
                            />
                            <span className="text-sm font-medium text-gray-900">Usar dirección guardada</span>
                          </label>
                        </div>

                        {selectedOtherAddressMode === 'saved' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Seleccionar dirección guardada <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={selectedOtherAddressId}
                              onChange={(e) => handleOtherAddressSelect(e.target.value)}
                              className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#2ecc70] focus:border-transparent appearance-none bg-white ${
                                errors.direccionDespacho ? 'border-red-500 bg-red-50' : 'border-gray-300'
                              }`}
                            >
                              <option value="">-- Seleccionar dirección guardada --</option>
                              {savedAddresses.map(addr => (
                                <option key={addr.id} value={String(addr.id)}>
                                  📦 {addr.direccion} — {addr.distritoNombre}, {addr.provinciaNombre}
                                  {addr.isDefault === 1 ? ' (Principal)' : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedOtherAddressMode === 'saved' ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dirección de Despacho <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={formData.direccionDespacho}
                            readOnly
                            rows={2}
                            className={`w-full px-3 py-2.5 border rounded-lg bg-gray-100 cursor-not-allowed resize-none ${
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                            <input
                              readOnly
                              value={formData.deptoNombre}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                            <input
                              readOnly
                              value={formData.provinciaNombre}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Distrito <span className="text-red-500">*</span>
                            </label>
                            <input
                              readOnly
                              value={formData.distritoNombre}
                              className={`w-full px-3 py-2.5 border rounded-lg bg-gray-100 cursor-not-allowed ${
                                errors.distritoDespacho ? 'border-red-500 bg-red-50' : 'border-gray-300'
                              }`}
                            />
                            {errors.distritoDespacho && (
                              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />{errors.distritoDespacho}
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
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
                            <select
                              value={formData.deptoDespacho}
                              onChange={(e) => handleDeptoChange(e.target.value)}
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
                            <select
                              value={formData.provinciaDespacho}
                              onChange={(e) => handleProvinciaChange(e.target.value)}
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
                                  distritoNombre: dist?.descripcion || '',
                                }));
                                if (errors.distritoDespacho) {
                                  setErrors(prev => {
                                    const er = { ...prev };
                                    delete er.distritoDespacho;
                                    return er;
                                  });
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
                      </>
                    )}

                    <div className="mt-2">
                      <ShippingAgencyForm
                        agencyData={formData.agenciaDespacho}
                        onChange={handleAgencyChange}
                        errors={{ nombre: errors.agenciaNombre, dni: errors.agenciaDni, telefono: errors.agenciaTelefono }}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded-lg p-5 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-700" />
              Observaciones Generales
            </h3>

            <div>
              <textarea
                value={formData.observaciones}
                onChange={(e) => handleChange('observaciones', e.target.value)}
                placeholder="Indicaciones especiales, horarios de entrega, etc..."
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ecc70] focus:border-transparent resize-none text-sm"
              />
            </div>
          </div>

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