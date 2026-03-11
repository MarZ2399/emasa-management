// src/components/dashboard/AnnualComparativeChart.jsx
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

const MESES = [
  { value: 1,  label: 'Enero' },
  { value: 2,  label: 'Febrero' },
  { value: 3,  label: 'Marzo' },
  { value: 4,  label: 'Abril' },
  { value: 5,  label: 'Mayo' },
  { value: 6,  label: 'Junio' },
  { value: 7,  label: 'Julio' },
  { value: 8,  label: 'Agosto' },
  { value: 9,  label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

const YEARS  = [2024, 2025, 2026];
const COLORS = {
  2024: '#94a3b8',   // gris azulado
  2025: '#f97316',   // naranja
  2026: '#1d4ed8',   // azul EMASA
};

// ── Tooltip personalizado ──────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-semibold text-gray-900">
            ${(entry.value / 1000).toFixed(1)}K
          </span>
        </div>
      ))}
      {/* Variación % entre 2025 y 2026 si ambos existen */}
      {payload.length >= 2 && (() => {
        const v2025 = payload.find(p => p.name === '2025')?.value || 0;
        const v2026 = payload.find(p => p.name === '2026')?.value || 0;
        if (!v2025 || !v2026) return null;
        const delta = (((v2026 - v2025) / v2025) * 100).toFixed(1);
        const color = delta >= 0 ? 'text-green-600' : 'text-red-500';
        return (
          <p className={`mt-2 pt-2 border-t border-gray-100 font-semibold ${color}`}>
            Var. vs 2025: {delta > 0 ? '+' : ''}{delta}%
          </p>
        );
      })()}
    </div>
  );
};

// ── Componente principal ───────────────────────────────────────────────
const AnnualComparativeChart = ({ data = [], loading = false }) => {
  const currentMonth = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  /**
   * data esperada del backend:
   * [
   *   { anio: 2024, mes: 2, efectivo: 42000, meta: 50000 },
   *   { anio: 2025, mes: 2, efectivo: 46000, meta: 52000 },
   *   { anio: 2026, mes: 2, efectivo: 55000, meta: 58000 },
   * ]
   */
  const chartData = useMemo(() => {
    // Agrupar por "core" o simplemente mostrar los años para el mes seleccionado
    // Si no hay cores, genera una sola barra por año
    const byYear = YEARS.map((anio) => {
      const row = data.find(d => d.anio === anio && d.mes === selectedMonth);
      return {
        anio: String(anio),
        efectivo: row?.efectivo || 0,
        meta:     row?.meta     || 0,
        logro:    row?.meta ? Math.round((row.efectivo / row.meta) * 100) : 0,
      };
    });
    return byYear;
  }, [data, selectedMonth]);

  const mesLabel = MESES.find(m => m.value === selectedMonth)?.label;

  // ── Formato eje Y ──
  const formatY = (val) => `$${(val / 1000).toFixed(0)}K`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Comparativo Anual por Mes
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Efectivo vs Meta — {mesLabel} {YEARS.join(' / ')}
          </p>
        </div>

        {/* Selector de mes */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white
                     text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                     cursor-pointer"
        >
          {MESES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          Cargando datos...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            barCategoryGap="30%"
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="anio"
              tick={{ fontSize: 13, fill: '#64748b', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatY}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
            <Legend
              formatter={(value) => (
                <span className="text-xs text-gray-600">{value}</span>
              )}
            />

            {/* Barra Efectivo por año */}
            <Bar dataKey="efectivo" name="Efectivo" radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.anio}
                  fill={COLORS[Number(entry.anio)]}
                />
              ))}
            </Bar>

            {/* Barra Meta por año — semi-transparente */}
            <Bar dataKey="meta" name="Meta" radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.anio}
                  fill={COLORS[Number(entry.anio)]}
                  fillOpacity={0.3}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Badges de % logro por año */}
      <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
        {chartData.map((row) => (
          <div key={row.anio} className="flex-1 text-center">
            <p className="text-xs text-gray-400 mb-1">{row.anio}</p>
            <span
              className={`text-sm font-bold ${
                row.logro >= 100 ? 'text-green-600' :
                row.logro >= 80  ? 'text-yellow-500' :
                row.logro > 0    ? 'text-red-500'    : 'text-gray-300'
              }`}
            >
              {row.logro > 0 ? `${row.logro}%` : '—'}
            </span>
            <p className="text-xs text-gray-400">% logro</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnualComparativeChart; 
