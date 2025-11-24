// src/components/dashboard/DashboardFilters.jsx
import React from 'react';
import { Calendar, Filter, Users } from 'lucide-react';

const DashboardFilters = ({ 
  period, 
  onPeriodChange, 
  selectedAgent, 
  onAgentChange, 
  isAdmin,
  agents,
  dateRange,
  onDateRangeChange
}) => {
  const periods = [
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta Semana' },
    { value: 'month', label: 'Este Mes' },
    { value: 'custom', label: 'Personalizado' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Filter className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-900">Filtros</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Filtro de Período */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Período
          </label>
          <select
            value={period}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {periods.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Agente (solo Admin) */}
        {isAdmin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Agente
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => onAgentChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los Agentes</option>
              {agents.map(agent => (
                <option key={agent.username} value={agent.username}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Rango de Fechas Personalizado */}
        {period === 'custom' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        )}
      </div>

      {/* Indicador de Vista */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          {isAdmin && selectedAgent === 'all' ? (
            <>📊 Vista General - Mostrando datos de todos los agentes</>
          ) : (
            <>👤 Vista Individual - Mostrando solo tus datos</>
          )}
        </p>
      </div>
    </div>
  );
};

export default DashboardFilters;
