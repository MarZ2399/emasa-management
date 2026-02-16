// src/components/calls/QuotationTab.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Trash2, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { previewQuotationPDF, generateQuotationPDF } from '../../utils/pdfGenerator';
import PDFPreview from './PDFPreview';
import OrderForm from '../orders/OrderForm';
import { getNextQuotationNumber, getCurrentQuotationNumber } from '../../data/quotationCounter';

const IGV_RATE = 0.18;

const QuotationTab = ({ 
  quotationItems, 
  setQuotationItems, 
  onBackToProducts, 
  selectedClient,
  onRegistrationComplete 
}) => {
  const pdfRef = useRef(null);
  const [quotationNumber, setQuotationNumber] = useState(getCurrentQuotationNumber());
  const [isRegistering, setIsRegistering] = useState(false);
  
  const currency = 'USD';
  
  // Estados para el modal de pedido
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [quotationForOrder, setQuotationForOrder] = useState(null);

  // Símbolos de moneda
  const currencySymbol = currency === 'USD' ? '$' : 'S/';
  const currencyLabel = currency === 'USD' ? 'Dólares Americanos (USD)' : 'Soles (PEN)';

  /**
   * ✅ FUNCIÓN PARA NORMALIZAR Y CALCULAR PRECIO NETO
   * Se ejecuta cada vez que se agregan o modifican productos
   */
  const normalizeAndCalculate = (item) => {
    // Normalizar valores
    const precioLista = Number(item.precioLista) || 0;
    const discount1 = Number(item.discount1) || 0;
    const discount5 = Number(item.discount5) || 0;
    const quantity = Number(item.quantity) || 1;

    // Validar rangos de descuentos
    const validDiscount1 = Math.max(0, Math.min(100, discount1));
    const validDiscount5 = Math.max(0, Math.min(100, discount5));

    // ✅ Calcular precio neto con descuentos en cascada
    const precioConDescuento1 = precioLista * ((100 - validDiscount1) / 100);
    const precioNeto = precioConDescuento1 * ((100 - validDiscount5) / 100);

    return {
      ...item,
      precioLista,
      discount1: validDiscount1,
      discount5: validDiscount5,
      quantity,
      precioNeto: Number(precioNeto.toFixed(2))
    };
  };

  /**
   * ✅ EFECTO PARA NORMALIZAR ITEMS CUANDO LLEGAN POR PRIMERA VEZ
   * Se ejecuta cada vez que quotationItems cambia desde el exterior
   */
  useEffect(() => {
    if (quotationItems && quotationItems.length > 0) {
      const normalizedItems = quotationItems.map(item => normalizeAndCalculate(item));
      
      // Solo actualizar si hay cambios reales
      const hasChanges = normalizedItems.some((normalized, idx) => {
        const original = quotationItems[idx];
        return (
          normalized.precioNeto !== original.precioNeto ||
          normalized.discount1 !== original.discount1 ||
          normalized.discount5 !== original.discount5
        );
      });

      if (hasChanges) {
        console.log('✅ Normalizando productos al llegar al tab de cotización');
        setQuotationItems(normalizedItems);
      }
    }
  }, [quotationItems.length]); // Solo cuando cambia la cantidad de items

  /**
   * ✅ FUNCIÓN MEJORADA PARA EDITAR CAMPOS
   * Recalcula automáticamente el precio neto
   */
  const handleEdit = (idx, field, value) => {
    setQuotationItems(items => 
      items.map((item, i) => {
        if (i !== idx) return item;

        // Crear item actualizado con el nuevo valor
        const updatedItem = {
          ...item,
          [field]: value === "" ? 0 : Number(value)
        };

        // Normalizar y recalcular
        return normalizeAndCalculate(updatedItem);
      })
    );
  };

  const removeItem = idx => {
    setQuotationItems(items => items.filter((_, i) => i !== idx));
    toast.error('Producto eliminado de la cotización', { position: 'top-right' });
  };

  const handleRegister = async () => {
    if (quotationItems.length === 0) {
      toast.error('No hay productos en la cotización', { position: 'top-right' });
      return;
    }

    setIsRegistering(true);

    try {
      // Genera y descarga el PDF
      if (pdfRef.current) {
        await generateQuotationPDF(
          pdfRef.current, 
          `cotizacion_${quotationNumber}.pdf`
        );
      }

      // Incrementa el contador
      const nextNumber = getNextQuotationNumber();
      setQuotationNumber(nextNumber);
      
      toast.success('Cotización registrada y descargada correctamente', { 
        position: 'top-right',
        duration: 4000
      });
      
      // Limpia la cotización
      setQuotationItems([]);
      
      if (onRegistrationComplete) {
        onRegistrationComplete();
      }
    } catch (error) {
      toast.error('Error al generar la cotización', { position: 'top-right' });
      console.error(error);
    } finally {
      setIsRegistering(false);
    }
  };

  // ✅ Calcular totales con validación
  const subtotal = (quotationItems ?? []).reduce((sum, p) => {
    const precioNeto = Number(p.precioNeto) || 0;
    const quantity = Number(p.quantity) || 0;
    return sum + (precioNeto * quantity);
  }, 0);
  
  const igv = subtotal * IGV_RATE;
  const total = subtotal + igv;

  // Handler para PDF preview
  const handlePreviewPDF = async () => {
    if (!pdfRef.current) return;
    await previewQuotationPDF(pdfRef.current);
    toast.success('Vista previa PDF generada', { position: 'top-right' });
  };

  // Handler para PDF descarga
  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    await generateQuotationPDF(pdfRef.current, `cotizacion_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF descargado', { position: 'top-right' });
  };

  // Handler para generar pedido
  const handleGenerateOrder = () => {
    if (quotationItems.length === 0) {
      toast.error('No hay productos en la cotización', { position: 'top-right' });
      return;
    }

    // Preparar datos de la cotización para el pedido
    const quotationData = {
      id: Date.now(),
      numeroCotizacion: quotationNumber,
      clienteId: selectedClient?.id || 1,
      clienteNombre: selectedClient?.nombreCliente || 'Cliente',
      clienteRuc: selectedClient?.ruc || '00000000000',
      productos: quotationItems.map((item, idx) => ({
        id: idx + 1,
        codigo: item.codigo,
        descripcion: item.nombre,
        cantidad: item.quantity,
        precioUnitario: item.precioNeto,
        subtotal: item.precioNeto * item.quantity
      })),
      subtotal: subtotal,
      igv: igv,
      total: total,
      asesor: selectedClient?.vendedor || '-',
      fecha: new Date().toISOString(),
      vigencia: '30 días',
      estado: 'Aprobada',
      tipoMoneda: currency
    };

    setQuotationForOrder(quotationData);
    setShowOrderForm(true);
  };

  // Handler para guardar pedido
  const handleSaveOrder = (orderData) => {
    console.log('Nuevo pedido generado:', orderData);
    
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const newOrder = {
      ...orderData,
      id: existingOrders.length + 1,
      createdAt: new Date().toISOString()
    };
    existingOrders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(existingOrders));

    toast.success(`Pedido ${orderData.numeroPedido} generado exitosamente`, {
      position: 'top-right',
      duration: 4000
    });
  };

  return (
    <div className="space-y-8">
      {/* PDFPreview oculto para generación PDF */}
      <PDFPreview
        ref={pdfRef}
        quotationItems={quotationItems}
        subtotal={subtotal}
        igv={igv}
        total={total}
        selectedClient={selectedClient}
        quotationNumber={quotationNumber}
        currency={currency}
      />

      {/* Header con título */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-800">
          Cotización
        </h2>
      </div>

      <div className="overflow-auto rounded-xl shadow-lg bg-white border">
        <table className="min-w-full divide-y divide-gray-200 text-sm" style={{ tableLayout: "fixed", width: "100%" }}>
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th style={{ width: 56 }} className="p-4 font-bold text-gray-700 text-center">Item</th>
              <th style={{ width: 120 }} className="p-4 font-bold text-gray-700 text-center">Código Mercadería</th>
              <th style={{ width: 210 }} className="p-4 font-bold text-gray-700 text-center">Descripción Mercadería</th>
              <th style={{ width: 130 }} className="p-4 font-bold text-gray-700 text-center">Precio Lista Unitario ({currencySymbol})</th>
              <th style={{ width: 130 }} className="p-4 font-bold text-gray-700 text-center">1er Dsco.</th>
              <th style={{ width: 130 }} className="p-4 font-bold text-gray-700 text-center">5to Dsco.</th>
              <th style={{ width: 140 }} className="p-4 font-bold text-gray-700 text-center">Precio Neto Unitario ({currencySymbol})</th>
              <th style={{ width: 70 }} className="p-4 font-bold text-gray-700 text-center">Cant.</th>
              <th style={{ width: 130 }} className="p-4 font-bold text-gray-700 text-center">Precio Neto Total ({currencySymbol})</th>
              <th style={{ width: 100 }} className="p-4 font-bold text-gray-700 text-center">IGV ({currencySymbol})</th>
              <th style={{ width: 120 }} className="p-4 font-bold text-gray-700 text-center">Importe Total ({currencySymbol})</th>
              <th style={{ width: 56 }}></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(quotationItems ?? []).length === 0 ? (
              <tr>
                <td colSpan={12} className="text-center p-8 text-gray-400 font-semibold">
                  No hay productos en la cotización.
                </td>
              </tr>
            ) : (
              (quotationItems ?? []).map((item, idx) => {
                const precioNetoTotal = (item.precioNeto || 0) * (item.quantity || 0);
                const igvTotal = precioNetoTotal * IGV_RATE;
                const importeTotal = precioNetoTotal + igvTotal;
                
                return (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td style={{ width: 56 }} className="p-4 text-center font-mono font-bold text-blue-800 bg-blue-50 rounded-l-lg">
                      {String(idx + 1).padStart(3, '0')}
                    </td>
                    <td style={{ width: 120 }} className="p-4 text-center font-semibold">{item.codigo}</td>
                    <td style={{ width: 210 }} className="p-4 text-left">{item.nombre}</td>
                    <td style={{ width: 130 }} className="p-4 text-right text-gray-700">
                      {currencySymbol} {(item.precioLista || 0).toFixed(2)}
                    </td>
                    <td style={{ width: 130 }} className="p-4 text-right">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={item.discount1 || 0}
                        onChange={e => {
                          let value = e.target.value.replace(/\D/g, "");
                          if (value === "") value = "0";
                          if (parseInt(value) > 100) value = "100";
                          handleEdit(idx, 'discount1', value);
                        }}
                        onBlur={e => {
                          if (e.target.value === "" || e.target.value === null) {
                            handleEdit(idx, 'discount1', 0);
                          }
                        }}
                        className="w-16 bg-indigo-50 border border-indigo-200 rounded px-2 py-1 text-center font-semibold text-indigo-700"
                      />
                      <span className="ml-1">%</span>
                    </td>
                    <td style={{ width: 130 }} className="p-4 text-right">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={item.discount5 || 0}
                        onChange={e => {
                          let value = e.target.value.replace(/\D/g, "");
                          if (value === "") value = "0";
                          if (parseInt(value) > 100) value = "100";
                          handleEdit(idx, 'discount5', value);
                        }}
                        onBlur={e => {
                          if (e.target.value === "" || e.target.value === null) {
                            handleEdit(idx, 'discount5', 0);
                          }
                        }}
                        className="w-16 bg-orange-50 border border-orange-200 rounded px-2 py-1 text-center font-semibold text-orange-700"
                      />
                      <span className="ml-1">%</span>
                    </td>
                    <td style={{ width: 140 }} className="p-4 text-right font-bold text-green-700">
                      {currencySymbol} {(item.precioNeto || 0).toFixed(2)}
                    </td>
                    <td style={{ width: 70 }} className="p-4 text-center">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={item.quantity || 1}
                        onChange={e => {
                          const value = e.target.value.replace(/\D/g, "");
                          handleEdit(idx, 'quantity', value || 1);
                        }}
                        onBlur={e => {
                          if (e.target.value === "" || parseInt(e.target.value) === 0) {
                            handleEdit(idx, 'quantity', 1);
                          }
                        }}
                        className="w-16 bg-blue-50 border border-blue-200 rounded px-2 py-1 text-center font-bold"
                      />
                    </td>
                    <td style={{ width: 130 }} className="p-4 text-right text-blue-900 font-bold">
                      {currencySymbol} {precioNetoTotal.toFixed(2)}
                    </td>
                    <td style={{ width: 100 }} className="p-4 text-right text-yellow-700">
                      {currencySymbol} {igvTotal.toFixed(2)}
                    </td>
                    <td style={{ width: 120 }} className="p-4 text-right text-red-800 font-bold">
                      {currencySymbol} {importeTotal.toFixed(2)}
                    </td>
                    <td style={{ width: 56 }} className="p-4 text-center">
                      <button
                        onClick={() => removeItem(idx)}
                        className="p-1 rounded hover:bg-red-600 hover:text-white text-red-600 transition"
                        title="Quitar producto"
                      >
                        <Trash2 size={22} strokeWidth={2.5} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Resumen totales */}
      <div className="w-full flex justify-end mt-4">
        <div className="space-y-2 max-w-xs w-full mr-4">
          <div className="bg-gray-50 rounded px-4 py-2 shadow text-sm flex items-center justify-between">
            <span className="font-bold text-gray-700">Subtotal:</span>
            <span className="font-bold text-blue-800">{currencySymbol} {subtotal.toFixed(2)}</span>
          </div>
          <div className="bg-gray-50 rounded px-4 py-2 shadow text-sm flex items-center justify-between">
            <span className="font-bold text-gray-700">IGV (18%):</span>
            <span className="font-bold text-yellow-700">{currencySymbol} {igv.toFixed(2)}</span>
          </div>
          <div className="bg-gray-100 rounded px-4 py-2 shadow-lg border border-blue-200 text-sm flex items-center justify-between">
            <span className="font-bold text-gray-900">Total:</span>
            <span className="font-extrabold text-blue-900">{currencySymbol} {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center mt-6 gap-3">
        <button
          onClick={onBackToProducts}
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold px-4 py-2 rounded-lg shadow hover:scale-105 transition text-sm w-full md:w-auto"
        >
          Seguir agregando productos
        </button>

        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handlePreviewPDF}
            disabled={quotationItems.length === 0}
            className="bg-orange-600 text-white font-bold px-4 py-2 rounded-lg shadow hover:scale-105 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            👁️ Previsualizar PDF
          </button>
          
          <button
            onClick={handleDownloadPDF}
            disabled={quotationItems.length === 0}
            className="bg-gray-600 text-white font-bold px-4 py-2 rounded-lg shadow hover:scale-105 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📥 Descargar PDF
          </button>
          
          <button
            onClick={handleRegister}
            disabled={quotationItems.length === 0 || isRegistering}
            className={`bg-green-600 text-white font-bold px-4 py-2 rounded-lg shadow hover:scale-105 transition text-sm flex items-center gap-2
            ${quotationItems.length === 0 || isRegistering ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {isRegistering ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generando...
              </>
            ) : (
              'Registrar Cotización'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuotationTab;
