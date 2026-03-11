import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

const ResultsDonut = ({ goals }) => {
  // % cumplimiento por vendedor
  const data = useMemo(() => {
    const map = {};
    goals.forEach(row => {
      const key = row.VTDNOC || row.VTDNOM || row.METVEN;
      if (!map[key]) map[key] = { name: key, meta: 0, metnet: 0 };
      map[key].meta   += Number(row.META)   || 0;
      map[key].metnet += Number(row.METNET) || 0;
    });

    return Object.values(map)
      .map(v => ({
        name:  v.name,
        value: v.meta > 0 ? Math.round((v.metnet / v.meta) * 100) : 0,
      }))
      .filter(v => v.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // máximo 6 en el donut
  }, [goals]);

  if (!data.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-center h-64 text-gray-400">
        Sin datos para mostrar
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Cumplimiento por Vendedor</h3>
        <p className="text-sm text-gray-500">% de meta alcanzada</p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
            animationDuration={900}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `${v}%`} />
          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-3 space-y-2">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span className="text-xs text-gray-600 flex-1 truncate">{item.name}</span>
            <span className={`text-xs font-bold ${item.value >= 100 ? 'text-green-600' : item.value >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsDonut;
