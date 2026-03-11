// src/components/dashboard/MetricCard.jsx
import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Target, DollarSign, Percent, BarChart2 } from 'lucide-react';

const ICON_CONFIG = {
  'Meta Asignada':  { icon: Target,     bg: 'bg-blue-100',   text: 'text-blue-500'   },
  'Venta Bruta':    { icon: DollarSign,  bg: 'bg-green-100',  text: 'text-green-500'  },
  'Venta Neta':     { icon: BarChart2,   bg: 'bg-purple-100', text: 'text-purple-500' },
  '% Cumplimiento': { icon: Percent,     bg: 'bg-orange-100', text: 'text-orange-400' },
};

const SUBTITLE = {
  'Meta Asignada':  'Meta del período',
  'Venta Bruta':    'Venta total',
  'Venta Neta':     'Después de devoluciones',
  '% Cumplimiento': 'Sobre la meta asignada',
};

const MetricCard = ({ title, value, target, format = 'number', color }) => {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 900;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setAnimated(end); clearInterval(timer); }
      else               { setAnimated(start); }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  const formatValue = (v) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD', minimumFractionDigits: 2,
      }).format(v);
    }
    if (format === 'percent') {
      // Muestra el valor tal cual con 2 decimales (ej: 111.15%)
      return `${Number(v).toFixed(2)}%`;
    }
    return Math.round(v).toLocaleString();
  };

  // Para Venta Neta: recalcula igual que DashboardModule (2 decimales)
  const percentage = target > 0
    ? Number(((value / target) * 100).toFixed(2))
    : null;

  const cfg      = ICON_CONFIG[title] || { icon: TrendingUp, bg: 'bg-gray-100', text: 'text-gray-500' };
  const Icon     = cfg.icon;
  const subtitle = SUBTITLE[title] || '';

  // El valor de referencia para el color: si es % Cumplimiento usa value, si es Venta Neta usa percentage
  const pctRef = format === 'percent' ? Number(value) : percentage;

  const badgeColor = pctRef === null ? null
    : pctRef >= 100 ? 'text-green-500'
    : pctRef >= 70  ? 'text-yellow-500'
    : 'text-red-400';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
      <div className="flex items-center gap-4">

        {/* Icono izquierda */}
        <div className={`w-12 h-12 rounded-2xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${cfg.text}`} />
        </div>

        {/* Contenido derecha */}
        <div className="min-w-0 flex-1">

          {/* Fila 1: título + badge */}
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="text-xs text-gray-400 font-medium truncate">{title}</p>

            {/* Badge para Venta Neta (tiene target) */}
            {percentage !== null && format !== 'percent' && (
              <div className={`flex items-center gap-0.5 text-xs font-semibold flex-shrink-0 ${badgeColor}`}>
                {percentage >= 100
                  ? <TrendingUp className="w-3 h-3" />
                  : <TrendingDown className="w-3 h-3" />}
                {percentage.toFixed(2)}%
              </div>
            )}

           
          </div>

          {/* Fila 2: valor */}
          <p className="text-lg font-bold text-gray-800 leading-tight truncate">
            {formatValue(animated)}
          </p>

          {/* Fila 3: subtítulo */}
          <p className="text-xs text-gray-400 mt-0.5 truncate">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
