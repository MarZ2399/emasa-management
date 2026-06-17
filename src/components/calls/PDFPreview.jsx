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
  quotation,
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

const formatStoredDate = (value) => {
  if (!value) return '';

  const raw = String(value).trim();

  // Entero AS400: 20260617 → 17/06/2026
  if (/^\d{8}$/.test(raw)) {
    const year = raw.slice(0, 4);
    const month = raw.slice(4, 6);
    const day = raw.slice(6, 8);
    return `${day}/${month}/${year}`;  // ← cambia - por /
  }

  // ISO con T: "2026-06-17T05:00:00.000Z" → 17/06/2026
  if (raw.includes('-') && raw.includes(':')) {
    const datePart = raw.split(' ')[0].split('T')[0];
    const [year, month, day] = datePart.split('-');
    if (year && month && day) return `${day}/${month}/${year}`;  // ← cambia - por /
  }

  // ISO sin T: "2026-06-17" → 17/06/2026
  if (raw.includes('-')) {
    const [year, month, day] = raw.split('-');
    if (year && month && day) return `${day}/${month}/${year}`;  // ← agrega este caso
  }

  return raw;
};

const FORMAS_PAGO = {
  ADE: 'Adelantos pagos - Contado',
  AD2: 'Adelanto por dscto. 0.02',
  CEF: 'Contado - Marketplace',
  CON: 'Contado',
  F03: 'Factura 3 días',
  F07: 'Factura 7 días',
  F15: 'Factura 15 días',
  F30: 'Factura 30 días',
  F45: 'Factura 45 días',
  F60: 'Factura 60 días',
  F75: 'Factura 75 días',
  F90: 'Factura 90 días',
  F92: 'Factura 120 días',
  PLA: 'Descuento planilla al personal',
  TRA: 'Traslado entre almacenes',
  TTG: 'Transf. a título gratuito',
  210: 'Factura 210 días',
};

const resolveFormaPago = (value) => {
  const fp = String(value || '').trim().toUpperCase();

  if (!fp) return 'Adelantos pagos - Contado';

  return FORMAS_PAGO[fp] || value || 'Adelantos pagos - Contado';
};

const quotationDate =
  quotation?.fechac ||          // caso cotizaciones (viene del backend)
  quotation?.fecha_registro ||
  quotation?.fecha ||
  quotation?.createdAt ||
  '';

const fechaFinal = formatStoredDate(quotationDate) || new Date().toLocaleDateString('es-PE');

const vendedorTexto = (
  // Caso cotizaciones: viene en el spread de cabecera
  quotation?.usuario_registro_nombre?.trim() ||
  quotation?.vendedor?.trim() ||
  quotation?.vend?.trim() ||
  // Caso ventas: viene en selectedClient
  selectedClient?.vendedor?.trim() ||
  'No Figura en la Base'
);

const formaPagoTexto = resolveFormaPago(
  quotation?.forpag ||
  quotation?.formaPago ||
  selectedClient?.fpago ||       // ← caso ventas
  selectedClient?.formaPago
);

const clientRuc =
  selectedClient?.ruc ||
  quotation?.ruc ||
  quotation?.rucc ||
  quotation?.clienteRuc ||
  'No Figura en la Base';

const clientName =
  selectedClient?.nombreCliente ||
  quotation?.nomc ||
  quotation?.nombreCliente ||
  quotation?.razonSocial ||
  'No Figura en la Base';

const clientAddress =
  selectedClient?.direccion ||
  quotation?.dirc ||
  quotation?.direccion ||
  quotation?.direccionFiscal ||
  'No Figura en la Base';

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
              <span>{fechaFinal}</span>
            </div>
            <div>
              <span className="font-bold">R.U.C. :</span>{' '}
              <span>{clientRuc}</span>
            </div>
            <div>
              <span className="font-bold">Razón Social:</span>{' '}
              <span>{clientName}</span>
            </div>
            <div>
              <span className="font-bold">Dirección Fiscal:</span>{' '}
              <span>{clientAddress}</span>
            </div>
            <div>
              <span className="font-bold">Orden de Compra:</span> <span>No</span>
            </div>
          </div>

          <div className="space-y-1">
            <div>
              <span className="font-bold">Vendedor:</span>{' '}
              <span>{vendedorTexto || 'No Figura en la Base'}</span>
            </div>
            <div>
              <span className="font-bold">Moneda:</span>{' '}
              <span>{currencyName}</span>
            </div>
            <div>
              <span className="font-bold">Forma de Pago:</span>{' '}
              <span>{formaPagoTexto}</span>
            </div>
            {/* <div>
              <span className="font-bold">Categoría:</span>{' '}
              <span>{selectedClient?.categoria || ''}</span>
            </div> */}
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
                  {item.discount5.toFixed(3)}%
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