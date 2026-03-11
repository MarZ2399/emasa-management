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

  // ── Data ──────────────────────────────────────────────────────
  const [goals,   setGoals]   = useState([]);
  const [team,    setTeam]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

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

  useEffect(() => { loadGoals(); }, [loadGoals]);
  useEffect(() => { loadTeam();  }, [loadTeam]);

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

  const cumplimiento = metrics.meta > 0
  ? Number(((metrics.metnet / metrics.meta) * 100).toFixed(2))
  : 0;

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
            <MetricCard
              title="Meta Asignada"
              value={metrics.meta}
              format="currency"
              color="from-blue-500 to-blue-600"
            />
            <MetricCard
              title="Venta Bruta"
              value={metrics.venta}
              format="currency"
              color="from-green-500 to-green-600"
            />
            <MetricCard
              title="Venta Neta"
              value={metrics.metnet}
              target={metrics.meta}
              format="currency"
              color="from-purple-500 to-purple-600"
            />
            <MetricCard
              title="% Cumplimiento"
              value={cumplimiento}
              format="percent"
              color={
                cumplimiento >= 100 ? 'from-green-500 to-green-600'
                : cumplimiento >= 70 ? 'from-yellow-500 to-yellow-600'
                : 'from-red-500 to-red-600'
              }
            />
          </div>

          {/* Tabla de avance por Core Business */}
          <GoalsTable
            goals={goals}
            mes={mes}
            ano={ano}
            vendorName={selectedVendor?.VTDNOM || null}
            nivelAcceso={nivel}
          />

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <WeeklyChart goals={goals} />
            </div>
            <div>
              <ResultsDonut goals={goals} />
            </div>
          </div>

          {/* Ranking equipo (jefe/gerente sin drill-down activo) */}
          {nivel < 2 && !selectedVendor && (
            <AgentRanking
              team={team}
              nivel={nivel}
              ano={ano}
              mes={mes}
              onSelectVendor={setSelectedVendor}
            />
          )}

          {/* Mensaje motivacional */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
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
