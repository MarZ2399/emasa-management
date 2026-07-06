import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { companyData } from '../data/companyData.js';

const IGV_RATE = 0.18;
const WARRANTY_URL = 'https://www.emasa.pe/pdf/Politica_de_GarantiaEquiposEMASA.pdf';

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

const formatStoredDate = (value) => {
  if (!value) return '';
  const raw = String(value).trim();
  if (/^\d{8}$/.test(raw)) {
    const year = raw.slice(0, 4);
    const month = raw.slice(4, 6);
    const day = raw.slice(6, 8);
    return `${day}/${month}/${year}`;
  }
  if (raw.includes('-') && raw.includes(':')) {
    const datePart = raw.split(' ')[0].split('T')[0];
    const [year, month, day] = datePart.split('-');
    if (year && month && day) return `${day}/${month}/${year}`;
  }
  if (raw.includes('-')) {
    const [year, month, day] = raw.split('-');
    if (year && month && day) return `${day}/${month}/${year}`;
  }
  return raw;
};

const resolveFormaPago = (value) => {
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
  const fp = String(value || '').trim().toUpperCase();
  if (!fp) return 'Adelantos pagos - Contado';
  return FORMAS_PAGO[fp] || value || 'Adelantos pagos - Contado';
};

const normalizeItems = (quotationItems = []) => {
  return (Array.isArray(quotationItems) ? quotationItems : []).map((item) => {
    const quantity = Number(item.quantity ?? item.cantidad ?? item.qaprbd ?? 0) || 0;
    const precioLista = Number(
      item.precioLista ?? item.plistadol ?? item.preciosDetalle?.importes?.ldol ?? item.preciosDetalle?.importes?.dola ?? item.dola ?? 0
    );
    const discount1 = Number(item.discount1 ?? item.descuentos?.[0] ?? item.pdsc1d ?? 0) || 0;
    const discount5 = Number(item.discount5 ?? item.descuentos?.[4] ?? item.pdsc5d ?? 0) || 0;
    const descripcion = item.descripcion || item.nombre || item.nom_prod || item.codigo || '-';
    const codigo = item.codigo || item.codigd || '-';

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
};

const splitText = (doc, text, maxWidth) => doc.splitTextToSize(String(text || ''), maxWidth);

// Función para obtener la imagen en Base64 de forma asíncrona una sola vez
const getLogoBase64 = async () => {
  if (!companyData?.logo) return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
    img.src = companyData.logo;
  });
};

const buildPdfDocument = async ({ quotation, selectedClient, quotationItems, quotationNumber, currency = 'USD' }) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  
  // 1. Precargar logo para usar en todas las páginas
  const logoBase64 = await getLogoBase64();

  // 2. Variables y dimensiones fijas
  const tableStartY = 75; 
  const footerTopY = 265;
  const footerPageY = 285;

  const currencySymbol = currency === 'USD' ? '$' : 'S/';
  const currencyName = currency === 'USD' ? 'Dólares (USD)' : 'Soles (S/)';
  const currencyLabel = currency === 'USD' ? 'Dólares' : 'Soles';

  const quotationDate = quotation?.fechac || quotation?.fecha_registro || quotation?.fecha || quotation?.createdAt || '';
  const fechaFinal = formatStoredDate(quotationDate) || new Date().toLocaleDateString('es-PE');
  
  const vendedorTexto = quotation?.usuario_registro_nombre?.trim() || quotation?.vendedor?.trim() || quotation?.vend?.trim() || selectedClient?.vendedor?.trim() || 'No Figura en la Base';
  const formaPagoTexto = resolveFormaPago(quotation?.forpag || quotation?.formaPago || selectedClient?.fpago || selectedClient?.formaPago);
  const clientRuc = selectedClient?.ruc || quotation?.ruc || quotation?.rucc || quotation?.clienteRuc || 'No Figura en la Base';
  const clientName = selectedClient?.nombreCliente || quotation?.nomc || quotation?.nombreCliente || quotation?.razonSocial || 'No Figura en la Base';
  const clientAddress = selectedClient?.direccion || quotation?.dirc || quotation?.direccion || quotation?.direccionFiscal || 'No Figura en la Base';

  const items = normalizeItems(quotationItems);
  const subtotal = roundTo(items.reduce((acc, item) => acc + Number(item.netoTotal || 0), 0), 2);
  const igv = roundTo(subtotal * IGV_RATE, 2);
  const total = roundTo(subtotal + igv, 2);

  // 3. Función del Header (se llamará en CADA página)
  const drawHeader = () => {
    doc.setTextColor(0, 0, 0);
    
    // Logo y datos empresa (Izquierda)
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 5, 10, 32, 8); // Logo más pequeño y ajustado
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(companyData?.razonSocial || 'AUTOREX PERUANA S.A.', 5, 24);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`${companyData?.direccion || ''}, ${companyData?.ciudad || ''}`, 5, 28);
    
    doc.setFontSize(7);
    doc.text(`Central: ${companyData?.telefonos?.central || ''}    Ventas: ${companyData?.telefonos?.ventas || ''}    Créditos y Cobranzas: ${companyData?.telefonos?.otros || ''}    Fax: ${companyData?.fax || ''}`, 5, 31.5);

    // Recuadro derecho (RUC y Cotización)
    const rightBoxX = 147;
    const rightBoxW = 58;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.4);
    doc.roundedRect(rightBoxX, 10, rightBoxW, 21.5, 2.5, 2.5); // Esquinas redondeadas y altura exacta

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(`R.U.C. ${companyData?.ruc || ''}`, rightBoxX + rightBoxW / 2, 16.5, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.text('Cotización de Venta', rightBoxX + rightBoxW / 2, 22.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12.5);
    doc.text(String(quotationNumber || ''), rightBoxX + rightBoxW / 2, 29, { align: 'center' });

    // Línea separadora negra gruesa (<hr> de HTML)
    doc.setLineWidth(0.6);
    doc.line(5, 34, 205, 34);

    // Recuadro de datos del Cliente
    // Recuadro de datos del Cliente (Aumentamos un poquito el alto a 35 para que entre si hay 2 líneas extra)
    doc.setLineWidth(0.3);
    doc.roundedRect(5, 37, 200, 35, 1.5, 1.5);

    // Posiciones X de las columnas
    doc.setFontSize(9);
    const col1X = 9;
    const val1X = 37;
    const col2X = 125;
    const val2X = 151;

    // Variables de espaciado Y dinámico
    let leftY = 43; // Coordenada Y inicial para la columna izquierda
    let rightY = 43; // Coordenada Y inicial para la columna derecha
    const rowGap = 5.5; // Espacio normal entre filas
    const lineHeight = 4; // Espacio extra que se suma por cada línea que se "salta" hacia abajo

    // --- COLUMNA IZQUIERDA (DINÁMICA) ---
    // 1. Fecha
    doc.setFont('helvetica', 'bold'); doc.text('Fecha:', col1X, leftY);
    doc.setFont('helvetica', 'normal'); doc.text(String(fechaFinal), val1X, leftY);
    leftY += rowGap;

    // 2. R.U.C.
    doc.setFont('helvetica', 'bold'); doc.text('R.U.C. :', col1X, leftY);
    doc.setFont('helvetica', 'normal'); doc.text(String(clientRuc), val1X, leftY);
    leftY += rowGap;

    // 3. Razón Social (Verificamos si hace salto de línea)
    const nameLines = splitText(doc, clientName, 75);
    doc.setFont('helvetica', 'bold'); doc.text('Razón Social:', col1X, leftY);
    doc.setFont('helvetica', 'normal'); doc.text(nameLines, val1X, leftY);
    // Fórmula: Si tiene 1 línea suma rowGap, si tiene 2 suma rowGap + lineHeight
    leftY += (nameLines.length - 1) * lineHeight + rowGap;

    // 4. Dirección Fiscal (Verificamos si hace salto de línea)
    const addressLines = splitText(doc, clientAddress, 75);
    doc.setFont('helvetica', 'bold'); doc.text('Dirección Fiscal:', col1X, leftY);
    doc.setFont('helvetica', 'normal'); doc.text(addressLines, val1X, leftY);
    leftY += (addressLines.length - 1) * lineHeight + rowGap;

    // 5. Orden de Compra (Se imprime basada en el espacio que dejaron las anteriores)
    doc.setFont('helvetica', 'bold'); doc.text('Orden de Compra:', col1X, leftY);
    doc.setFont('helvetica', 'normal'); doc.text('No', val1X, leftY);


    // --- COLUMNA DERECHA (FIJA) ---
    doc.setFont('helvetica', 'bold'); doc.text('Vendedor:', col2X, rightY);
    doc.setFont('helvetica', 'normal'); doc.text(splitText(doc, vendedorTexto, 52), val2X, rightY);
    rightY += rowGap;

    doc.setFont('helvetica', 'bold'); doc.text('Moneda:', col2X, rightY);
    doc.setFont('helvetica', 'normal'); doc.text(String(currencyName), val2X, rightY);
    rightY += rowGap;

    doc.setFont('helvetica', 'bold'); doc.text('Forma de Pago:', col2X, rightY);
    doc.setFont('helvetica', 'normal'); doc.text(splitText(doc, formaPagoTexto, 52), val2X, rightY);
  };

  const drawFixedFooter = (pageNumber, totalPages) => {
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.3);
    doc.line(5, footerTopY, 205, footerTopY);

    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);

    const legalLines = [
      'La validez de la presente cotización es de 05 días calendario y está sujeta a disponibilidad de stock.',
      'Precio incluye entrega técnica en Lima Metropolitana y Callao. Para provincia, el cliente asumirá los viáticos correspondientes.',
      'Garantía por 01 año contra defectos de fabricación, previo cumplimiento del plan de mantenimiento preventivo y/o correctivo.',
      'En caso de Garantía fuera de Lima, el cliente asumirá los viáticos por diagnóstico y reparación del equipo, esto último si la Garantía se declara procedente.',
      'En caso de Importación, el cliente deberá abonar el 100% del valor de venta y enviar la orden de compra vía correo electrónico.',
    ];

    let y = footerTopY + 5;
    legalLines.forEach((line) => {
      const wrapped = splitText(doc, line, 165);
      doc.text(wrapped, 5, y);
      y += wrapped.length * 3.5;
    });

    doc.setTextColor(0, 102, 204);
    doc.textWithLink('Política de Garantía: https://www.emasa.pe/pdf/Politica_de_GarantiaEquiposEMASA.pdf', 5, y + 0, { url: WARRANTY_URL });

    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(`Página ${pageNumber} de ${totalPages}`, 205, footerPageY, { align: 'right' });
  };

  const body = items.map((item, idx) => [
    String(idx + 1).padStart(3, '0'),
    item.codigo,
    item.descripcion,
    item.precioLista.toFixed(3),
    `${item.discount1.toFixed(2)}%`,
    `${item.discount5.toFixed(3)}%`,
    item.precioNeto.toFixed(4),
    String(item.quantity),
    item.netoTotal.toFixed(2),
    item.igvItem.toFixed(2),
    item.totalItem.toFixed(2),
  ]);

  // Construcción de la tabla usando medidas exactas proporcionales a 190mm de ancho total
  autoTable(doc, {
    startY: tableStartY,
    margin: { top: tableStartY, right: 6, bottom: 42, left: 6 },
    head: [[
      'Item',
      'Código',
      'Descripción',
      `Precio\nLista (${currencySymbol})`,
      '1er Dscto\n(%)',
      '5to Dscto\n(%)',
      `Precio\nNeto (${currencySymbol})`,
      'Cant.',
      `Neto\nTotal (${currencySymbol})`,
      `IGV\n(${currencySymbol})`,
      `Importe\n(${currencySymbol})`,
    ]],
    body,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7,
      cellPadding: 1.5,
      lineColor: [210, 210, 210], // Border gris claro
      lineWidth: 0.15,
      textColor: [0, 0, 0],
      valign: 'middle',
    },
    headStyles: {
      fillColor: [238, 238, 238], // Gris idéntico al HTML
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center', // Cabecera centrada
    },
    bodyStyles: {
      halign: 'left', // Cuerpo a la izquierda, igual que tu HTML
    },
    // Anchos matemáticamente sumados para dar 190
    columnStyles: {
      0: { cellWidth: 9 },
      1: { cellWidth: 32 },
      2: { cellWidth: 53 },
      3: { cellWidth: 13 },
      4: { cellWidth: 14 },
      5: { cellWidth: 14 },
      6: { cellWidth: 14 },
      7: { cellWidth: 10 },
      8: { cellWidth: 15 },
      9: { cellWidth: 11 },
      10: { cellWidth: 14 },
    },
    didDrawPage: () => {
      drawHeader();
    },
  });

  let finalY = doc.lastAutoTable?.finalY || tableStartY;
  
  if (finalY + 25 > footerTopY - 5) {
    doc.addPage();
    drawHeader();
    finalY = tableStartY;
  }

  // --- BLOQUE DE TOTALES ---
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  
  const totalsBoxX = 150;
  const totalsValueX = 203;

  doc.setFont('helvetica', 'bold');
  doc.text('Subtotal:', totalsBoxX, finalY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(subtotal.toFixed(2), totalsValueX, finalY + 8, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.text('IGV (18%):', totalsBoxX, finalY + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(igv.toFixed(2), totalsValueX, finalY + 14, { align: 'right' });

  doc.setDrawColor(156, 163, 175);
  doc.setLineWidth(0.3);
  doc.line(totalsBoxX, finalY + 18, totalsValueX, finalY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Total:', totalsBoxX, finalY + 24);
  doc.text(`${currencySymbol} ${total.toFixed(2)}`, totalsValueX, finalY + 24, { align: 'right' });

  // doc.setFont('helvetica', 'normal');
  // doc.setFontSize(8);
  // doc.setTextColor(107, 114, 128);
  // doc.text(`Vigencia de cotización 24 horas - Valores expresados en ${currencyLabel}`, 10, finalY + 24);

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i += 1) {
    doc.setPage(i);
    drawFixedFooter(i, totalPages);
  }

  return doc;
};

export const generateQuotationPDF = async (_element, filename = 'cotizacion.pdf', data = {}) => {
  try {
    const pdf = await buildPdfDocument(data);
    pdf.save(filename);
    return pdf;
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw error;
  }
};

export const previewQuotationPDF = async (_element, data = {}) => {
  try {
    return await buildPdfDocument(data);
  } catch (error) {
    console.error('Error previsualizando PDF:', error);
    throw error;
  }
};