// src/components/billing/BillingList.jsx
import React from 'react';
import { FileText, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────────
const formatFecha = (n) => {
  if (!n) return '—';
  const s = String(n).padStart(8, '0');
  return `${s.slice(6, 8)}/${s.slice(4, 6)}/${s.slice(0, 4)}`;
};

const formatMonto = (val, prefijo = 'S/') =>
  `${prefijo} ${Number(val || 0).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// ── Columnas ───────────────────────────────────────────────────────────────────
const COLUMNS = [
  {
    key: 'nrgst', label: 'N° Reg.',
    render: (r) => (
      <span className="font-semibold text-green-700 tabular-nums">{r.nrgst ?? '—'}</span>
    ),
  },
  {
    key: 'ddcmt', label: 'F. Emisión',
    render: (r) => (
      <div className="flex items-center gap-1 text-gray-600 whitespace-nowrap">
        <CalendarDays className="w-3 h-3 opacity-50 shrink-0" />
        {formatFecha(r.ddcmt)}
      </div>
    ),
  },
  { key: 'stpdc',    label: 'Tipo Doc',  render: (r) => <span className="text-gray-600">{r.stpdc  ?? '—'}</span> },
  { key: 'nser',     label: 'Serie',     render: (r) => <span className="tabular-nums text-gray-600">{r.nser   ?? '—'}</span> },
  { key: 'ndocu',    label: 'N° Doc',    render: (r) => <span className="tabular-nums text-gray-600">{r.ndocu  ?? '—'}</span> },
  { key: 'cclte',    label: 'RUC/Doc',   render: (r) => <span className="tabular-nums text-gray-600">{r.cclte  ?? '—'}</span> },
  {
    key: 'tclte', label: 'Cliente',
    render: (r) => (
      <span className="font-medium text-gray-900 block max-w-[280px] truncate" title={r.tclte}>
        {r.tclte ?? '—'}
      </span>
    ),
  },
  { key: 'cvndr',    label: 'Vendedor',  render: (r) => <span className="text-gray-600">{r.cvndr  ?? '—'}</span> },
  {
    key: 'cmnda', label: 'Moneda',
    render: (r) => (
      <span className={`inline-block text-xs font-semibold px-1.5 py-0.5 rounded ${
        r.cmnda === 2 ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
      }`}>
        {r.cmnda === 2 ? 'USD' : 'PEN'}
      </span>
    ),
  },
  {
    key: 'isdcm', label: 'Monto',
    render: (r) => (
      <span className="tabular-nums whitespace-nowrap block text-right font-semibold text-gray-800">
        {formatMonto(r.isdcm, r.cmnda === 2 ? '$' : 'S/')}
      </span>
    ),
  },
  {
    key: 'igv', label: 'IGV',
    render: (r) => (
      <span className="tabular-nums whitespace-nowrap block text-right text-gray-500">
        {formatMonto(r.igv, r.cmnda === 2 ? '$' : 'S/')}
      </span>
    ),
  },
  { key: 'dctdocin', label: 'Tipo Ref',  render: (r) => <span className="text-gray-500 text-xs">{r.dctdocin ?? '—'}</span> },
  { key: 'dcndocin', label: 'N° Ref',    render: (r) => <span className="tabular-nums text-gray-500 text-xs">{r.dcndocin ?? '—'}</span> },
  { key: 'ssts',     label: 'Estado',    render: (r) => <span className="text-gray-600">{r.ssts   ?? '—'}</span> },
  { key: 'jvtcod',   label: 'Jefe Vta',  render: (r) => <span className="text-gray-500 text-xs">{r.jvtcod  ?? '—'}</span> },
];

// ── Componente ─────────────────────────────────────────────────────────────────
const BillingList = ({ data, total, ruc, esFiltroFechaActivo, onResetFecha }) => {
  const [sortField, setSortField] = React.useState('ddcmt');
  const [sortDir,   setSortDir]   = React.useState('desc');

  const sorted = React.useMemo(() => {
    return [...data].sort((a, b) => {
      const av = a[sortField] ?? '';
      const bv = b[sortField] ?? '';
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }, [data, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <p className="text-sm text-gray-500 mb-4">
        Mostrando <strong className="text-gray-800">{total}</strong> documento(s)
        {ruc && (
          <> para RUC <span className="font-semibold text-green-700">{ruc}</span></>
        )}
      </p>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {COLUMNS.map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700
                      uppercase tracking-wider cursor-pointer hover:bg-gray-100
                      transition whitespace-nowrap select-none"
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      {sortField === key && (
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
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-4 py-14 text-center text-gray-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No se encontraron documentos para este cliente</p>
                    {esFiltroFechaActivo && (
                      <p className="text-xs mt-1">
                        Prueba ampliando el rango de fechas o{' '}
                        <button
                          onClick={onResetFecha}
                          className="text-blue-500 underline"
                        >
                          volver a hoy
                        </button>
                      </p>
                    )}
                  </td>
                </tr>
              ) : sorted.map((row, idx) => (
                <tr
                  key={`${row.nrgst}-${idx}`}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {COLUMNS.map(({ key, render }) => (
                    <td key={key} className="px-4 py-3 whitespace-nowrap">
                      {render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingList;