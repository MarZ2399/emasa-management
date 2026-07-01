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
  // { key: 'stockDisponible', label: 'Disponible' },
  // { key: 'descAlmc',        label: 'Almacén'    },
   { key: 'almacenes',    label: 'Stock por Almacén'  },
  { key: 'core',            label: 'Core'       },
  { key: 'codReemplazo',    label: 'Reemplazo'  },
];

const PAGE_SIZE = 50;

const getStockBadge = (stock) => {
  if (stock <= 0) return 'bg-red-100 text-red-700 border-red-300';
  if (stock < 10) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
  return 'bg-green-100 text-green-700 border-green-300';
};

// ── Selector Core ──────────────────────────────────────────────────────────
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
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition">
        <span className={value ? 'text-gray-800 font-medium' : 'text-gray-400'}>
          {value || 'Todos los cores'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
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

// ── Selector Almacén ───────────────────────────────────────────────────────
const AlmacenSelect = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => o.cod === value);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition">
        <span className={value ? 'text-gray-800 font-medium truncate' : 'text-gray-400'}>
          {selected ? `${selected.cod} — ${selected.descripcion}` : 'Todos los almacenes'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false); }}
            className={`w-full text-left px-4 py-3 text-sm transition
              ${value === ''
                ? 'bg-[#334a5e] text-white font-semibold'
                : 'text-gray-500 hover:bg-gray-50'}`}>
            Todos los almacenes
          </button>
          <div className="border-t border-gray-100 max-h-60 overflow-y-auto">
            {options.map(opt => (
              <button
                key={opt.cod}
                type="button"
                onClick={() => { onChange(opt.cod); setOpen(false); }}
                className={`w-full text-left px-4 py-3 text-sm transition flex items-center justify-between gap-2
                  ${value === opt.cod
                    ? 'bg-[#334a5e] text-white font-semibold'
                    : 'text-gray-700 hover:bg-blue-50'}`}>
                <span>
                  <span className="font-mono font-bold">{opt.cod}</span>
                  {opt.descripcion && (
                    <span className="ml-2 opacity-75">— {opt.descripcion}</span>
                  )}
                </span>
                {value === opt.cod && (
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
  const [allRows,        setAllRows]        = useState([]);
  const [coreOptions,    setCoreOptions]    = useState([]);
  const [almacenOptions, setAlmacenOptions] = useState([]);  //  NUEVO
  const [loading,        setLoading]        = useState(false);
  const [buscado,        setBuscado]        = useState(false);

  const [filtros, setFiltros] = useState({ core: '', almacen: '', codigo: '', descripcion: '' }); //  almacen agregado
  const [page, setPage] = useState(1);
const [excelMode, setExcelMode] = useState('detalle');
const [hasSearchedOnce, setHasSearchedOnce] = useState(false);

const coreRequired = !filtros.core?.trim();

  // ── Al montar: cargar cores y almacenes ───────────────────────────────
  useEffect(() => {
    productService.getCoresStock().then(res => {
      if (res.success) setCoreOptions(res.data);
    });
    productService.getAlmacenesStock().then(res => {        //  NUEVO
      if (res.success) setAlmacenOptions(res.data);
    });
  }, []);

  const set = (field, value) => {
    setFiltros(prev => ({ ...prev, [field]: value }));
    setPage(1);
  };

  // ── Filtrado local sobre allRows ───────────────────────────────────────
  const filtered = useMemo(() => {
    return allRows.filter(row => {
      // const matchCodigo  = !filtros.codigo      || row.codProd.toUpperCase().includes(filtros.codigo.toUpperCase());
      // const matchDesc    = !filtros.descripcion || row.mercaderia.toUpperCase().includes(filtros.descripcion.toUpperCase());
      const matchCore    = !filtros.core        || row.core === filtros.core;
      const matchAlmacen = !filtros.almacen     || row.codAlmc === filtros.almacen; //  NUEVO
      return matchCore && matchAlmacen; //matchCodigo && matchDesc && 
    });
  }, [allRows, filtros]);



  // const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Agrupa las filas por codProd
const grouped = useMemo(() => {
  const map = new Map();
  filtered.forEach(row => {
    const key = row.codProd;
    if (!map.has(key)) {
      map.set(key, {
        codProd:      row.codProd,
        mercaderia:   row.mercaderia,
        precioLista:  row.precioLista,
        core:         row.core,
        codReemplazo: row.codReemplazo,
        almacenes: [],
      });
    }
    map.get(key).almacenes.push({
      codAlmc:        row.codAlmc,
      descAlmc:       row.descAlmc || row.codAlmc,
      stockDisponible: row.stockDisponible,
    });
  });
  return Array.from(map.values());
}, [filtered]);

const totalPages = Math.max(1, Math.ceil(grouped.length / PAGE_SIZE));
const paginated  = grouped.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Buscar ─────────────────────────────────────────────────────────────
  const handleBuscar = useCallback(async () => {
  if (!hasSearchedOnce && !filtros.core?.trim()) {
    toast.error('Debe seleccionar el Core (Grupo de Venta) para la primera búsqueda.', {
      position: 'top-right',
      duration: 4000,
      icon: '⚠️',
    });
    return;
  }

  try {
    setLoading(true);
    setBuscado(false);
    setPage(1);

    const response = await productService.getStockGeneral(filtros);

    if (response.success) {
      setAllRows(response.data);
      setBuscado(true);
      setHasSearchedOnce(true);

      if (response.data.length === 0) {
        toast('Sin resultados para los filtros ingresados', { icon: '🔍' });
      }
    } else {
      toast.error(response.msgerror || 'Error al consultar stock');
    }
  } catch {
    toast.error('Error de conexión');
  } finally {
    setLoading(false);
  }
}, [filtros, hasSearchedOnce]);

  const handleLimpiar = () => {
    setFiltros({ core: '', almacen: '', codigo: '', descripcion: '' }); //  almacen reseteado
    setAllRows([]);
    setBuscado(false);
    setPage(1);
    setExcelMode('detalle');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleBuscar();
  };

 const handleExportExcel = () => {
  const sourceRows = excelMode === 'detalle' ? filtered : grouped;
  if (sourceRows.length === 0) return toast('No hay datos para exportar', { icon: '⚠️' });

  const wb = XLSX.utils.book_new();
  const now = new Date().toLocaleString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  let wsData = [];
  let mergeEndCol = 0;
  let colWidths = [];

  if (excelMode === 'detalle') {
    wsData = [
      ['Consulta de Stock'],
      [`Formato: Detallado | Generado: ${now} | Total registros: ${filtered.length}`],
      [],
      ['Código', 'Mercadería', 'P. Lista $', 'Disponible', 'Almacén', 'Core', 'Reemplazo'],
      ...filtered.map(row => [
        row.codProd,
        row.mercaderia,
        Number(row.precioLista ?? 0),
        Number(row.stockDisponible ?? 0),
        row.descAlmc || row.codAlmc || '',
        row.core || '',
        row.codReemplazo || '',
      ])
    ];
    mergeEndCol = 6;
    colWidths = [
      { wch: 18 }, { wch: 45 }, { wch: 12 },
      { wch: 12 }, { wch: 20 }, { wch: 22 }, { wch: 15 },
    ];
  } else {
    wsData = [
      ['Consulta de Stock'],
      [`Formato: Agrupado | Generado: ${now} | Total productos: ${grouped.length}`],
      [],
      ['Código', 'Mercadería', 'P. Lista $', 'Stock por Almacén', 'Core', 'Reemplazo'],
      ...grouped.map(row => [
        row.codProd,
        row.mercaderia,
        Number(row.precioLista ?? 0),
        row.almacenes
          .map(alm => `${alm.descAlmc}: ${alm.stockDisponible}`)
          .join('\n'),
        row.core || '',
        row.codReemplazo || '',
      ])
    ];
    mergeEndCol = 5;
    colWidths = [
      { wch: 18 }, { wch: 45 }, { wch: 12 },
      { wch: 38 }, { wch: 22 }, { wch: 15 },
    ];
  }

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = colWidths;

  const headerStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '334a5e' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
  };

  const titleStyle = {
    font: { bold: true, sz: 14, color: { rgb: '334a5e' } },
    alignment: { horizontal: 'left', vertical: 'center' }
  };

  const subTitleStyle = {
    font: { sz: 9, color: { rgb: '666666' } },
    alignment: { horizontal: 'left', vertical: 'center' }
  };

  if (ws['A1']) ws['A1'].s = titleStyle;
  if (ws['A2']) ws['A2'].s = subTitleStyle;

  const headerCells = excelMode === 'detalle'
    ? ['A4','B4','C4','D4','E4','F4','G4']
    : ['A4','B4','C4','D4','E4','F4'];

  headerCells.forEach(cell => {
    if (ws[cell]) ws[cell].s = headerStyle;
  });

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: mergeEndCol } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: mergeEndCol } },
  ];

  if (excelMode === 'detalle') {
    filtered.forEach((row, i) => {
      const rowNum = i + 5;

      const priceCell = `C${rowNum}`;
      if (ws[priceCell]) {
        ws[priceCell].s = {
          alignment: { horizontal: 'right', vertical: 'center' },
          numFmt: '0.00'
        };
      }

      const stockCell = `D${rowNum}`;
      if (ws[stockCell]) {
        const stock = Number(row.stockDisponible ?? 0);
        if (stock <= 0) {
          ws[stockCell].s = {
            fill: { fgColor: { rgb: 'FEE2E2' } },
            font: { color: { rgb: 'B91C1C' }, bold: true },
            alignment: { horizontal: 'center', vertical: 'center' }
          };
        } else if (stock < 10) {
          ws[stockCell].s = {
            fill: { fgColor: { rgb: 'FEF3C7' } },
            font: { color: { rgb: 'A16207' }, bold: true },
            alignment: { horizontal: 'center', vertical: 'center' }
          };
        } else {
          ws[stockCell].s = {
            fill: { fgColor: { rgb: 'DCFCE7' } },
            font: { color: { rgb: '15803D' }, bold: true },
            alignment: { horizontal: 'center', vertical: 'center' }
          };
        }
      }
    });
  } else {
    grouped.forEach((row, i) => {
      const rowNum = i + 5;

      const priceCell = `C${rowNum}`;
      if (ws[priceCell]) {
        ws[priceCell].s = {
          alignment: { horizontal: 'right', vertical: 'top' },
          numFmt: '0.00'
        };
      }

      const almacenCell = `D${rowNum}`;
      if (ws[almacenCell]) {
        ws[almacenCell].s = {
          alignment: { horizontal: 'left', vertical: 'top', wrapText: true }
        };
      }
    });

    ws['!rows'] = [
      {},
      {},
      {},
      {},
      ...grouped.map(row => {
        const lines = Math.max(1, row.almacenes.length);
        return { hpt: Math.max(22, lines * 18) };
      })
    ];
  }

  XLSX.utils.book_append_sheet(wb, ws, 'Stock');
  XLSX.writeFile(
    wb,
    `Stock_${excelMode}_${new Date().toISOString().slice(0, 10)}.xlsx`
  );
  toast.success(
    `Excel ${excelMode === 'detalle' ? 'detallado' : 'agrupado'} exportado (${sourceRows.length} registros)`
  );
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

        {/* Fila 1: Core + Almacén */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelCls}>Core (Grupo de Venta)<span className="ml-1 text-red-500">* Obligatorio para la primera búsqueda.</span></label>
            
            <CoreSelect
              value={filtros.core}
              onChange={val => set('core', val)}
              options={coreOptions}
            />
          </div>

          {/*  NUEVO — Almacén */}
          <div>
            <label className={labelCls}>
              Almacén
              <span className="ml-1 font-normal text-gray-400">(opcional)</span>
            </label>
            <AlmacenSelect
              value={filtros.almacen}
              onChange={val => set('almacen', val)}
              options={almacenOptions}
            />
          </div>
        </div>

        {/* Fila 2: Código + Descripción */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* ── Tabla ─────────────────────────────────────────────────────────── */}
      {buscado && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          <div className="bg-[#334a5e] text-white px-5 py-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              <span className="font-bold text-sm uppercase tracking-wide">Resultados de Stock</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-blue-200">
  {grouped.length} productos
  {filtered.length !== allRows.length && ` (filtrados de ${allRows.length} registros)`}
</span>
              <div className="flex items-center gap-2">
    <span className="text-xs text-blue-200 font-medium">Formato Excel:</span>
    <select
      value={excelMode}
      onChange={(e) => setExcelMode(e.target.value)}
      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-white/20 bg-white/10 text-white outline-none focus:ring-2 focus:ring-white/30"
    >
      <option value="detalle" className="text-gray-900">Detallado</option>
      <option value="agrupado" className="text-gray-900">Agrupado</option>
    </select>
  </div>

  <button onClick={handleExportExcel}
    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition">
    <FileSpreadsheet className="w-3.5 h-3.5" />
    Excel
  </button>
              <button onClick={handleExportPDF}
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
    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Código</th>
    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Mercadería</th>
    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">P. Lista $</th>
    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Stock por Almacén</th>
    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Core</th>
    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Reemplazo</th>
  </tr>
</thead>
              <tbody className="divide-y divide-gray-100">
  {paginated.length > 0 ? paginated.map((row, i) => (
    <tr key={row.codProd} className={`hover:bg-blue-50/30 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
      
      {/* Código */}
      <td className="px-4 py-3 text-xs font-semibold text-gray-800 whitespace-nowrap align-top">
        {row.codProd}
      </td>

      {/* Mercadería */}
      <td className="px-4 py-3 text-xs text-gray-700 max-w-[220px] align-top">
        <span className="line-clamp-2">{row.mercaderia}</span>
      </td>

      {/* Precio */}
      <td className="px-4 py-3 text-xs text-right font-medium text-gray-800 whitespace-nowrap align-top">
        {row.precioLista.toFixed(2)}
      </td>

      {/* Stock por Almacén — panel agrupado */}
      <td className="px-4 py-3 align-top">
        <div className="flex flex-col gap-1.5">
          {row.almacenes.map((alm, j) => (
            <div key={j} className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 min-w-[200px]">
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                {/* ícono almacén */}
                <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10l9-7 9 7v10a1 1 0 01-1 1H4a1 1 0 01-1-1V10z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
                </svg>
                <span className="font-semibold text-gray-700">{alm.descAlmc}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getStockBadge(alm.stockDisponible)}`}>
                {alm.stockDisponible}
              </span>
            </div>
          ))}
        </div>
      </td>

      {/* Core */}
      <td className="px-4 py-3 text-xs align-top">
        {row.core
          ? <span className="px-2 py-0.5 bg-purple-100 text-purple-800 border border-purple-300 rounded-full text-xs font-semibold whitespace-nowrap">{row.core}</span>
          : '—'}
      </td>

      {/* Reemplazo */}
      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap align-top">
        {row.codReemplazo || '—'}
      </td>

    </tr>
  )) : (
    <tr>
      <td colSpan={6} className="text-center py-10 text-gray-400">
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
