import React from 'react';
import { companyData } from '../../data/companyData';

const PDFPreview = React.forwardRef(
  ({
    selectedClient,
    quotationItems,
    subtotal,
    igv,
    total,
    quotationNumber,
  }, ref) => {
    const IGV_RATE = 0.18;

    if (!selectedClient) {
      return (
        <div
          ref={ref}
          className="absolute left-[-9999px] top-0 w-[1100px] bg-white z-[-1] p-12 text-[22px] text-center text-gray-400"
        >
          Sin datos para generar PDF
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className="absolute left-[-9999px] top-0 w-[1100px] bg-white z-[-1] p-8 font-sans"
        id="pdf-preview"
      >
         {/* CABECERA */}
        <div className="flex justify-between items-start">
          <div>
            {companyData.logo && (
              <img
                src={companyData.logo}
                alt="Logo"
                className="h-12 mb-1 object-contain bg-transparent"
              />
            )}
            <div className="font-bold text-xl text-black mb-[2px]">
              {companyData.razonSocial}
            </div>
            <div className="text-[13px] text-black">
              {companyData.direccion}, {companyData.ciudad}
            </div>
            <div className="text-xs mt-1 text-black">
              Central: {companyData.telefonos.central} &nbsp;
              Ventas: {companyData.telefonos.ventas} &nbsp; 
              Créditos y Cobranzas: {companyData.telefonos.otros} &nbsp; 
              Fax: {companyData.fax}
            </div>
          </div>
          <div className="min-w-[250px] border-2 border-black rounded-xl px-4 py-2 bg-white flex flex-col items-center space-y-2">
  <div className="w-full flex justify-center items-center pt-1">
    <span className="font-bold text-lg text-black mr-2">R.U.C.</span>
    <span className="font-extrabold text-lg text-black">{companyData.ruc}</span>
  </div>
  <div className="w-full flex justify-center items-center">
    <span className="w-full text-center font-semibold text-[19px] text-black">
      Cotización de Venta
    </span>
  </div>
  <div className="w-full flex justify-center mt-0.5">
    <span className="font-extrabold text-2xl text-black">{quotationNumber}</span>
  </div>
</div>

        </div>

        {/* SEPARADOR */}
        <hr className="border-t-2 border-black my-2" />

        {/* BLOQUE DATOS CLIENTE CON BORDE */}
        <div className="border-2 border-black rounded p-4 mt-1 mb-4 text-[16px] grid grid-cols-2">
          {/* Izquierda */}
          <div className="space-y-1">
            <div>
              <span className="font-bold">Fecha:</span>{" "}
              <span>{new Date().toLocaleDateString("es-PE")}</span>
            </div>
            <div>
              <span className="font-bold">R.U.C. :</span>{" "}
              <span>{selectedClient?.ruc || "No Figura en la Base"}</span>
            </div>
            <div>
              <span className="font-bold">Razón Social:</span>{" "}
              <span>{selectedClient?.nombreCliente || "No Figura en la Base"}</span>
            </div>
            <div>
              <span className="font-bold">Dirección Fiscal:</span>{" "}
              <span>{selectedClient?.direccion || "No Figura en la Base"}</span>
            </div>
            <div>
              <span className="font-bold">Orden de Compra:</span> <span>No</span>
            </div>
          </div>
          {/* Derecha */}
          <div className="space-y-1">
            <div>
              <span className="font-bold">Vendedor:</span>{" "}
              <span>{selectedClient?.vendedor || ""}</span>
            </div>
            <div>
              <span className="font-bold">Moneda:</span>{" "}
              <span>Dólares Americanos (USD)</span>
            </div>
            <div>
              <span className="font-bold">Forma de Pago:</span>{" "}
              <span>Contado - Pago x Adelantado</span>
            </div>
            <div>
              <span className="font-bold">Categoría:</span>{" "}
              <span>{selectedClient?.categoria || ""}</span>
            </div>
          </div>
        </div>

        {/* TABLA DE PRODUCTOS */}
        <table className="w-full border border-gray-300 text-[13px] mb-6">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Item</th>
              <th className="border border-gray-300 p-2">Código</th>
              <th className="border border-gray-300 p-2">Descripción</th>
              <th className="border border-gray-300 p-2">Precio Lista (S/)</th>
              <th className="border border-gray-300 p-2">1er Dscto (%)</th>
              <th className="border border-gray-300 p-2">5to Dscto (%)</th>
              <th className="border border-gray-300 p-2">Precio Neto (S/)</th>
              <th className="border border-gray-300 p-2">Cant.</th>
              <th className="border border-gray-300 p-2">Neto Total (S/)</th>
              <th className="border border-gray-300 p-2">IGV (S/)</th>
              <th className="border border-gray-300 p-2">Importe (S/)</th>
            </tr>
          </thead>
          <tbody>
            {quotationItems.map((item, idx) => {
              const precioNetoTotal = item.precioNeto * item.quantity;
              const igvTotal = precioNetoTotal * IGV_RATE;
              const importeTotal = precioNetoTotal + igvTotal;
              return (
                <tr key={idx} className="border-b border-gray-300">
                  <td className="border border-gray-300 p-2 text-center">{String(idx + 1).padStart(3, "0")}</td>
                  <td className="border border-gray-300 p-2">{item.codigo}</td>
                  <td className="border border-gray-300 p-2">{item.nombre}</td>
                  <td className="border border-gray-300 p-2 text-right">S/ {item.precioLista?.toFixed(2)}</td>
                  <td className="border border-gray-300 p-2 text-center">{item.discount1}%</td>
                  <td className="border border-gray-300 p-2 text-center">{item.discount5 || 0}%</td>
                  <td className="border border-gray-300 p-2 text-right">S/ {item.precioNeto?.toFixed(2)}</td>
                  <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
                  <td className="border border-gray-300 p-2 text-right">S/ {precioNetoTotal.toFixed(2)}</td>
                  <td className="border border-gray-300 p-2 text-right">S/ {igvTotal.toFixed(2)}</td>
                  <td className="border border-gray-300 p-2 text-right font-bold">S/ {importeTotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* TOTALES */}
        <div className="flex justify-end mb-2">
          <div className="w-64 space-y-1">
            <div className="flex justify-between text-[13px]">
              <span className="font-bold">Subtotal:</span>
              <span>S/ {subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="font-bold">IGV (18%):</span>
              <span>S/ {igv?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-gray-400 pt-2">
              <span>Total:</span>
              <span>S/ {total?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* PIE */}
        <div className="text-[11px] text-gray-500 border-t pt-4 mt-5">
          Vigencia de cotización 24 horas - Valores expresados en S/
        </div>
      </div>
    );
  }
);

PDFPreview.displayName = 'PDFPreview';

export default PDFPreview;
