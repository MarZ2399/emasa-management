// src/components/dashboard/DashboardFilters.jsx
import React, { useState, useMemo } from 'react';
import { Filter, Eye, Users, X } from 'lucide-react';
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
  { value: String(currentYear - 2), label: String(currentYear - 2) },
  { value: String(currentYear - 1), label: String(currentYear - 1) },
  { value: String(currentYear),     label: String(currentYear)     },
];

const DashboardFilters = ({
  ano, mes, onAnoChange, onMesChange,
  nivel, vendorName,
  team = [],
  onSelectVendor,
  onClearVendor,
}) => {
  const nivelCfg   = NIVEL_CONFIG[nivel] ?? NIVEL_CONFIG[2];
  const mesLabel   = MESES.find(m => m.value === mes)?.label || '';
  const [selectedJefe, setSelectedJefe] = useState('');

  const jefesOptions = useMemo(() => {
    if (nivel > 1 || !team.length) return [];
    const map = {};
    team.forEach((v) => {
      if (v.JVTCOD && !map[v.JVTCOD]) map[v.JVTCOD] = v.JVTNOM || v.JVTCOD;
    });
    return Object.entries(map).map(([value, label]) => ({
      value,
      label: `${label} (${value})`,
    }));
  }, [team, nivel]);

  const vendedoresOptions = useMemo(() => {
    if (!team.length) return [];
    const fuente = nivel === 0 && selectedJefe
      ? team.filter((v) => v.JVTCOD === selectedJefe)
      : team;
    return fuente.map((v) => ({
      value: v.VTCVEN,
      label: `${v.VTDNOM} (${v.VTCVEN})`,
    }));
  }, [team, nivel, selectedJefe]);

  const handleJefeChange = (val) => {
    setSelectedJefe(val);
    onClearVendor?.();
  };

  const handleVendorChange = (val) => {
    if (!val) { onClearVendor?.(); return; }
    const found = team.find((v) => v.VTCVEN === val);
    if (found) onSelectVendor?.({ VTCVEN: found.VTCVEN, VTDNOM: found.VTDNOM });
  };

  const currentVendorValue = vendorName
    ? team.find((v) => v.VTDNOM === vendorName)?.VTCVEN || ''
    : '';

  const showTeamFilters = nivel <= 1 && team.length > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm ">

      {/* ── FILA 1 ─────────────────────────────────────────────── */}
      <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[auto_1px_auto_1px_auto] gap-x-5 gap-y-3 items-center">

        {/* Período */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Filter className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 leading-tight">Período de consulta</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Mostrando datos de{' '}
              <span className="font-semibold text-gray-600">{mesLabel} {ano}</span>
            </p>
          </div>
        </div>

        {/* Divisor vertical */}
        <div className="hidden lg:block h-10 bg-gray-100 w-px justify-self-center" />

        {/* Badge nivel */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${nivelCfg.dot}`} />
            <span className="text-sm font-semibold text-gray-800">{nivelCfg.label}</span>
            {vendorName && (
              <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                <Eye className="w-3 h-3" />
                {vendorName}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5 pl-4">{nivelCfg.sub}</p>
        </div>

        {/* Divisor vertical */}
        <div className="hidden lg:block h-10 bg-gray-100 w-px justify-self-center" />

        {/* Año + Mes */}
{nivel === 2 ? (
  // VENDEDOR → solo lectura, no puede cambiar
  <div className="flex gap-3">
    <div className="w-40 flex-shrink-0">
      <p className="text-xs font-medium text-gray-500 mb-1">Año</p>
      <div className="h-9 px-3 flex items-center bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed select-none">
        {ano}
      </div>
    </div>
    <div className="flex-1 min-w-[140px]">
      <p className="text-xs font-medium text-gray-500 mb-1">Mes</p>
      <div className="h-9 px-3 flex items-center bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed select-none">
        {mesLabel}
      </div>
    </div>
  </div>
) : (
  // JEFE / GERENTE → pueden cambiar
  <div className="flex gap-3">
    <div className="w-40 flex-shrink-0">
      <SearchableSelect
        label="Año"
        value={String(ano)}
        onChange={(val) => onAnoChange(Number(val))}
        options={YEARS}
        placeholder="Año..."
      />
    </div>
    <div className="flex-1 min-w-[140px]">
      <SearchableSelect
        label="Mes"
        value={String(mes)}
        onChange={(val) => onMesChange(Number(val))}
        options={MESES.map(m => ({ ...m, value: String(m.value) }))}
        placeholder="Mes..."
      />
    </div>
  </div>
)}
      </div>

      {/* ── FILA 2: Filtros equipo ──────────────────────────────── */}
      {showTeamFilters && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[auto_1fr_1fr_auto] gap-3 items-end">

            {/* Label */}
            <div className="flex items-center gap-2 pb-1 flex-shrink-0">
              <div className="w-7 h-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-gray-500" />
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Filtrar equipo
              </span>
            </div>

            {/* Jefe — solo gerente */}
            {nivel === 0 ? (
              <SearchableSelect
                label="Jefe de Ventas"
                value={selectedJefe}
                onChange={handleJefeChange}
                options={jefesOptions}
                placeholder="Todos los jefes"
              />
            ) : (
              <div /> // placeholder para mantener grid en nivel 1
            )}

            {/* Vendedor */}
            <SearchableSelect
              label="Vendedor"
              value={currentVendorValue}
              onChange={handleVendorChange}
              options={vendedoresOptions}
              placeholder={
                nivel === 0 && !selectedJefe
                  ? 'Selecciona un jefe primero'
                  : 'Todos los vendedores'
              }
            />

            {/* Contador + limpiar */}
            <div className="flex items-end gap-2 pb-1">
              <span className="text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-2 whitespace-nowrap">
                <span className="font-bold text-gray-700">{vendedoresOptions.length}</span>
                {' '}vend.
              </span>
              {vendorName && (
                <button
                  onClick={() => { onClearVendor?.(); setSelectedJefe(''); }}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-white hover:bg-red-500
                             border border-red-200 hover:border-red-500 bg-white
                             rounded-lg px-3 py-2 transition-all whitespace-nowrap font-medium"
                >
                  <X className="w-3 h-3" />
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFilters;
