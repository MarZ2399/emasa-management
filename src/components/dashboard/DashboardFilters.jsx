// src/components/dashboard/DashboardFilters.jsx
import React from 'react';
import { Filter, Eye } from 'lucide-react';
import SearchableSelect from '../common/SearchableSelect';

const MESES = [
  { value: 1,  label: 'Enero'      },
  { value: 2,  label: 'Febrero'    },
  { value: 3,  label: 'Marzo'      },
  { value: 4,  label: 'Abril'      },
  { value: 5,  label: 'Mayo'       },
  { value: 6,  label: 'Junio'      },
  { value: 7,  label: 'Julio'      },
  { value: 8,  label: 'Agosto'     },
  { value: 9,  label: 'Septiembre' },
  { value: 10, label: 'Octubre'    },
  { value: 11, label: 'Noviembre'  },
  { value: 12, label: 'Diciembre'  },
];

const NIVEL_CONFIG = {
  0: { dot: 'bg-red-500',    label: 'Gerente',        sub: 'Vista global de todos los equipos' },
  1: { dot: 'bg-yellow-400', label: 'Jefe de Ventas', sub: 'Vista de tu equipo de vendedores'  },
  2: { dot: 'bg-green-500',  label: 'Vendedor',       sub: 'Vista de tus metas personales'     },
};

const currentYear = new Date().getFullYear();
const YEARS = [
  { value: currentYear - 2, label: String(currentYear - 2) },
  { value: currentYear - 1, label: String(currentYear - 1) },
  { value: currentYear,     label: String(currentYear)     },
];

const DashboardFilters = ({ ano, mes, onAnoChange, onMesChange, nivel, vendorName }) => {
  const nivelCfg = NIVEL_CONFIG[nivel] ?? NIVEL_CONFIG[2];
  const mesLabel = MESES.find(m => m.value === mes)?.label || '';

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">

        {/* 1. Ícono + título/subtítulo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Filter className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 leading-tight">Período de consulta</p>
            <p className="text-xs text-gray-400">
              Mostrando datos de{' '}
              <span className="font-medium text-gray-600">{mesLabel} {ano}</span>
            </p>
          </div>
        </div>

        {/* Separador vertical */}
        <div className="hidden sm:block w-px h-10 bg-gray-100 flex-shrink-0" />

        {/* 2. Badge de nivel — punto + label + subtítulo apilados */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${nivelCfg.dot}`} />
            <span className="text-sm font-semibold text-gray-800">{nivelCfg.label}</span>

            {/* Si hay drill-down, mostrar nombre del vendedor inline */}
            {vendorName && (
              <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-medium ml-1">
                <Eye className="w-3 h-3" />
                {vendorName}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 pl-4">{nivelCfg.sub}</p>
        </div>

        {/* Separador vertical */}
        <div className="hidden sm:block w-px h-10 bg-gray-100 flex-shrink-0" />

        {/* 3. Selectores Año + Mes */}
        <div className="flex flex-1 items-end gap-3">
          <div className="w-36 flex-shrink-0">
            <SearchableSelect
              label="Año"
              value={ano}
              onChange={(val) => onAnoChange(Number(val))}
              options={YEARS}
              placeholder="Año..."
            />
          </div>
          <div className="flex-1">
            <SearchableSelect
              label="Mes"
              value={mes}
              onChange={(val) => onMesChange(Number(val))}
              options={MESES}
              placeholder="Mes..."
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardFilters;
