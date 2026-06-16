// src/components/statement/StatementPDF.jsx
// Requiere: npm install jspdf jspdf-autotable

import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable'; 
import logoEmasa from '../../assets/logo-emasa.jpg';

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmt = (val, dec = 2) =>
  Number(val || 0).toLocaleString('en-US', {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });

const clean = (str) => String(str || '').trim();

const nowStr = () => {
  const d = new Date();
  return `${d.toLocaleDateString('es-PE')} ${d.toLocaleTimeString('es-PE', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })}`;
};

const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
};

// ── Transformar data plana AS400 ───────────────────────────────────────────────
const transformData = (rawData) => {
  if (!Array.isArray(rawData) || rawData.length === 0)
    return { cli: {}, facturas: [], letras: [], otros: [], currency: {} };

  const first = rawData[0];

  const telNumUnico = clean(first.ECTELNUU);
  const celNumUnico = clean(first.ECCELNUU);
  const numUnicoFinal = [telNumUnico, celNumUnico].filter(v => v && v !== '0').join(' | ');

  const resolveSalesRep = (rows) => {
    const nombres = rows
      .map(r => clean(r.ECNOMVEN))
      .filter(Boolean);

    const realName = nombres.find(
      n => n.toUpperCase() !== 'NO IDENTIFICADO'
    );

    if (realName) return realName;

    const fallback = nombres.find(
      n => n.toUpperCase() === 'NO IDENTIFICADO'
    );

    return fallback || '—';
  };

  const cli = {
    ruc: clean(first.ECRUCEMP || first.ECRUCCLI),
    razonSocial: clean(first.ECNOMCLI),
    repLegal: clean(first.ECREPLEG),
    direccion: clean(first.ECDIRCLI),
    distrito: clean(first.ECDISCLI),
    provincia: clean(first.ECPROCLI),
    departamento: clean(first.ECDEPCLI),
    telefono: clean(first.ECTELCLI),
    celular: clean(first.ECCELCLI),
    fax: clean(first.ECFAXCLI),
    email: clean(first.ECCORCLI),
    lineaCredito: first.ECLCRCLI || 0,
    lineaUtilizada: first.ECLUTCLI || 0,
    lineaDisponible: first.ECLDICLI || 0,
    numUnico: numUnicoFinal,
    fechaCorte: clean(first.ECFECCOR),
    venCli: resolveSalesRep(rawData),
    contacto1: clean(first.ECCONT01),
    rpc1: clean(first.ECCELC01),
    emailC1: clean(first.ECCORC01),
    contacto2: clean(first.ECCONT02),
    rpc2: clean(first.ECCELC02),
    emailC2: clean(first.ECCORC02),
    contacto3: clean(first.ECCONT03),
    rpc3: clean(first.ECCELC03),
    emailC3: clean(first.ECCORC03),
  };

  const facturas = [];
  const letras = [];
  const otros = [];

  rawData.forEach((r) => {
    const tipoRaw = clean(r.ECTIPDOC);

    const TIPO_MAP = {
      F: 'FACTURA',
      B: 'BOLETA',
      AN: 'ANTICIPO',
      NC: 'NOTA CRÉDITO',
    };

    const tipoDesc = TIPO_MAP[tipoRaw] || tipoRaw;

    const serie = clean(r.ECSERDOC);
    const numRaw = clean(r.ECNUMDOC);
    const numFormatted = numRaw.padStart(8, '0');
    const docStr = `${serie} ${numFormatted}`;

    const codMon = clean(r.ECCODMON);
    const nomMon = clean(r.ECNOMMON).toUpperCase();

    const isSoles =
      codMon === '1' ||
      nomMon.includes('SOL');

    const moneda = isSoles ? 'S/' : 'US$';
    const importe = Number(isSoles ? (r.ECVMNDOC || 0) : (r.ECVMEDOC || 0));
    const saldo = Number(isSoles ? (r.ECSMNDOC || 0) : (r.ECSMEDOC || 0));

    const base = {
      tipo: tipoDesc,
      doc: docStr,
      emision: clean(r.ECFEMDOC),
      vencimiento: clean(r.ECFVEDOC),
      fpago: clean(r.ECFPGDOC),
      estado: clean(r.ECESTDOC),
      banco: clean(r.ECNOMBCO),
      nUnico: clean(r.ECNUNDOC),
      atraso: r.ECDATDOC ?? 0,
      moneda,
      _impSNum: importe,
      _saldoSNum: saldo,
    };

    if (tipoRaw.startsWith('F')) facturas.push(base);
    else if (tipoRaw.startsWith('L')) letras.push(base);
    else otros.push(base);
  });

  return {
    cli,
    facturas,
    letras,
    otros,
    currency: {
      importLabel: 'Importe Origen',
      balanceLabel: 'Saldo',
    },
  };
};

// ── Generador principal ────────────────────────────────────────────────────────
export const generateStatementPDF = async (ruc, rawData, opciones = {}) => {
  const { cli, facturas, letras, otros, currency } =
  transformData(Array.isArray(rawData) ? rawData : (rawData?.data || []));

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW = doc.internal.pageSize.getWidth();
  const PH = doc.internal.pageSize.getHeight();
  const ML = 10;
  const MR = 10;
  let curY = 15;

  const BLACK = [0, 0, 0];
  const CORPORATE_BLUE = [20, 50, 100];

  // ── 1. Header (Logo + Título) ─────────────────────────────
  try {
    const img = await loadImage(logoEmasa);
    doc.addImage(img, 'JPEG', PW - MR - 35, curY, 35, 12);
  } catch (e) { console.warn(e); }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...CORPORATE_BLUE);
  doc.text('ESTADO DE CUENTA DEL CLIENTE', ML, curY + 10);
  
  curY += 25;

  // ── 2. Información del Cliente y Fecha Corte ─────────────────
  doc.setFontSize(8);
  doc.setTextColor(...BLACK);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha de corte: ${cli.fechaCorte}`, PW - MR, curY - 5, { align: 'right' });

  const clientY = curY;
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENTE:', ML, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(cli.razonSocial || '—', ML + 15, curY);
  
  curY += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('RUC:', ML, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(cli.ruc || ruc, ML + 15, curY);

  curY += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('DIRECCION:', ML, curY);
  doc.setFont('helvetica', 'normal');
  const dir = `${cli.direccion || ''} ${cli.distrito || ''} ${cli.provincia || ''} ${cli.departamento || ''}`;
  const splitDir = doc.splitTextToSize(dir, 80);
  doc.text(splitDir, ML + 20, curY);

  curY += (splitDir.length * 4);
  doc.setFont('helvetica', 'bold');
  doc.text('TELÉFONOS:', ML, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(cli.telefono || cli.celular || '—', ML + 20, curY);

  curY += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('CORREO ELECTRONICO:', ML, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(cli.email || '—', ML + 35, curY);

  curY += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('REPRESENTANTE DE VENTAS:', ML, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(cli.venCli || '—', ML + 45, curY);

  // ── Cálculos dinámicos: documentos y saldo vencido ───────────  ← AQUÍ
  const allDocs = [...facturas, ...letras, ...otros];

  const totalsByCurrency = allDocs.reduce((acc, r) => {
  const key = r.moneda || '—';

  if (!acc[key]) {
    acc[key] = { importe: 0, saldo: 0 };
  }

  acc[key].importe += Number(r._impSNum || 0);
  acc[key].saldo += Number(r._saldoSNum || 0);

  return acc;
}, {});

const currencyOrder = ['US$', 'S/'];
const totalRows = currencyOrder
  .filter(mon => totalsByCurrency[mon])
  .map(mon => ([
    { content: `TOTAL ${mon}`, styles: { halign: 'center', fontStyle: 'bold' } },
    { content: fmt(totalsByCurrency[mon].importe), styles: { halign: 'right', fontStyle: 'bold' } },
    { content: fmt(totalsByCurrency[mon].saldo), styles: { halign: 'right', fontStyle: 'bold' } },
  ]));


  const docsVencidos  = allDocs.filter(r => Number(r.atraso) > 0).length;
  const saldoVencido  = allDocs
    .filter(r => Number(r.atraso) > 0)
    .reduce((acc, r) => acc + r._saldoSNum, 0);

  // ── Tabla Resumen (Alineada a la derecha) ─────────────────────
const docsSoles = allDocs.filter(r => r.moneda === 'S/');
const docsDolares = allDocs.filter(r => r.moneda === 'US$');

const creditoUtilizadoSoles = docsSoles.reduce(
  (acc, r) => acc + Number(r._impSNum || 0),
  0
);

const creditoDisponibleSoles = creditoUtilizadoSoles;

const saldoVencidoSoles = docsSoles
  .filter(r => Number(r.atraso) > 0)
  .reduce((acc, r) => acc + Number(r._saldoSNum || 0), 0);

const docsVencidosSoles = docsSoles.filter(r => Number(r.atraso) > 0).length;

const saldoVencidoDolares = docsDolares
  .filter(r => Number(r.atraso) > 0)
  .reduce((acc, r) => acc + Number(r._saldoSNum || 0), 0);

const docsVencidosDolares = docsDolares.filter(r => Number(r.atraso) > 0).length;

const resTableWidth = 82;

autoTable(doc, {
  startY: clientY - 2,
  margin: { left: PW - MR - resTableWidth },
  tableWidth: resTableWidth,
  styles: {
    fontSize: 7,
    cellPadding: 1.2,
    lineWidth: 0.1,
    lineColor: [160, 180, 205],
  },
  headStyles: {
    fillColor: [200, 215, 235],
    textColor: CORPORATE_BLUE,
    fontStyle: 'bold',
    halign: 'center',
  },
  bodyStyles: {
    textColor: BLACK,
  },
  columnStyles: {
    0: { halign: 'left', cellWidth: 38 },
    1: { halign: 'right', cellWidth: 22 },
    2: { halign: 'right', cellWidth: 22 },
  },
  head: [['RESUMEN:', 'S/', 'US$']],
  body: [
    ['Línea de Crédito', fmt(0), fmt(cli.lineaCredito || 0)],
    ['Crédito Utilizado', fmt(creditoUtilizadoSoles), fmt(cli.lineaUtilizada || 0)],
    ['Crédito Disponible', fmt(creditoDisponibleSoles), fmt(cli.lineaDisponible || 0)],
    [
      'Saldo Vencido',
      { content: fmt(saldoVencidoSoles), styles: { fontStyle: 'bold' } },
      { content: fmt(saldoVencidoDolares), styles: { fontStyle: 'bold' } }
    ],
    [
      'Documentos vencidos:',
      { content: String(docsVencidosSoles), styles: { fontStyle: 'bold' } },
      { content: String(docsVencidosDolares), styles: { fontStyle: 'bold' } }
    ]
  ],
});

  curY = Math.max(curY + 8, doc.lastAutoTable.finalY + 10);

  // ── 3. Tabla Principal de Documentos ──────────────────────────
autoTable(doc, {
  startY: curY,
  margin: { left: ML, right: MR },
  styles: {
    fontSize: 6.5,
    cellPadding: 1,
    halign: 'center',
    lineWidth: 0.1,
    lineColor: [220, 220, 220]
  },
  headStyles: {
    fillColor: [230, 240, 250],
    textColor: CORPORATE_BLUE,
    fontStyle: 'bold',
    valign: 'middle'
  },
  columnStyles: {
    0: { halign: 'left', cellWidth: 20 },
    1: { halign: 'left', cellWidth: 23 },
    4: { cellWidth: 10 },
    5: { halign: 'left', cellWidth: 18 },
    6: { halign: 'left', cellWidth: 14 },
    7: { halign: 'center', cellWidth: 16 },
    8: { cellWidth: 12 },
    9: { cellWidth: 12 },
    10: { halign: 'right', cellWidth: 18 },
    11: { halign: 'right', cellWidth: 18 },
  },
  head: [[
    'Tipo Documento',
    'N° Documento',
    'Fecha Emisión',
    'Fecha Venc.',
    'Plazo Pago',
    'Situación',
    'Banco',
    'N° Único',
    'Días Venc',
    'Moneda',
    'Importe Origen',
    'Saldo'
  ]],
  body: allDocs.map(r => [
    r.tipo,
    r.doc,
    r.emision,
    r.vencimiento,
    r.fpago,
    r.estado,
    r.banco,
    r.nUnico,
    r.atraso,
    r.moneda,
    fmt(r._impSNum),
    fmt(r._saldoSNum)
  ]),
  foot: totalRows.map(row => [
    { content: '', colSpan: 9, styles: { fillColor: [240, 240, 240] } },
    ...row
  ]),
  footStyles: {
    fillColor: [240, 240, 240],
    textColor: CORPORATE_BLUE,
    fontStyle: 'bold'
  }
});

// ── 4. Footer dinámico ─────────────────────────────────────────────────────
const FOOTER_HEIGHT = 58;
const MARGIN_AFTER_TABLE = 6;
const SMALL_TABLE_LIMIT = 10;
const FOOTER_BOTTOM_MARGIN = 10;

const tableEndY = doc.lastAutoTable?.finalY ?? curY;
const isSmallTable = allDocs.length <= SMALL_TABLE_LIMIT;

const fixedFooterY = PH - FOOTER_HEIGHT - FOOTER_BOTTOM_MARGIN;

const footerFitsOnSamePage =
  (tableEndY + MARGIN_AFTER_TABLE + FOOTER_HEIGHT) <= (PH - FOOTER_BOTTOM_MARGIN);

let footerY;

if (isSmallTable) {
  // Si hay pocas filas, el footer baja al fondo de la página
  footerY = Math.max(tableEndY + MARGIN_AFTER_TABLE, fixedFooterY);
} else if (footerFitsOnSamePage) {
  // Si cabe debajo de la tabla, se coloca normal
  footerY = tableEndY + MARGIN_AFTER_TABLE;
} else {
  // Si no cabe, pasa a una nueva hoja
  doc.addPage();
  footerY = 20;
}

// — IMPORTANTE ─────────────────────────────────────────────────────────────
doc.setFontSize(7.5);
doc.setFont('helvetica', 'bold');
doc.setTextColor(...BLACK);
doc.text(
  'IMPORTANTE: Para consultas referente a la información brindada comunicarse con su ejecutiva de cartera.',
  ML, footerY
);

footerY += 5;
doc.setTextColor(...CORPORATE_BLUE);
doc.text('Ejecutivas de Cartera:', ML, footerY);

doc.setFont('helvetica', 'normal');
doc.setTextColor(...BLACK);

footerY += 5;
doc.setFont('helvetica', 'bold');
doc.text('Clientes Lima, Diesel y Cuentas Clave:', ML, footerY);
doc.setFont('helvetica', 'normal');
const cont1Val = [cli.contacto1, cli.rpc1, cli.emailC1].filter(Boolean).join(' - ') || '—';
doc.text(` ${cont1Val}`, ML + 50, footerY);

footerY += 4;
doc.setFont('helvetica', 'bold');
doc.text('Clientes Provincia y Televentas:', ML, footerY);
doc.setFont('helvetica', 'normal');
const cont2Val = [cli.contacto2, cli.rpc2, cli.emailC2].filter(Boolean).join(' - ') || '—';
doc.text(` ${cont2Val}`, ML + 42, footerY);

footerY += 4;
doc.setFont('helvetica', 'bold');
doc.text('Clientes Redes y Talleres y GGSS:', ML, footerY);
doc.setFont('helvetica', 'normal');
const cont3Val = [cli.contacto3, cli.rpc3, cli.emailC3].filter(Boolean).join(' - ') || '—';
doc.text(` ${cont3Val}`, ML + 45, footerY);

footerY += 8;
doc.text(
  'Si a la fecha de recepción de este estado de cuenta usted ya canceló alguna obligación que figure como pendiente, sírvase omitirla.',
  ML, footerY
);

// — Cuentas Corrientes ─────────────────────────────────────────────────────
footerY += 10;

const BL     = ML;
const BR     = MR;
const totalW = PW - BL - BR;
const colW   = totalW / 3;

const col1X = BL;
const col2X = BL + colW;
const col3X = BL + colW * 2;

doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(...BLACK);
doc.text('Cuentas Corrientes Autorex Peruana S.A.', BL, footerY);

footerY += 5;

doc.setFontSize(6);
doc.setTextColor(...CORPORATE_BLUE);
doc.text('BANCO DE CREDITO DEL PERU (CTA. RECAUDADORA)', col1X, footerY);
doc.setTextColor(...BLACK);
doc.text('MN: 193-0049600-0-09 / CCI: 002-193-000049600009-12', col1X, footerY + 3.5);
doc.text('ME: 193-0782860-1-85 / CCI: 002-193-000782860185-11', col1X, footerY + 6.5);

doc.setTextColor(...CORPORATE_BLUE);
doc.text('BANCO CONTINENTAL', col2X, footerY);
doc.setTextColor(...BLACK);
doc.text('MN: 0011-0910-01-00003756-72 / CCI: 011-910-00010000375672', col2X, footerY + 3.5);
doc.text('ME: 0011-0910-01-00045831-73 / CCI: 011-910-00010004583173', col2X, footerY + 6.5);

doc.setTextColor(...CORPORATE_BLUE);
doc.text('BANCO INTERBANK', col3X + 10, footerY);
doc.setTextColor(...BLACK);
doc.text('MN: 417-3001389013 / CCI: 003-417-003001389013-39', col3X + 10, footerY + 3.5);
doc.text('ME: 417-3001389020 / CCI: 003-417-003001389020-34', col3X + 10, footerY + 6.5);

footerY += 15;
doc.setFont('helvetica', 'bold');
doc.setFontSize(6);
doc.setTextColor(...BLACK);
doc.text(
  'LA EMPRESA NO SE RESPONSABILIZA DEL DINERO ENTREGADO AL VENDEDOR ASIGNADO PARA EL PAGO DE LA DEUDA.',
  BL, footerY
);

// ── Salida según modo ─────────────────────────────────────────────────────
   // recibe el 3er parámetro

const fileName = `ec${ruc}.pdf`;

if (opciones.mode === 'view') {
  // Construir una URL de tipo blob con nombre visible en la pestaña
  const blob    = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);

  // Abrir en nueva pestaña con el nombre en el hash de la URL
  // → el navegador lo muestra como título de la pestaña y en la barra
  const tab = window.open('', '_blank');
  if (tab) {
    tab.document.title = fileName;
    tab.location.href  = blobUrl;
  } else {
    // fallback si el navegador bloquea popups
    window.open(blobUrl, '_blank');
  }

  setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
} else {
  doc.save(fileName);
}
};