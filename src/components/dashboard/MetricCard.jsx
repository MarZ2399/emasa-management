// src/components/dashboard/MetricCard.jsx
import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Target, DollarSign, Percent, BarChart2,AlertTriangle,  } from 'lucide-react';

const ICON_CONFIG = {
  'Meta Asignada':  { icon: Target,     bg: 'bg-blue-900/40',   text: 'text-blue-300'   },
  // 'Venta Bruta':    { icon: DollarSign,  bg: 'bg-green-900/40',  text: 'text-green-300'  },
  'Faltante para Meta':    { icon: AlertTriangle,  bg: 'bg-green-900/40',  text: 'text-green-300'  },
  'Venta Neta':     { icon: BarChart2,   bg: 'bg-purple-900/40', text: 'text-purple-300' },
  '% Cumplimiento': { icon: Percent,     bg: 'bg-orange-900/40', text: 'text-orange-300' },
  'Efectividad de Cartera':{ icon: Target,        bg: 'bg-teal-900/40',   text: 'text-teal-300'   }, 
  '% Efectividad':         { icon: Percent,       bg: 'bg-teal-900/40',   text: 'text-teal-300'   },
};

const SUBTITLE = {
  'Meta Asignada':  'Meta del período',
  // 'Venta Bruta':    'Venta total',
  'Faltante para Meta': 'Para alcanzar la meta',
  'Venta Neta':     'Después de devoluciones',
  '% Cumplimiento': 'Sobre la meta asignada',
  'Efectividad de Cartera': 'Clientes facturados en el período', 
  '% Efectividad':          'Sobre tu cartera asignada',   
};

const MetricCard = ({ title, value, target, format = 'number', color, pctFaltante, extra }) => {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 900;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setAnimated(end); clearInterval(timer); }
      else              { setAnimated(start); }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  const formatValue = (v) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD', minimumFractionDigits: 2,
      }).format(v);
    }
    if (format === 'percent') return `${Number(v).toFixed(2)}%`;
    return Math.round(v).toLocaleString();
  };

  const percentage = target > 0
    ? Number(((value / target) * 100).toFixed(2))
    : null;

  const cfg      = ICON_CONFIG[title] || { icon: TrendingUp, bg: 'bg-white/10', text: 'text-white/70' };
  const Icon     = cfg.icon;
  const subtitle = SUBTITLE[title] || '';

  const pctRef = format === 'percent' ? Number(value) : percentage;

  const badgeColor = pctRef === null ? null
    : pctRef >= 100 ? 'text-green-400'
    : pctRef >= 70  ? 'text-yellow-400'
    : 'text-red-400';

  return (
    <div className="bg-gradient-to-br from-[#5982A6] to-[#1a2f3d] rounded-2xl border border-white/10 shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
       <div className="flex items-center gap-4">

        {/* Icono izquierda */}
        <div className={`w-12 h-12 rounded-2xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${cfg.text}`} />
        </div>

        {/* Contenido derecha */}
        <div className="min-w-0 flex-1">

          {/* Fila 1: título + badge */}
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="text-base text-white/90 font-medium truncate">{title}</p>

            {/* Badge para Venta Neta (tiene target) */}
            {percentage !== null && format !== 'percent' && (
              <div className={`flex items-center gap-0.5 text-sm font-semibold flex-shrink-0 ${badgeColor}`}>
                {percentage >= 100
                  ? <TrendingUp  className="w-3 h-3" />
                  : <TrendingDown className="w-3 h-3" />}
                {percentage.toFixed(2)}%
              </div>
            )}
          </div>

          {/* Fila 2: valor */}
          <p className="text-2xl font-bold text-white leading-tight truncate">
            {formatValue(animated)}
          </p>

          {/* Fila 3: subtítulo */}
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-sm text-white/80 truncate">{extra ? extra : subtitle}</p>
            {pctFaltante !== undefined && (
              <span className={`text-sm font-semibold flex-shrink-0 ${
                pctFaltante === 0    ? 'text-green-400'
                : pctFaltante <= 30  ? 'text-yellow-400'
                : 'text-red-400'
              }`}>
                {pctFaltante === 0 ? '✓ Meta lograda' : `-${pctFaltante}%`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
