import React from 'react';
import { Package, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';
import TablePaginator from '../common/TablePaginator';

const PAGE_SIZE_OPTIONS = [20, 50, 100];

const formatFecha = (n) => {
  if (!n) return '—';
  const s = String(n).padStart(8, '0');
  return `${s.slice(6, 8)}/${s.slice(4, 6)}/${s.slice(0, 4)}`;
};

const formatMonto = (val) =>
  Number(val || 0).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const tipoDocLabel = (stpdc) => {
  const map = {
    F: 'FACTURA',
    B: 'BOLETA',
  };
  return map[String(stpdc || '').trim()] || (stpdc ?? '—');
};

const COLUMNS = [
  {
    key: 'cclte',
    label: 'RUC',
    render: (r) => <span className="tabular-nums text-gray-700">{r.cclte ?? '—'}</span>,
  },
  {
    key: 'csucur',
    label: 'Suc.',
    render: (r) => <span className="tabular-nums text-gray-600">{r.csucur ?? '—'}</span>,
  },
  {
    key: 'tclte',
    label: 'Razón Social',
    render: (r) => (
      <span className="font-medium text-gray-900 block max-w-[280px] truncate" title={r.tclte}>
        {r.tclte ?? '—'}
      </span>
    ),
  },
  {
    key: 'ddcmt',
    label: 'Fecha',
    render: (r) => (
      <div className="flex items-center gap-1 text-gray-600 whitespace-nowrap">
        <CalendarDays className="w-3 h-3 opacity-50 shrink-0" />
        {formatFecha(r.ddcmt)}
      </div>
    ),
  },
  {
    key: 'stpdc',
    label: 'Tipo',
    render: (r) => <span className="text-gray-600">{tipoDocLabel(r.stpdc)}</span>,
  },
  {
    key: 'ndcmt',
    label: 'Serie / Número',
    render: (r) => <span className="tabular-nums text-gray-700">{r.ndcmt ?? '—'}</span>,
  },
  {
    key: 'nritm',
    label: 'Ítem',
    render: (r) => <span className="tabular-nums text-gray-600">{r.nritm ?? '—'}</span>,
  },
  {
    key: 'qdesp',
    label: 'Cant.',
    render: (r) => (
      <span className="tabular-nums block text-right font-semibold text-gray-800">
        {formatMonto(r.qdesp)}
      </span>
    ),
  },
  {
    key: 'iprun',
    label: 'Pre. Unit',
    render: (r) => (
      <span className="tabular-nums block text-right text-gray-700">
        {formatMonto(r.iprun)}
      </span>
    ),
  },
  {
    key: 'iinet',
    label: 'Imp. Neto',
    render: (r) => (
      <span className="tabular-nums block text-right font-semibold text-green-700">
        {formatMonto(r.iinet)}
      </span>
    ),
  },
  {
    key: 'pdsc1',
    label: 'Dscto 1',
    render: (r) => <span className="tabular-nums text-gray-600">{r.pdsc1 ?? 0}</span>,
  },
  {
    key: 'pdsc2',
    label: 'Dscto 2',
    render: (r) => <span className="tabular-nums text-gray-600">{r.pdsc2 ?? 0}</span>,
  },
  {
    key: 'pdsc3',
    label: 'Dscto 3',
    render: (r) => <span className="tabular-nums text-gray-600">{r.pdsc3 ?? 0}</span>,
  },
  {
    key: 'pdsc4',
    label: 'Dscto 4',
    render: (r) => <span className="tabular-nums text-gray-600">{r.pdsc4 ?? 0}</span>,
  },
  {
    key: 'pdsc5',
    label: 'Dscto 5',
    render: (r) => <span className="tabular-nums text-gray-600">{r.pdsc5 ?? 0}</span>,
  },
  {
    key: 'cvndr',
    label: 'Vendedor',
    render: (r) => <span className="text-gray-600">{r.cvndr ?? '—'}</span>,
  },
];

const SalesHistoryList = ({ data, total, totalRaw, codigo, esFiltroFechaActivo, onResetFecha }) => {
  const [sortField, setSortField] = React.useState('ddcmt');
  const [sortDir, setSortDir] = React.useState('desc');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(PAGE_SIZE_OPTIONS[0]);

  React.useEffect(() => { setPage(1); }, [data, pageSize]);

  const sorted = React.useMemo(() => {
    return [...data].sort((a, b) => {
      const av = a[sortField] ?? '';
      const bv = b[sortField] ?? '';
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }, [data, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));

  const paginated = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const handleSort = (field) => {
    setPage(1);
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const totalCantidad = React.useMemo(
    () => sorted.reduce((sum, row) => sum + Number(row.qdesp || 0), 0),
    [sorted]
  );

  const totalImporte = React.useMemo(
    () => sorted.reduce((sum, row) => sum + Number(row.iinet || 0), 0),
    [sorted]
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          Mostrando{' '}
          <strong className="text-gray-800">
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)}
          </strong>{' '}
          de <strong className="text-gray-800">{total}</strong> registro(s)
          {codigo && (
            <> para producto <span className="font-semibold text-green-700">{codigo}</span></>
          )}
          {esFiltroFechaActivo && (
            <> <span className="text-gray-400">·</span> filtrado desde <strong>{totalRaw}</strong> total(es)</>
          )}
        </p>

        <div className="text-sm text-gray-600 flex flex-wrap gap-4">
          <span>Cantidad: <strong className="text-gray-800">{formatMonto(totalCantidad)}</strong></span>
          <span>Imp. Neto: <strong className="text-green-700">{formatMonto(totalImporte)}</strong></span>
        </div>
      </div>

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
                      uppercase tracking-wider transition whitespace-nowrap select-none
                      cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      {sortField === key && (
                        sortDir === 'asc'
                          ? <ChevronUp className="w-3 h-3 text-green-600" />
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
                  <td colSpan={COLUMNS.length} className="px-4 py-14 text-center text-gray-400">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No se encontraron ventas para este producto</p>
                    {esFiltroFechaActivo && (
                      <p className="text-xs mt-1">
                        Prueba ampliando el rango de fechas o{' '}
                        <button onClick={onResetFecha} className="text-blue-500 underline">
                          resetear filtro
                        </button>
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                paginated.map((row, idx) => (
                  <tr key={`${row.cclte}-${row.ndcmt}-${idx}`} className="hover:bg-gray-50 transition-colors">
                    {COLUMNS.map(({ key, render }) => (
                      <td key={key} className="px-4 py-3 whitespace-nowrap">
                        {render(row)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePaginator
          page={page}
          totalPages={totalPages}
          total={sorted.length}
          pageSize={pageSize}
          onPage={setPage}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageSize={(size) => { setPageSize(size); setPage(1); }}
        />
      </div>
    </div>
  );
};

export default SalesHistoryList;