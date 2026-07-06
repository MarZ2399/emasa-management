import * as XLSX from 'xlsx-js-style';

const formatFechaHoraExcel = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';

  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const cellStyleHeader = {
  font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
  fill: { fgColor: { rgb: '0F2F3A' } },
  alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
  border: {
    top: { style: 'thin', color: { rgb: 'D9E2EC' } },
    bottom: { style: 'thin', color: { rgb: 'D9E2EC' } },
    left: { style: 'thin', color: { rgb: 'D9E2EC' } },
    right: { style: 'thin', color: { rgb: 'D9E2EC' } },
  },
};

const cellStyleBody = (align = 'left') => ({
  font: { sz: 10, color: { rgb: '1F2937' } },
  fill: { fgColor: { rgb: 'CFEAF7' } },
  alignment: { horizontal: align, vertical: 'center', wrapText: true },
  border: {
    top: { style: 'thin', color: { rgb: 'B7DCEB' } },
    bottom: { style: 'thin', color: { rgb: 'B7DCEB' } },
    left: { style: 'thin', color: { rgb: 'B7DCEB' } },
    right: { style: 'thin', color: { rgb: 'B7DCEB' } },
  },
});

export const exportCallReportExcel = ({
  rows = [],
  fechaDesde,
  fechaHasta,
  vendedorLabel = 'Todo mi equipo',
}) => {
  const headers = [
    'Código',
    'NombreCliente',
    'Contacto (In/Out)',
    'Estatus Llamada',
    'Telef1',
    'Telef2',
    // 'Cuenta eC',
    'Observaciones',
    'Fecha y Hora Gestión',
    'Asesor que hizo el registro',
  ];

  const data = rows.map((row) => ([
    row.ruc_emp_contacto ?? '',
    row.raz_social ?? '',
    row.tipo_contacto_nom ?? '',
    row.resultado_gestion_nom || row.estatus_llamada || '',
    row.telefono_1 ?? '',
    row.telefono_2 ?? '',
    // row.cuenta_ec ?? '',
    row.observaciones ?? '',
    formatFechaHoraExcel(row.fecha_registro),
    row.nom_asesor ?? '',
  ]));

  const worksheetData = [headers, ...data];
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  ws['!cols'] = [
    { wch: 14 },
    { wch: 34 },
    { wch: 16 },
    { wch: 28 },
    { wch: 14 },
    { wch: 14 },
    // { wch: 14 },
    { wch: 30 },
    { wch: 20 },
    { wch: 24 },
  ];

  const range = XLSX.utils.decode_range(ws['!ref']);

  for (let C = range.s.c; C <= range.e.c; C++) {
    const headerCell = XLSX.utils.encode_cell({ r: 0, c: C });
    if (ws[headerCell]) ws[headerCell].s = cellStyleHeader;
  }

  for (let R = 1; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;

      const value = ws[cellAddress].v;
      let align = 'left';

      if (C === 0 || C === 4 || C === 5 || C === 8) align = 'center';

      ws[cellAddress].s = cellStyleBody(align);
      ws[cellAddress].v = value ?? '';
    }
  }

  ws['!freeze'] = { xSplit: 0, ySplit: 1 };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte');

  const safeVendedor = vendedorLabel && vendedorLabel !== 'Todo mi equipo'
    ? `_${vendedorLabel.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '_')}`
    : '';

  const fileName = `reporte_llamadas_${fechaDesde}_a_${fechaHasta}${safeVendedor}.xlsx`;
  XLSX.writeFile(wb, fileName);
};