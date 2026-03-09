// src/components/products/FindStockProduct.jsx
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Search, Package, RotateCcw, Loader2, Layers, ChevronLeft, ChevronRight, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import XLSX from 'xlsx-js-style';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { productService } from '../../services/productService';
import toast from 'react-hot-toast';
import SectionHeader from '../common/SectionHeader';

const STOCK_COLS = [
  { key: 'codProd',         label: 'Código'     },
  { key: 'mercaderia',      label: 'Mercadería' },
  { key: 'precioLista',     label: 'P. Lista $' },
  { key: 'stockDisponible', label: 'Disponible' },
  { key: 'descAlmc',        label: 'Almacén'    },
  { key: 'core',            label: 'Core'       },
  { key: 'codReemplazo',    label: 'Reemplazo'  },
];

const PAGE_SIZE = 50;

const getStockBadge = (stock) => {
  if (stock <= 0) return 'bg-red-100 text-red-700 border-red-300';
  if (stock < 10) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
  return 'bg-green-100 text-green-700 border-green-300';
};

// ── Selector custom responsive ─────────────────────────────────────────────
const CoreSelect = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition">
        <span className={value ? 'text-gray-800 font-medium' : 'text-gray-400'}>
          {value || 'Todos los cores'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {/* Todos */}
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false); }}
            className={`w-full text-left px-4 py-3 text-sm transition
              ${value === ''
                ? 'bg-[#334a5e] text-white font-semibold'
                : 'text-gray-500 hover:bg-gray-50'}`}>
            Todos los cores
          </button>

          <div className="border-t border-gray-100 max-h-60 overflow-y-auto">
            {options.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-4 py-3 text-sm transition flex items-center justify-between
                  ${value === opt
                    ? 'bg-[#334a5e] text-white font-semibold'
                    : 'text-gray-700 hover:bg-blue-50'}`}>
                <span>{opt}</span>
                {value === opt && (
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────

const FindStockProduct = () => {
  const [allRows,     setAllRows]     = useState([]);
  const [coreOptions, setCoreOptions] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [buscado,     setBuscado]     = useState(false);

  const [filtros, setFiltros] = useState({ core: '', codigo: '', descripcion: '' });
  const [page, setPage] = useState(1);

  // ── Al montar: solo cargar los cores (tabla vacía) ─────────────────────
  useEffect(() => {
    productService.getCoresStock().then(res => {
      if (res.success) setCoreOptions(res.data);
    });
  }, []);

  const set = (field, value) => {
    setFiltros(prev => ({ ...prev, [field]: value }));
    setPage(1);
  };

  // ── Filtrado local sobre allRows ───────────────────────────────────────
  const filtered = useMemo(() => {
    return allRows.filter(row => {
      const matchCodigo = !filtros.codigo      || row.codProd.toUpperCase().includes(filtros.codigo.toUpperCase());
      const matchDesc   = !filtros.descripcion || row.mercaderia.toUpperCase().includes(filtros.descripcion.toUpperCase());
      const matchCore   = !filtros.core        || row.core === filtros.core;
      return matchCodigo && matchDesc && matchCore;
    });
  }, [allRows, filtros]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Buscar ─────────────────────────────────────────────────────────────
  const handleBuscar = useCallback(async () => {
    try {
      setLoading(true);
      setBuscado(false);
      setPage(1);
      const response = await productService.getStockGeneral(filtros);
      if (response.success) {
        setAllRows(response.data);
        setBuscado(true);
        if (response.data.length === 0)
          toast('Sin resultados para los filtros ingresados', { icon: '🔍' });
      } else {
        toast.error(response.msgerror || 'Error al consultar stock');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  const handleLimpiar = () => {
    setFiltros({ core: '', codigo: '', descripcion: '' });
    setAllRows([]);
    setBuscado(false);
    setPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleBuscar();
  };

 // ── Exportar Excel con formato profesional ─────────────────────────────
const handleExportExcel = () => {
  if (filtered.length === 0) return toast('No hay datos para exportar', { icon: '⚠️' });

  const wb = XLSX.utils.book_new();

  // Crear array de datos con encabezado personalizado
  const now = new Date().toLocaleString('es-PE', { 
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: true 
  });

  const wsData = [
    ['Consulta de Stock'],                                    // Título
    [`Generado: ${now}   |   Total registros: ${filtered.length}`], // Info
    [],                                                        // Fila vacía
    ['Código', 'Mercadería', 'P. Lista $', 'Disponible', 'Almacén', 'Core', 'Reemplazo'], // Headers
    ...filtered.map(row => [
      row.codProd,
      row.mercaderia,
      row.precioLista,
      row.stockDisponible,
      row.descAlmc || row.codAlmc || '',
      row.core || '',
      row.codReemplazo || '',
    ])
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // ── Anchos de columna ──────────────────────────────────────────────────
  ws['!cols'] = [
    { wch: 18 },  // Código
    { wch: 45 },  // Mercadería
    { wch: 12 },  // P. Lista
    { wch: 12 },  // Disponible
    { wch: 15 },  // Almacén
    { wch: 20 },  // Core
    { wch: 15 },  // Reemplazo
  ];

  // ── Estilos (aplica si tu versión de xlsx soporta) ────────────────────
  const headerStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '334a5e' } },
    alignment: { horizontal: 'center', vertical: 'center' }
  };

  const titleStyle = {
    font: { bold: true, sz: 14, color: { rgb: '334a5e' } },
    alignment: { horizontal: 'left', vertical: 'center' }
  };

  // Aplicar estilos a celdas específicas
  if (ws['A1']) ws['A1'].s = titleStyle;
  if (ws['A2']) ws['A2'].s = { font: { sz: 9, color: { rgb: '666666' } } };

  // Headers (fila 4)
  const headerCells = ['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4'];
  headerCells.forEach(cell => {
    if (ws[cell]) ws[cell].s = headerStyle;
  });

  // Merge título (A1 ocupa hasta G1)
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },  // Título
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },  // Info
  ];

  // ── Formato condicional para columna Disponible (D) ───────────────────
  filtered.forEach((row, i) => {
    const rowNum = i + 5; // Fila 5 en adelante (después de headers)
    const cell = `D${rowNum}`;
    if (ws[cell]) {
      const stock = row.stockDisponible;
      if (stock <= 0) {
        ws[cell].s = { fill: { fgColor: { rgb: 'fee2e2' } }, font: { color: { rgb: 'b91c1c' }, bold: true } };
      } else if (stock < 10) {
        ws[cell].s = { fill: { fgColor: { rgb: 'fef3c7' } }, font: { color: { rgb: 'a16207' }, bold: true } };
      } else {
        ws[cell].s = { fill: { fgColor: { rgb: 'dcfce7' } }, font: { color: { rgb: '15803d' }, bold: true } };
      }
    }

    // Alineación derecha para precio
    const priceCell = `C${rowNum}`;
    if (ws[priceCell]) {
      ws[priceCell].s = { alignment: { horizontal: 'right' }, numFmt: '0.00' };
    }
  });

  XLSX.utils.book_append_sheet(wb, ws, 'Stock');
  XLSX.writeFile(wb, `Stock_${new Date().toISOString().slice(0, 10)}.xlsx`);
  toast.success(`Excel exportado (${filtered.length} registros)`);
};


  // ── Exportar PDF ───────────────────────────────────────────────────────
  const handleExportPDF = () => {
    if (filtered.length === 0) return toast('No hay datos para exportar', { icon: '⚠️' });

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    doc.setFontSize(14);
    doc.setTextColor(51, 74, 94);
    doc.text('Consulta de Stock', 14, 15);

    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Generado: ${new Date().toLocaleString('es-PE')}   |   Total registros: ${filtered.length}`, 14, 21);

    autoTable(doc, {
      startY: 26,
      head: [['Código', 'Mercadería', 'P. Lista $', 'Disponible', 'Almacén', 'Core', 'Reemplazo']],
      body: filtered.map(row => [
        row.codProd,
        row.mercaderia,
        ` ${row.precioLista.toFixed(2)}`,
        row.stockDisponible,
        row.descAlmc || row.codAlmc || '',
        row.core || '',
        row.codReemplazo || '',
      ]),
      headStyles:         { fillColor: [51, 74, 94], fontSize: 8, fontStyle: 'bold' },
      bodyStyles:         { fontSize: 7.5 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { cellWidth: 32 },
        1: { cellWidth: 70 },
        2: { cellWidth: 22, halign: 'right' },
        3: { cellWidth: 22, halign: 'center' },
        4: { cellWidth: 25 },
        5: { cellWidth: 28 },
        6: { cellWidth: 28 },
      },
      margin: { left: 14, right: 14 },
    });

    doc.save(`Stock_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success(`PDF exportado (${filtered.length} registros)`);
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelCls = 'block text-xs font-semibold text-gray-600 mb-1';

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="space-y-6">

      <SectionHeader
        icon={Layers}
        title="Consulta Stock"
        subtitle="Consulta de stock de productos con filtros"
        showButton={false}
      />

      {/* ── Filtros ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-sm font-bold text-gray-700 mb-4 pb-2 border-b">Filtros de Búsqueda</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Core — selector custom responsive */}
          <div>
            <label className={labelCls}>Core (Grupo de Venta)</label>
            <CoreSelect
              value={filtros.core}
              onChange={val => set('core', val)}
              options={coreOptions}
            />
          </div>

          <div>
            <label className={labelCls}>Código de Producto</label>
            <input
              className={inputCls}
              value={filtros.codigo}
              onChange={e => set('codigo', e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="Ej: D3.C.BOX"
            />
          </div>

          <div>
            <label className={labelCls}>Descripción</label>
            <input
              className={inputCls}
              value={filtros.descripcion}
              onChange={e => set('descripcion', e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ej: GASKET"
            />
          </div>

        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={handleLimpiar}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Limpiar
          </button>
          <button onClick={handleBuscar} disabled={loading}
            className="px-5 py-2 bg-[#334a5e] text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2 disabled:opacity-50">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" />Buscando...</>
              : <><Search className="w-4 h-4" />Buscar</>
            }
          </button>
        </div>
      </div>

      {/* ── Tabla — solo aparece después de buscar ────────────────────────── */}
      {buscado && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Header con botones exportar */}
          <div className="bg-[#334a5e] text-white px-5 py-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              <span className="font-bold text-sm uppercase tracking-wide">Resultados de Stock</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-blue-200">
                {filtered.length} registros
                {filtered.length !== allRows.length && ` (filtrados de ${allRows.length})`}
              </span>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Excel
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold transition">
                <FileText className="w-3.5 h-3.5" />
                PDF
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {STOCK_COLS.map(col => (
                    <th key={col.key}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.length > 0 ? paginated.map((row, i) => (
                  <tr key={i} className={`hover:bg-blue-50/30 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-4 py-2.5 text-xs font-semibold text-gray-800 whitespace-nowrap">{row.codProd}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-700 max-w-[220px]">
                      <span className="line-clamp-2">{row.mercaderia}</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-right font-medium text-gray-800 whitespace-nowrap">
                      {row.precioLista.toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getStockBadge(row.stockDisponible)}`}>
                        {row.stockDisponible}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-600 whitespace-nowrap">{row.descAlmc || row.codAlmc}</td>
                    <td className="px-4 py-2.5 text-xs">
                      {row.core
                        ? <span className="px-2 py-0.5 bg-purple-100 text-purple-800 border border-purple-300 rounded-full text-xs font-semibold whitespace-nowrap">{row.core}</span>
                        : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">{row.codReemplazo || '—'}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={STOCK_COLS.length} className="text-center py-10 text-gray-400">
                      <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm font-medium">Sin resultados para los filtros aplicados</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50 flex-wrap gap-2">
              <span className="text-xs text-gray-500">
                Página <span className="font-semibold">{page}</span> de <span className="font-semibold">{totalPages}</span>
                {' '}· {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
              </span>
              <div className="flex items-center gap-1 flex-wrap">
                <button onClick={() => setPage(1)} disabled={page === 1}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">«</button>
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1">
                  <ChevronLeft className="w-3 h-3" /> Anterior
                </button>
                {pageNumbers.map((p, i) =>
                  p === '...'
                    ? <span key={`e-${i}`} className="px-2 py-1 text-xs text-gray-400">…</span>
                    : <button key={p} onClick={() => setPage(p)}
                        className={`px-2.5 py-1 text-xs border rounded transition ${
                          page === p ? 'bg-[#334a5e] text-white border-[#334a5e]' : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                        }`}>{p}</button>
                )}
                <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1">
                  Siguiente <ChevronRight className="w-3 h-3" />
                </button>
                <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">»</button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default FindStockProduct;
