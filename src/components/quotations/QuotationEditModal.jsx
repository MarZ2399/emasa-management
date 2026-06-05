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
} from 'lucide-react';
import toast from 'react-hot-toast';
import ProductSelectorModal from '../products/ProductSelectorModal';
import { precioService } from '../../services/precioService';
import { productService } from '../../services/productService';

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

const getPrecioListaByFlag = (item) => {
  const flag = item?.preciosDetalle?.flag?.trim() ?? item?.flag?.trim();

  if (flag === 'X') {
    return Number(
      item?.preciosDetalle?.importes?.dola ??
      item?.dola ??
      0
    );
  }

  return Number(
    item?.precioLista ??
    item?.plistadol ??
    item?.preciosDetalle?.importes?.ldol ??
    item?.preciosDetalle?.importes?.dola ??
    item?.dola ??
    0
  );
};

const normalizeProductForVisualCalc = (p) => {
  const precioLista = getPrecioListaByFlag(p);

  const discount1 = Number(p.discount1 ?? p.descuento ?? 0) || 0;
  const discount5 = Number(p.discount5 ?? p.descuento5to ?? 0) || 0;
  const quantity = Number(p.quantity ?? p.cantidad ?? 0) || 0;

  const calc = calcPrecioVisual(precioLista, discount1, discount5, quantity);

  return {
    ...p,
    precioLista,
    dola: precioLista,
    discount1,
    discount5,
    descuento: discount1,
    descuento5to: discount5,
    quantity,
    cantidad: quantity,
    precioNeto: calc.precioNeto,
    precioUnitario: calc.precioNeto,
    subtotal: calc.precioNetoTotal,
    igvItem: calc.igv,
    totalItem: calc.importeTotal,
  };
};

const buildVisualTotals = (products = []) => {
  const productos = products.map(normalizeProductForVisualCalc);
  const subtotal = roundTo(
    productos.reduce((sum, p) => sum + Number(p.subtotal || 0), 0),
    2
  );
  const igv = roundTo(subtotal * IGV_RATE, 2);
  const total = roundTo(subtotal + igv, 2);

  return { productos, subtotal, igv, total };
};

const QuotationEditModal = ({ isOpen, quotation, onClose, onSave }) => {
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);
  const [loadingPrices, setLoadingPrices] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (!quotation || !isOpen) return;

    const productosBase = (quotation.productos || []).map(p => {
      const quantity = Number(p.quantity ?? p.cantidad ?? 1) || 1;
      return {
        ...p,
        cantidadOriginal: quantity,
        quantity,
        cantidad: quantity,
      };
    });

    const { productos, subtotal, igv, total } = buildVisualTotals(productosBase);

    setFormData({
      ...quotation,
      productos,
      subtotal,
      igv,
      total,
      observaciones: quotation.observaciones || '',
      observacionesCreditos: quotation.observacionesCreditos || '',
      observacionesLogistica: quotation.observacionesLogistica || '',
    });

    setErrors({});

    if (quotation.ruc && quotation.productos?.length > 0) {
      enrichProductsWithPrices(quotation);
    }
  }, [quotation, isOpen]);

  const enrichProductsWithPrices = async (quot) => {
    setLoadingPrices(true);
    try {
      const enriched = await Promise.all(
        (quot.productos || []).map(async (p) => {
          try {
            const res = await precioService.obtenerPrecio(quot.ruc, p.codigo?.trim(), 1);

            if (res.success && res.data) {
              const data = res.data;
              const descuentos = data.descuentos || {};
              const importes = data.importes || {};
              const costos = data.costos || {};
              const flag = data.flag?.trim() ?? '';

              let stockDisponible = (p.stock !== undefined && p.stock !== null) ? p.stock : null;

              if (stockDisponible === null) {
                try {
                  const codAlmacenTxt = String(
                    quot.cod_alm ?? p.warehouse ?? ''
                  ).trim().toUpperCase();

                  const codAlmacenNum = String(
                    quot.codnum_alm ?? p.codnum_alm ?? p.codNumAlmacen ?? ''
                  ).trim();

                  const stockRes = await productService.searchByCodigo(p.codigo?.trim());

                  if (stockRes.success && stockRes.data?.length > 0) {
                    const prod = stockRes.data[0];
                    const stockArr = Array.isArray(prod.stock) ? prod.stock : [];

                    const almacenStock = stockArr.find(s => {
                      const txt = String(s.almacencod ?? '').trim().toUpperCase();
                      const num = String(s.almacencod2 ?? '').trim();

                      return (
                        (codAlmacenTxt && txt === codAlmacenTxt) ||
                        (codAlmacenNum && num === codAlmacenNum)
                      );
                    });

                    stockDisponible = Number(almacenStock?.stock ?? almacenStock?.cantidad ?? 0);

                    console.log('📦 Stock resuelto en edición:', {
                      producto: p.codigo,
                      codAlmacenTxt,
                      codAlmacenNum,
                      almacenEncontrado: almacenStock,
                      stockDisponible,
                    });
                  } else {
                    stockDisponible = 0;
                  }
                } catch (stockErr) {
                  console.error(`❌ Error obteniendo stock de ${p.codigo}:`, stockErr);
                  stockDisponible = 0;
                }
              }

              const precioListaActualizado = getPrecioListaByFlag({
  ...p,
  preciosDetalle: { flag, descuentos, importes, costos },
});

              return normalizeProductForVisualCalc({
                ...p,
                precioLista: precioListaActualizado,
                dola: precioListaActualizado,
                stock: stockDisponible,
                cantidadOriginal: p.cantidadOriginal ?? p.quantity ?? p.cantidad ?? 1,
                preciosDetalle: { flag, descuentos, importes, costos },
              });
            }

            return normalizeProductForVisualCalc(p);
          } catch {
            return normalizeProductForVisualCalc(p);
          }
        })
      );

      const { productos, subtotal, igv, total } = buildVisualTotals(enriched);

      setFormData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          productos,
          subtotal,
          igv,
          total,
        };
      });
    } catch (err) {
      console.error('❌ Error al enriquecer productos con flags:', err);
    } finally {
      setLoadingPrices(false);
    }
  };

  if (!isOpen || !formData) return null;

  const updateTotals = (updatedProducts) => {
    const { productos, subtotal, igv, total } = buildVisualTotals(updatedProducts);

    setFormData(prev => ({
      ...prev,
      productos,
      subtotal,
      igv,
      total,
    }));
  };

  const handleHeaderChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleProductChange = (index, field, value) => {
    setFormData(prev => {
      const products = [...prev.productos];
      const product = { ...products[index] };

      if (field === 'cantidad' || field === 'quantity') {
        const qty = value === '' ? 0 : Number(value);
        product.cantidad = qty;
        product.quantity = qty;
      } else if (field === 'discount5') {
        product.discount5 = value;
        product.descuento5to = value;
      } else {
        product[field] = value;
      }

      products[index] = normalizeProductForVisualCalc(product);

      const { productos, subtotal, igv, total } = buildVisualTotals(products);

      return {
        ...prev,
        productos,
        subtotal,
        igv,
        total,
      };
    });
  };

  const handleDiscount5Blur = (index) => {
    setFormData(prev => {
      const products = [...prev.productos];
      const product = { ...products[index] };

      const flag = product.preciosDetalle?.flag?.trim() ?? product.flag?.trim() ?? '';
      const flagT = flag === 'T';
      const flagX = flag === 'X';
      const minD5 = flagT ? (product.preciosDetalle?.descuentos?.de04 ?? product.discount4 ?? 0) : 0;
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
      products[index] = normalizeProductForVisualCalc(product);

      const { productos, subtotal, igv, total } = buildVisualTotals(products);

      return {
        ...prev,
        productos,
        subtotal,
        igv,
        total,
      };
    });
  };

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
      const nextId = (prev.productos[prev.productos.length - 1]?.id || 0) + 1;
      const qtyDefault = 1;

      const precioLista = getPrecioListaByFlag(product);

      const discount1 = Number(product.discount1 || 0);
      const discount5 = 0;

      const newProduct = normalizeProductForVisualCalc({
        id: nextId,
        codigo: product.codigo,
        nombre: product.nombre,
        descripcion: product.nombre,
        cantidad: qtyDefault,
        quantity: qtyDefault,
        precioLista,
        dola: precioLista,
        discount1,
        discount2: product.discount2 || 0,
        discount3: product.discount3 || 0,
        discount4: product.discount4 || 0,
        discount5,
        descuento: discount1,
        descuento5to: discount5,
        flag: product.flag || '',
        preciosDetalle: product.preciosDetalle || null,
        stock: product.stockDisponible ?? product.stock ?? 0,
        warehouse: product.warehouse ?? formData.cod_alm ?? null,
        codnum_alm: product.codnum_alm ?? product.codNumAlmacen ?? formData.codnum_alm ?? null,
        codNumAlmacen: product.codNumAlmacen ?? product.codnum_alm ?? formData.codnum_alm ?? null,
      });

      const products = [...prev.productos, newProduct];
      const { productos, subtotal, igv, total } = buildVisualTotals(products);

      return {
        ...prev,
        productos,
        subtotal,
        igv,
        total,
      };
    });
  };

  const handleRemoveProduct = (index) => {
    setFormData(prev => {
      const products = prev.productos.filter((_, i) => i !== index);
      const { productos, subtotal, igv, total } = buildVisualTotals(products);

      return {
        ...prev,
        productos,
        subtotal,
        igv,
        total,
      };
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.cliente?.trim()) newErrors.cliente = 'Cliente es requerido';
    if (!formData.ruc?.trim()) newErrors.ruc = 'RUC es requerido';
    if (!formData.asesor?.trim()) newErrors.asesor = 'Asesor es requerido';
    if (!formData.fecha) newErrors.fecha = 'Fecha es requerida';
    if (!formData.productos || formData.productos.length === 0) {
      newErrors.productos = 'Debe existir al menos un producto';
    }

    formData.productos.forEach((p, i) => {
      const flag = p.preciosDetalle?.flag?.trim() ?? p.flag?.trim() ?? '';
      const flagT = flag === 'T';
      const flagX = flag === 'X';
      const minD5 = flagT ? (p.preciosDetalle?.descuentos?.de04 ?? p.discount4 ?? 0) : 0;
      const maxD5 = flagT ? (p.preciosDetalle?.descuentos?.de05 ?? 100) : 100;
      const d5 = Number(p.discount5) || 0;

      if (flagX && d5 !== 0) {
        newErrors[`producto_${i}_d5`] = `Ítem ${i + 1}: no permite descuento adicional.`;
      }

      if (flagT && (d5 < minD5 || d5 > maxD5)) {
        newErrors[`producto_${i}_d5`] = `Ítem ${i + 1}: 5to descuento debe estar entre ${minD5}% y ${maxD5}%.`;
      }

      const maxStock = p.stock || 0;
      const qty = Number(p.quantity || p.cantidad) || 0;
      if (maxStock > 0 && qty > maxStock) {
        newErrors[`producto_${i}_stock`] = `Ítem ${i + 1} (${p.codigo}): cantidad (${qty}) supera el stock disponible (${maxStock}).`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const { productos, subtotal, igv, total } = buildVisualTotals(formData.productos);

    onSave({
      ...formData,
      productos,
      subtotal,
      igv,
      total,
    });
  };

  const selectedClient = formData.cliente && formData.ruc ? {
    nombreCliente: formData.cliente,
    nombre: formData.cliente,
    ruc: formData.ruc,
    vendedor: formData.asesor,
  } : null;

  const modalContent = (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-emerald-500 to-green-600 text-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
              <div>
                <h2 className="text-lg font-bold">
                  Editar Cotización #{formData.numeroCotizacion}
                </h2>
                {loadingPrices ? (
                  <p className="text-xs text-emerald-100 flex items-center gap-1 animate-pulse">
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {formData.productos.map((p, index) => {
                      const qty = p.quantity || p.cantidad || 0;
                      const precioLista = Number(p.precioLista || 0);
                      const discount1 = Number(p.discount1 || 0);
                      const discount5 = Number(p.discount5 || 0);

                      const {
                        precioNeto,
                        precioNetoTotal,
                        igv,
                        importeTotal
                      } = calcPrecioVisual(precioLista, discount1, discount5, qty);

                      const flag = p.preciosDetalle?.flag?.trim() ?? p.flag?.trim() ?? '';
                      const flagT = flag === 'T';
                      const flagX = flag === 'X';
                      const minD5 = flagT ? (p.preciosDetalle?.descuentos?.de04 ?? p.discount4 ?? 0) : 0;
                      const maxD5 = flagT ? (p.preciosDetalle?.descuentos?.de05 ?? 100) : 100;

                      return (
                        <tr key={p.id || index} className="hover:bg-gray-50 transition">
                          <td className="px-3 py-2 text-center text-gray-500 font-semibold">
                            {index + 1}
                          </td>

                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={p.codigo}
                              onChange={e => handleProductChange(index, 'codigo', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            />
                          </td>

                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={p.nombre}
                              onChange={e => handleProductChange(index, 'nombre', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            />
                          </td>

                          <td className="px-3 py-2 text-right">
                            <input
                              type="text"
                              value={precioLista.toFixed(3)}
                              readOnly
                              className="w-24 px-2 py-1 border border-gray-200 rounded text-right text-xs bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                          </td>

                          <td className="px-3 py-2 text-right">
                            <input
                              type="text"
                              value={p.discount1 ?? 0}
                              readOnly
                              className="w-20 px-2 py-1 border border-indigo-200 rounded text-right text-xs bg-indigo-50 text-indigo-700 cursor-not-allowed font-semibold"
                            />
                          </td>

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
                                  const num = Number(raw);
                                  const capped = flagT
                                    ? (num > maxD5 ? String(maxD5) : raw)
                                    : (num > 100 ? '100' : raw);
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

                          <td className="px-3 py-2 text-right">
                            <input
                              type="text"
                              value={precioNeto.toFixed(4)}
                              readOnly
                              className="w-24 px-2 py-1 border border-green-200 rounded text-right text-xs bg-green-50 text-green-700 cursor-not-allowed font-semibold"
                            />
                          </td>

                          <td className="px-3 py-2 text-right">
                            <div className="flex flex-col items-end gap-0.5">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={qty === 0 || qty === null ? '' : String(qty)}
                                onChange={e => {
                                  const raw = e.target.value.replace(/\D/g, '');
                                  const maxStock = p.stock ?? 0;

                                  if (raw === '') {
                                    handleProductChange(index, 'quantity', '');
                                    return;
                                  }

                                  const num = Number(raw);

                                  if (maxStock > 0 && num > maxStock) {
                                    const cantidadRestaurada = p.cantidadOriginal ?? 1;
                                    toast.error(
                                      `Stock insuficiente para "${p.codigo}". Solo hay ${maxStock} unid. disponibles. Se restauró la cantidad a ${cantidadRestaurada}.`,
                                      { position: 'top-right', duration: 5000, icon: '📦' }
                                    );
                                    handleProductChange(index, 'quantity', cantidadRestaurada);
                                    return;
                                  }

                                  handleProductChange(index, 'quantity', raw);
                                }}
                                onBlur={e => {
                                  const raw = e.target.value.replace(/\D/g, '');
                                  if (raw === '' || Number(raw) === 0) {
                                    handleProductChange(index, 'quantity', 1);
                                  }
                                }}
                                className={`w-16 px-2 py-1 border rounded text-right text-xs font-bold focus:ring-1 outline-none ${
                                  errors[`producto_${index}_stock`]
                                    ? 'border-red-400 bg-red-50 text-red-700 focus:ring-red-400'
                                    : 'border-blue-200 bg-blue-50 focus:ring-blue-400'
                                }`}
                              />
                              {errors[`producto_${index}_stock`] && (
                                <span className="text-[10px] text-red-600 font-semibold">Máx: {p.stock}</span>
                              )}
                            </div>
                          </td>

                          <td className="px-3 py-2 text-right text-blue-800 font-bold text-xs">
                            ${precioNetoTotal.toFixed(2)}
                          </td>

                          <td className="px-3 py-2 text-right text-yellow-700 font-semibold text-xs">
                            ${igv.toFixed(2)}
                          </td>

                          <td className="px-3 py-2 text-right text-red-700 font-bold text-xs">
                            ${importeTotal.toFixed(2)}
                          </td>

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