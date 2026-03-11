import React from 'react';
import { Trophy, ChevronRight } from 'lucide-react';

const MEDAL = ['from-yellow-400 to-yellow-600', 'from-gray-300 to-gray-400', 'from-orange-400 to-orange-600'];

const AgentRanking = ({ team, nivel, onSelectVendor }) => {
  // Para gerente: agrupar por jefe
  const isGerente = nivel === 0;

  // Aplanar la lista para el ranking
  const vendedores = isGerente
    ? team  // ya viene { JVTCOD, JVTNOM, VTCVEN, VTDNOM, VTDNOC, VTAVEN }
    : team; // jefe → { VTCVEN, VTDNOM, VTDNOC, VTAVEN }

  if (!vendedores.length) return null;

  // Agrupar por jefe si es gerente
  const grouped = isGerente
    ? vendedores.reduce((acc, v) => {
        const key = v.JVTCOD;
        if (!acc[key]) acc[key] = { jefe: v.JVTNOM, miembros: [] };
        acc[key].miembros.push(v);
        return acc;
      }, {})
    : null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {isGerente ? 'Equipos de Venta' : 'Mi Equipo'}
          </h3>
          <p className="text-sm text-gray-500">
            Click en un vendedor para ver sus metas
          </p>
        </div>
      </div>

      {/* Vista GERENTE → agrupado por jefe */}
      {isGerente && grouped && (
        <div className="space-y-6">
          {Object.entries(grouped).map(([jefeCod, { jefe, miembros }]) => (
            <div key={jefeCod}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                {jefe} ({jefeCod})
              </p>
              <div className="space-y-2">
                {miembros.map((v, i) => (
                  <VendorRow
                    key={v.VTCVEN}
                    vendor={v}
                    index={i}
                    onSelect={onSelectVendor}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vista JEFE → lista plana */}
      {!isGerente && (
        <div className="space-y-3">
          {vendedores.map((v, i) => (
            <VendorRow
              key={v.VTCVEN}
              vendor={v}
              index={i}
              onSelect={onSelectVendor}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const VendorRow = ({ vendor, index, onSelect }) => (
  <button
    onClick={() => onSelect({ VTCVEN: vendor.VTCVEN, VTDNOM: vendor.VTDNOM })}
    className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-blue-50 transition-all border border-gray-100 text-left"
  >
    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${MEDAL[index] || 'from-gray-200 to-gray-300'} flex items-center justify-center text-white text-sm font-bold shadow`}>
      {index + 1}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900 truncate">{vendor.VTDNOM}</p>
      <p className="text-xs text-gray-400">{vendor.VTCVEN} · {vendor.VTAVEN || '—'}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
  </button>
);

export default AgentRanking;
