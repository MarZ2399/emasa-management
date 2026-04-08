// src/components/billing/BillingList.jsx
import React from 'react';
import { FileText, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';
import { buildDocFilename, openPdf, downloadFile } from '../../services/billingDocsService';
import StatementButton from '../statement/StatementButton';
import Tooltip from '../common/Tooltip';
import TablePaginator from '../common/TablePaginator';
import toast from 'react-hot-toast';

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

const TIPOS_DOC = {
  '01': 'FACTURA',
  '03': 'BOLETA',
};

const PAGE_SIZE_OPTIONS = [20, 50, 100];

// ── Iconos SVG documento ───────────────────────────────────────────────────────
const IconXml = () => (
  <svg viewBox="0 0 32 40" className="w-7 h-7" fill="none">
    <rect x="1" y="1" width="24" height="32" rx="3" fill="#2196F3" />
    <polygon points="17,1 25,9 17,9" fill="#1565C0" opacity="0.6" />
    <path d="M17 1 L25 9 L25 33 Q25 34 24 34 L2 34 Q1 34 1 33 L1 2 Q1 1 2 1 Z" fill="white" opacity="0.05" />
    <text x="13" y="27" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial, sans-serif">X</text>
  </svg>
);

const IconPdf = () => (
  <svg viewBox="0 0 32 40" className="w-7 h-7" fill="none">
    <rect x="1" y="1" width="24" height="32" rx="3" fill="#F44336" />
    <polygon points="17,1 25,9 17,9" fill="#B71C1C" opacity="0.6" />
    <path d="M17 1 L25 9 L25 33 Q25 34 24 34 L2 34 Q1 34 1 33 L1 2 Q1 1 2 Z" fill="white" opacity="0.05" />
    <text x="13" y="27" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="Arial, sans-serif">PDF</text>
  </svg>
);

const IconCdr = () => (
  <svg viewBox="0 0 32 40" className="w-7 h-7" fill="none">
    <rect x="1" y="1" width="24" height="32" rx="3" fill="#2196F3" />
    <polygon points="17,1 25,9 17,9" fill="#1565C0" opacity="0.6" />
    <path d="M17 1 L25 9 L25 33 Q25 34 24 34 L2 34 Q1 34 1 33 L1 2 Q1 1 2 1 Z" fill="white" opacity="0.05" />
    <text x="13" y="27" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="Arial, sans-serif">CDR</text>
  </svg>
);

// ── Columnas ───────────────────────────────────────────────────────────────────
const COLUMNS = [
  {
    key: 'nrgst', label: 'N° Reg.',
    render: (r) => (
      <span className="font-semibold text-green-700 tabular-nums">{r.nrgst ?? '—'}</span>
    ),
  },
  {
    key: 'dctdocsn', label: 'Tipo Doc',
    render: (r) => {
      const valor = String(r['dctdocsn'] ?? '').trim();
      const label = TIPOS_DOC[valor] ?? (valor || '—');
      return <span className="text-gray-600">{label}</span>;
    },
  },
  {
    key: 'dcnsersn', label: 'Serie',
    render: (r) => <span className="tabular-nums text-gray-600">{r.dcnsersn ?? '—'}</span>,
  },
  {
    key: 'dcndocsn', label: 'Número Doc',
    render: (r) => (
      <span className="tabular-nums text-gray-600">
        {r.dcndocsn != null ? String(r.dcndocsn).padStart(8, '0') : '—'}
      </span>
    ),
  },
  {
    key: 'cclte', label: 'RUC',
    render: (r) => <span className="tabular-nums text-gray-600">{r.cclte ?? '—'}</span>,
  },
  {
    key: 'tclte', label: 'Razón Social',
    render: (r) => (
      <span className="font-medium text-gray-900 block max-w-[280px] truncate" title={r.tclte}>
        {r.tclte ?? '—'}
      </span>
    ),
  },
  {
    key: 'ddcmt', label: 'Fecha Emisión',
    render: (r) => (
      <div className="flex items-center gap-1 text-gray-600 whitespace-nowrap">
        <CalendarDays className="w-3 h-3 opacity-50 shrink-0" />
        {formatFecha(r.ddcmt)}
      </div>
    ),
  },
  {
    key: 'isdcm', label: 'Monto $',
    render: (r) => (
      <span className="tabular-nums whitespace-nowrap block text-right font-semibold text-gray-800">
        {formatMonto(r.isdcm, r.cmnda === 2 ? '$' : 'S/')}
      </span>
    ),
  },
  {
    key: 'cvndr', label: 'Vendedor',
    render: (r) => <span className="text-gray-600">{r.cvndr ?? '—'}</span>,
  },

  // ── Columna documentos ─────────────────────────────────────────────────────
  {
    key: 'acciones',
    label: 'Docs',
    render: (r) => {
      const rucEmisor = String(r.cclte    ?? '').trim();
      const tipoDoc   = String(r.dctdocsn ?? '').trim();
      const serie     = String(r.dcnsersn ?? '').trim();
      const numero    = r.dcndocsn        ?? '';

      if (!rucEmisor || !tipoDoc || !serie || !numero) {
        return <span className="text-gray-300 text-xs">—</span>;
      }

      const filenamePdf = buildDocFilename(rucEmisor, tipoDoc, serie, numero, 'pdf');
      const filenameXml = buildDocFilename(rucEmisor, tipoDoc, serie, numero, 'xml');
      const filenameCdr = buildDocFilename(rucEmisor, tipoDoc, serie, numero, 'cdr');

      const handlePdf = async () => {
        try       { await openPdf(filenamePdf); }
        catch (e) { toast.error('No se pudo abrir el PDF'); }
      };
      const handleXml = async () => {
        try       { await downloadFile(filenameXml, 'xml'); }
        catch (e) { toast.error('No se pudo descargar el XML'); }
      };
      const handleCdr = async () => {
        try       { await downloadFile(filenameCdr, 'cdr'); }
        catch (e) { toast.error('No se pudo descargar el CDR'); }
      };

      return (
        <div className="flex items-center gap-1.5">
          <Tooltip text="Descargar XML">
            <button onClick={handleXml} className="hover:opacity-70 transition-opacity active:scale-95">
              <IconXml />
            </button>
          </Tooltip>
          <Tooltip text="Ver PDF">
            <button onClick={handlePdf} className="hover:opacity-70 transition-opacity active:scale-95">
              <IconPdf />
            </button>
          </Tooltip>
          <Tooltip text="Descargar CDR">
            <button onClick={handleCdr} className="hover:opacity-70 transition-opacity active:scale-95">
              <IconCdr />
            </button>
          </Tooltip>
        </div>
      );
    },
  },
];

// ── Componente Principal ───────────────────────────────────────────────────────
const BillingList = ({ data, total, ruc, esFiltroFechaActivo, onResetFecha }) => {
  const [sortField, setSortField] = React.useState('ddcmt');
  const [sortDir,   setSortDir]   = React.useState('desc');
  const [page,      setPage]      = React.useState(1);
  const [pageSize,  setPageSize]  = React.useState(PAGE_SIZE_OPTIONS[0]);

  // Reset a página 1 cuando cambian los datos o el tamaño de página
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
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          Mostrando{' '}
          <strong className="text-gray-800">
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)}
          </strong>
          {' '}de <strong className="text-gray-800">{total}</strong> documento(s)
          {ruc && (
            <> para RUC <span className="font-semibold text-green-700">{ruc}</span></>
          )}
        </p>
        {ruc && <StatementButton ruc={ruc} disabled={!ruc} />}
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {COLUMNS.map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => key !== 'acciones' && handleSort(key)}
                    className={`px-4 py-3 text-left text-xs font-semibold text-gray-700
                      uppercase tracking-wider transition whitespace-nowrap select-none
                      ${key !== 'acciones' ? 'cursor-pointer hover:bg-gray-100' : 'cursor-default'}`}
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      {sortField === key && key !== 'acciones' && (
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
                  <td colSpan={COLUMNS.length} className="px-4 py-14 text-center text-gray-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No se encontraron documentos para este cliente</p>
                    {esFiltroFechaActivo && (
                      <p className="text-xs mt-1">
                        Prueba ampliando el rango de fechas o{' '}
                        <button onClick={onResetFecha} className="text-blue-500 underline">
                          volver a hoy
                        </button>
                      </p>
                    )}
                  </td>
                </tr>
              ) : paginated.map((row, idx) => (
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

        {/* ── Paginador reutilizable ── */}
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

export default BillingList;