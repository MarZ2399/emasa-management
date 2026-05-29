import React, { useMemo } from 'react';
import { companyData } from '../../data/companyData';

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

const PDFPreview = React.forwardRef(
  (
    {
      selectedClient,
      quotationItems,
      subtotal,
      igv,
      total,
      quotationNumber,
      currency = 'USD',
      isVisible = false
    },
    ref
  ) => {
    const currencySymbol = currency === 'USD' ? '$' : 'S/';
    const currencyName = currency === 'USD' ? 'Dólares (USD)' : 'Soles (S/)';
    const currencyLabel = currency === 'USD' ? 'Dólares' : 'Soles';

    const normalizedData = useMemo(() => {
      const items = (Array.isArray(quotationItems) ? quotationItems : []).map((item) => {
        const quantity = Number(item.quantity ?? item.cantidad ?? item.qaprbd ?? 0) || 0;

        const precioLista = Number(
          item.precioLista ??
          item.plistadol ??
          item.preciosDetalle?.importes?.ldol ??
          item.preciosDetalle?.importes?.dola ??
          item.dola ??
          0
        );

        const discount1 = Number(
          item.discount1 ??
          item.descuentos?.[0] ??
          0
        ) || 0;

        const discount5 = Number(
          item.discount5 ??
          item.descuentos?.[4] ??
          0
        ) || 0;

        const descripcion = item.descripcion || item.nombre || item.codigo || '-';
        const codigo = item.codigo || '-';

        const calc = calcPrecioVisual(precioLista, discount1, discount5, quantity);

        return {
          ...item,
          codigo,
          descripcion,
          quantity,
          cantidad: quantity,
          precioLista,
          discount1,
          discount5,
          precioNeto: calc.precioNeto,
          netoTotal: calc.precioNetoTotal,
          igvItem: calc.igv,
          totalItem: calc.importeTotal,
        };
      });

      const subtotalVisual = roundTo(
        items.reduce((acc, item) => acc + Number(item.netoTotal || 0), 0),
        2
      );

      const igvVisual = roundTo(subtotalVisual * IGV_RATE, 2);
      const totalVisual = roundTo(subtotalVisual + igvVisual, 2);

      return {
        items,
        subtotal: subtotalVisual,
        igv: igvVisual,
        total: totalVisual,
      };
    }, [quotationItems]);

    if (!selectedClient) {
      return (
        <div
          ref={ref}
          className={`${
            isVisible ? 'relative' : 'absolute left-[-9999px] top-0 z-[-1]'
          } w-[1100px] bg-white p-12 text-[22px] text-center text-gray-400`}
        >
          Sin datos para generar PDF
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`${
          isVisible ? 'relative' : 'absolute left-[-9999px] top-0 z-[-1]'
        } w-[1100px] bg-white p-8 font-sans`}
        id="pdf-preview"
      >
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

        <hr className="border-t-2 border-black my-2" />

        <div className="border-2 border-black rounded p-4 mt-1 mb-4 text-[16px] grid grid-cols-2">
          <div className="space-y-1">
            <div>
              <span className="font-bold">Fecha:</span>{' '}
              <span>{new Date().toLocaleDateString('es-PE')}</span>
            </div>
            <div>
              <span className="font-bold">R.U.C. :</span>{' '}
              <span>{selectedClient?.ruc || 'No Figura en la Base'}</span>
            </div>
            <div>
              <span className="font-bold">Razón Social:</span>{' '}
              <span>{selectedClient?.nombreCliente || 'No Figura en la Base'}</span>
            </div>
            <div>
              <span className="font-bold">Dirección Fiscal:</span>{' '}
              <span>{selectedClient?.direccion || 'No Figura en la Base'}</span>
            </div>
            <div>
              <span className="font-bold">Orden de Compra:</span> <span>No</span>
            </div>
          </div>

          <div className="space-y-1">
            <div>
              <span className="font-bold">Vendedor:</span>{' '}
              <span>{selectedClient?.vendedor || ''}</span>
            </div>
            <div>
              <span className="font-bold">Moneda:</span>{' '}
              <span>{currencyName}</span>
            </div>
            <div>
              <span className="font-bold">Forma de Pago:</span>{' '}
              <span>Contado - Pago x Adelantado</span>
            </div>
            <div>
              <span className="font-bold">Categoría:</span>{' '}
              <span>{selectedClient?.categoria || ''}</span>
            </div>
          </div>
        </div>

        <table className="w-full border border-gray-300 text-[13px] mb-6">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Item</th>
              <th className="border border-gray-300 p-2">Código</th>
              <th className="border border-gray-300 p-2">Descripción</th>
              <th className="border border-gray-300 p-2">Precio Lista ({currencySymbol})</th>
              <th className="border border-gray-300 p-2">1er Dscto (%)</th>
              <th className="border border-gray-300 p-2">5to Dscto (%)</th>
              <th className="border border-gray-300 p-2">Precio Neto ({currencySymbol})</th>
              <th className="border border-gray-300 p-2">Cant.</th>
              <th className="border border-gray-300 p-2">Neto Total ({currencySymbol})</th>
              <th className="border border-gray-300 p-2">IGV ({currencySymbol})</th>
              <th className="border border-gray-300 p-2">Importe ({currencySymbol})</th>
            </tr>
          </thead>

          <tbody>
            {normalizedData.items.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-300">
                <td className="border border-gray-300 p-2 text-center">
                  {String(idx + 1).padStart(3, '0')}
                </td>
                <td className="border border-gray-300 p-2">{item.codigo}</td>
                <td className="border border-gray-300 p-2">{item.descripcion}</td>
                <td className="border border-gray-300 p-2 text-right">
                  {item.precioLista.toFixed(3)}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {item.discount1.toFixed(2)}%
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {item.discount5.toFixed(2)}%
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  {item.precioNeto.toFixed(4)}
                </td>
                <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
                <td className="border border-gray-300 p-2 text-right">
                  {item.netoTotal.toFixed(2)}
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  {item.igvItem.toFixed(2)}
                </td>
                <td className="border border-gray-300 p-2 text-right font-bold">
                  {item.totalItem.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-2">
          <div className="w-64 space-y-1">
            <div className="flex justify-between text-[13px]">
              <span className="font-bold">Subtotal:</span>
              <span>{normalizedData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="font-bold">IGV (18%):</span>
              <span>{normalizedData.igv.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-gray-400 pt-2">
              <span>Total:</span>
              <span>{currencySymbol} {normalizedData.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-gray-500 border-t pt-4 mt-5">
          Vigencia de cotización 24 horas - Valores expresados en {currencyLabel}
        </div>
      </div>
    );
  }
);

PDFPreview.displayName = 'PDFPreview';

export default PDFPreview;