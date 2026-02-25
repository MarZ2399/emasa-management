// src/components/calls/QuotationTab.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { previewQuotationPDF, generateQuotationPDF } from '../../utils/pdfGenerator';
import PDFPreview from './PDFPreview';
import quotationService from '../../services/quotationService';

const IGV_RATE = 0.18;

// ✅ Fuera del componente — idéntico a calcPrecios en ProductsTab
// precioNeto = precioLista × (1 - de01/100) × (1 - de05/100)
const calcPrecioNeto = (precioLista, discount1, discount5) => {
  const ldol = Number(precioLista) || 0;
  const de01 = (Number(discount1) || 0) / 100;
  const de05 = (Number(discount5) || 0) / 100;
  return ldol * (1 - de01) * (1 - de05);
};

const QuotationTab = ({
  quotationItems,
  setQuotationItems,
  onBackToProducts,
  selectedClient,
  onRegistrationComplete
}) => {
  const pdfRef = useRef(null);
  const [quotationNumber, setQuotationNumber] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const currency = 'USD';
  const currencySymbol = currency === 'USD' ? '$' : 'S/';
  const currencyLabel = currency === 'USD' ? 'Dólares Americanos (USD)' : 'Soles (PEN)';

  // ✅ Obtener siguiente correlativo al cargar
  useEffect(() => {
    const fetchNextCorrelative = async () => {
      try {
        const response = await quotationService.getNextCorrelative();
        if (response.success) {
          setQuotationNumber(response.data.correlative);
        }
      } catch (error) {
        console.error('Error al obtener correlativo:', error);
        const year = new Date().getFullYear();
        setQuotationNumber(`COT-${year}-TEMP`);
      }
    };
    fetchNextCorrelative();
  }, []);

  // ✅ Normaliza un item: convierte strings a números y recalcula precioNeto
  const normalizeItem = (item) => {
    const precioLista = Number(item.precioLista) || 0;
    const discount1   = Math.max(0, Math.min(100, Number(item.discount1) || 0));
    const discount5   = Math.max(0, Math.min(100, Number(item.discount5) || 0));
    const quantity    = Math.max(1, Number(item.quantity) || 1);
    const precioNeto  = calcPrecioNeto(precioLista, discount1, discount5);

    return { ...item, precioLista, discount1, discount5, quantity, precioNeto };
  };

  // ✅ Normalizar items al llegar por primera vez
  useEffect(() => {
    if (quotationItems && quotationItems.length > 0) {
      const normalized = quotationItems.map(normalizeItem);
      const hasChanges = normalized.some((n, i) => {
        const o = quotationItems[i];
        return n.precioNeto !== o.precioNeto || n.discount1 !== o.discount1 || n.discount5 !== o.discount5;
      });
      if (hasChanges) {
        setQuotationItems(normalized);
      }
    }
  }, [quotationItems.length]);

  // ✅ Actualiza un campo raw (string) sin normalizar — para onChange
  const setItemField = (idx, field, rawValue) => {
    setQuotationItems(items =>
      items.map((item, i) => i === idx ? { ...item, [field]: rawValue } : item)
    );
  };

  // ✅ Normaliza el item completo en onBlur
  const normalizeItemAtIndex = (idx) => {
    setQuotationItems(items =>
      items.map((item, i) => i === idx ? normalizeItem(item) : item)
    );
  };

  const removeItem = idx => {
    setQuotationItems(items => items.filter((_, i) => i !== idx));
    toast.error('Producto eliminado de la cotización', { position: 'top-right' });
  };

  // ✅ Registrar cotización
  const handleRegister = async () => {
    if (quotationItems.length === 0) {
      toast.error('No hay productos en la cotización', { position: 'top-right' });
      return;
    }
    if (!selectedClient || !selectedClient.ruc) {
      toast.error('Debe seleccionar un cliente válido', { position: 'top-right' });
      return;
    }

    setIsRegistering(true);

    try {
      // Normalizar todos los items antes de enviar
      const itemsNormalized = quotationItems.map(normalizeItem);

      const payload = quotationService.prepareQuotationPayload(
        itemsNormalized,
        selectedClient,
        currency,
        subtotal,
        igv,
        total,
        quotationNumber
      );

      console.log('📤 Enviando cotización:', payload);

      const response = await quotationService.registerQuotation(
        payload.cabecera,
        payload.detalles
      );

      if (response.success) {
        toast.success(`Cotización ${response.data.correlativo_cotiza} registrada exitosamente`, {
          position: 'top-right',
          duration: 4000
        });

        if (pdfRef.current) {
          await generateQuotationPDF(
            pdfRef.current,
            `cotizacion_${response.data.correlativo_cotiza}.pdf`
          );
        }

        const nextResponse = await quotationService.getNextCorrelative();
        if (nextResponse.success) {
          setQuotationNumber(nextResponse.data.correlative);
        }

        setQuotationItems([]);

        if (onRegistrationComplete) {
          onRegistrationComplete();
        }
      }
    } catch (error) {
      console.error('❌ Error al registrar cotización:', error);

      if (error.response?.data?.details) {
        const errores = Array.isArray(error.response.data.details)
          ? error.response.data.details
          : [error.response.data.details];
        errores.forEach(err => {
          toast.error(err, { position: 'top-right', duration: 5000 });
        });
      } else {
        toast.error(error.response?.data?.error || 'Error al registrar la cotización', {
          position: 'top-right'
        });
      }
    } finally {
      setIsRegistering(false);
    }
  };

  // ✅ Totales calculados en vivo usando calcPrecioNeto (igual que ProductsTab)
  const subtotal = (quotationItems ?? []).reduce((sum, item) => {
    const precioNeto = calcPrecioNeto(item.precioLista, item.discount1, item.discount5);
    const qty        = Number(item.quantity) || 0;
    return sum + precioNeto * qty;
  }, 0);

  const igv   = subtotal * IGV_RATE;
  const total = subtotal + igv;

  const handlePreviewPDF = async () => {
    if (!pdfRef.current) return;
    await previewQuotationPDF(pdfRef.current);
    toast.success('Vista previa PDF generada', { position: 'top-right' });
  };

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    await generateQuotationPDF(pdfRef.current, `cotizacion_${quotationNumber}.pdf`);
    toast.success('PDF descargado', { position: 'top-right' });
  };

  return (
    <div className="space-y-8">
      {/* PDFPreview oculto */}
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

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-800">
          Cotización
        </h2>
        {quotationNumber && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg px-4 py-2">
            <span className="text-sm font-semibold text-gray-600">Nro. Cotización:</span>
            <span className="ml-2 text-lg font-bold text-blue-700">{quotationNumber}</span>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-auto rounded-xl shadow-lg bg-white border">
        <table className="min-w-full divide-y divide-gray-200 text-sm" style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th style={{ width: 56 }}  className="p-4 font-bold text-gray-700 text-center">Item</th>
              <th style={{ width: 120 }} className="p-4 font-bold text-gray-700 text-center">Código Mercadería</th>
              <th style={{ width: 210 }} className="p-4 font-bold text-gray-700 text-center">Descripción Mercadería</th>
              <th style={{ width: 130 }} className="p-4 font-bold text-gray-700 text-center">P. Lista Unit. (Sin IGV) ({currencySymbol})</th>
              <th style={{ width: 130 }} className="p-4 font-bold text-gray-700 text-center">1er Dsco.</th>
              <th style={{ width: 130 }} className="p-4 font-bold text-gray-700 text-center">5to Dsco.</th>
              <th style={{ width: 140 }} className="p-4 font-bold text-gray-700 text-center">P. Neto Unit.  ({currencySymbol})</th>
              <th style={{ width: 70 }}  className="p-4 font-bold text-gray-700 text-center">Cant.</th>
              <th style={{ width: 130 }} className="p-4 font-bold text-gray-700 text-center">P. Neto Total ({currencySymbol})</th>
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
                // ✅ Cálculo en vivo — idéntico a ProductsTab
                const precioNeto      = calcPrecioNeto(item.precioLista, item.discount1, item.discount5);
                const qty             = Number(item.quantity) || 1;
                const precioNetoTotal = precioNeto * qty;
                const igvTotal        = precioNetoTotal * IGV_RATE;
                const importeTotal    = precioNetoTotal + igvTotal;

                return (
                  <tr key={idx} className="hover:bg-gray-50 transition">

                    {/* Item */}
                    <td style={{ width: 56 }} className="p-4 text-center font-mono font-bold text-blue-800 bg-blue-50 rounded-l-lg">
                      {String(idx + 1).padStart(3, '0')}
                    </td>

                    {/* Código */}
                    <td style={{ width: 120 }} className="p-4 text-center font-semibold">
                      {item.codigo}
                    </td>

                    {/* Descripción */}
                    <td style={{ width: 210 }} className="p-4 text-left">
                      {item.nombre}
                    </td>

                    {/* P. Lista — ✅ toFixed(3) */}
                    <td style={{ width: 130 }} className="p-4 text-right text-gray-700">
                      {currencySymbol} {(item.precioLista || 0).toFixed(3)}
                    </td>

                    {/* 1er Dsco — readonly */}
                    <td style={{ width: 130 }} className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="text"
                          value={item.discount1 ?? 0}
                          readOnly
                          className="w-16 bg-indigo-50 border border-indigo-200 rounded px-2 py-1 text-center font-semibold text-indigo-700"
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    </td>

                    {/* 5to Dsco — editable, máx 100, raw string en onChange */}
                    <td style={{ width: 130 }} className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={item.discount5 ?? ''}
                          onChange={e => {
                            const raw    = e.target.value.replace(/\D/g, '');
                            const capped = raw === '' ? '' : Number(raw) > 100 ? '100' : raw;
                            setItemField(idx, 'discount5', capped);
                          }}
                          onBlur={() => normalizeItemAtIndex(idx)}
                          className="w-16 bg-orange-50 border border-orange-200 rounded px-2 py-1 text-center font-semibold text-orange-700 focus:ring-1 focus:ring-orange-400 outline-none"
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    </td>

                    {/* P. Neto Unit — ✅ calculado en vivo, toFixed(3) */}
                    <td style={{ width: 140 }} className="p-4 text-right font-bold text-green-700">
                      {currencySymbol} {precioNeto.toFixed(3)}
                    </td>

                    {/* Cantidad — editable, raw string en onChange */}
                    <td style={{ width: 70 }} className="p-4 text-center">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={item.quantity ?? ''}
                        onChange={e => {
                          const raw = e.target.value.replace(/\D/g, '');
                          setItemField(idx, 'quantity', raw);
                        }}
                        onBlur={() => normalizeItemAtIndex(idx)}
                        className="w-16 bg-blue-50 border border-blue-200 rounded px-2 py-1 text-center font-bold focus:ring-1 focus:ring-blue-400 outline-none"
                      />
                    </td>

                    {/* P. Neto Total — ✅ calculado en vivo, toFixed(3) */}
                    <td style={{ width: 130 }} className="p-4 text-right text-blue-900 font-bold">
                      {currencySymbol} {precioNetoTotal.toFixed(3)}
                    </td>

                    {/* IGV — ✅ toFixed(3) */}
                    <td style={{ width: 100 }} className="p-4 text-right text-yellow-700">
                      {currencySymbol} {igvTotal.toFixed(3)}
                    </td>

                    {/* Importe Total — ✅ toFixed(3) */}
                    <td style={{ width: 120 }} className="p-4 text-right text-red-800 font-bold">
                      {currencySymbol} {importeTotal.toFixed(3)}
                    </td>

                    {/* Eliminar */}
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
            <span className="font-bold text-blue-800">{currencySymbol} {subtotal.toFixed(3)}</span>
          </div>
          <div className="bg-gray-50 rounded px-4 py-2 shadow text-sm flex items-center justify-between">
            <span className="font-bold text-gray-700">IGV (18%):</span>
            <span className="font-bold text-yellow-700">{currencySymbol} {igv.toFixed(3)}</span>
          </div>
          <div className="bg-gray-100 rounded px-4 py-2 shadow-lg border border-blue-200 text-sm flex items-center justify-between">
            <span className="font-bold text-gray-900">Total:</span>
            <span className="font-extrabold text-blue-900">{currencySymbol} {total.toFixed(3)}</span>
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
            disabled={quotationItems.length === 0 || isRegistering || !quotationNumber}
            className={`bg-green-600 text-white font-bold px-4 py-2 rounded-lg shadow hover:scale-105 transition text-sm flex items-center gap-2
              ${quotationItems.length === 0 || isRegistering || !quotationNumber ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {isRegistering ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registrando...
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
