import React, { useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { previewQuotationPDF, generateQuotationPDF } from '../../utils/pdfGenerator';
import PDFPreview from './PDFPreview';
import { getNextQuotationNumber, getCurrentQuotationNumber } from '../../data/quotationCounter';


const IGV_RATE = 0.18;

const QuotationTab = ({ quotationItems, setQuotationItems, onBackToProducts, selectedClient}) => {
  const pdfRef = useRef(null);
  const [quotationNumber, setQuotationNumber] = useState(getCurrentQuotationNumber());

  // Edita campo en un item y recalcula
  const handleEdit = (idx, field, value) => {
    setQuotationItems(items => items.map((item, i) =>
      i !== idx
        ? item
        : {
            ...item,
            [field]: field.includes('discount') ? Number(value) : Number(value),
            precioNeto:
              item.precioLista *
              ((100 - (field === 'discount1' ? Number(value) : item.discount1)) / 100) *
              ((100 - (field === 'discount5' ? Number(value) : item.discount5 || 0)) / 100)
          }
    ));
  };

  const removeItem = idx => {
    setQuotationItems(items => items.filter((_, i) => i !== idx));
    toast.error('Producto eliminado de la cotización', { position: 'top-right' });
  };

  const handleRegister = () => {
    // Incrementa el contador al registrar
    const nextNumber = getNextQuotationNumber();
    setQuotationNumber(nextNumber);
    
    toast.success('Cotización registrada con éxito', { position: 'top-right' });
    setQuotationItems([]); // Limpia la cotización
  };

  const subtotal = (quotationItems ?? []).reduce((sum, p) => sum + p.precioNeto * p.quantity, 0);
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
      />

      <h2 className="text-3xl font-extrabold tracking-tight text-gray-800 mb-6">
        Cotización
      </h2>

      
      <div className="overflow-auto rounded-xl shadow-lg bg-white border">
  <table className="min-w-full divide-y divide-gray-200 text-sm" style={{ tableLayout: "fixed", width: "100%" }}>
    <thead className="bg-gray-100 sticky top-0 z-10">
      <tr>
        <th style={{ width: 56 }} className="p-4 font-bold text-gray-700 text-center">Item</th>
        <th style={{ width: 120 }} className="p-4 font-bold text-gray-700 text-center">Código Mercadería</th>
        <th style={{ width: 210 }} className="p-4 font-bold text-gray-700 text-center">Descripción Mercadería</th>
        <th style={{ width: 130 }} className="p-4 font-bold text-gray-700 text-center">Precio Lista Unitario ($)</th>
        <th style={{ width: 130 }} className="p-4 font-bold text-gray-700 text-center">1er Dsco.</th>
        <th style={{ width: 130 }} className="p-4 font-bold text-gray-700 text-center">5to Dsco.</th>
        <th style={{ width: 140 }} className="p-4 font-bold text-gray-700 text-center">Precio Neto Unitario ($)</th>
        <th style={{ width: 70 }} className="p-4 font-bold text-gray-700 text-center">Cant.</th>
        <th style={{ width: 130 }} className="p-4 font-bold text-gray-700 text-center">Precio Neto Total ($)</th>
        <th style={{ width: 100 }} className="p-4 font-bold text-gray-700 text-center">IGV ($)</th>
        <th style={{ width: 120 }} className="p-4 font-bold text-gray-700 text-center">Importe Total ($)</th>
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
          const precioNetoTotal = item.precioNeto * item.quantity;
          const igvTotal = precioNetoTotal * IGV_RATE;
          const importeTotal = precioNetoTotal + igvTotal;
          return (
            <tr key={idx} className="hover:bg-gray-50 transition">
              <td style={{ width: 56 }} className="p-4 text-center font-mono font-bold text-blue-800 bg-blue-50 rounded-l-lg">{String(idx + 1).padStart(3, '0')}</td>
              <td style={{ width: 120 }} className="p-4 text-center font-semibold">{item.codigo}</td>
              <td style={{ width: 210 }} className="p-4 text-left">{item.nombre}</td>
              <td style={{ width: 130 }} className="p-4 text-right text-gray-700">S/ {item.precioLista?.toFixed(2)}</td>
              <td style={{ width: 90 }} className="p-4 text-right">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={item.discount1}
                  onChange={e => handleEdit(idx, 'discount1', e.target.value)}
                  className="w-16 bg-indigo-50 border border-indigo-200 rounded px-2 py-1 text-center font-semibold text-indigo-700"
                />%
              </td>
              <td style={{ width: 90 }} className="p-4 text-right">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={item.discount5 || 0}
                  onChange={e => handleEdit(idx, 'discount5', e.target.value)}
                  className="w-16 bg-orange-50 border border-orange-200 rounded px-2 py-1 text-center font-semibold text-orange-700"
                />%
              </td>
              <td style={{ width: 140 }} className="p-4 text-right font-bold text-green-700">S/ {item.precioNeto?.toFixed(2)}</td>
              <td style={{ width: 70 }} className="p-4 text-center">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={e => handleEdit(idx, 'quantity', e.target.value)}
                  className="w-16 bg-blue-50 border border-blue-200 rounded px-2 py-1 text-center font-bold"
                />
              </td>
              <td style={{ width: 130 }} className="p-4 text-right text-blue-900 font-bold">S/ {precioNetoTotal.toFixed(2)}</td>
              <td style={{ width: 100 }} className="p-4 text-right text-yellow-700">S/ {igvTotal.toFixed(2)}</td>
              <td style={{ width: 120 }} className="p-4 text-right text-red-800 font-bold">S/ {importeTotal.toFixed(2)}</td>
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
        }
        )
      )}
    </tbody>
  </table>
</div>

      {/* Resumen totales alineado a la derecha y compacto */}
      <div className="w-full flex justify-end mt-4">
        <div className="space-y-2 max-w-xs w-full mr-4">
          <div className="bg-gray-50 rounded px-4 py-2 shadow text-sm flex items-center justify-between">
            <span className="font-bold text-gray-700">Subtotal:</span>
            <span className="font-bold text-blue-800">S/ {subtotal.toFixed(2)}</span>
          </div>
          <div className="bg-gray-50 rounded px-4 py-2 shadow text-sm flex items-center justify-between">
            <span className="font-bold text-gray-700">IGV:</span>
            <span className="font-bold text-yellow-700">S/ {igv.toFixed(2)}</span>
          </div>
          <div className="bg-gray-100 rounded px-4 py-2 shadow-lg border border-blue-200 text-sm flex items-center justify-between">
            <span className="font-bold text-gray-900">Total:</span>
            <span className="font-extrabold text-blue-900">S/ {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Botones PDF y flujo */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center mt-6 gap-3">
        <button
          onClick={onBackToProducts}
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold px-4 py-2 rounded-lg shadow hover:scale-105 transition text-sm w-full md:w-auto"
        >
          Seguir agregando productos
        </button>

        <div className="flex gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handlePreviewPDF}
            disabled={quotationItems.length === 0}
            className="bg-orange-600 text-white font-bold px-4 py-2 rounded-lg shadow hover:scale-105 transition text-sm"
          >
            👁️ Previsualizar PDF
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={quotationItems.length === 0}
            className="bg-gray-600 text-white font-bold px-4 py-2 rounded-lg shadow hover:scale-105 transition text-sm"
          >
            📥 Descargar PDF
          </button>
          <button
            onClick={handleRegister}
            disabled={quotationItems.length === 0}
            className={`bg-green-600 text-white font-bold px-4 py-2 rounded-lg shadow hover:scale-105 transition text-sm
            ${quotationItems.length === 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            Registrar Cotización
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuotationTab;
