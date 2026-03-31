import React, { useState, useMemo } from 'react';
import {
  Search, Package, Calendar,
  ChevronDown, ChevronUp, Loader,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  CalendarDays
} from 'lucide-react';
import WmsTrackingModal from '../orders/WmsTrackingModal';

const FASES = {
  50: { label: 'FACTURADO',   color: 'bg-green-100  text-green-800'  },
  45: { label: 'PICKEADO',    color: 'bg-teal-100   text-teal-800'   },
  40: { label: 'EN ALMACÉN',  color: 'bg-blue-100   text-blue-800'   },
  30: { label: 'OBS CXC',     color: 'bg-purple-100 text-purple-800'  },
  24: { label: 'OBS GV',      color: 'bg-orange-200 text-orange-800' },
  22: { label: 'OBS JDV',     color: 'bg-orange-200 text-orange-800' },
  20: { label: 'OBS VTA',     color: 'bg-orange-200 text-orange-800' },
  15: { label: 'ANULADO',     color: 'bg-red-100    text-red-800'    },
  10: { label: 'CERRADO',     color: 'bg-gray-100   text-gray-600'   },
   5: { label: 'ABR/RCH VTA', color: 'bg-pink-100   text-pink-800'   },
  
};

const PAGE_SIZE_OPTIONS = [20, 50, 100];

// Helpers
const todayInt  = () => {
  const d = new Date();
  return (
    d.getFullYear() * 10000 +
    (d.getMonth() + 1) * 100 +
    d.getDate()
  );
};

// "20210811" → "2021-08-11" (valor de <input type="date">)
const intToInputDate = (n) => {
  if (!n) return '';
  const s = String(n).padStart(8, '0');
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
};

// "2021-08-11" → 20210811
const inputDateToInt = (s) => {
  if (!s) return null;
  return Number(s.replace(/-/g, ''));
};

const FaseBadge = ({ codfase }) => {
  const fase = FASES[codfase] ?? { label: `FASE ${codfase}`, color: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${fase.color}`}>
      {fase.label}
    </span>
  );
};

const formatFecha = (fechaInt) => {
  if (!fechaInt) return '—';
  const s = String(fechaInt).padStart(8, '0');
  return `${s.slice(6, 8)}/${s.slice(4, 6)}/${s.slice(0, 4)}`;
};

const formatMonto = (val, prefix = 'S/') =>
  `${prefix} ${Number(val || 0).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// ── Paginación ────────────────────────────────────────────────────────────────
const Pagination = ({ page, totalPages, pageSize, totalItems, onPage, onPageSize }) => {
  const pages = useMemo(() => {
    const delta = 2;
    const range = [];
    const left  = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);
    for (let i = left; i <= right; i++) range.push(i);
    return range;
  }, [page, totalPages]);

  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-200">
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span>
          {from}–{to} de <strong className="text-gray-700">{totalItems}</strong>
        </span>
        <span className="hidden sm:inline text-gray-300">|</span>
        <label className="hidden sm:flex items-center gap-1.5">
          Filas:
          <select
            value={pageSize}
            onChange={e => onPageSize(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {PAGE_SIZE_OPTIONS.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(1)} disabled={page === 1}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition">
          <ChevronsLeft className="w-4 h-4 text-gray-600" />
        </button>
        <button onClick={() => onPage(page - 1)} disabled={page === 1}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition">
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        {pages[0] > 1 && <span className="px-2 text-gray-400 text-sm">…</span>}
        {pages.map(p => (
          <button key={p} onClick={() => onPage(p)}
            className={`min-w-[32px] h-8 px-2 rounded text-sm font-medium transition ${
              p === page ? 'bg-green-600 text-white shadow-sm' : 'hover:bg-gray-100 text-gray-700'
            }`}>
            {p}
          </button>
        ))}
        {pages[pages.length - 1] < totalPages && <span className="px-2 text-gray-400 text-sm">…</span>}
        <button onClick={() => onPage(page + 1)} disabled={page === totalPages || totalPages === 0}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition">
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
        <button onClick={() => onPage(totalPages)} disabled={page === totalPages || totalPages === 0}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition">
          <ChevronsRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

// ── Columnas dinámicas según nivel ────────────────────────────────────────────
const buildColumns = (nivelAcceso) => {
  const all = [
    {
      key: 'reg', label: 'N° Pedido', field: 'reg', niveles: [0, 1, 2],
      thClass: 'w-24',
      renderCell: (o) => <span className="font-semibold text-green-700 tabular-nums">{o.reg}</span>,
    },
    {
      key: 'fecped', label: 'Fecha', field: 'fecped', niveles: [0, 1, 2],
      thClass: 'w-28',
      renderCell: (o) => (
        <div className="flex items-center gap-1 text-gray-600 whitespace-nowrap">
          <Calendar className="w-3 h-3 opacity-50 shrink-0" />
          {formatFecha(o.fecped)}
        </div>
      ),
    },
    {
      key: 'rucc', label: 'RUC', field: 'rucc', niveles: [0, 1, 2],
      thClass: 'w-28',
      renderCell: (o) => <span className="text-gray-600 tabular-nums">{o.rucc || '—'}</span>,
    },
    {
      key: 'nomc', label: 'Cliente', field: 'nomc', niveles: [0, 1, 2],
      thClass: 'min-w-[180px]',
      renderCell: (o) => (
        <span className="font-medium text-gray-900 block max-w-[320px] truncate" title={o.nomc}>
          {o.nomc || '—'}
        </span>
      ),
    },
    {
      key: 'vend', label: nivelAcceso === 0 ? 'Vendedor / Jefe Vta' : 'Vendedor',
      field: 'vend', niveles: [0, 1],
      thClass: nivelAcceso === 0 ? 'min-w-[180px]' : 'min-w-[130px]',
      renderCell: (o) => (
        <div className="text-gray-600 leading-tight">
          <span className="block whitespace-nowrap">{o.vtdnom || o.vend || '—'}</span>
          {nivelAcceso === 0 && (
            <span className="block text-xs text-gray-400 whitespace-nowrap mt-0.5">
              {o.jvtnom || o.jvta || '—'}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'almdes', label: 'Almacén', field: 'almdes', niveles: [0, 1, 2],
      thClass: 'w-24',
      renderCell: (o) => <span className="text-gray-600">{o.almdes || '—'}</span>,
    },
    {
      key: 'cmone', label: 'Moneda', field: 'cmone', niveles: [0, 1, 2],
      thClass: 'w-20 text-center',
      renderCell: (o) => (
        <span className={`inline-block text-xs font-semibold px-1.5 py-0.5 rounded ${
          o.cmone === 2 ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
        }`}>
          {o.cmone === 2 ? 'USD' : 'PEN'}
        </span>
      ),
    },
    {
      key: 'netos', label: 'Neto S/', field: 'netos', niveles: [0, 1, 2],
      thClass: 'w-28 text-right',
      renderCell: (o) => (
        <span className="text-gray-700 tabular-nums whitespace-nowrap block text-right">
          {formatMonto(o.netos, 'S/')}
        </span>
      ),
    },
    {
      key: 'netod', label: 'Neto USD', field: 'netod', niveles: [0, 1, 2],
      thClass: 'w-28 text-right',
      renderCell: (o) => (
        <span className="font-semibold text-green-700 tabular-nums whitespace-nowrap block text-right">
          {formatMonto(o.netod, '$')}
        </span>
      ),
    },
    {
  key: 'nrowms', label: 'WMS', field: 'nrowms', niveles: [0, 1, 2],
  thClass: 'w-24 text-center',
  renderCell: (o, onTrackingClick) => {          // ← recibe el callback
    const wms = o.nrowms?.toString().trim();
    if (!wms || wms === '0') return <span className="text-gray-300">—</span>;
    return (
      <button
        onClick={() => onTrackingClick(o.reg)}   // ← o.reg = N° Pedido
        className="text-teal-600 font-semibold hover:underline hover:text-teal-700 transition-colors tabular-nums"
        title="Ver tracking WMS"
      >
        {wms}
      </button>
    );
  },
},
    {
      key: 'codfase', label: 'Fase', field: 'codfase', niveles: [0, 1, 2],
      thClass: 'w-32',
      renderCell: (o) => <FaseBadge codfase={o.codfase} />,
    },
  ];

  return all.filter(c => c.niveles.includes(nivelAcceso));
};

// ── Componente principal ──────────────────────────────────────────────────────
const OrdersList = ({ orders, loading, nivelAcceso = 2 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [faseFilter, setFaseFilter] = useState('all');
  const [sortField,  setSortField]  = useState('fecped');
  const [sortDir,    setSortDir]    = useState('desc');
  const [page,       setPage]       = useState(1);
  const [pageSize,   setPageSize]   = useState(20);
  const [trackingPedido, setTrackingPedido] = useState(null);

  // ── Filtro de fechas ────────────────────────────────────────────────────────
  const hoy = todayInt();
  const [fechaDesde, setFechaDesde] = useState(hoy);  // default: hoy
  const [fechaHasta, setFechaHasta] = useState(hoy);  // default: hoy
  // ──────────────────────────────────────────────────────────────────────────

  const columns = useMemo(() => buildColumns(nivelAcceso), [nivelAcceso]);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return orders.filter(o => {
      // Búsqueda texto
      const matchSearch =
        String(o.reg   || '').toLowerCase().includes(q) ||
        String(o.nomc  || '').toLowerCase().includes(q) ||
        String(o.rucc  || '').includes(q)               ||
        String(o.vtdnom  || '').toLowerCase().includes(q);

      // Fase
      const matchFase = faseFilter === 'all' || String(o.codfase) === faseFilter;

      // Rango de fechas (fecped es entero tipo 20210811)
      const fec = o.fecped ?? 0;
      const matchFecha =
        (!fechaDesde || fec >= fechaDesde) &&
        (!fechaHasta || fec <= fechaHasta);

      return matchSearch && matchFase && matchFecha;
    });
  }, [orders, searchTerm, faseFilter, fechaDesde, fechaHasta]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortField] ?? '';
      const bv = b[sortField] ?? '';
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const handleSort    = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
    setPage(1);
  };
  const handleSearch  = (e) => { setSearchTerm(e.target.value); setPage(1); };
  const handleFase    = (e) => { setFaseFilter(e.target.value); setPage(1); };
  const handlePageSize = (n) => { setPageSize(n); setPage(1); };

  const handleFechaDesde = (e) => {
    const v = inputDateToInt(e.target.value);
    setFechaDesde(v);
    setPage(1);
  };
  const handleFechaHasta = (e) => {
    const v = inputDateToInt(e.target.value);
    // Asegurar que hasta >= desde
    setFechaHasta(v);
    setPage(1);
  };

  const limpiarFechas = () => {
    setFechaDesde(hoy);
    setFechaHasta(hoy);
    setPage(1);
  };

  const esFiltroFechaActivo = fechaDesde !== hoy || fechaHasta !== hoy;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 text-green-600 animate-spin" />
        <span className="ml-3 text-gray-500">Cargando pedidos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      <div className="flex flex-wrap items-center gap-3">

  {/* Buscador */}
  <div className="flex-1 min-w-48 relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    <input
      type="text"
      placeholder="Buscar por N° Pedido, cliente, RUC o vendedor..."
      value={searchTerm}
      onChange={handleSearch}
      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
    />
  </div>

  {/* Desde */}
  <div className="flex items-center gap-2 text-sm text-gray-600">
    <CalendarDays className="w-4 h-4 text-gray-400 shrink-0" />
    <span className="font-medium whitespace-nowrap">Desde:</span>
    <input
      type="date"
      value={intToInputDate(fechaDesde)}
      onChange={handleFechaDesde}
      max={intToInputDate(fechaHasta) || undefined}
      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
    />
  </div>

  {/* Hasta */}
  <div className="flex items-center gap-2 text-sm text-gray-600">
    <span className="font-medium whitespace-nowrap">Hasta:</span>
    <input
      type="date"
      value={intToInputDate(fechaHasta)}
      onChange={handleFechaHasta}
      min={intToInputDate(fechaDesde) || undefined}
      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
    />
  </div>

  {/* Selector de fase */}
  <select
    value={faseFilter}
    onChange={handleFase}
    className="w-44 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
  >
    <option value="all">Todas las fases</option>
    {Object.entries(FASES)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([cod, { label }]) => (
        <option key={cod} value={cod}>{label}</option>
      ))}
  </select>

  {/* Badge rango personalizado */}
  {esFiltroFechaActivo && (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 font-medium whitespace-nowrap">
      <CalendarDays className="w-3.5 h-3.5" />
      Rango personalizado
      <button
        onClick={limpiarFechas}
        className="ml-1 text-blue-400 hover:text-blue-700 font-bold leading-none"
        aria-label="Volver a hoy"
      >
        ×
      </button>
    </div>
  )}

</div>

      {/* Contador */}
      <p className="text-sm text-gray-500">
        Mostrando <strong>{sorted.length}</strong> de <strong>{orders.length}</strong> pedidos
      </p>

      {/* Tabla */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map(({ key, label, field, thClass }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(field)}
                    className={`px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition whitespace-nowrap select-none ${thClass ?? ''}`}
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      {sortField === field && (
                        sortDir === 'asc'
                          ? <ChevronUp   className="w-3 h-3 text-green-600" />
                          : <ChevronDown className="w-3 h-3 text-green-600" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-14 text-center text-gray-400">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No se encontraron pedidos</p>
                    {esFiltroFechaActivo && (
                      <p className="text-xs mt-1">
                        Prueba ampliando el rango de fechas o{' '}
                        <button onClick={limpiarFechas} className="text-blue-500 underline">
                          volver a hoy
                        </button>
                      </p>
                    )}
                  </td>
                </tr>
              ) : paginated.map((order, idx) => (
                <tr
                  key={`${order.reg}-${idx}`}
                  className={`hover:bg-gray-50 transition-colors ${
                    order.codfase === 15 ? 'opacity-60' : ''
                  }`}
                >
                  {columns.map(({ key, renderCell }) => (
                    <td key={key} className="px-4 py-3">
                     {renderCell(order, setTrackingPedido)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <Pagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={sorted.length}
            onPage={setPage}
            onPageSize={handlePageSize}
          />
        </div>

        {/* Modal Tracking WMS */}
      {trackingPedido && (
        <WmsTrackingModal
          numeroPedido={trackingPedido}
          onClose={() => setTrackingPedido(null)}
        />
      )}
      </div>

    </div>
  );
};

export default OrdersList;