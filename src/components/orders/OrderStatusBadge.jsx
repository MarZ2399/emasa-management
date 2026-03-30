import React from 'react';

// Fases reales de VT2000.PEDFASES — reemplaza el uso de ordersData
const FASE_CONFIG = {
  50: { label: 'FACTURADO',   color: 'green'  },
  45: { label: 'PICKEADO',    color: 'teal'   },
  40: { label: 'EN ALMACÉN',  color: 'blue'   },
  30: { label: 'OBS CXC',     color: 'amber'  },
  20: { label: 'OBS VTA',     color: 'orange' },
  15: { label: 'ANULADO',     color: 'red'    },
   5: { label: 'ABR/RCH VTA', color: 'pink'   },
};

const COLOR_CLASSES = {
  green:  'bg-green-100  text-green-800  border-green-300',
  teal:   'bg-teal-100   text-teal-800   border-teal-300',
  blue:   'bg-blue-100   text-blue-800   border-blue-300',
  amber:  'bg-amber-100  text-amber-800  border-amber-300',
  orange: 'bg-orange-100 text-orange-800 border-orange-300',
  red:    'bg-red-100    text-red-800    border-red-300',
  pink:   'bg-pink-100   text-pink-800   border-pink-300',
  gray:   'bg-gray-100   text-gray-600   border-gray-300',
};

const SIZE_CLASSES = {
  sm: 'px-2    py-0.5 text-xs',
  md: 'px-2.5  py-1   text-xs',
  lg: 'px-4    py-1.5 text-sm',
};

const OrderStatusBadge = ({ codfase, size = 'md' }) => {
  const config = FASE_CONFIG[codfase] ?? {
    label: `FASE ${codfase ?? '—'}`,
    color: 'gray',
  };

  return (
    <span className={`
      inline-flex items-center rounded-full font-semibold border whitespace-nowrap
      ${COLOR_CLASSES[config.color]}
      ${SIZE_CLASSES[size] ?? SIZE_CLASSES.md}
    `}>
      {config.label}
    </span>
  );
};

export default OrderStatusBadge;
