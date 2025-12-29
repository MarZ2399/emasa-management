// src/components/dashboard/DashboardModule.jsx
import React, { useState, useMemo } from 'react';
import { Phone, ShoppingCart, FileText, Clock, Calendar, Award,TrendingUp } from 'lucide-react';
import MetricCard from './MetricCard';
import WeeklyChart from './WeeklyChart';
import AgentRanking from './AgentRanking';
import ResultsDonut from './ResultsDonut';
import DashboardFilters from './DashboardFilters';
import SectionHeader from '../common/SectionHeader';
import { historicalCallsData, agentGoals, agentsRanking } from '../../data/dashboardData';

const DashboardModule = ({ currentUser }) => {
  // Determinar si es admin o agente
  const isAdmin = currentUser?.rol === 'Administrador';
  const currentUsername = currentUser?.username || 'miguel.reyes';

  // Estados de filtros
  const [period, setPeriod] = useState('today');
  const [selectedAgent, setSelectedAgent] = useState(isAdmin ? 'all' : currentUsername);
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Función para obtener rango de fechas según período
  const getDateRange = () => {
    const today = new Date();
    let start = new Date();
    
    switch(period) {
      case 'today':
        start = new Date(today);
        break;
      case 'week':
        start = new Date(today);
        start.setDate(today.getDate() - 7);
        break;
      case 'month':
        start = new Date(today);
        start.setDate(today.getDate() - 30);
        break;
      case 'custom':
        return {
          start: new Date(dateRange.start),
          end: new Date(dateRange.end)
        };
      default:
        start = new Date(today);
    }
    
    return {
      start: start,
      end: today
    };
  };

  // Filtrar datos según período y agente
  const filteredData = useMemo(() => {
    const range = getDateRange();
    
    return historicalCallsData.filter(record => {
      const recordDate = new Date(record.date);
      const isInDateRange = recordDate >= range.start && recordDate <= range.end;
      
      // Si es admin y seleccionó "all", mostrar todos
      if (isAdmin && selectedAgent === 'all') {
        return isInDateRange;
      }
      
      // Si es admin con agente específico o si es agente, filtrar por usuario
      const agent = agentsRanking.find(a => a.username === (isAdmin ? selectedAgent : currentUsername));
      return isInDateRange && record.agentName === agent?.name;
    });
  }, [period, selectedAgent, dateRange, isAdmin, currentUsername]);

  // Calcular métricas agregadas
  const metrics = useMemo(() => {
    const totals = filteredData.reduce((acc, record) => {
      acc.calls += record.calls;
      acc.sales += record.sales;
      acc.quotes += record.quotes;
      acc.followups += record.followups;
      return acc;
    }, { calls: 0, sales: 0, quotes: 0, followups: 0 });

    // Calcular metas según el período
    let goals = agentGoals.daily;
    const days = filteredData.length / (isAdmin && selectedAgent === 'all' ? agentsRanking.length : 1);
    
    if (period === 'week' || days > 7) {
      goals = agentGoals.weekly;
    } else if (period === 'month' || days > 30) {
      goals = agentGoals.monthly;
    }

    // Si es vista de todos los agentes, multiplicar metas
    const multiplier = (isAdmin && selectedAgent === 'all') ? agentsRanking.length : 1;

    return {
      calls: { 
        value: totals.calls, 
        target: goals.calls * multiplier, 
        trend: Math.floor(Math.random() * 20) - 5 
      },
      sales: { 
        value: totals.sales, 
        target: goals.sales * multiplier, 
        trend: Math.floor(Math.random() * 20) - 5 
      },
      quotes: { 
        value: totals.quotes, 
        target: goals.quotes * multiplier, 
        trend: Math.floor(Math.random() * 20) - 5 
      },
      followups: { 
        value: totals.followups, 
        target: goals.followups * multiplier, 
        trend: Math.floor(Math.random() * 20) - 5 
      }
    };
  }, [filteredData, period, isAdmin, selectedAgent]);

  // Calcular progreso total
  const totalProgress = Math.round(
    ((metrics.calls.value + metrics.sales.value + metrics.quotes.value + metrics.followups.value) / 
     (metrics.calls.target + metrics.sales.target + metrics.quotes.target + metrics.followups.target)) * 100
  );

  // Agrupar datos por día para el gráfico
  const weeklyData = useMemo(() => {
    const grouped = {};
    
    filteredData.forEach(record => {
      const day = new Date(record.date).toLocaleDateString('es-ES', { weekday: 'short' });
      if (!grouped[day]) {
        grouped[day] = { day, calls: 0, sales: 0, quotes: 0, meta: agentGoals.daily.calls };
      }
      grouped[day].calls += record.calls;
      grouped[day].sales += record.sales;
      grouped[day].quotes += record.quotes;
    });
    
    return Object.values(grouped);
  }, [filteredData]);

  const currentDate = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader
    icon={TrendingUp}
    title={isAdmin && selectedAgent === 'all' ? 'Dashboard General' : 'Mi Dashboard'}
    subtitle={
      <div className="flex items-center gap-2 text-blue-100">
        <Calendar className="w-4 h-4" />
        <span className="capitalize">{currentDate}</span>
      </div>
    }
    showButton={true}
    buttonText={`${totalProgress}%`}
    buttonTextMobile={`${totalProgress}%`}
    buttonIcon={Award}
    // O puedes quitar el botón si no necesitas acción
    gradientFrom="from-[#334a5e]"
    gradientTo="to-[#2ecc70]"
  />

      {/* Filtros */}
      <DashboardFilters
        period={period}
        onPeriodChange={setPeriod}
        selectedAgent={selectedAgent}
        onAgentChange={setSelectedAgent}
        isAdmin={isAdmin}
        agents={agentsRanking}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Llamadas Realizadas"
          value={metrics.calls.value}
          target={metrics.calls.target}
          icon={Phone}
          color="from-blue-500 to-blue-600"
          trend={metrics.calls.trend}
        />
        
        <MetricCard
          title="Pedidos Cerrados"
          value={metrics.sales.value}
          target={metrics.sales.target}
          icon={ShoppingCart}
          color="from-green-500 to-green-600"
          trend={metrics.sales.trend}
        />
        
        <MetricCard
          title="Cotizaciones"
          value={metrics.quotes.value}
          target={metrics.quotes.target}
          icon={FileText}
          color="from-purple-500 to-purple-600"
          trend={metrics.quotes.trend}
        />
        
        <MetricCard
          title="Seguimientos"
          value={metrics.followups.value}
          target={metrics.followups.target}
          icon={Clock}
          color="from-orange-500 to-orange-600"
          trend={metrics.followups.trend}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WeeklyChart data={weeklyData} />
        </div>
        <div>
          <ResultsDonut data={filteredData} />
        </div>
      </div>

      {/* Ranking (solo para Admin en vista general) */}
      {isAdmin && selectedAgent === 'all' && (
        <AgentRanking />
      )}

      {/* Mensaje Motivacional */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="text-6xl">🎯</div>
          <div>
            <h3 className="text-xl font-bold mb-1">
              {totalProgress >= 100 ? '¡Meta Cumplida! Excelente trabajo' : '¡Sigue así! Estás en el camino correcto'}
            </h3>
            <p className="text-purple-100">
              {metrics.calls.value >= metrics.calls.target ? 
                'Has superado tu meta de llamadas. ¡Increíble desempeño!' :
                `Te faltan ${metrics.calls.target - metrics.calls.value} llamadas para completar tu meta.`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardModule;
