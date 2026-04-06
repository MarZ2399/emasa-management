// src/components/statement/StatementPDF.jsx
// Requiere: npm install jspdf jspdf-autotable

import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable'; 
// Importación del logo desde assets
import logoEmasa from '../../assets/logo-emasa.jpg';

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmt = (val, dec = 2) =>
  Number(val || 0).toLocaleString('es-PE', {
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

// Helper para cargar la imagen antes de generar el PDF
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
    return { cli: {}, facturas: [], letras: [], otros: [] };

  const first = rawData[0];

  // Mapeo de campos de contacto combinados para Números Únicos (ECTELNUU | ECCELNUU)
  const telNumUnico = clean(first.ECTELNUU);
  const celNumUnico = clean(first.ECCELNUU);
  const numUnicoFinal = [telNumUnico, celNumUnico].filter(v => v && v !== '0').join(' | ');

  const cli = {
    ruc:             clean(first.ECRUCEMP  || first.ECRUCCLI),
    razonSocial:     clean(first.ECNOMCLI),
    repLegal:        clean(first.ECREPLEG),
    direccion:       clean(first.ECDIRCLI),
    departamento:    clean(first.ECDEPCLI),
    provincia:       clean(first.ECPROCLI),
    distrito:        clean(first.ECDISCLI),
    telefono:        clean(first.ECTELCLI),
    fax:             clean(first.ECFAXCLI),
    celular:         clean(first.ECCELCLI),
    email:           clean(first.ECCORCLI),
    lineaCredito:    first.ECLCRCLI   || 0,
    lineaUtilizada:  first.ECLUTCLI   || 0,
    lineaDisponible: first.ECLDICLI   || 0,
    contacto:        clean(first.ECCONT01),
    emailContacto:   clean(first.ECCORC01),
    telContacto:     clean(first.ECTELC01),
    rpc:             clean(first.ECCELC01),
    contacto2:       clean(first.ECCONT02),
    emailContacto2:  clean(first.ECCORC02),
    telContacto2:    clean(first.ECTELC02),
    rpc2:            clean(first.ECCELC02),
    contacto3:       clean(first.ECCONT03),
    emailContacto3:  clean(first.ECCORC03),
    rpc3:            clean(first.ECCELC03),
    numUnico:        numUnicoFinal, 
    fechaCorte:      clean(first.ECFECCOR),
  };

  const facturas = [];
  const letras   = [];
  const otros    = [];

  rawData.forEach((r) => {
    const tipo   = clean(r.ECTIPDOC);
    const serie  = clean(r.ECSERDOC);
    const num    = String(r.ECNUMDOC || '').trim();
    const docStr = `${serie} ${num}`;

    const base = {
      doc:         docStr,
      emision:     clean(r.ECFEMDOC),
      vencimiento: clean(r.ECFVEDOC),
      importeS:     fmt(r.ECVMNDOC),
      importeUS:   fmt(r.ECVMEDOC),
      saldoS:       fmt(r.ECSMNDOC),
      saldoUS:     fmt(r.ECSMEDOC),
      atraso:      r.ECDATDOC ?? 0,
      fpago:       clean(r.ECFPGDOC),
      ocompra:     clean(r.ECOCMDOC),
      lineaVend:   clean(r.ECLINDOC),
      vend:        clean(r.ECCVEDOC),
      nUnico:      clean(r.ECNUNDOC),
      banco:       clean(r.ECNOMBCO),
      estado:      clean(r.ECESTDOC),
      _saldoSNum:  Number(r.ECSMNDOC || 0),
      _saldoUSNum: Number(r.ECSMEDOC || 0),
      _impSNum:    Number(r.ECVMNDOC || 0),
      _impUSNum:   Number(r.ECVMEDOC || 0),
    };

    if (tipo.startsWith('F'))      facturas.push(base);
    else if (tipo.startsWith('L')) letras.push(base);
    else                           otros.push(base);
  });

  return { cli, facturas, letras, otros };
};

// ── Generador principal ────────────────────────────────────────────────────────
export const generateStatementPDF = async (ruc, rawData) => {
  const arr = Array.isArray(rawData)
    ? rawData
    : (Array.isArray(rawData?.data) ? rawData.data : []);

  const { cli, facturas, letras, otros } = transformData(arr);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [216, 330] });
  const PW  = doc.internal.pageSize.getWidth();
  const PH  = doc.internal.pageSize.getHeight();
  const ML  = 10;
  const MR  = 10;
  
  let curY = 10;

  const BLACK    = [0, 0, 0];
  const LINE_CLR = [180, 180, 180];
  const WHITE    = [255, 255, 255];

  // ── 1. Header (Logo + Título) ─────────────────────────────
  try {
    const img = await loadImage(logoEmasa);
    doc.addImage(img, 'JPEG', ML, curY, 25, 8);
  } catch (e) { console.warn(e); }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9); 
  doc.text('Estado de Cuenta Corriente', PW / 2 + 10, curY + 6, { align: 'center' });
  curY += 18;

  // ── 2. Datos del Cliente ───────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7); 
  doc.text('Datos del Cliente', ML, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(nowStr(), PW - MR, curY, { align: 'right' });
  curY += 4;

  const rucLabel = cli.ruc || ruc;
  doc.text(`Nombre o Razón Social: ${rucLabel} ${cli.razonSocial || ''}`, ML, curY);
  curY += 3.5;
  doc.text(`Rep. Legal: ${cli.repLegal || '—'}`, ML, curY);
  curY += 3.5;
  const dirFull = [cli.direccion, cli.distrito, cli.provincia, cli.departamento].filter(Boolean).join(', ');
  doc.text(`Dirección: ${dirFull || '—'}`, ML, curY);
  curY += 3.5;
  doc.text(`Teléfonos: ${cli.telefono || ''} - Celular: ${cli.celular || ''} - Fax: ${cli.fax || ''}`, ML, curY);
  curY += 3.5;
  doc.text(`Correo Electrónico: ${cli.email || '—'}`, ML, curY);
  curY += 6; 

  // ── 3. Bloque de Contacto y Crédito ───────────────────────────
  const contactStartY = curY;
  const contactosStr = [cli.contacto, cli.contacto2, cli.contacto3].filter(Boolean).join(' | ');
  doc.text(`Contacto: ${contactosStr || '—'}`, ML, curY);
  curY += 3.5;
  const telsStr = [cli.telContacto, cli.telContacto2].filter(v => v && v !== '0').join(' | ');
  doc.text(`Telefono: ${telsStr || '0'}`, ML, curY);
  curY += 3.5;
  const rpcStr = [cli.rpc, cli.rpc2, cli.rpc3].filter(Boolean).join(' | ');
  doc.text(`RPC: ${rpcStr || '—'}`, ML, curY);
  curY += 3.5;
  const emailsStr = [cli.emailContacto, cli.emailContacto2, cli.emailContacto3].filter(Boolean).join(' | ');
  doc.text(`E-Mail: ${emailsStr || '—'}`, ML, curY);
  curY += 3.5;
  if (cli.numUnico) {
    doc.text(`Información de números únicos y T.C. al telf.: ${cli.numUnico}`, ML, curY);
    curY += 3.5;
  }

  const creditLabelX = PW - MR - 45;
  const creditValX   = PW - MR;
  doc.text('Línea de Crédito  US$:', creditLabelX, contactStartY);
  doc.text('Línea Utilizada   US$:', creditLabelX, contactStartY + 4);
  doc.text('Línea Disponible  US$:', creditLabelX, contactStartY + 8);
  doc.setFont('helvetica', 'bold');
  doc.text(fmt(cli.lineaCredito), creditValX, contactStartY, { align: 'right' });
  doc.text(fmt(cli.lineaUtilizada), creditValX, contactStartY + 4, { align: 'right' });
  doc.text(fmt(cli.lineaDisponible), creditValX, contactStartY + 8, { align: 'right' });
  doc.setFont('helvetica', 'normal');

  curY = Math.max(curY, contactStartY + 12) + 4; 

  // ── 4. Estilos Tablas ─────────────────────────────────────────
  const TABLE_STYLES = { fontSize: 7, cellPadding: 0.8, lineWidth: 0, font: 'helvetica', textColor: [0, 0, 0] };
  const HEAD_STYLES = { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: { bottom: 0.15 }, lineColor: [180, 180, 180] };
  const FOOT_STYLES = { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: { top: 0.15 }, lineColor: [180, 180, 180] };

  // ── 5. Facturas ───────────────────────────────────────────────────
  autoTable(doc, {
    startY: curY,
    margin: { left: ML, right: MR },
    head: [['Facturas', 'Emisión', 'Vencimiento', 'Importe S/.', 'Importe US$', 'Saldo S/.', 'Saldo US$', 'Atraso', 'F. Pago', 'O. Compra', 'Línea Vend.', 'Vend.']],
    body: facturas.map(r => [r.doc, r.emision, r.vencimiento, r.importeS, r.importeUS, r.saldoS, r.saldoUS, r.atraso, r.fpago, r.ocompra, r.lineaVend, r.vend]),
    foot: [['', 'Total', '', fmt(facturas.reduce((s, r) => s + r._impSNum, 0)), fmt(facturas.reduce((s, r) => s + r._impUSNum, 0)), fmt(facturas.reduce((s, r) => s + r._saldoSNum, 0)), fmt(facturas.reduce((s, r) => s + r._saldoUSNum, 0)), '', '', '', '', '']],
    styles: TABLE_STYLES, headStyles: HEAD_STYLES, footStyles: FOOT_STYLES,
    columnStyles: { 0: { cellWidth: 20 }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' }, 7: { halign: 'center' } },
    didParseCell: (data) => {
      if (data.section === 'foot' && data.column.index === 1) data.cell.styles.halign = 'center';
      if (data.section === 'foot' && data.column.index >= 3 && data.column.index <= 6) data.cell.styles.halign = 'right';
    },
    didDrawPage: (data) => { curY = data.cursor.y; }
  });

  // ── 6. Letras ─────────────────────────────────────────────────────
  curY = (doc.lastAutoTable?.finalY ?? curY) + 4;
  autoTable(doc, {
    startY: curY,
    margin: { left: ML, right: MR },
    head: [['Letras', 'Emisión', 'Vencimiento', 'Importe S/.', 'Importe US$', 'Saldo S/.', 'Saldo US$', 'Atraso', 'N° Único', 'Banco', 'Estado', 'Vend.']],
    body: letras.map(r => [r.doc, r.emision, r.vencimiento, r.importeS, r.importeUS, r.saldoS, r.saldoUS, r.atraso, r.nUnico, r.banco, r.estado, r.vend]),
    foot: [['', 'Total', '', fmt(letras.reduce((s, r) => s + r._impSNum, 0)), fmt(letras.reduce((s, r) => s + r._impUSNum, 0)), fmt(letras.reduce((s, r) => s + r._saldoSNum, 0)), fmt(letras.reduce((s, r) => s + r._saldoUSNum, 0)), '', '', '', '', '']],
    styles: TABLE_STYLES, headStyles: HEAD_STYLES, footStyles: FOOT_STYLES,
    columnStyles: { 0: { cellWidth: 20 }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' }, 7: { halign: 'center' } },
    didParseCell: (data) => {
      if (data.section === 'foot' && data.column.index === 1) data.cell.styles.halign = 'center';
      if (data.section === 'foot' && data.column.index >= 3 && data.column.index <= 6) data.cell.styles.halign = 'right';
    },
    didDrawPage: (data) => { curY = data.cursor.y; }
  });

  // ── 7. Otros Documentos ───────────────────────────────────────────
  curY = (doc.lastAutoTable?.finalY ?? curY) + 4;
  autoTable(doc, {
    startY: curY,
    margin: { left: ML, right: MR },
    head: [['Otros Doctos.', 'Emisión', 'Vencimiento', 'Importe S/.', 'Importe US$', 'Saldo S/.', 'Saldo US$', 'Atraso']],
    body: otros.map(r => [r.doc, r.emision, r.vencimiento, r.importeS, r.importeUS, r.saldoS, r.saldoUS, r.atraso]),
    foot: [['', 'Total', '', fmt(otros.reduce((s, r) => s + r._impSNum, 0)), fmt(otros.reduce((s, r) => s + r._impUSNum, 0)), fmt(otros.reduce((s, r) => s + r._saldoSNum, 0)), fmt(otros.reduce((s, r) => s + r._saldoUSNum, 0)), '']],
    styles: TABLE_STYLES, headStyles: HEAD_STYLES, footStyles: FOOT_STYLES,
    columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' }, 7: { halign: 'center' } },
    didParseCell: (data) => {
      if (data.section === 'foot' && data.column.index === 1) data.cell.styles.halign = 'center';
      if (data.section === 'foot' && data.column.index >= 3 && data.column.index <= 6) data.cell.styles.halign = 'right';
    },
    didDrawPage: (data) => { curY = data.cursor.y; }
  });

  // ── 8. Resumen e Importante (Dos columnas) ───────────────────────────────────
  curY = (doc.lastAutoTable?.finalY ?? curY) + 6;
  const resumenY = curY;

  // Cálculos de totales para la tabla de resumen
  const totFactIS = facturas.reduce((s, r) => s + r._impSNum, 0);
  const totFactIU = facturas.reduce((s, r) => s + r._impUSNum, 0);
  const totFactS  = facturas.reduce((s, r) => s + r._saldoSNum, 0);
  const totFactU  = facturas.reduce((s, r) => s + r._saldoUSNum, 0);

  const totLetIS = letras.reduce((s, r) => s + r._impSNum, 0);
  const totLetIU = letras.reduce((s, r) => s + r._impUSNum, 0);
  const totLetS  = letras.reduce((s, r) => s + r._saldoSNum, 0);
  const totLetU  = letras.reduce((s, r) => s + r._saldoUSNum, 0);

  const totOtrIS = otros.reduce((s, r) => s + r._impSNum, 0);
  const totOtrIU = otros.reduce((s, r) => s + r._impUSNum, 0);
  const totOtrS  = otros.reduce((s, r) => s + r._saldoSNum, 0);
  const totOtrU  = otros.reduce((s, r) => s + r._saldoUSNum, 0);

  autoTable(doc, {
    startY: resumenY,
    margin: { left: ML, right: PW / 2 + 2 },
    head: [['Resumen :', 'Importe S/.', 'Importe US$', 'Saldo S/.', 'Saldo US$']],
    body: [
      ['Facturas', fmt(totFactIS), fmt(totFactIU), fmt(totFactS), fmt(totFactU)],
      ['Letras', fmt(totLetIS), fmt(totLetIU), fmt(totLetS), fmt(totLetU)],
      ['Otros Documentos', fmt(totOtrIS), fmt(totOtrIU), fmt(totOtrS), fmt(totOtrU)]
    ],
    foot: [['Total', fmt(totFactIS+totLetIS+totOtrIS), fmt(totFactIU+totLetIU+totOtrIU), fmt(totFactS+totLetS+totOtrS), fmt(totFactU+totLetU+totOtrU)]],
    styles: { ...TABLE_STYLES, fontSize: 7 },
    headStyles: HEAD_STYLES,
    footStyles: FOOT_STYLES,
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
    didParseCell: (data) => { if (data.section === 'foot' && data.column.index >= 1) data.cell.styles.halign = 'right'; }
  });

  const noteX = PW / 2 + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('IMPORTANTE :', noteX, resumenY + 3.5);
  doc.setFont('helvetica', 'normal');
  const notaText = "De tener discrepancias con el contenido del reporte favor de comunicarse con la persona de contacto indicada en el encabezado. Si a la fecha de recepción de este estado de cuenta usted ya canceló alguna obligación que figure como pendiente, sírvase omitirla.";
  const lines = doc.splitTextToSize(notaText, PW - MR - noteX);
  doc.text(lines, noteX, resumenY + 7);

  // ── 9. Pie de página ──────────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(6.5);
    doc.text(`Pagina ${i} de ${totalPages}`, PW - MR, PH - 6, { align: 'right' });
  }

  window.open(URL.createObjectURL(doc.output('blob')), '_blank');
};