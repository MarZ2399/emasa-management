// src/components/dashboard/ResultsDonut.jsx
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const ResultsDonut = ({ data }) => {
  const resultsDistribution = useMemo(() => {
    const totals = data.reduce((acc, record) => {
      acc.sales += record.sales;
      acc.quotes += record.quotes;
      acc.followups += record.followups;
      acc.noAnswer += record.noAnswer;
      return acc;
    }, { sales: 0, quotes: 0, followups: 0, noAnswer: 0 });

    return [
      { name: 'Ventas', value: totals.sales, color: '#10b981' },
      { name: 'Cotizaciones', value: totals.quotes, color: '#3b82f6' },
      { name: 'Seguimientos', value: totals.followups, color: '#f59e0b' },
      { name: 'No Contesta', value: totals.noAnswer, color: '#ef4444' }
    ];
  }, [data]);

  const total = resultsDistribution.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Distribución de Resultados</h3>
        <p className="text-sm text-gray-500">Total de interacciones: {total}</p>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={resultsDistribution}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            animationDuration={1000}
          >
            {resultsDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {resultsDistribution.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-gray-600">{item.name}</span>
            <span className="text-xs font-bold text-gray-900 ml-auto">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsDonut;
