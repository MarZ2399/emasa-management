import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { Users } from 'lucide-react';

const COLORS = ['#6366f1','#38bdf8','#34d399','#f59e0b','#f472b6','#a78bfa'];

const pctColor = (v) =>
  v >= 100 ? 'text-green-600' : v >= 70 ? 'text-yellow-600' : 'text-red-500';

const pctBg = (v) =>
  v >= 100 ? 'bg-green-50 border-green-200'
  : v >= 70 ? 'bg-yellow-50 border-yellow-200'
  : 'bg-red-50 border-red-200';

const ActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#111827" fontSize={22} fontWeight={700}>
        {payload.value}%
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#6b7280" fontSize={11}>
        {payload.name}
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 12} outerRadius={outerRadius + 16}
        startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.4} />
    </g>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  const color = value >= 100 ? '#16a34a' : value >= 70 ? '#d97706' : '#dc2626';
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-center">
      <p className="text-xs font-semibold text-gray-700 mb-1">{name}</p>
      <p className="text-xl font-bold" style={{ color }}>{value}%</p>
      <p className="text-xs text-gray-400">de meta alcanzada</p>
    </div>
  );
};

// ── Componente principal ─────────────────────────────────────
const ResultsDonut = ({ goals, nivel = 2, team = [] }) => {
  const [activeIdx, setActiveIdx] = useState(0);

  const { data, chartTitle, chartSub } = useMemo(() => {
    // ── GERENTE (nivel 0): agrupa por jefe de ventas ──────────
    if (nivel === 0 && team.length) {
      // Construir mapa VTCVEN → JVTCOD/JVTNOM desde team
      const vendorToJefe = {};
      team.forEach(v => {
        vendorToJefe[v.VTCVEN] = { cod: v.JVTCOD, nom: v.JVTNOM };
      });

      const map = {};
      goals.forEach(row => {
        const jefe = vendorToJefe[row.METVEN];
        const key  = jefe?.cod || 'Sin jefe';
        const nom  = jefe?.nom || 'Sin jefe';
        if (!map[key]) map[key] = { name: nom, meta: 0, metnet: 0 };
        map[key].meta   += Number(row.META)   || 0;
        map[key].metnet += Number(row.METNET) || 0;
      });

      return {
        chartTitle: 'Cumplimiento por Equipo',
        chartSub:   'Agrupado por Jefe de Ventas',
        data: Object.values(map)
          .map(v => ({
            name:  v.name,
            value: v.meta > 0 ? Math.round((v.metnet / v.meta) * 100) : 0,
          }))
          .filter(v => v.value > 0)
          .sort((a, b) => b.value - a.value)
          .slice(0, 6),
      };
    }

    // ── JEFE (nivel 1) o VENDEDOR: agrupa por vendedor ────────
    const map = {};
    goals.forEach(row => {
      const key = row.VTDNOC || row.VTDNOM || row.METVEN;
      if (!map[key]) map[key] = { name: key, meta: 0, metnet: 0 };
      map[key].meta   += Number(row.META)   || 0;
      map[key].metnet += Number(row.METNET) || 0;
    });

    return {
      chartTitle: 'Cumplimiento por Vendedor',
      chartSub:   '% de meta alcanzada · Top 6',
      data: Object.values(map)
        .map(v => ({
          name:  v.name,
          value: v.meta > 0 ? Math.round((v.metnet / v.meta) * 100) : 0,
        }))
        .filter(v => v.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 6),
    };
  }, [goals, nivel, team]);

  const avgPct = data.length
    ? Math.round(data.reduce((s, d) => s + d.value, 0) / data.length)
    : 0;

  if (!data.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-center h-64 text-gray-400">
        Sin datos para mostrar
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
              {chartTitle}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">{chartSub}</p>
          </div>
        </div>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${pctBg(avgPct)} ${pctColor(avgPct)}`}>
          {avgPct}%
        </span>
      </div>

      {/* Donut */}
      <div className="px-4 pt-4">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%" cy="50%"
              innerRadius={60} outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              activeIndex={activeIdx}
              activeShape={<ActiveShape />}
              onMouseEnter={(_, idx) => setActiveIdx(idx)}
              animationDuration={800}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]}
                  opacity={activeIdx === i ? 1 : 0.75} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Lista ranking */}
      <div className="px-5 pb-5 space-y-2">
        {data.map((item, i) => (
          <div
            key={item.name}
            onMouseEnter={() => setActiveIdx(i)}
            className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all
              ${activeIdx === i ? 'bg-gray-50 border-gray-200 shadow-sm' : 'border-transparent hover:bg-gray-50'}`}
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}>
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-700 truncate">{item.name}</span>
                <span className={`text-xs font-bold ml-2 flex-shrink-0 ${pctColor(item.value)}`}>
                  {item.value}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(item.value, 100)}%`, backgroundColor: COLORS[i % COLORS.length] }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsDonut;
