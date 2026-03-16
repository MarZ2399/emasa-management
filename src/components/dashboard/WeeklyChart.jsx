import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import { BarChart2 } from 'lucide-react';

const fmtUSD = (v) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(v);

const fmtAxis = (v) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
};

// ── Tooltip personalizado ────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const meta   = payload.find(p => p.dataKey === 'meta')?.value   || 0;
  const venta  = payload.find(p => p.dataKey === 'venta')?.value  || 0;
  const metnet = payload.find(p => p.dataKey === 'metnet')?.value || 0;
  const pct    = meta > 0 ? ((metnet / meta) * 100).toFixed(1) : 0;
  const pctColor = pct >= 100 ? '#16a34a' : pct >= 70 ? '#d97706' : '#dc2626';

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-4 min-w-[200px]">
      <p className="text-sm font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">{label}</p>
      <div className="space-y-1.5">
        <div className="flex justify-between gap-4">
          <span className="text-xs text-gray-500 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#6366f1] inline-block" /> Meta
          </span>
          <span className="text-xs font-semibold text-gray-700">{fmtUSD(meta)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-xs text-gray-500 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#38bdf8] inline-block" /> Venta Bruta
          </span>
          <span className="text-xs font-semibold text-gray-700">{fmtUSD(venta)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-xs text-gray-500 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#34d399] inline-block" /> Venta Neta
          </span>
          <span className="text-xs font-semibold text-gray-700">{fmtUSD(metnet)}</span>
        </div>
        <div className="flex justify-between gap-4 pt-2 border-t border-gray-100 mt-1">
          <span className="text-xs text-gray-500 font-medium">% Logro</span>
          <span className="text-xs font-bold" style={{ color: pctColor }}>{pct}%</span>
        </div>
      </div>
    </div>
  );
};

// ── Leyenda personalizada ────────────────────────────────────
const CustomLegend = () => (
  <div className="flex items-center justify-center gap-6 mt-2">
    {[
      { color: '#6366f1', label: 'Meta' },
      { color: '#38bdf8', label: 'Venta Bruta' },
      { color: '#34d399', label: 'Venta Neta' },
    ].map(({ color, label }) => (
      <div key={label} className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
    ))}
  </div>
);

// ── Componente principal ─────────────────────────────────────
const WeeklyChart = ({ goals }) => {
  const data = useMemo(() => {
    const map = {};
    goals.forEach(row => {
      const key = row.METGRD || 'Sin grupo';
      if (!map[key]) map[key] = { grupo: key, meta: 0, venta: 0, metnet: 0 };
      map[key].meta   += Number(row.META)   || 0;
      map[key].venta  += Number(row.VENTA)  || 0;
      map[key].metnet += Number(row.METNET) || 0;
    });
    return Object.values(map).sort((a, b) => b.meta - a.meta);
  }, [goals]);

  // % logro global para el badge
  const totalMeta   = data.reduce((s, r) => s + r.meta,   0);
  const totalMetnet = data.reduce((s, r) => s + r.metnet, 0);
  const globalPct   = totalMeta > 0 ? ((totalMetnet / totalMeta) * 100).toFixed(1) : 0;
  const badgeBg     = globalPct >= 100 ? 'bg-green-100 text-green-700'
                    : globalPct >= 70  ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-600';

  if (!data.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-center h-64 text-gray-400">
        Sin datos para el período seleccionado
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
              Ventas vs Metas por Core
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Comparativa por línea de producto (US$)</p>
          </div>
        </div>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${badgeBg}`}>
          {globalPct}% logro
        </span>
      </div>

      {/* Chart */}
      <div className="px-4 pt-4 pb-2">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 10, left: 10, bottom: 70 }}
            barCategoryGap="25%"
            barGap={3}
          >
            <defs>
              <linearGradient id="gMeta"   x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#6366f1" stopOpacity={1}   />
                <stop offset="100%" stopColor="#818cf8" stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id="gVenta"  x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#38bdf8" stopOpacity={1}   />
                <stop offset="100%" stopColor="#7dd3fc" stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id="gMetnet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#34d399" stopOpacity={1}   />
                <stop offset="100%" stopColor="#6ee7b7" stopOpacity={0.7} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />

            <XAxis
              dataKey="grupo"
              stroke="#d1d5db"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              angle={-35}
              textAnchor="end"
              interval={0}
              tickLine={false}
            />

            <YAxis
              stroke="#d1d5db"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickFormatter={fmtAxis}
              width={60}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb', radius: 4 }} />

            <Bar dataKey="meta"   fill="url(#gMeta)"   name="Meta"       radius={[4,4,0,0]} maxBarSize={28} />
            <Bar dataKey="venta"  fill="url(#gVenta)"  name="Venta Bruta" radius={[4,4,0,0]} maxBarSize={28} />
            <Bar dataKey="metnet" fill="url(#gMetnet)" name="Venta Neta" radius={[4,4,0,0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>

        <CustomLegend />
      </div>
    </div>
  );
};

export default WeeklyChart;
