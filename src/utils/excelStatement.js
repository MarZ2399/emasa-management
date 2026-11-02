// src/utils/excelStatement.js
import XLSX from 'xlsx-js-style';

// ── 1. Helper para Transformar Data ──────────────────────────────────────────
const clean = (str) => String(str || '').trim();

const transformDataForExcel = (rawData) => {
  if (!Array.isArray(rawData) || rawData.length === 0)
    return { cli: {}, facturas: [], letras: [], otros: [] };

  const first = rawData[0];

  const telNumUnico = clean(first.ECTELNUU);
  const celNumUnico = clean(first.ECCELNUU);
  const numUnicoFinal = [telNumUnico, celNumUnico].filter(v => v && v !== '0').join(' | ');

  const resolveSalesRep = (rows) => {
    const nombres = rows.map(r => clean(r.ECNOMVEN)).filter(Boolean);
    const realName = nombres.find(n => n.toUpperCase() !== 'NO IDENTIFICADO');
    if (realName) return realName;
    const fallback = nombres.find(n => n.toUpperCase() === 'NO IDENTIFICADO');
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
    const TIPO_MAP = { F: 'FACTURA', B: 'BOLETA', AN: 'ANTICIPO', NC: 'NOTA CRÉDITO' };
    const tipoDesc = TIPO_MAP[tipoRaw] || tipoRaw;

    const serie = clean(r.ECSERDOC);
    const numRaw = clean(r.ECNUMDOC);
    const numFormatted = numRaw.padStart(8, '0');
    const docStr = `${serie} ${numFormatted}`;

    const codMon = clean(r.ECCODMON);
    const nomMon = clean(r.ECNOMMON).toUpperCase();
    const isSoles = codMon === '1' || nomMon.includes('SOL');
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

  return { cli, facturas, letras, otros }; 
};


// ── 2. Función Principal de Exportación ──────────────────────────────────────
export const generateStatementExcel = (ruc, rawData) => {
  const { cli, facturas, letras, otros } = transformDataForExcel(
    Array.isArray(rawData) ? rawData : (rawData?.data || [])
  );
  const allDocs = [...facturas, ...letras, ...otros];

  // --- ESTILOS VISUALES ---
  const CORPORATE_BLUE = "143264";
  
  const titleStyle = { font: { bold: true, sz: 16, color: { rgb: CORPORATE_BLUE } } };
  const boldStyle = { font: { bold: true } };
  const blueBoldStyle = { font: { bold: true, color: { rgb: CORPORATE_BLUE } } };
  
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: CORPORATE_BLUE } }, 
    alignment: { horizontal: "center", vertical: "center" }
  };

  const borderCfg = { style: "thin", color: { rgb: "A0B4CD" } };
  const borderStyle = { top: borderCfg, bottom: borderCfg, left: borderCfg, right: borderCfg };

  const summaryHeaderStyle = {
    font: { bold: true, color: { rgb: CORPORATE_BLUE } },
    fill: { fgColor: { rgb: "C8D7EB" } }, 
    alignment: { horizontal: "center" },
    border: borderStyle
  };

  const summaryCellStyle = { border: borderStyle, alignment: { horizontal: "left" } };
  const summaryNumStyle = { border: borderStyle, alignment: { horizontal: "right" }, numFmt: "#,##0.00" };
  const summaryNumBoldStyle = { font: { bold: true }, border: borderStyle, alignment: { horizontal: "right" }, numFmt: "#,##0.00" };
  
  // Estilo para números en la tabla principal (con comas y decimales)
  const tableNumStyle = { numFmt: "#,##0.00" };


  // --- CÁLCULOS DEL RESUMEN ---
  const docsSoles = allDocs.filter(r => r.moneda === 'S/');
  const docsDolares = allDocs.filter(r => r.moneda === 'US$');

  const creditoUtilizadoSoles = docsSoles.reduce((acc, r) => acc + Number(r._impSNum || 0), 0);
  const saldoVencidoSoles = docsSoles.filter(r => Number(r.atraso) > 0).reduce((acc, r) => acc + Number(r._saldoSNum || 0), 0);
  const docsVencidosSoles = docsSoles.filter(r => Number(r.atraso) > 0).length;

  const saldoVencidoDolares = docsDolares.filter(r => Number(r.atraso) > 0).reduce((acc, r) => acc + Number(r._saldoSNum || 0), 0);
  const docsVencidosDolares = docsDolares.filter(r => Number(r.atraso) > 0).length;

  const dir = `${cli.direccion || ''} ${cli.distrito || ''} ${cli.provincia || ''} ${cli.departamento || ''}`.trim();

  const excelRows = [];

  // ── SECCIÓN 1: CABECERA Y RECUADRO DERECHO DE RESUMEN ──
  excelRows.push([{ v: 'ESTADO DE CUENTA DEL CLIENTE', s: titleStyle }, '', '', '', '', '', '', '', '', '', '']); 
  excelRows.push([]); 
  
  // Fila 1 del recuadro
  excelRows.push([
    '', '', '', '', '', '',
    '', '', '', { v: `Fecha de corte: ${cli.fechaCorte}`, s: { alignment: { horizontal: "right" } } }
  ]);

  // Fila 2: Cabecera Resumen
  excelRows.push([
    { v: 'CLIENTE:', s: boldStyle }, cli.razonSocial, '', '', '', '', '',
    { v: 'RESUMEN:', s: summaryHeaderStyle }, { v: 'S/', s: summaryHeaderStyle }, { v: 'US$', s: summaryHeaderStyle }
  ]);

  // Fila 3: Línea Crédito
  excelRows.push([
    { v: 'RUC:', s: boldStyle }, cli.ruc || ruc, '', '', '', '', '',
    { v: 'Línea de Crédito', s: summaryCellStyle }, { v: 0, t: 'n', s: summaryNumStyle }, { v: Number(cli.lineaCredito || 0), t: 'n', s: summaryNumStyle }
  ]);

  // Fila 4: Crédito Utilizado
  excelRows.push([
    { v: 'DIRECCIÓN:', s: boldStyle }, dir, '', '', '', '', '',
    { v: 'Crédito Utilizado', s: summaryCellStyle }, { v: creditoUtilizadoSoles, t: 'n', s: summaryNumStyle }, { v: Number(cli.lineaUtilizada || 0), t: 'n', s: summaryNumStyle }
  ]);

  // Fila 5: Crédito Disponible
  excelRows.push([
    { v: 'TELÉFONOS:', s: boldStyle }, cli.telefono || cli.celular || '—', '', '', '', '', '',
    { v: 'Crédito Disponible', s: summaryCellStyle }, { v: creditoUtilizadoSoles, t: 'n', s: summaryNumStyle }, { v: Number(cli.lineaDisponible || 0), t: 'n', s: summaryNumStyle }
  ]);

  // Fila 6: Saldo Vencido
  excelRows.push([
    { v: 'CORREO ELECTRÓNICO:', s: boldStyle }, cli.email || '—', '', '', '', '', '',
    { v: 'Saldo Vencido', s: summaryCellStyle }, { v: saldoVencidoSoles, t: 'n', s: summaryNumBoldStyle }, { v: saldoVencidoDolares, t: 'n', s: summaryNumBoldStyle }
  ]);

  // Fila 7: Documentos Vencidos
  excelRows.push([
    { v: 'REPRESENTANTE DE VENTAS:', s: boldStyle }, cli.venCli || '—', '', '', '', '', '',
    { v: 'Documentos vencidos:', s: summaryCellStyle }, { v: docsVencidosSoles, t: 'n', s: { ...summaryNumBoldStyle, numFmt: "0" } }, { v: docsVencidosDolares, t: 'n', s: { ...summaryNumBoldStyle, numFmt: "0" } }
  ]);
  
  excelRows.push([]); 
  excelRows.push([]); 


  // ── SECCIÓN 2: TABLA PRINCIPAL DE DOCUMENTOS ──
  const tableHeaders = [
    'Tipo Documento', 'N° Documento', 'Fecha Emisión', 'Fecha Venc.',
    'Plazo Pago', 'Situación', 'Banco', 'N° Único', 'Días Venc',
    'Moneda', 'Importe Origen', 'Saldo'
  ];
  excelRows.push(tableHeaders.map(text => ({ v: text, s: headerStyle })));

  if (allDocs.length === 0) {
    excelRows.push([{ v: 'No tiene documentos registrados', s: { alignment: { horizontal: "center" } } }]);
  } else {
    allDocs.forEach((r) => {
      excelRows.push([
        r.tipo, r.doc, r.emision, r.vencimiento, r.fpago, r.estado,
        r.banco, r.nUnico, Number(r.atraso), { v: r.moneda, s: { alignment: { horizontal: "center" } } },
        { v: Number(r._impSNum || 0), t: 'n', s: tableNumStyle },   
        { v: Number(r._saldoSNum || 0), t: 'n', s: tableNumStyle }  
      ]);
    });
  }

  // ── SECCIÓN 3: TOTALES (Bajará dinámicamente según la cantidad de documentos) ──
  const totalsByCurrency = allDocs.reduce((acc, r) => {
    const key = r.moneda || '—';
    if (!acc[key]) acc[key] = { importe: 0, saldo: 0 };
    acc[key].importe += Number(r._impSNum || 0);
    acc[key].saldo += Number(r._saldoSNum || 0);
    return acc;
  }, {});

  ['US$', 'S/'].forEach(mon => {
    if (totalsByCurrency[mon]) {
      excelRows.push([
        '', '', '', '', '', '', '', '', '',
        { v: `TOTAL ${mon}`, s: blueBoldStyle },
        { v: totalsByCurrency[mon].importe, t: 'n', s: { ...blueBoldStyle, ...tableNumStyle } },
        { v: totalsByCurrency[mon].saldo, t: 'n', s: { ...blueBoldStyle, ...tableNumStyle } }
      ]);
    }
  });


//   // ── SECCIÓN 4: FOOTER E INFORMACIÓN BANCARIA ──
//   excelRows.push([]); 
//   excelRows.push([]); 

//   excelRows.push([{ v: 'IMPORTANTE: Para consultas referente a la información brindada comunicarse con su ejecutiva de cartera.', s: boldStyle }]);
//   excelRows.push([]);
//   excelRows.push([{ v: 'Si a la fecha de recepción de este estado de cuenta usted ya canceló alguna obligación que figure como pendiente, sírvase omitirla.' }]);
  
//   excelRows.push([]);
//   excelRows.push([{ v: 'Cuentas Corrientes Autorex Peruana S.A.', s: boldStyle }]);
//   excelRows.push([]);
  
//   excelRows.push([
//     { v: 'BANCO DE CREDITO DEL PERU (CTA. RECAUDADORA)', s: blueBoldStyle }, '', '', '',
//     { v: 'BANCO CONTINENTAL', s: blueBoldStyle }, '', '', '',
//     { v: 'BANCO INTERBANK', s: blueBoldStyle }
//   ]);
//   excelRows.push([
//     'MN: 193-0049600-0-09 / CCI: 002-193-000049600009-12', '', '', '',
//     'MN: 0011-0910-01-00003756-72 / CCI: 011-910-00010000375672', '', '', '',
//     'MN: 417-3001389013 / CCI: 003-417-003001389013-39'
//   ]);
//   excelRows.push([
//     'ME: 193-0782860-1-85 / CCI: 002-193-000782860185-11', '', '', '',
//     'ME: 0011-0910-01-00045831-73 / CCI: 011-910-00010004583173', '', '', '',
//     'ME: 417-3001389020 / CCI: 003-417-003001389020-34'
//   ]);
  
//   excelRows.push([]);
//   excelRows.push([{ v: 'LA EMPRESA NO SE RESPONSABILIZA DEL DINERO ENTREGADO AL VENDEDOR ASIGNADO PARA EL PAGO DE LA DEUDA.', s: boldStyle }]);


  // ── SECCIÓN 5: GENERACIÓN DEL ARCHIVO ──
  const worksheet = XLSX.utils.aoa_to_sheet(excelRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Estado de Cuenta');

  // Aplicar merge para el título principal, abarcando de la A hasta la G
  if(!worksheet['!merges']) worksheet['!merges'] = [];
  worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } });

  // Ajustar anchos de columna (A-L)
  worksheet['!cols'] = [
    { wch: 18 }, { wch: 22 }, { wch: 12 }, { wch: 12 },
    { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 18 },
    { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 15 }
  ];

  XLSX.writeFile(workbook, `ec_${ruc}.xlsx`);
};