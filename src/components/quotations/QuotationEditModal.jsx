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
import ProductSelectorModal from '../products/ProductSelectorModal';

const IGV_RATE = 0.18;

const QuotationEditModal = ({ isOpen, quotation, onClose, onSave }) => {
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);

  // Bloquear scroll al abrir
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (quotation && isOpen) {
      setFormData({
        ...quotation,
        productos: quotation.productos.map(p => ({ ...p })),
         observaciones: quotation.observaciones || '',
      observacionesCreditos: quotation.observacionesCreditos || '',
      observacionesLogistica: quotation.observacionesLogistica || '',
      });
      setErrors({});
    }
  }, [quotation, isOpen]);

  if (!isOpen || !formData) return null;

  // Helpers
  const updateTotals = updatedProducts => {
    const subtotal = updatedProducts.reduce(
      (sum, p) => sum + (p.precioNeto || 0) * (p.quantity || p.cantidad || 0),
      0
    );
    const igv = subtotal * IGV_RATE;
    const total = subtotal + igv;

    setFormData(prev => ({
      ...prev,
      productos: updatedProducts,
      subtotal,
      igv,
      total,
    }));
  };

  const handleHeaderChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

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
      } else if (
        field === 'precioLista' ||
        field === 'precioUnitario' ||
        field === 'precioNeto'
      ) {
        product[field] = value === '' ? 0 : Number(value);
      } else if (field === 'discount1' || field === 'discount5') {
        const num = value === '' ? 0 : Number(value);
        product[field] = num;
        if (field === 'discount1') product.descuento = num;
        if (field === 'discount5') product.descuento5to = num;
      } else {
        product[field] = value;
      }

      const basePrice = product.precioLista || product.precioUnitario || 0;
      const d1 = product.discount1 || 0;
      const d5 = product.discount5 || 0;

      const precioConDescuentos =
        basePrice *
        ((100 - d1) / 100) *
        ((100 - d5) / 100);

      product.precioNeto = Number(precioConDescuentos.toFixed(2));

      products[index] = product;
      updateTotals(products);
      return { ...prev, productos: products };
    });
  };

  const handleAddProduct = () => {
    setIsProductSelectorOpen(true);
  };

  const handleSelectProductForQuotation = product => {
    setFormData(prev => {
      const nextId =
        (prev.productos[prev.productos.length - 1]?.id || 0) + 1;

      const qtyDefault = 1;
      const precioLista = product.precioLista ?? product.precio ?? 0;
      const precioNeto = product.precioNeto ?? product.precio ?? 0;

      const newProduct = {
        id: nextId,
        codigo: product.codigo,
        nombre: product.nombre,
        descripcion: product.nombre,
        cantidad: qtyDefault,
        quantity: qtyDefault,
        precioLista,
        precioUnitario: precioNeto,
        precioNeto,
        discount1: product.descuento1 ?? product.descuento ?? 0,
        discount5: product.descuento2 ?? 0,
        descuento: product.descuento1 ?? product.descuento ?? 0,
        descuento5to: product.descuento2 ?? 0,
        subtotal: Number((precioNeto * qtyDefault).toFixed(2)),
      };

      const products = [...prev.productos, newProduct];
      updateTotals(products);
      return { ...prev, productos: products };
    });
  };

  const handleRemoveProduct = index => {
    setFormData(prev => {
      const products = prev.productos.filter((_, i) => i !== index);
      updateTotals(products);
      return { ...prev, productos: products };
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!validate()) return;

    const productosAjustados = formData.productos.map(p => {
      const qty = p.quantity || p.cantidad || 0;
      const subtotal = (p.precioNeto || 0) * qty;
      return {
        ...p,
        cantidad: qty,
        quantity: qty,
        subtotal: Number(subtotal.toFixed(2)),
      };
    });

    const payload = {
      ...formData,
      productos: productosAjustados,
    };

    onSave(payload);
  };

  const modalContent = (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-emerald-500 to-green-600 text-white">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
              <div>
                <h2 className="text-lg font-bold">
                  Editar Cotización #{formData.numeroCotizacion}
                </h2>
                <p className="text-xs text-emerald-100">
                  Modifica los datos generales y la lista de productos
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition"
            >
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
                {errors.cliente && (
                  <p className="mt-1 text-xs text-red-600">{errors.cliente}</p>
                )}
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
                {errors.ruc && (
                  <p className="mt-1 text-xs text-red-600">{errors.ruc}</p>
                )}
              </div>
            </div>

            {/* Asesor y fecha */}
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
                {errors.asesor && (
                  <p className="mt-1 text-xs text-red-600">{errors.asesor}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={e => handleHeaderChange('fecha', e.target.value)}
                    className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.fecha ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.fecha && (
                  <p className="mt-1 text-xs text-red-600">{errors.fecha}</p>
                )}
              </div>
            </div>

            {/* Observaciones */}
<div className="border border-gray-200 rounded-lg p-5 space-y-4">
  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
    <MessageSquare className="w-5 h-5 text-gray-700" />
    Observaciones
  </h3>

  {/* Observaciones Generales */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      Observaciones Generales
    </label>
    <textarea
      rows={2}
      value={formData.observaciones || ''}
      onChange={e =>
        handleHeaderChange('observaciones', e.target.value)
      }
      placeholder="Indicaciones especiales, horarios de entrega, etc..."
      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-sm"
    />
  </div>

  {/* Observaciones de Créditos */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      Observaciones de Créditos
    </label>
    <textarea
      rows={2}
      value={formData.observacionesCreditos || ''}
      onChange={e =>
        handleHeaderChange('observacionesCreditos', e.target.value)
      }
      placeholder="Condiciones de pago, plazos, garantías..."
      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
    />
  </div>

  {/* Observaciones de Logística */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      Observaciones de Logística
    </label>
    <textarea
      rows={2}
      value={formData.observacionesLogistica || ''}
      onChange={e =>
        handleHeaderChange('observacionesLogistica', e.target.value)
      }
      placeholder="Dirección de entrega, contacto, instrucciones de despacho..."
      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
    />
  </div>
</div>


            {/* Productos */}
            <div className="border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                <h3 className="text-sm font-semibold text-gray-800">
                  Productos de la Cotización
                </h3>
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4" />
                  Agregar producto
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">
                        Código
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">
                        Descripción
                      </th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-700">
                        Precio Lista
                      </th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-700">
                        Dscto 1 (%)
                      </th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-700">
                        Dscto 5 (%)
                      </th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-700">
                        Precio Neto
                      </th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-700">
                        Cant.
                      </th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-700">
                        Subtotal
                      </th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {formData.productos.map((p, index) => {
                      const qty = p.quantity || p.cantidad || 0;
                      const rowSubtotal = (p.precioNeto || 0) * qty;
                      return (
                        <tr key={p.id || index}>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={p.codigo}
                              onChange={e =>
                                handleProductChange(index, 'codigo', e.target.value)
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={p.nombre}
                              onChange={e =>
                                handleProductChange(index, 'nombre', e.target.value)
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={
                                p.precioLista === 0 || p.precioLista === null
                                  ? ''
                                  : String(p.precioLista)
                              }
                              onChange={e => {
                                let raw = e.target.value.replace(',', '.');
                                if (raw === '') {
                                  handleProductChange(index, 'precioLista', '');
                                  return;
                                }
                                if (!/^\d*\.?\d*$/.test(raw)) return;
                                handleProductChange(index, 'precioLista', raw);
                              }}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={
                                p.discount1 === 0 || p.discount1 === null
                                  ? ''
                                  : String(p.discount1)
                              }
                              onChange={e => {
                                let raw = e.target.value.replace(',', '.');
                                if (raw === '') {
                                  handleProductChange(index, 'discount1', '');
                                  return;
                                }
                                if (!/^\d*\.?\d*$/.test(raw)) return;
                                handleProductChange(index, 'discount1', raw);
                              }}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={
                                p.discount5 === 0 || p.discount5 === null
                                  ? ''
                                  : String(p.discount5)
                              }
                              onChange={e => {
                                let raw = e.target.value.replace(',', '.');
                                if (raw === '') {
                                  handleProductChange(index, 'discount5', '');
                                  return;
                                }
                                if (!/^\d*\.?\d*$/.test(raw)) return;
                                handleProductChange(index, 'discount5', raw);
                              }}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={
                                p.precioNeto === 0 || p.precioNeto === null
                                  ? ''
                                  : String(p.precioNeto)
                              }
                              onChange={e => {
                                let raw = e.target.value.replace(',', '.');
                                if (raw === '') {
                                  handleProductChange(index, 'precioNeto', '');
                                  return;
                                }
                                if (!/^\d*\.?\d*$/.test(raw)) return;
                                handleProductChange(index, 'precioNeto', raw);
                              }}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={qty === 0 || qty === null ? '' : String(qty)}
                              onChange={e => {
                                let raw = e.target.value;
                                if (raw === '') {
                                  handleProductChange(index, 'quantity', '');
                                  return;
                                }
                                if (!/^\d*$/.test(raw)) return;
                                handleProductChange(index, 'quantity', raw);
                              }}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-right"
                            />
                          </td>
                          <td className="px-3 py-2 text-right text-gray-800 font-semibold">
                            {rowSubtotal.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(index)}
                              className="p-1 rounded text-red-600 hover:bg-red-50"
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
                <p className="px-4 py-2 text-xs text-red-600">
                  {errors.productos}
                </p>
              )}
            </div>

            {/* Totales */}
            <div className="flex justify-end">
              <div className="space-y-1 w-full max-w-xs">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Subtotal:</span>
                  <span className="font-semibold text-gray-900">
                    {formData.subtotal?.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    IGV ({IGV_RATE * 100}%):
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formData.igv?.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm border-t pt-1 mt-1">
                  <span className="font-bold text-gray-900">Total:</span>
                  <span className="font-extrabold text-emerald-700">
                    {formData.total?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-md hover:shadow-lg"
              >
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Selector de productos reutilizable */}
      <ProductSelectorModal
        isOpen={isProductSelectorOpen}
        onClose={() => setIsProductSelectorOpen(false)}
        onSelect={handleSelectProductForQuotation}
      />
    </>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default QuotationEditModal;
