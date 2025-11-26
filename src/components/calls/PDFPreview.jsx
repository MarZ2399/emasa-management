import React from 'react';


const PDFPreview = React.forwardRef(({ 
  selectedClient, 
  quotationItems, 
  subtotal, 
  igv, 
  total 
}, ref) => {
  const IGV_RATE = 0.18;

  if (!selectedClient) {
  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left: '-9999px',
        top: 0,
        width: '1100px',
        background: 'white',
        zIndex: -1,
        padding: '48px',
        color: '#888',
        fontSize: '22px',
        textAlign: 'center'
      }}
    >
      Sin datos para generar PDF
    </div>
  );
}

  return (
    <div 
      ref={ref}
    style={{
      position: 'absolute',
      left: '-9999px',
      top: 0,
      width: '1100px',
      background: 'white',
      zIndex: -1,
      padding: '32px',
      fontFamily: 'Arial, sans-serif'
    }}
    id="pdf-preview"
    >
      {/* Encabezado */}
      <div className="text-center mb-6 border-b-2 pb-4">
        <h1 className="text-2xl font-bold">AUTOREX PERUANA S.A.</h1>
        <p className="text-sm text-gray-600">Cotización de Venta</p>
      </div>

      {/* Datos del Cliente */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <p><strong>Fecha:</strong> {new Date().toLocaleDateString('es-PE')}</p>
          <p><strong>R.U.C.:</strong> {selectedClient.ruc}</p>
          <p><strong>Razón Social:</strong> {selectedClient.nombreCliente}</p>
          <p><strong>Dirección:</strong> {selectedClient.direccion}</p>
        </div>
        <div>
          <p><strong>Vendedor:</strong> {selectedClient.vendedor}</p>
          <p><strong>Moneda:</strong> Dólares Americanos (USD)</p>
          <p><strong>Forma de Pago:</strong> Contacto - Pago x Adelantado</p>
          <p><strong>Categoría:</strong> {selectedClient.categoria}</p>
        </div>
      </div>

      {/* Tabla de Productos */}
      <table className="w-full border-collapse border border-gray-300 mb-6 text-xs">
        <thead className="bg-gray-200">
          <tr>
            <th className="border border-gray-300 px-2 py-2">Item</th>
            <th className="border border-gray-300 px-2 py-2">Código</th>
            <th className="border border-gray-300 px-2 py-2">Descripción</th>
            <th className="border border-gray-300 px-2 py-2">Precio Lista ($)</th>
            <th className="border border-gray-300 px-2 py-2">Dscto. (%)</th>
            <th className="border border-gray-300 px-2 py-2">Precio Neto ($)</th>
            <th className="border border-gray-300 px-2 py-2">Cant.</th>
            <th className="border border-gray-300 px-2 py-2">Neto Total ($)</th>
            <th className="border border-gray-300 px-2 py-2">IGV ($)</th>
            <th className="border border-gray-300 px-2 py-2">Importe ($)</th>
          </tr>
        </thead>
        <tbody>
          {quotationItems.map((item, idx) => {
            const precioNetoTotal = item.precioNeto * item.quantity;
            const igvTotal = precioNetoTotal * IGV_RATE;
            const importeTotal = precioNetoTotal + igvTotal;
            return (
              <tr key={idx} className="border-b border-gray-300">
                <td className="border border-gray-300 px-2 py-2 text-center">{String(idx + 1).padStart(3, '0')}</td>
                <td className="border border-gray-300 px-2 py-2">{item.codigo}</td>
                <td className="border border-gray-300 px-2 py-2">{item.nombre}</td>
                <td className="border border-gray-300 px-2 py-2 text-right">S/ {item.precioLista?.toFixed(2)}</td>
                <td className="border border-gray-300 px-2 py-2 text-center">{item.discount1}%</td>
                <td className="border border-gray-300 px-2 py-2 text-right">S/ {item.precioNeto?.toFixed(2)}</td>
                <td className="border border-gray-300 px-2 py-2 text-center">{item.quantity}</td>
                <td className="border border-gray-300 px-2 py-2 text-right">S/ {precioNetoTotal.toFixed(2)}</td>
                <td className="border border-gray-300 px-2 py-2 text-right">S/ {igvTotal.toFixed(2)}</td>
                <td className="border border-gray-300 px-2 py-2 text-right font-bold">S/ {importeTotal.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totales */}
      <div className="flex justify-end mb-4">
        <div className="w-64">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold">Subtotal:</span>
            <span>S/ {subtotal?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold">IGV (18%):</span>
            <span>S/ {igv?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t-2 pt-2">
            <span>Total:</span>
            <span>S/ {total?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Pie de página */}
      <div className="text-xs text-gray-600 border-t pt-4 mt-6">
        <p>Vigencia de cotización 24 horas - Valores expresados en US$</p>
      </div>
    </div>
  );
});

PDFPreview.displayName = 'PDFPreview';

export default PDFPreview;
