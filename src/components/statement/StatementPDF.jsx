// src/components/statement/StatementPDF.jsx
// Requiere: npm install jspdf jspdf-autotable

import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable'; 
// Importación del logo desde assets
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

  // Mapeo de campos de contacto combinados para Números Únicos
  const telNumUnico = clean(first.ECTELNUU);
  const celNumUnico = clean(first.ECCELNUU);
  const numUnicoFinal = [telNumUnico, celNumUnico].filter(v => v && v !== '0').join(' | ');

  const cli = {
    ruc:             clean(first.ECRUCEMP  || first.ECRUCCLI),
    razonSocial:     clean(first.ECNOMCLI),
    repLegal:        clean(first.ECREPLEG),
    direccion:       clean(first.ECDIRCLI),
    distrito:        clean(first.ECDISCLI),
    provincia:       clean(first.ECPROCLI),
    departamento:    clean(first.ECDEPCLI),
    telefono:        clean(first.ECTELCLI),
    celular:         clean(first.ECCELCLI),
    fax:             clean(first.ECFAXCLI),
    email:           clean(first.ECCORCLI),
    lineaCredito:    first.ECLCRCLI   || 0,
    lineaUtilizada:  first.ECLUTCLI   || 0,
    lineaDisponible: first.ECLDICLI   || 0,
    numUnico:        numUnicoFinal,
    fechaCorte:      clean(first.ECFECCOR),
    venCli:          clean(first.ECVENCLI)
  };

  const facturas = [];
  const letras   = [];
  const otros    = [];

  rawData.forEach((r) => {
    const tipoRaw = clean(r.ECTIPDOC);
    
    // 1. Transformar Tipo Documento (F -> FACTURA, B -> BOLETA)
    let tipoDesc = tipoRaw;
    if (tipoRaw === 'F') tipoDesc = 'FACTURA';
    else if (tipoRaw === 'B') tipoDesc = 'BOLETA';

    // 2. Formatear N° Documento (Padding de ceros a la izquierda para completar 8 caracteres)
    const serie = clean(r.ECSERDOC);
    const numRaw = clean(r.ECNUMDOC);
    const numFormatted = numRaw.padStart(8, '0'); 
    const docStr = `${serie} ${numFormatted}`;

    const base = {
      tipo:        tipoDesc,
      doc:         docStr,
      emision:     clean(r.ECFEMDOC),
      vencimiento: clean(r.ECFVEDOC),
      fpago:       clean(r.ECFPGDOC),
      estado:      clean(r.ECESTDOC),
      banco:       clean(r.ECNOMBCO),
      nUnico:      clean(r.ECNUMUNI),
      atraso:      r.ECDATDOC ?? 0,
      _impSNum:    Number(r.ECVMEDOC || 0), 
      _saldoSNum:  Number(r.ECSMEDOC || 0), 
    };

    if (tipoRaw.startsWith('F'))      facturas.push(base);
    else if (tipoRaw.startsWith('L')) letras.push(base);
    else                           otros.push(base);
  });

  return { cli, facturas, letras, otros };
};

// ── Generador principal ────────────────────────────────────────────────────────
export const generateStatementPDF = async (ruc, rawData) => {
  const { cli, facturas, letras, otros } = transformData(Array.isArray(rawData) ? rawData : (rawData?.data || []));

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
  
  // Fecha de Corte alineada a la derecha
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha de corte: ${cli.fechaCorte || '07/04/2026'}`, PW - MR, curY - 5, { align: 'right' });

  const clientY = curY;
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENTE:', ML, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(cli.razonSocial || 'INVERSIONES POLONIA S.A.C.', ML + 15, curY);
  
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
  doc.text(cli.venCli || 'DAVID HUAMAN', ML + 45, curY);

  // ── Tabla Resumen (Alineada a la derecha) ─────────────────────
  const resTableWidth = 60;
  autoTable(doc, {
    startY: clientY - 2,
    margin: { left: PW - MR - resTableWidth },
    tableWidth: resTableWidth,
    styles: { fontSize: 7, cellPadding: 1.2 },
    headStyles: { fillColor: [200, 215, 235], textColor: CORPORATE_BLUE, fontStyle: 'bold' },
    body: [
      ['Linea de Crédito', fmt(cli.lineaCredito)],
      ['Crédito Utilizado', fmt(cli.lineaUtilizada)],
      ['Crédito Disponible', fmt(cli.lineaDisponible)],
      ['Saldo Vencido', { content: '3,811.02', styles: { fontStyle: 'bold' } }],
      ['Documentos vencidos:', '1']
    ],
    head: [['RESUMEN:', 'USD']]
  });

  curY = Math.max(curY + 8, doc.lastAutoTable.finalY + 10);

  // ── 3. Tabla Principal de Documentos ──────────────────────────
  const allDocs = [...facturas, ...letras, ...otros];
  autoTable(doc, {
    startY: curY,
    margin: { left: ML, right: MR },
    styles: { fontSize: 6.5, cellPadding: 1, halign: 'center', lineWidth: 0.1, lineColor: [220, 220, 220] },
    headStyles: { fillColor: [230, 240, 250], textColor: CORPORATE_BLUE, fontStyle: 'bold' },
    columnStyles: {
      0: { halign: 'left', cellWidth: 18 }, 
      1: { halign: 'left', cellWidth: 25 },
      5: { halign: 'left' },
      9: { halign: 'right' }, 
      10: { halign: 'right' }
    },
    head: [['Tipo Documento', 'N° Documento', 'Fecha Emisión', 'Fecha Vencimiento', 'Plazo Pago', 'Situación', 'Banco', 'N° Único', 'Días Venc', 'Importe Origen USD', 'Saldo USD']],
    body: allDocs.map(r => [
      r.tipo, r.doc, r.emision, r.vencimiento, r.fpago, r.estado, r.banco, r.nUnico, r.atraso, fmt(r._impSNum), fmt(r._saldoSNum)
    ]),
    foot: [[{ content: 'TOTALES', colSpan: 9, styles: { halign: 'right', fontStyle: 'bold' } }, fmt(allDocs.reduce((a, b) => a + b._impSNum, 0)), fmt(allDocs.reduce((a, b) => a + b._saldoSNum, 0))]],
    footStyles: { fillColor: [240, 240, 240], textColor: CORPORATE_BLUE }
  });

  // ── 4. Footer Fijo (Posicionamiento Absoluto) ──────────────────
  let footerY = PH - 85; 

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLACK);
  doc.text('IMPORTANTE: Para consultas referente a la información brindada comunicarse con su ejecutiva de cartera.', ML, footerY);
  
  footerY += 5;
  doc.setTextColor(...CORPORATE_BLUE);
  doc.text('Ejecutivas de Cartera:', ML, footerY);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BLACK);
  footerY += 5;
  doc.setFont('helvetica', 'bold'); doc.text('Clientes Lima, Diesel y Cuentas Clave:', ML, footerY);
  doc.setFont('helvetica', 'normal'); doc.text(' Ingrid Gamarra - 998 140 098 / ingrid.gamarra@emasa.pe', ML + 50, footerY);
  
  footerY += 4;
  doc.setFont('helvetica', 'bold'); doc.text('Clientes Provincia y Televentas:', ML, footerY);
  doc.setFont('helvetica', 'normal'); doc.text(' Cony Inga - 998 108 223 / cony.inga@emasa.pe', ML + 42, footerY);

  footerY += 4;
  doc.setFont('helvetica', 'bold'); doc.text('Clientes Redes y Talleres y GGSS:', ML, footerY);
  doc.setFont('helvetica', 'normal'); doc.text(' Yulisa Garcia - 946 398 204 / yulisa.garcia@emasa.pe', ML + 45, footerY);

  footerY += 8;
  doc.text('Si a la fecha de recepción de este estado de cuenta usted ya canceló alguna obligación que figure como pendiente, sírvase omitirla.', ML, footerY);

  // Bloque de Cuentas Corrientes
  footerY += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Cuentas Corrientes Autorex Peruana S.A.', ML, footerY);
  
  footerY += 5;
  doc.setFontSize(6.5);
  const colW = (PW - ML - MR) / 3;
  
  // BANCO DE CREDITO
  doc.setTextColor(...CORPORATE_BLUE); doc.text('BANCO DE CREDITO DEL PERU (CTA. RECAUDADORA)', ML, footerY);
  doc.setTextColor(...BLACK); doc.setFontSize(6);
  doc.text('MN: 193-0049600-0-09 / CCI: 002-193-000049600009-12', ML, footerY + 3.5);
  doc.text('ME: 193-0782860-1-85 / CCI: 002-193-000782860185-11', ML, footerY + 6.5);

  // BANCO CONTINENTAL
  doc.setFontSize(6.5);
  doc.setTextColor(...CORPORATE_BLUE); doc.text('BANCO CONTINENTAL', ML + colW, footerY);
  doc.setTextColor(...BLACK); doc.setFontSize(6);
  doc.text('MN: 0011-0910-01-00003756-72 / CCI: 011-910-00010000375672', ML + colW, footerY + 3.5);
  doc.text('ME: 0011-0910-01-00045831-73 / CCI: 011-910-00010004583173', ML + colW, footerY + 6.5);

  // BANCO INTERBANK
  doc.setFontSize(6.5);
  doc.setTextColor(...CORPORATE_BLUE); doc.text('BANCO INTERBANK', ML + colW * 2, footerY);
  doc.setTextColor(...BLACK); doc.setFontSize(6);
  doc.text('MN: 417-3001389013 / CCI: 003-417-003001389013-39', ML + colW * 2, footerY + 3.5);
  doc.text('ME: 417-3001389020 / CCI: 003-417-003001389020-34', ML + colW * 2, footerY + 6.5);

  footerY += 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('LA EMPRESA NO SE RESPONSABILIZA DEL DINERO ENTREGADO AL VENDEDOR ASIGNADO PARA EL PAGO DE LA DEUDA.', ML, footerY);

  // ── Descarga Directa ──────────────────────────────────────────────────────
  doc.save(`ec${ruc}.pdf`);
};