import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const fmtUSD = (v) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2
  }).format(v);

const fmtAxis = (v) => {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}K`;
  return `$${Number(v).toFixed(2)}`;
};

const WeeklyChart = ({ goals }) => {
  const data = useMemo(() => {
    const map = {};
    goals.forEach(row => {
      const key = row.METGRD || 'Sin grupo';
      if (!map[key]) map[key] = { grupo: key, meta: 0, venta: 0, metnet: 0 };
      // Parseamos con Number() preservando decimales
      map[key].meta   += Number(row.META)       || 0;
      map[key].venta  += Number(row.VENTA)      || 0;
      map[key].metnet += Number(row.METNET)     || 0;
    });
    return Object.values(map).sort((a, b) => b.venta - a.venta);
  }, [goals]);

  if (!data.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-center h-64 text-gray-400">
        Sin datos para el período seleccionado
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Ventas vs Metas por Grupo</h3>
        <p className="text-sm text-gray-500">Comparativa por línea de producto (US$)</p>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 20, bottom: 65 }}>
          <defs>
            <linearGradient id="colorMeta" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.85} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.25} />
            </linearGradient>
            <linearGradient id="colorVenta" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.85} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.25} />
            </linearGradient>
            <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#10b981" stopOpacity={0.85} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.25} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

          <XAxis
            dataKey="grupo"
            stroke="#9ca3af"
            tick={{ fontSize: 10 }}
            angle={-35}
            textAnchor="end"
            interval={0}
          />

          <YAxis
            stroke="#9ca3af"
            tick={{ fontSize: 11 }}
            tickFormatter={fmtAxis}   // ← usa decimales reales en eje
            width={65}
          />

          <Tooltip
            formatter={(value, name) => [fmtUSD(value), name]}  // ← decimales en tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              fontSize: '12px'
            }}
          />

          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />

          <Bar dataKey="meta"   fill="url(#colorMeta)"  name="Meta"        radius={[4,4,0,0]} />
          <Bar dataKey="venta"  fill="url(#colorVenta)" name="Venta Bruta"  radius={[4,4,0,0]} />
          <Bar dataKey="metnet" fill="url(#colorNet)"   name="Venta Neta"  radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyChart;
