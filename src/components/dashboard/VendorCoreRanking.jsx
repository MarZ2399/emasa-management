import { useMemo, useState } from 'react';
import { Award, TrendingUp } from 'lucide-react';

const MESES = ['','Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export default function VendorCoreRanking({ goals, mes, ano }) {
  const [activeVendor, setActiveVendor] = useState(null); // toggle click

  const vendorStats = useMemo(() => {
    const byVendor = {};

    goals.forEach(row => {
      const vKey = row.METVEN;
      if (!byVendor[vKey]) {
        byVendor[vKey] = {
          codigo: row.METVEN,
          nombre: row.VTDNOM,
          cores:  {},
        };
      }
      const cKey = row.METGRP;
      if (!byVendor[vKey].cores[cKey]) {
        byVendor[vKey].cores[cKey] = { meta: 0, metnet: 0, nombre: row.METGRD };
      }
      byVendor[vKey].cores[cKey].meta   += Number(row.META)   || 0;
      byVendor[vKey].cores[cKey].metnet += Number(row.METNET) || 0;
    });

    return Object.values(byVendor).map(v => {
      const coresArr = Object.values(v.cores).map(c => ({
        ...c,
        pct: c.meta > 0 ? (c.metnet / c.meta) * 100 : 0,
      }));
      const completados = coresArr.filter(c => c.pct >= 100);
      const pendientes  = coresArr.filter(c => c.pct < 100);
      const total       = coresArr.length;
      const metaTotal   = coresArr.reduce((s, c) => s + c.meta,   0);
      const netTotal    = coresArr.reduce((s, c) => s + c.metnet, 0);
      const pctMeta     = metaTotal > 0 ? (netTotal / metaTotal) * 100 : 0;

      return {
        ...v,
        completados,
        pendientes,
        total,
        pctCores: total > 0 ? (completados.length / total) * 100 : 0,
        pctMeta,
      };
    })
    .sort((a, b) =>
      b.completados.length !== a.completados.length
        ? b.completados.length - a.completados.length
        : b.pctMeta - a.pctMeta
    );
  }, [goals]);

  const maxCores  = vendorStats[0]?.total ?? 8;
  const mesLabel  = MESES[mes] || mes;

  if (!vendorStats.length) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">

     {/* Header */}
<div className="px-6 py-4 bg-gradient-to-r from-[#5982A6] to-[#1a2f3d] flex items-center justify-between">
  <div>
    <h3 className="text-base font-bold text-white uppercase tracking-wide">
      Ranking de Vendedor por Core
    </h3>
    <p className="text-xs text-white/60 mt-0.5">{mesLabel} {ano}</p>
  </div>
  <div className="flex items-center gap-4 text-xs text-white/80">
    <span className="flex items-center gap-1.5">
      <span className="w-3 h-3 rounded-sm bg-green-400 inline-block" /> Completados
    </span>
    <span className="flex items-center gap-1.5">
      <span className="w-3 h-3 rounded-sm bg-white/30 inline-block" /> Pendientes
    </span>
  </div>
</div>

      {/* Filas */}
      <div className="px-6 py-4 space-y-4">
        {vendorStats.map((v, i) => {
          const nComp    = v.completados.length;
          const barPct   = (nComp / maxCores) * 100;
          const barColor =
            nComp === maxCores        ? 'bg-gradient-to-r from-[#16a34a] to-[#4ade80]'
  : nComp >= maxCores * 0.5 ? 'bg-gradient-to-r from-[#15803d] to-[#22c55e]'
  : nComp > 0               ? 'bg-gradient-to-r from-[#166534] to-[#16a34a]'
  : 'bg-gray-200';
          const medalColor =
            i === 0 ? 'text-[#4ade80]'   // verde brillante
  : i === 1 ? 'text-[#22c55e]' // verde medio
  : i === 2 ? 'text-[#16a34a]' // verde oscuro
  : 'text-gray-300';
          const isActive = activeVendor === v.codigo;

          return (
            <div key={v.codigo}>
              <div className="flex items-center gap-3">

                {/* Posición */}
                <div className="w-7 text-center flex-shrink-0">
                  {i < 3
                    ? <Award className={`w-5 h-5 mx-auto ${medalColor}`} />
                    : <span className="text-sm text-gray-400 font-mono font-bold">{i + 1}</span>
                  }
                </div>

                {/* Nombre */}
                <div className="w-60 flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-800 truncate" title={v.nombre}>
                    {v.nombre}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">{v.codigo}</p>
                </div>

                {/* Barra clicable */}
                <div className="flex-1 flex items-center gap-3">
                  <div
                    className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden cursor-pointer group relative"
                    onClick={() => setActiveVendor(isActive ? null : v.codigo)}
                    title="Click para ver cores completados"
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 group-hover:opacity-80 ${barColor}`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>

                  {/* Conteo */}
                  <span className={`text-sm font-bold w-12 text-right flex-shrink-0 ${
  nComp === maxCores ? 'text-green-500'
  : nComp > 0       ? 'text-green-600'
  : 'text-gray-400'
}`}>
  {nComp}/{v.total}
</span>
                </div>

                {/* % Meta */}
                <div className="w-16 text-right flex-shrink-0">
                  <span className={`text-sm font-bold ${
                    v.pctMeta >= 100 ? 'text-green-600'
                    : v.pctMeta >= 70 ? 'text-yellow-600'
                    : 'text-red-500'
                  }`}>
                    {v.pctMeta.toFixed(1)}%
                  </span>
                  <p className="text-xs text-gray-400">meta</p>
                </div>
              </div>

              {/* Panel expandible con cores completados */}
              {isActive && (
                <div className="ml-10 mt-2 bg-gray-900 text-white text-xs rounded-xl px-4 py-3
                                shadow-xl border border-white/10 animate-fade-in">

                  {/* Cores completados */}
                  {v.completados.length > 0 && (
                    <>
                      <p className="font-bold text-gray-300 uppercase tracking-wide text-[11px] mb-2">
                        Cores al 100%:
                      </p>
                      {v.completados.map(c => (
                        <div key={c.nombre}
                          className="flex items-center gap-2 py-1 border-b border-white/5 last:border-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                          <span className="flex-1 truncate">{c.nombre}</span>
                          <span className="text-green-400 font-bold ml-2">
                            {c.pct.toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Cores pendientes */}
                  {v.pendientes.length > 0 && (
                    <>
                      <p className="font-bold text-gray-300 uppercase tracking-wide text-[11px] mt-3 mb-2">
                        Pendientes:
                      </p>
                      {v.pendientes.map(c => (
                        <div key={c.nombre}
                          className="flex items-center gap-2 py-1 border-b border-white/5 last:border-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                          <span className="flex-1 truncate">{c.nombre}</span>
                          <span className="text-yellow-300 font-bold ml-2">
                            {c.pct.toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </>
                  )}

                  {v.completados.length === 0 && (
                    <p className="text-gray-400 text-xs">Ningún core completado aún.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
        <TrendingUp className="w-3.5 h-3.5" />
        <span>
          {vendorStats.filter(v => v.completados.length > 0).length} de {vendorStats.length} vendedores
          con al menos 1 core completado · Click en barra para ver detalle
        </span>
      </div>
    </div>
  );
}