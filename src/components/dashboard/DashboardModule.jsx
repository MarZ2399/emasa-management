import React, { useState, useEffect, useContext, useCallback } from 'react';
import { TrendingUp, Calendar, Award, ChevronLeft } from 'lucide-react';
import MetricCard from './MetricCard';
import WeeklyChart from './WeeklyChart';
import AgentRanking from './AgentRanking';
import ResultsDonut from './ResultsDonut';
import DashboardFilters from './DashboardFilters';
import GoalsTable from './GoalsTable';
import SectionHeader from '../common/SectionHeader';
import { followService } from '../../services/followService';
import { AuthContext } from '../../context/AuthContext';
import CreditRanking from './CreditRanking'; 
import VendorCoreRanking from './VendorCoreRanking';

const DashboardModule = () => {
  const { user } = useContext(AuthContext);

  const nivel     = user?.nivel_acceso ?? 2;
  const codigoSis = user?.codigo_sis   || null;

  // ── Filtros ───────────────────────────────────────────────────
  const now = new Date();
  const [ano, setAno] = useState(now.getFullYear());
  const [mes, setMes] = useState(now.getMonth() + 1);

  // ── Drill-down ────────────────────────────────────────────────
  const [selectedVendor, setSelectedVendor] = useState(null); // { VTCVEN, VTDNOM }
  const [selectedCore,   setSelectedCore]   = useState(null); 

  // ── Data ──────────────────────────────────────────────────────
  const [goals,   setGoals]   = useState([]);
  const [team,    setTeam]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [vendorKpis, setVendorKpis] = useState({ clientesFacturados: 0, clientesCartera: 0 });


  // ── Cargar metas ──────────────────────────────────────────────
  const loadGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (selectedVendor) {
        res = await followService.getGoalsByVendor(selectedVendor.VTCVEN, { ano, mes });
      } else {
        res = await followService.getGoals({ ano, mes });
      }
      setGoals(res.data || []);
    } catch (err) {
      console.error('Error cargando metas:', err);
      setError('No se pudieron cargar los datos de seguimiento.');
    } finally {
      setLoading(false);
    }
  }, [ano, mes, selectedVendor]);

  const handleCoreClick = useCallback((core) => {
  setSelectedCore(prev =>
    prev?.METGRP === core.METGRP ? null : core
  );
}, []);

  // ── Cargar equipo (jefe/gerente) ──────────────────────────────
  const loadTeam = useCallback(async () => {
    if (nivel >= 2) return;
    try {
      const res = await followService.getTeam();
      setTeam(res.data || []);
    } catch (err) {
      console.error('Error cargando equipo:', err);
    }
  }, [nivel]);

  const loadVendorKpis = useCallback(async () => {
  // Cargar si es vendedor propio, O si hay drill-down activo
  if (nivel !== 2 && !selectedVendor) return;
  try {
    const codigoVendor = selectedVendor ? selectedVendor.VTCVEN : null;
    const res = await followService.getVendorClientKpis({ ano, mes, codigo: codigoVendor });
    setVendorKpis(res.data || { clientesFacturados: 0, clientesCartera: 0 });
  } catch (err) {
    console.error('Error cargando KPIs vendedor:', err);
  }
}, [nivel, ano, mes, selectedVendor]);

  useEffect(() => { loadGoals(); }, [loadGoals]);
  useEffect(() => { loadTeam();  }, [loadTeam]);
  useEffect(() => { loadVendorKpis();  }, [loadVendorKpis]);

  // ── Métricas agregadas ────────────────────────────────────────
  const metrics = goals.reduce(
    (acc, row) => {
      acc.meta   += Number(row.META)        || 0;
      acc.venta  += Number(row.VENTA)       || 0;
      acc.devol  += Number(row.DEVOLUCION)  || 0;
      acc.metnet += Number(row.METNET)      || 0;
      return acc;
    },
    { meta: 0, venta: 0, devol: 0, metnet: 0 }
  );

  const faltante = Math.max(0, metrics.meta - metrics.metnet);
  
  const cumplimiento = metrics.meta > 0
  ? Number(((metrics.metnet / metrics.meta) * 100).toFixed(2))
  : 0;

  const faltantePct = metrics.meta > 0
  ? Math.max(0, Number((100 - cumplimiento).toFixed(2)))
  : 0;

// ── Cores completados (agrupado por METGRP) ───────────────────
const coresPorGrupo = goals.reduce((acc, row) => {
  const key = row.METGRP;
  if (!acc[key]) acc[key] = { METGRP: key, METGRD: row.METGRD, meta: 0, metnet: 0 };
  acc[key].meta   += Number(row.META)   || 0;
  acc[key].metnet += Number(row.METNET) || 0;
  return acc;
}, {});

const coresGrupos     = Object.values(coresPorGrupo).map(c => ({
  ...c,
  pct: c.meta > 0 ? (c.metnet / c.meta) * 100 : 0,
}));
const coresCompletados = coresGrupos.filter(c => c.pct >= 100);
const coresTotal       = coresGrupos.length;

  const currentDate = now.toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // ── Título dinámico ───────────────────────────────────────────
  const title = selectedVendor
    ? `Metas de ${selectedVendor.VTDNOM}`
    : nivel === 0 ? 'Dashboard General'
    : nivel === 1 ? 'Mi Equipo'
    : 'Mis Metas';

  return (
    <div className="space-y-6">

      {/* Header */}
      <SectionHeader
        icon={TrendingUp}
        title={title}
        subtitle={
          <div className="flex items-center gap-2 text-blue-100">
            <Calendar className="w-4 h-4" />
            <span className="capitalize">{currentDate}</span>
          </div>
        }
        showButton={false}
        
        gradientFrom="from-[#334a5e]"
        gradientTo="to-[#2ecc70]"
      />

      {/* Botón volver drill-down */}
      {selectedVendor && (
        <button
          onClick={() => setSelectedVendor(null)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver al equipo
        </button>
      )}

      {/* Filtros año/mes */}
      <DashboardFilters
        ano={ano}
        mes={mes}
        onAnoChange={setAno}
        onMesChange={setMes}
        nivel={nivel}
        vendorName={selectedVendor?.VTDNOM || null}
        team={team}                                   // ← ¿está esto?
  onSelectVendor={setSelectedVendor}            // ← ¿está esto?
  onClearVendor={() => setSelectedVendor(null)}
      />

      {/* Estado de carga */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          <span className="ml-3 text-gray-500">Cargando datos AS400...</span>
        </div>
      )}

      {/* Estado de error */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Contenido principal */}
      {!loading && !error && (
        <>
          {/* Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(nivel === 2 || selectedVendor) ? (
  <MetricCard
    title="% Efectividad Cartera"
    value={
      vendorKpis.clientesCartera > 0
        ? Number(((vendorKpis.clientesFacturados / vendorKpis.clientesCartera) * 100).toFixed(2))
        : 0
    }
    format="percent"
    extra={`${vendorKpis.clientesFacturados} de ${vendorKpis.clientesCartera} clientes asignados`}
    color={
      vendorKpis.clientesCartera === 0                                         ? 'from-gray-400 to-gray-500'
      : vendorKpis.clientesFacturados / vendorKpis.clientesCartera >= 0.6     ? 'from-green-500 to-green-600'
      : vendorKpis.clientesFacturados / vendorKpis.clientesCartera >= 0.3     ? 'from-yellow-500 to-yellow-600'
      : 'from-red-500 to-red-600'
    }
  />
) : (
  <MetricCard
    title="Meta Asignada"
    value={metrics.meta}
    format="currency"
    color="from-blue-500 to-blue-600"
  />
)}
            {/* <MetricCard
              title="Venta Bruta"
              value={metrics.venta}
              format="currency"
              color="from-green-500 to-green-600"
            /> */}
            <MetricCard
              title="Venta Neta"
              value={metrics.metnet}
              target={metrics.meta}
              format="currency"
              color="from-purple-500 to-purple-600"
            />
            <MetricCard
              title="Faltante para Meta"       // ← nuevo título
              value={faltante}                  // ← nuevo valor
              pctFaltante={faltantePct} 
              format="currency"
              color={
                faltante === 0              ? 'from-green-500 to-green-600'   // meta cumplida
                : faltante <= metrics.meta * 0.3 ? 'from-yellow-500 to-yellow-600' // falta poco (≤30%)
                : 'from-red-500 to-red-600'                                         // falta bastante
              }
            />
            {/* KPI Cores Completados — con tooltip hover */}
<div className="relative group bg-gradient-to-br from-[#5982A6] to-[#1a2f3d] rounded-2xl border border-white/10 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 cursor-default">
  <div className="flex items-center gap-4">

    {/* Icono */}
    <div className="w-12 h-12 rounded-2xl bg-orange-900/40 flex items-center justify-center flex-shrink-0">
      <Award className="w-6 h-6 text-orange-300" />
    </div>

    {/* Contenido */}
    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between gap-2 mb-0.5">
        <p className="text-base text-white/90 font-medium truncate">Cores Completados</p>
        <span className={`text-sm font-semibold flex-shrink-0 ${
          coresTotal > 0 && coresCompletados.length === coresTotal
            ? 'text-green-400' : 'text-orange-300'
        }`}>
          {coresTotal > 0
            ? `${Math.round((coresCompletados.length / coresTotal) * 100)}%`
            : '0%'}
        </span>
      </div>

      <p className="text-2xl font-bold text-white leading-tight">
        {coresCompletados.length}
        <span className="text-base font-normal text-white/60 ml-1">/ {coresTotal}</span>
      </p>

      <p className="text-sm text-white/80 mt-0.5">
        {coresCompletados.length === 0
          ? 'Ningún core al 100% aún'
          : coresCompletados.length === coresTotal
          ? '¡Todos los cores completados!'
          : 'Pasa el cursor para ver cuáles'}
      </p>
    </div>
  </div>

  {/* Tooltip */}
  {coresCompletados.length > 0 && (
    <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block
                    bg-gray-900 text-white text-xs rounded-xl p-3
                    shadow-2xl z-50 min-w-[200px] border border-white/10">
      <p className="font-bold mb-2 text-gray-300 uppercase tracking-wide text-[10px]">
        Cores al 100%:
      </p>
      {coresCompletados.map(c => (
  <div key={c.METGRP} className="flex items-center gap-2 py-1 border-b border-white/5 last:border-0">
    <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
    <span className="flex-1 truncate">{c.METGRD}</span>
    <span className="text-green-400 font-bold ml-2">
      {c.pct.toFixed(0)}%
    </span>
  </div>
))}
    </div>
  )}
</div>
          </div>

          {/* Tabla de avance por Core Business */}
          {/* Tabla de avance por Core Business */}
          <GoalsTable
            goals={goals}
            mes={mes}
            ano={ano}
            vendorName={selectedVendor?.VTDNOM || null}
            nivelAcceso={nivel}
            onRowClick={(nivel === 2 || (nivel < 2 && selectedVendor !== null)) ? handleCoreClick : null}
            selectedCore={selectedCore}                                             // ← AGREGAR
          />

          {nivel === 1 && !selectedVendor && (
  <VendorCoreRanking
    goals={goals}
    mes={mes}
    ano={ano}
  />
)}

          {/* Ranking de crédito por core — solo vista vendedor */}
          {(nivel === 2 || selectedVendor) && (                                    // ← AGREGAR BLOQUE
            <CreditRanking
              selectedCore={selectedCore}
              codigoVendor={selectedVendor?.VTCVEN || null} 
              onClose={() => setSelectedCore(null)}
            />
          )}

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <WeeklyChart goals={goals} />
            </div>
            <div>
              <ResultsDonut goals={goals} 
               nivel={nivel}   // ← NUEVO
  team={team}/>
            </div>
          </div>

          {/* Ranking equipo (jefe/gerente sin drill-down activo) */}
          {/* {nivel < 2 && !selectedVendor && (
            <AgentRanking
              team={team}
              nivel={nivel}
              ano={ano}
              mes={mes}
              onSelectVendor={setSelectedVendor}
            />
          )} */}

          {/* Mensaje motivacional */}
          <div className="bg-gradient-to-r from-[#334a5e] to-[#2ecc70] rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="text-6xl">🎯</div>
              <div>
                <h3 className="text-xl font-bold mb-1">
                  {cumplimiento >= 100
                    ? '¡Meta Cumplida! Excelente trabajo'
                    : '¡Sigue así! Estás en el camino correcto'}
                </h3>
                <p className="text-purple-100">
                  {cumplimiento >= 100
                    ? `Superaste tu meta con un ${cumplimiento}% de cumplimiento.`
                    : `Llevas ${cumplimiento}% de cumplimiento. ¡Tú puedes!`}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardModule;
