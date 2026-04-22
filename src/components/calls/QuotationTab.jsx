// src/components/calls/QuotationTab.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { previewQuotationPDF, generateQuotationPDF } from '../../utils/pdfGenerator';
import PDFPreview from './PDFPreview';
import quotationService from '../../services/quotationService';
import { logActivity, EVENTOS } from '../../services/activityLogService';


const IGV_RATE = 0.18;


const calcPrecioNeto = (dola, discount5) => {
  const base = Number(dola) || 0;
  const de05 = (Number(discount5) || 0) / 100;
  return base * (1 - de05);
};


const QuotationTab = ({
  quotationItems,
  setQuotationItems,
  onBackToProducts,
  selectedClient,
  onRegistrationComplete,
  almacenCotizacion   // ✅ nuevo prop — cod del almacén fijado desde ProductsTab
}) => {
  const pdfRef = useRef(null);

  const [quotationNumber, setQuotationNumber] = useState('');
  const [isRegistering, setIsRegistering]     = useState(false);

  const currency       = 'USD';
  const currencySymbol = currency === 'USD' ? '$' : 'S/';

  // ── Siguiente correlativo ───────────────────────────────────────────────
  useEffect(() => {
    const fetchNextCorrelative = async () => {
      try {
        const response = await quotationService.getNextCorrelative();
        if (response.success) setQuotationNumber(response.data.correlative);
      } catch (error) {
        console.error('Error al obtener correlativo:', error);
        setQuotationNumber(`COT-${new Date().getFullYear()}-TEMP`);
      }
    };
    fetchNextCorrelative();
  }, []);

  // ── Normalizar item ─────────────────────────────────────────────────────
  const normalizeItem = (item) => {
    const dola      = Number(item.preciosDetalle?.importes?.dola ?? item.dola ?? item.precioNeto ?? 0);
    const discount1 = Math.max(0, Math.min(100, Number(item.discount1) || 0));
    const discount5 = Math.max(0, Math.min(100, Number(item.discount5) || 0));
    const quantity  = Math.max(1, Number(item.quantity) || 1);
    const precioNeto = calcPrecioNeto(dola, discount5);
    return { ...item, dola, discount1, discount5, quantity, precioNeto };
  };

  useEffect(() => {
    if (quotationItems && quotationItems.length > 0) {
      const normalized = quotationItems.map(normalizeItem);
      const hasChanges = normalized.some((n, i) => {
        const o = quotationItems[i];
        return (
          n.precioNeto !== o.precioNeto ||
          n.discount1  !== o.discount1  ||
          n.discount5  !== o.discount5  ||
          n.dola       !== o.dola
        );
      });
      if (hasChanges) setQuotationItems(normalized);
    }
  }, [quotationItems.length]);

  // ── Helpers de edición ──────────────────────────────────────────────────
  const setItemField = (idx, field, rawValue) => {
    setQuotationItems(items =>
      items.map((item, i) => i === idx ? { ...item, [field]: rawValue } : item)
    );
  };

  const normalizeItemAtIndex = (idx) => {
    setQuotationItems(items =>
      items.map((item, i) => i === idx ? normalizeItem(item) : item)
    );
  };

  const removeItem = (idx) => {
    setQuotationItems(items => items.filter((_, i) => i !== idx));
    toast.error('Producto eliminado de la cotización', { position: 'top-right' });
  };

  // ── Totales en vivo ─────────────────────────────────────────────────────
  const subtotal = (quotationItems ?? []).reduce((sum, item) => {
    const dola = Number(item.preciosDetalle?.importes?.dola ?? item.dola ?? item.precioNeto ?? 0);
    return sum + calcPrecioNeto(dola, item.discount5) * (Number(item.quantity) || 1);
  }, 0);

  const igv   = subtotal * IGV_RATE;
  const total = subtotal + igv;

 // ── Registrar cotización ────────────────────────────────────────────────
const handleRegister = async () => {
  if (quotationItems.length === 0) {
    toast.error('No hay productos en la cotización', { position: 'top-right' });
    return;
  }
  if (!selectedClient?.ruc) {
    toast.error('Debe seleccionar un cliente válido', { position: 'top-right' });
    return;
  }

  setIsRegistering(true);

  try {
    const itemsNormalized = quotationItems.map(normalizeItem);

    // ✅ NUEVO — enriquecer cliente con datos del almacén
    const clienteConAlmacen = {
      ...selectedClient,
      cod_alm:    almacenCotizacion?.cod    || null,
      codnum_alm: almacenCotizacion?.codnum ?? null,
    };

    const payload = quotationService.prepareQuotationPayload(
      itemsNormalized,
      clienteConAlmacen,   // ✅ CAMBIO — antes era selectedClient
      currency,
      subtotal,
      igv,
      total,
      quotationNumber
      // ✅ CAMBIO — eliminado almacenCotizacion como 8vo param
    );

    console.log('📤 Enviando cotización:', payload);
    console.log('🏭 Almacén:', almacenCotizacion);

    const response = await quotationService.registerQuotation(
      payload.cabecera,
      payload.detalles
    );

    if (response.success) {
      logActivity(EVENTOS.COTIZACION_REGISTRADA, response.data.id_cotizac);

      toast.success(
        `Cotización ${response.data.correlativo_cotiza} registrada exitosamente`,
        { position: 'top-right', duration: 4000 }
      );

      if (pdfRef.current) {
        await generateQuotationPDF(
          pdfRef.current,
          `cotizacion_${response.data.correlativo_cotiza}.pdf`
        );
      }

      const nextResponse = await quotationService.getNextCorrelative();
      if (nextResponse.success) setQuotationNumber(nextResponse.data.correlative);

      setQuotationItems([]);
      if (onRegistrationComplete) onRegistrationComplete();
    }
  } catch (error) {
    console.error('❌ Error al registrar cotización:', error);
    if (error.response?.data?.details) {
      const errores = Array.isArray(error.response.data.details)
        ? error.response.data.details
        : [error.response.data.details];
      errores.forEach(err => toast.error(err, { position: 'top-right', duration: 5000 }));
    } else {
      toast.error(
        error.response?.data?.error || 'Error al registrar la cotización',
        { position: 'top-right' }
      );
    }
  } finally {
    setIsRegistering(false);
  }
};

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

  // ── Guard: sin cliente ──────────────────────────────────────────────────
  if (!selectedClient?.ruc) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Busca un cliente para comenzar</h3>
        <p className="text-gray-500 text-sm">Ingresa el RUC o Razón Social en el panel de búsqueda superior</p>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────
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

      {/* ✅ Header — muestra el almacén fijado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-800">
          Cotización
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          {/* Badge almacén */}
          {almacenCotizacion && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg px-4 py-2">
              <span className="text-sm font-semibold text-gray-600">Almacén:</span>
              <span className="ml-2 text-sm font-bold text-amber-700">{almacenCotizacion?.cod} — {almacenCotizacion?.nombre}</span>
            </div>
          )}
          {/* Badge número cotización */}
          {quotationNumber && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg px-4 py-2">
              <span className="text-sm font-semibold text-gray-600">Nro. Cotización:</span>
              <span className="ml-2 text-lg font-bold text-blue-700">{quotationNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-auto rounded-xl shadow-lg bg-white border">
        <table
          className="divide-y divide-gray-200 text-sm"
          style={{ tableLayout: 'fixed', width: '100%', minWidth: 1300 }}
        >
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th style={{ width: 56 }}  className="p-4 font-bold text-gray-700 text-center">Item</th>
              <th style={{ width: 180 }} className="p-4 font-bold text-gray-700 text-center">Código Mercadería</th>
              <th style={{ width: 210 }} className="p-4 font-bold text-gray-700 text-center">Descripción Mercadería</th>
              <th style={{ width: 130 }} className="p-4 font-bold text-gray-700 text-center">P. Lista Unit. (Sin IGV) ({currencySymbol})</th>
              <th style={{ width: 130 }} className="p-4 font-bold text-gray-700 text-center">1er Dsco.</th>
              <th style={{ width: 130 }} className="p-4 font-bold text-gray-700 text-center">5to Dsco.</th>
              <th style={{ width: 130 }} className="p-4 font-bold text-gray-700 text-center">P. Neto Unit. ({currencySymbol})</th>
              <th style={{ width: 70 }}  className="p-4 font-bold text-gray-700 text-center">Cant.</th>
              <th style={{ width: 130 }} className="p-4 font-bold text-gray-700 text-center">P. Neto Total ({currencySymbol})</th>
              <th style={{ width: 100 }} className="p-4 font-bold text-gray-700 text-center">IGV ({currencySymbol})</th>
              <th style={{ width: 130 }} className="p-4 font-bold text-gray-700 text-center">Importe Total ({currencySymbol})</th>
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
                const flag  = item.preciosDetalle?.flag?.trim();
                const flagT = flag === 'T';
                const flagX = flag === 'X';
                const minD5 = flagT ? (item.preciosDetalle?.descuentos?.de04 ?? 0)   : 0;
                const maxD5 = flagT ? (item.preciosDetalle?.descuentos?.de05 ?? 100) : 100;

                const dola            = Number(item.preciosDetalle?.importes?.dola ?? item.dola ?? item.precioNeto ?? 0);
                const precioNeto      = calcPrecioNeto(dola, item.discount5);
                const qty             = Number(item.quantity) || 1;
                const precioNetoTotal = precioNeto * qty;
                const igvTotal        = precioNetoTotal * IGV_RATE;
                const importeTotal    = precioNetoTotal + igvTotal;

                return (
                  <tr key={idx} className="hover:bg-gray-50 transition">

                    <td style={{ width: 56 }} className="p-4 text-center font-mono font-bold text-blue-900 bg-blue-50 rounded-l-lg">
                      {String(idx + 1).padStart(3, '0')}
                    </td>

                    <td style={{ width: 180 }} className="p-3 text-center font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                      {item.codigo}
                    </td>

                    <td style={{ width: 210 }} className="p-3 text-left leading-tight break-words">
                      {item.nombre}
                    </td>

                    <td style={{ width: 110 }} className="p-3 text-right text-gray-700 whitespace-nowrap">
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

                    {/* 5to Dsco */}
                    <td style={{ width: 130 }} className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={item.discount5 ?? ''}
                            disabled={flagX}
                            onChange={e => {
                              if (flagX) return;
                              const raw = e.target.value.replace(/\D/g, '');
                              if (raw === '') { setItemField(idx, 'discount5', ''); return; }
                              const num = Number(raw);
                              const capped = flagT ? (num > maxD5 ? String(maxD5) : raw) : (num > 100 ? '100' : raw);
                              setItemField(idx, 'discount5', capped);
                            }}
                            onBlur={() => {
                              if (flagX) return;
                              const current = item.discount5;
                              if (current === '' || current == null) return;
                              const num = Number(current) || 0;
                              const val = flagT ? Math.min(maxD5, Math.max(minD5, num)) : Math.min(100, Math.max(0, num));
                              setItemField(idx, 'discount5', val);
                              normalizeItemAtIndex(idx);
                            }}
                            className={`w-16 rounded px-2 py-1 text-center font-semibold focus:ring-1 outline-none border ${
                              flagX ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                                    : flagT ? 'bg-orange-50 border-orange-400 text-orange-700 focus:ring-orange-400'
                                    : 'bg-orange-50 border-orange-200 text-orange-700 focus:ring-orange-400'
                            }`}
                          />
                          <span className="text-sm text-gray-500">%</span>
                        </div>
                        {flagX && <span className="text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-300 rounded px-1.5 py-0.5">Sin dscto.</span>}
                        {flagT && <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 rounded px-1.5 py-0.5">{minD5}% – {maxD5}%</span>}
                      </div>
                    </td>

                    <td style={{ width: 120 }} className="p-3 text-right font-bold text-green-700 whitespace-nowrap">
                      {currencySymbol} {precioNeto.toFixed(3)}
                    </td>

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

                    <td style={{ width: 120 }} className="p-3 text-right text-blue-900 font-bold whitespace-nowrap">
                      {currencySymbol} {precioNetoTotal.toFixed(3)}
                    </td>

                    <td style={{ width: 90 }} className="p-3 text-right text-yellow-700 whitespace-nowrap">
                      {currencySymbol} {igvTotal.toFixed(3)}
                    </td>

                    <td style={{ width: 110 }} className="p-3 text-right text-red-800 font-bold whitespace-nowrap">
                      {currencySymbol} {importeTotal.toFixed(3)}
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
      <div className="w-full mt-6 flex flex-col gap-3">
        <div className="w-full">
          <button
            onClick={onBackToProducts}
            className="w-full md:w-auto bg-gradient-to-r bg-[#334a5e] to-blue-700 text-white font-bold px-5 py-2.5 rounded-lg shadow hover:scale-105 transition text-sm"
          >
            + Seguir agregando productos
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <button
            onClick={handlePreviewPDF}
            disabled={quotationItems.length === 0}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#334a5e] text-white font-bold px-4 py-2.5 rounded-lg shadow hover:scale-105 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previsualizar PDF
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={quotationItems.length === 0}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#334a5e] text-white font-bold px-4 py-2.5 rounded-lg shadow hover:scale-105 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Descargar PDF
          </button>

          <button
            onClick={handleRegister}
            disabled={quotationItems.length === 0 || isRegistering || !quotationNumber}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#334a5e] text-white font-bold px-4 py-2.5 rounded-lg shadow hover:scale-105 transition text-sm
              ${quotationItems.length === 0 || isRegistering || !quotationNumber ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {isRegistering ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
