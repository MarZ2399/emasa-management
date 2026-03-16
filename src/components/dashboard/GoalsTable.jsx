import React, { useMemo, useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const MESES = ['', 'Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const fmt = (v) =>
  Number(v || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const pctColor = (v) => {
  const n = Number(v || 0);
  if (n >= 100) return 'text-green-600 font-bold';
  if (n >= 70)  return 'text-yellow-600 font-semibold';
  return 'text-red-500 font-semibold';
};

const GoalsTable = ({ goals, mes, ano, vendorName, nivelAcceso }) => {
  const [sortKey, setSortKey]   = useState('METGRD');
  const [sortDir, setSortDir]   = useState('asc');

  const mesLabel = MESES[mes] || mes;

  // ── Agrupar por grupo de producto (METGRD) ──────────────────────
  const rows = useMemo(() => {
    const map = {};
    goals.forEach(row => {
      const key = row.METGRD || 'Sin grupo';
      if (!map[key]) {
        map[key] = {
          descripcion: key,
          meta:        0,
          venta:       0,
          devolucion:  0,
          metnet:      0,
          metpor:      0,
          count:       0,
        };
      }
      map[key].meta       += Number(row.META)       || 0;
      map[key].venta      += Number(row.VENTA)      || 0;
      map[key].devolucion += Number(row.DEVOLUCION) || 0;
      map[key].metnet     += Number(row.METNET)     || 0;
      map[key].count      += 1;
    });

    // Recalcular % logro sobre los totales agrupados
    return Object.values(map).map(r => ({
      ...r,
      metpor: r.meta > 0 ? (r.metnet / r.meta) * 100 : 0,
    }));
  }, [goals]);

  // ── Totales ─────────────────────────────────────────────────────
  const totals = useMemo(() =>
    rows.reduce((acc, r) => ({
      meta:       acc.meta       + r.meta,
      venta:      acc.venta      + r.venta,
      devolucion: acc.devolucion + r.devolucion,
      metnet:     acc.metnet     + r.metnet,
    }), { meta: 0, venta: 0, devolucion: 0, metnet: 0 }),
  [rows]);

  const totalPct = totals.meta > 0
    ? (totals.metnet / totals.meta) * 100
    : 0;

  // ── Ordenamiento ────────────────────────────────────────────────
  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (typeof va === 'string') {
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortDir === 'asc' ? va - vb : vb - va;
    });
  }, [rows, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }) => {
  if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
  return sortDir === 'asc'
    ? <ArrowUp   className="w-3 h-3 text-white" />  // ← antes text-blue-600
    : <ArrowDown className="w-3 h-3 text-white" />;  // ← antes text-blue-600
};

  const ThBtn = ({ col, label }) => (
  <th
    onClick={() => handleSort(col)}
    className="px-4 py-3 text-right text-xs font-semibold text-white/90 uppercase tracking-wider cursor-pointer hover:text-white select-none whitespace-nowrap"
  >
    <div className="flex items-center justify-end gap-1">
      {label}
      <SortIcon col={col} />
    </div>
  </th>
);

  if (!goals.length) return null;

  // ── Título dinámico según nivel ──────────────────────────────────
  const title = vendorName
    ? `Seguimiento de Avance por Core Business — ${vendorName}`
    : nivelAcceso <= 1
    ? `Seguimiento Consolidado de Equipo`
    : `Seguimiento de Avance por Core Business`;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">

      {/* Header de la tabla */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
            {title}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {mesLabel} {ano} US$
          </p>
        </div>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
          totalPct >= 100
            ? 'bg-green-100 text-green-700'
            : totalPct >= 70
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-red-100 text-red-600'
        }`}>
          {fmt(totalPct)}% total
        </span>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-[#5982A6] to-[#1a2f3d]">
  <tr>
    <th
      onClick={() => handleSort('descripcion')}
      className="px-4 py-3 text-left text-xs font-semibold text-white/90 uppercase tracking-wider cursor-pointer hover:text-white select-none"
    >
      <div className="flex items-center gap-1">
        Descripción <SortIcon col="descripcion" />
      </div>
    </th>
    <ThBtn col="meta"       label={`Meta ${mesLabel} US$`} />
    <ThBtn col="venta"      label={`Ventas ${mesLabel} US$`} />
    <ThBtn col="devolucion" label={`Devolución ${mesLabel} US$`} />
    <ThBtn col="metnet"     label={`Efectivo ${mesLabel} US$`} />
    <ThBtn col="metpor"     label="% Logro US$" />
  </tr>
</thead>

          <tbody className="divide-y divide-gray-100">
            {sorted.map((row, i) => (
              <tr
                key={row.descripcion}
                className={`hover:bg-blue-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
              >
                <td className="px-4 py-3 font-medium text-gray-800">{row.descripcion}</td>
                <td className="px-4 py-3 text-right text-gray-700">{fmt(row.meta)}</td>
                <td className="px-4 py-3 text-right text-gray-700">{fmt(row.venta)}</td>
                <td className="px-4 py-3 text-right text-gray-700">{fmt(row.devolucion)}</td>
                <td className="px-4 py-3 text-right text-gray-700">{fmt(row.metnet)}</td>
                <td className={`px-4 py-3 text-right ${pctColor(row.metpor)}`}>
                  {fmt(row.metpor)}
                </td>
              </tr>
            ))}
          </tbody>

          {/* Fila de totales */}
          <tfoot>
            <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
              <td className="px-4 py-3 text-gray-900">Totales</td>
              <td className="px-4 py-3 text-right text-gray-900">{fmt(totals.meta)}</td>
              <td className="px-4 py-3 text-right text-gray-900">{fmt(totals.venta)}</td>
              <td className="px-4 py-3 text-right text-gray-900">{fmt(totals.devolucion)}</td>
              <td className="px-4 py-3 text-right text-gray-900">{fmt(totals.metnet)}</td>
              <td className={`px-4 py-3 text-right ${pctColor(totalPct)}`}>
                {fmt(totalPct)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default GoalsTable;
