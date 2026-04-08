import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * TablePaginator — paginador reutilizable para tablas
 *
 * Props:
 *  - page         {number}   página actual (1-based)
 *  - totalPages   {number}   total de páginas
 *  - total        {number}   total de registros
 *  - pageSize     {number}   registros por página
 *  - onPage       {fn}       (page: number) => void
 *  - pageSizeOptions {number[]}  opciones del selector (opcional)
 *  - onPageSize   {fn}       (size: number) => void (opcional, omite el selector si no se pasa)
 *  - showPageSize {bool}     mostrar selector filas/página (default true si onPageSize existe)
 *  - className    {string}   clases extra para el contenedor
 */
const TablePaginator = ({
  page,
  totalPages,
  total,
  pageSize,
  onPage,
  pageSizeOptions,
  onPageSize,
  className = '',
}) => {
  if (totalPages <= 1 && !onPageSize) return null;

  // Rango de páginas visibles ±2 con elipsis
  const buildRange = () => {
    const delta = 2;
    const left  = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);
    const pages = [];
    for (let i = left; i <= right; i++) pages.push(i);

    const result = [];
    if (left > 1) {
      result.push(1);
      if (left > 2) result.push('...');
    }
    result.push(...pages);
    if (right < totalPages) {
      if (right < totalPages - 1) result.push('...');
      result.push(totalPages);
    }
    return result;
  };

  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  const btnBase   = 'px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition';
  const btnActive = 'bg-[#334a5e] text-white border-[#334a5e]';

  return (
    <div className={`flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50 flex-wrap gap-2 ${className}`}>

      {/* Info texto */}
      <span className="text-xs text-gray-500 whitespace-nowrap">
        Página <span className="font-semibold">{page}</span> de{' '}
        <span className="font-semibold">{totalPages}</span>
        {' '}· {from}–{to} de <span className="font-semibold">{total}</span>
        {onPageSize && pageSizeOptions && (
          <>
            {' '}|{' '}
            <span className="inline-flex items-center gap-1 ml-1">
              Filas:
              <select
                value={pageSize}
                onChange={(e) => onPageSize(Number(e.target.value))}
                className="ml-1 border border-gray-200 rounded px-1 py-0.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#334a5e]"
              >
                {pageSizeOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </span>
          </>
        )}
      </span>

      {/* Controles de navegación */}
      <div className="flex items-center gap-1 flex-wrap">
        {/* Primera */}
        <button onClick={() => onPage(1)} disabled={page === 1} className={btnBase}>«</button>

        {/* Anterior */}
        <button onClick={() => onPage(page - 1)} disabled={page === 1} className={`${btnBase} flex items-center gap-1`}>
          <ChevronLeft className="w-3 h-3" /> Anterior
        </button>

        {/* Páginas */}
        {buildRange().map((p, i) =>
          p === '...'
            ? <span key={`e-${i}`} className="px-1.5 py-1 text-xs text-gray-400">…</span>
            : <button
                key={p}
                onClick={() => onPage(p)}
                className={`${btnBase} px-2.5 ${page === p ? btnActive : 'text-gray-700'}`}
              >
                {p}
              </button>
        )}

        {/* Siguiente */}
        <button onClick={() => onPage(page + 1)} disabled={page === totalPages} className={`${btnBase} flex items-center gap-1`}>
          Siguiente <ChevronRight className="w-3 h-3" />
        </button>

        {/* Última */}
        <button onClick={() => onPage(totalPages)} disabled={page === totalPages} className={btnBase}>»</button>
      </div>

    </div>
  );
};

export default TablePaginator;