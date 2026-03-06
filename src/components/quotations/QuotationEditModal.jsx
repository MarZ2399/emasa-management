// src/components/quotations/QuotationEditModal.jsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import {
  X,
  FileText,
  User,
  Contact2,
  UserCircle2,
  Calendar,
  Plus,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ProductSelectorModal from '../products/ProductSelectorModal';
import { precioService } from '../../services/precioService';


const IGV_RATE = 0.18;


// ✅ IGUAL que QuotationTab — siempre desde dola, nunca acumulativo
const calcPrecioNeto = (dola, discount5) => {
  const base = Number(dola) || 0;
  const de05 = (Number(discount5) || 0) / 100;
  return base * (1 - de05);
};


const QuotationEditModal = ({ isOpen, quotation, onClose, onSave }) => {
  const [formData, setFormData]                           = useState(null);
  const [errors, setErrors]                               = useState({});
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);
  const [loadingPrices, setLoadingPrices]                 = useState(false); // ✅ spinner flags

  // Bloquear scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (!quotation || !isOpen) return;

    // ── Carga inicial: muestra el modal de inmediato con los datos guardados ──
    setFormData({
      ...quotation,
      productos: quotation.productos.map(p => {
        // Reconstruir dola si no está persistido
        const dola = Number(
          p.dola ??
          p.precioNetoDola ??
          (p.precioLista != null && p.discount1 != null
            ? p.precioLista * (1 - (Number(p.discount1) || 0) / 100)
            : null) ??
          p.precioNeto ??
          0
        );
        return { ...p, dola };
      }),
      observaciones:          quotation.observaciones          || '',
      observacionesCreditos:  quotation.observacionesCreditos  || '',
      observacionesLogistica: quotation.observacionesLogistica || '',
    });
    setErrors({});

    // ── Re-consultar precios para activar flags — sin tocar datos visibles ────
    if (quotation.ruc && quotation.productos?.length > 0) {
      enrichProductsWithPrices(quotation);
    }
  }, [quotation, isOpen]);


  // ✅ Solo trae preciosDetalle y dola del backend
  // NO pisa precioLista, discount1, discount5, precioNeto ni totales visibles
  const enrichProductsWithPrices = async (quot) => {
    setLoadingPrices(true);
    try {
      const enriched = await Promise.all(
        quot.productos.map(async (p) => {
          try {
            const res = await precioService.obtenerPrecio(quot.ruc, p.codigo?.trim(), 1);

            if (res.success && res.data) {
              const data       = res.data;
              const descuentos = data.descuentos || {};
              const importes   = data.importes   || {};
              const costos     = data.costos     || {};
              const flag       = data.flag?.trim() ?? '';

              // dola fresco — solo como base interna de recálculo futuro
              const dola = Number(importes.dola ?? p.dola ?? p.precioNeto ?? 0);

              return {
                ...p,       // ✅ todos los datos visibles guardados intactos
                dola,       // ✅ base de cálculo interna actualizada
                preciosDetalle: { flag, descuentos, importes, costos }, // ✅ activa flags
              };
            }
            return p; // Si falla ese producto, lo deja sin cambios
          } catch {
            return p;
          }
        })
      );

      // ✅ Solo reemplaza productos — NO recalcula totales (datos visibles intactos)
      setFormData(prev => {
        if (!prev) return prev;
        return { ...prev, productos: enriched };
      });

    } catch (err) {
      console.error('❌ Error al enriquecer productos con flags:', err);
    } finally {
      setLoadingPrices(false);
    }
  };


  if (!isOpen || !formData) return null;

  // ── Recalcular totales ────────────────────────────────────────────────────────
  const updateTotals = (updatedProducts) => {
    const subtotal = updatedProducts.reduce((sum, p) => {
      const dola = Number(p.preciosDetalle?.importes?.dola ?? p.dola ?? p.precioNeto ?? 0);
      return sum + calcPrecioNeto(dola, p.discount5) * (p.quantity || p.cantidad || 0);
    }, 0);
    const igv   = subtotal * IGV_RATE;
    const total = subtotal + igv;
    setFormData(prev => ({ ...prev, productos: updatedProducts, subtotal, igv, total }));
  };

  const handleHeaderChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const copy = { ...prev }; delete copy[field]; return copy; });
    }
  };

  // ── Edición de fila ───────────────────────────────────────────────────────────
  const handleProductChange = (index, field, value) => {
    setFormData(prev => {
      const products = [...prev.productos];
      const product  = { ...products[index] };

      if (field === 'cantidad' || field === 'quantity') {
        const qty = value === '' ? 0 : Number(value);
        product.cantidad = qty;
        product.quantity = qty;
      } else if (field === 'discount5') {
        product.discount5    = value;
        product.descuento5to = value;
      } else {
        product[field] = value;
      }

      // ✅ Recalcular siempre desde dola — nunca desde precioNeto acumulado
      if (field === 'discount5') {
        const dola = Number(
          product.preciosDetalle?.importes?.dola ??
          product.dola ??
          0
        );
        product.precioNeto     = calcPrecioNeto(dola, value);
        product.precioUnitario = product.precioNeto;
      }

      products[index] = product;
      updateTotals(products);
      return { ...prev, productos: products };
    });
  };

  // ── onBlur: normalizar discount5 según flag ───────────────────────────────────
  const handleDiscount5Blur = (index) => {
    setFormData(prev => {
      const products = [...prev.productos];
      const product  = { ...products[index] };

      const flag  = product.preciosDetalle?.flag?.trim() ?? product.flag?.trim() ?? '';
      const flagT = flag === 'T';
      const flagX = flag === 'X';
      const minD5 = flagT ? (product.preciosDetalle?.descuentos?.de04 ?? product.discount4 ?? 0)   : 0;
      const maxD5 = flagT ? (product.preciosDetalle?.descuentos?.de05 ?? product.discount4Max ?? 100) : 100;

      if (flagX) {
        product.discount5 = 0;
      } else {
        const current = product.discount5;
        if (current === '' || current == null) {
          product.discount5 = 0;
        } else {
          const num = Number(current) || 0;
          product.discount5 = flagT
            ? Math.min(maxD5, Math.max(minD5, num))
            : Math.min(100, Math.max(0, num));
        }
      }

      product.descuento5to = product.discount5;

      const dola = Number(
        product.preciosDetalle?.importes?.dola ??
        product.dola ??
        0
      );
      product.precioNeto     = calcPrecioNeto(dola, product.discount5);
      product.precioUnitario = product.precioNeto;

      products[index] = product;
      updateTotals(products);
      return { ...prev, productos: products };
    });
  };

  // ── Agregar producto ──────────────────────────────────────────────────────────
  const handleAddProduct = () => setIsProductSelectorOpen(true);

  const handleSelectProductForQuotation = (product) => {
    const yaExiste = formData.productos.some(
      p => p.codigo?.trim() === product.codigo?.trim()
    );
    if (yaExiste) {
      toast.error(
        `"${product.codigo}" ya está en la cotización. Modifica los datos directamente en la tabla.`,
        { position: 'top-right', duration: 4000, icon: '⚠️' }
      );
      return;
    }

    setFormData(prev => {
      const nextId     = (prev.productos[prev.productos.length - 1]?.id || 0) + 1;
      const qtyDefault = 1;

      const dola       = Number(product.preciosDetalle?.importes?.dola ?? product.precioNeto ?? 0);
      const discount5  = 0;
      const precioNeto = calcPrecioNeto(dola, discount5);

      const newProduct = {
        id:             nextId,
        codigo:         product.codigo,
        nombre:         product.nombre,
        descripcion:    product.nombre,
        cantidad:       qtyDefault,
        quantity:       qtyDefault,

        precioLista:    product.precioLista || 0,
        precioUnitario: precioNeto,
        precioNeto:     precioNeto,
        dola,

        discount1:  product.discount1 || 0,
        discount2:  product.discount2 || 0,
        discount3:  product.discount3 || 0,
        discount4:  product.discount4 || 0,
        discount5,

        descuento:    product.discount1 || 0,
        descuento5to: discount5,

        flag:           product.flag           || '',
        preciosDetalle: product.preciosDetalle || null,

        subtotal: Number((precioNeto * qtyDefault).toFixed(2)),
      };

      const products      = [...prev.productos, newProduct];
      const subtotalTotal = products.reduce((sum, p) => {
        const d = Number(p.preciosDetalle?.importes?.dola ?? p.dola ?? p.precioNeto ?? 0);
        return sum + calcPrecioNeto(d, p.discount5) * (p.quantity || p.cantidad || 0);
      }, 0);
      const igv   = subtotalTotal * IGV_RATE;
      const total = subtotalTotal + igv;

      return { ...prev, productos: products, subtotal: subtotalTotal, igv, total };
    });
  };

  const handleRemoveProduct = (index) => {
    setFormData(prev => {
      const products = prev.productos.filter((_, i) => i !== index);
      updateTotals(products);
      return { ...prev, productos: products };
    });
  };

  // ── Validación ────────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!formData.cliente?.trim())  newErrors.cliente = 'Cliente es requerido';
    if (!formData.ruc?.trim())      newErrors.ruc     = 'RUC es requerido';
    if (!formData.asesor?.trim())   newErrors.asesor  = 'Asesor es requerido';
    if (!formData.fecha)            newErrors.fecha   = 'Fecha es requerida';
    if (!formData.productos || formData.productos.length === 0)
      newErrors.productos = 'Debe existir al menos un producto';

    formData.productos.forEach((p, i) => {
      const flag  = p.preciosDetalle?.flag?.trim() ?? p.flag?.trim() ?? '';
      const flagT = flag === 'T';
      const flagX = flag === 'X';
      const minD5 = flagT ? (p.preciosDetalle?.descuentos?.de04 ?? p.discount4 ?? 0)   : 0;
      const maxD5 = flagT ? (p.preciosDetalle?.descuentos?.de05 ?? 100) : 100;
      const d5    = Number(p.discount5) || 0;

      if (flagX && d5 !== 0)
        newErrors[`producto_${i}_d5`] = `Ítem ${i + 1}: no permite descuento adicional.`;
      if (flagT && (d5 < minD5 || d5 > maxD5))
        newErrors[`producto_${i}_d5`] = `Ítem ${i + 1}: 5to descuento debe estar entre ${minD5}% y ${maxD5}%.`;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const productosAjustados = formData.productos.map(p => {
      const qty   = p.quantity || p.cantidad || 0;
      const dola  = Number(p.preciosDetalle?.importes?.dola ?? p.dola ?? 0);
      const pNeto = calcPrecioNeto(dola, p.discount5);
      return {
        ...p,
        cantidad:       qty,
        quantity:       qty,
        precioNeto:     pNeto,
        precioUnitario: pNeto,
        subtotal:       Number((pNeto * qty).toFixed(2)),
      };
    });

    onSave({ ...formData, productos: productosAjustados });
  };

  // Cliente para ProductSelectorModal
  const selectedClient = formData.cliente && formData.ruc ? {
    nombreCliente: formData.cliente,
    nombre:        formData.cliente,
    ruc:           formData.ruc,
    vendedor:      formData.asesor,
  } : null;

  // ─────────────────────────────────────────────────────────────────────────────
  const modalContent = (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-emerald-500 to-green-600 text-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
              <div>
                <h2 className="text-lg font-bold">
                  Editar Cotización #{formData.numeroCotizacion}
                </h2>
                {/* ✅ Spinner mientras carga flags — sin bloquear el modal */}
                {loadingPrices ? (
                  <p className="text-xs text-emerald-100 flex items-center gap-1 animate-pulse">
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Cargando validaciones de descuentos...
                  </p>
                ) : (
                  <p className="text-xs text-emerald-100">Modifica los datos y productos</p>
                )}
              </div>
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">

            {/* Datos generales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.cliente}
                    onChange={e => handleHeaderChange('cliente', e.target.value)}
                    className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.cliente ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.cliente && <p className="mt-1 text-xs text-red-600">{errors.cliente}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RUC <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Contact2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.ruc}
                    onChange={e => handleHeaderChange('ruc', e.target.value)}
                    className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.ruc ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.ruc && <p className="mt-1 text-xs text-red-600">{errors.ruc}</p>}
              </div>
            </div>

            {/* Asesor y Fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asesor <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.asesor}
                    onChange={e => handleHeaderChange('asesor', e.target.value)}
                    className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.asesor ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.asesor && <p className="mt-1 text-xs text-red-600">{errors.asesor}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
  type="date"
  value={formData.fecha || ''}
  onChange={e => handleHeaderChange('fecha', e.target.value)}
  disabled
  className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-100 text-gray-500 cursor-not-allowed ${
    errors.fecha ? 'border-red-500 bg-red-50' : 'border-gray-300'
  }`}
/>
                </div>
                {errors.fecha && <p className="mt-1 text-xs text-red-600">{errors.fecha}</p>}
              </div>
            </div>

            {/* Observaciones */}
            <div className="border border-gray-200 rounded-lg p-5 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gray-700" />
                Observaciones
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Observaciones Generales</label>
                <textarea
                  rows={2}
                  value={formData.observaciones || ''}
                  onChange={e => handleHeaderChange('observaciones', e.target.value)}
                  placeholder="Indicaciones especiales..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Observaciones de Créditos</label>
                <textarea
                  rows={2}
                  value={formData.observacionesCreditos || ''}
                  onChange={e => handleHeaderChange('observacionesCreditos', e.target.value)}
                  placeholder="Condiciones de pago..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Observaciones de Logística</label>
                <textarea
                  rows={2}
                  value={formData.observacionesLogistica || ''}
                  onChange={e => handleHeaderChange('observacionesLogistica', e.target.value)}
                  placeholder="Dirección de entrega..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
                />
              </div>
            </div>

            {/* Tabla de productos */}
            <div className="border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                <h3 className="text-sm font-semibold text-gray-800">Productos de la Cotización</h3>
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  Agregar producto
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-center font-semibold text-gray-700 w-8">#</th>
                      <th className="px-3 py-2 text-left  font-semibold text-gray-700">Código</th>
                      <th className="px-3 py-2 text-left  font-semibold text-gray-700">Descripción</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-700">Precio Lista</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-700">Dscto 1 (%)</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-700">Dscto 5 (%)</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-700">Precio Neto</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-700">Cant.</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-700">P. Neto Total</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-700">IGV ($)</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-700">Total</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {formData.productos.map((p, index) => {
                      const qty = p.quantity || p.cantidad || 0;

                      // ✅ Calcular siempre en vivo desde dola
                      const dola            = Number(p.preciosDetalle?.importes?.dola ?? p.dola ?? 0);
                      const precioNeto      = calcPrecioNeto(dola, p.discount5);
                      const precioNetoTotal = precioNeto * qty;
                      const igvRow          = precioNetoTotal * IGV_RATE;
                      const importeTotal    = precioNetoTotal + igvRow;

                      // ✅ Flag logic — activo tras enrichProductsWithPrices
                      const flag  = p.preciosDetalle?.flag?.trim() ?? p.flag?.trim() ?? '';
                      const flagT = flag === 'T';
                      const flagX = flag === 'X';
                      const minD5 = flagT ? (p.preciosDetalle?.descuentos?.de04 ?? p.discount4 ?? 0)   : 0;
                      const maxD5 = flagT ? (p.preciosDetalle?.descuentos?.de05 ?? 100) : 100;

                      return (
                        <tr key={p.id || index} className="hover:bg-gray-50 transition">

                          {/* # */}
                          <td className="px-3 py-2 text-center text-gray-500 font-semibold">
                            {index + 1}
                          </td>

                          {/* Código */}
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={p.codigo}
                              onChange={e => handleProductChange(index, 'codigo', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            />
                          </td>

                          {/* Descripción */}
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={p.nombre}
                              onChange={e => handleProductChange(index, 'nombre', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            />
                          </td>

                          {/* Precio Lista — readonly */}
                          <td className="px-3 py-2 text-right">
                            <input
                              type="text"
                              value={(p.precioLista || 0).toFixed(3)}
                              readOnly
                              className="w-24 px-2 py-1 border border-gray-200 rounded text-right text-xs bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                          </td>

                          {/* Dscto 1 — readonly */}
                          <td className="px-3 py-2 text-right">
                            <input
                              type="text"
                              value={p.discount1 ?? 0}
                              readOnly
                              className="w-20 px-2 py-1 border border-indigo-200 rounded text-right text-xs bg-indigo-50 text-indigo-700 cursor-not-allowed font-semibold"
                            />
                          </td>

                          {/* ✅ Dscto 5 — editable con validaciones de flag */}
                          <td className="px-3 py-2 text-right">
                            <div className="flex flex-col items-end gap-0.5">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={p.discount5 ?? ''}
                                disabled={flagX}
                                onChange={e => {
                                  if (flagX) return;
                                  const raw = e.target.value.replace(/\D/g, '');
                                  if (raw === '') {
                                    handleProductChange(index, 'discount5', '');
                                    return;
                                  }
                                  const num    = Number(raw);
                                  const capped = flagT
                                    ? (num > maxD5 ? String(maxD5) : raw)
                                    : (num > 100   ? '100'         : raw);
                                  handleProductChange(index, 'discount5', capped);
                                }}
                                onBlur={() => handleDiscount5Blur(index)}
                                className={`w-20 px-2 py-1 rounded text-right text-xs font-semibold focus:ring-1 outline-none border ${
                                  flagX
                                    ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                                    : flagT
                                    ? 'bg-orange-50 border-orange-400 text-orange-700 focus:ring-orange-400'
                                    : 'bg-orange-50 border-orange-200 text-orange-700 focus:ring-orange-400'
                                }`}
                              />
                              {flagX && (
                                <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 border border-gray-300 rounded px-1">
                                  Sin dscto.
                                </span>
                              )}
                              {flagT && (
                                <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 border border-orange-200 rounded px-1">
                                  {minD5}%–{maxD5}%
                                </span>
                              )}
                              {errors[`producto_${index}_d5`] && (
                                <span className="text-[10px] text-red-600">
                                  {errors[`producto_${index}_d5`]}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Precio Neto — calculado en vivo desde dola, readonly */}
                          <td className="px-3 py-2 text-right">
                            <input
                              type="text"
                              value={precioNeto.toFixed(3)}
                              readOnly
                              className="w-24 px-2 py-1 border border-green-200 rounded text-right text-xs bg-green-50 text-green-700 cursor-not-allowed font-semibold"
                            />
                          </td>

                          {/* Cantidad */}
                          <td className="px-3 py-2 text-right">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={qty === 0 || qty === null ? '' : String(qty)}
                              onChange={e => {
                                const raw = e.target.value.replace(/\D/g, '');
                                handleProductChange(index, 'quantity', raw === '' ? '' : raw);
                              }}
                              onBlur={() => {
                                const current = p.quantity;
                                if (current === '' || current == null) {
                                  handleProductChange(index, 'quantity', 1);
                                }
                              }}
                              className="w-16 px-2 py-1 border border-blue-200 rounded text-right text-xs bg-blue-50 font-bold focus:ring-1 focus:ring-blue-400 outline-none"
                            />
                          </td>

                          {/* P. Neto Total */}
                          <td className="px-3 py-2 text-right text-blue-800 font-bold text-xs">
                            ${precioNetoTotal.toFixed(2)}
                          </td>

                          {/* IGV por producto */}
                          <td className="px-3 py-2 text-right text-yellow-700 font-semibold text-xs">
                            ${igvRow.toFixed(2)}
                          </td>

                          {/* Importe Total por producto */}
                          <td className="px-3 py-2 text-right text-red-700 font-bold text-xs">
                            ${importeTotal.toFixed(2)}
                          </td>

                          {/* Eliminar */}
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(index)}
                              className="p-1 rounded text-red-600 hover:bg-red-50 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {errors.productos && (
                <p className="px-4 py-2 text-xs text-red-600">{errors.productos}</p>
              )}
            </div>

            {/* Totales */}
            <div className="flex justify-end">
              <div className="space-y-1 w-full max-w-xs bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Subtotal:</span>
                  <span className="font-semibold text-gray-900">${formData.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">IGV ({(IGV_RATE * 100).toFixed(0)}%):</span>
                  <span className="font-semibold text-yellow-700">${formData.igv?.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-base border-t pt-2 mt-2">
                  <span className="font-bold text-gray-900">Total:</span>
                  <span className="font-extrabold text-emerald-700 text-lg">${formData.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-md hover:shadow-lg transition"
              >
                Guardar cambios
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* ✅ ProductSelectorModal con existingProducts para marcar duplicados */}
      <ProductSelectorModal
        isOpen={isProductSelectorOpen}
        onClose={() => setIsProductSelectorOpen(false)}
        onSelect={handleSelectProductForQuotation}
        selectedClient={selectedClient}
        title="Agregar Producto a la Cotización"
        existingProducts={formData.productos}
      />
    </>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default QuotationEditModal;
