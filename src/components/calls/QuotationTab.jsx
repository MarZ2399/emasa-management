import React from 'react';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const IGV_RATE = 0.18;

const QuotationTab = ({ quotationItems, setQuotationItems, onBackToProducts }) => {
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
    toast.success('Cotización registrada con éxito', { position: 'top-right' });
    setQuotationItems([]); // Limpia la cotización
  };

  const subtotal = (quotationItems ?? []).reduce((sum, p) => sum + p.precioNeto * p.quantity, 0);
  const igv = subtotal * IGV_RATE;
  const total = subtotal + igv;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-extrabold tracking-tight text-gray-800 mb-6">
        Cotización
      </h2>
      <div className="overflow-auto rounded-xl shadow-lg bg-white border">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="p-4 font-bold text-gray-700 text-center">Item</th>
              <th className="p-4 font-bold text-gray-700 text-center">Código</th>
              <th className="p-4 font-bold text-gray-700 text-center">Descripción</th>
              <th className="p-4 font-bold text-gray-700 text-center">Lista</th>
              <th className="p-4 font-bold text-gray-700 text-center">1er Dscto</th>
              <th className="p-4 font-bold text-gray-700 text-center">5to Dscto</th>
              <th className="p-4 font-bold text-gray-700 text-center">Neto</th>
              <th className="p-4 font-bold text-gray-700 text-center">Cant.</th>
              <th className="p-4 font-bold text-gray-700 text-center">Neto Total</th>
              <th className="p-4 font-bold text-gray-700 text-center">IGV</th>
              <th className="p-4 font-bold text-gray-700 text-center">Importe</th>
              <th></th>
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
                    <td className="p-4 text-center font-mono font-bold text-blue-800 bg-blue-50 rounded-l-lg">{String(idx+1).padStart(3, '0')}</td>
                    <td className="p-4 text-center font-semibold">{item.codigo}</td>
                    <td className="p-4 text-left">{item.nombre}</td>
                    <td className="p-4 text-right text-gray-700">
                      S/ {item.precioLista?.toFixed(2)}
                    </td>
                    {/* 1er descuento editable */}
                    <td className="p-4 text-right">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={item.discount1}
                        onChange={e => handleEdit(idx, 'discount1', e.target.value)}
                        className="w-16 bg-indigo-50 border border-indigo-200 rounded px-2 py-1 text-center font-semibold text-indigo-700"
                      />%
                    </td>
                    {/* 5to descuento editable */}
                    <td className="p-4 text-right">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={item.discount5 || 0}
                        onChange={e => handleEdit(idx, 'discount5', e.target.value)}
                        className="w-16 bg-orange-50 border border-orange-200 rounded px-2 py-1 text-center font-semibold text-orange-700"
                      />%
                    </td>
                    {/* precio neto */}
                    <td className="p-4 text-right font-bold text-green-700">S/ {item.precioNeto?.toFixed(2)}</td>
                    {/* cantidad editable */}
                    <td className="p-4 text-center">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={e => handleEdit(idx, 'quantity', e.target.value)}
                        className="w-16 bg-blue-50 border border-blue-200 rounded px-2 py-1 text-center font-bold"
                      />
                    </td>
                    <td className="p-4 text-right text-blue-900 font-bold">S/ {precioNetoTotal.toFixed(2)}</td>
                    <td className="p-4 text-right text-yellow-700">S/ {igvTotal.toFixed(2)}</td>
                    <td className="p-4 text-right text-red-800 font-bold">S/ {importeTotal.toFixed(2)}</td>
                    <td className="p-4 text-center">
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

{/* Botones extremos: flex-col en móvil, flex-row con justify-between en desktop */}
<div className="w-full flex flex-col md:flex-row justify-between items-center mt-6 gap-3">
  <button
    onClick={onBackToProducts}
    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold px-4 py-2 rounded-lg shadow hover:scale-105 transition text-sm w-full md:w-auto"
  >
    Seguir agregando productos
  </button>
  <button
    onClick={handleRegister}
    disabled={quotationItems.length === 0}
    className={`bg-green-600 text-white font-bold px-4 py-2 rounded-lg shadow hover:scale-105 transition text-sm w-full md:w-auto
    ${quotationItems.length === 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
  >
    Registrar Cotización
  </button>
  
</div>

    </div>
  );
};

export default QuotationTab;
