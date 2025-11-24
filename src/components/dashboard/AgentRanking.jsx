// src/components/dashboard/AgentRanking.jsx
import React from 'react';
import { Trophy, TrendingUp } from 'lucide-react';
import { agentsRanking } from '../../data/dashboardData';

const AgentRanking = () => {
  const getMedalColor = (index) => {
    switch(index) {
      case 0: return 'from-yellow-400 to-yellow-600';
      case 1: return 'from-gray-300 to-gray-400';
      case 2: return 'from-orange-400 to-orange-600';
      default: return 'from-gray-200 to-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <div>
          <h3 className="text-lg font-bold text-gray-900">Ranking de Agentes</h3>
          <p className="text-sm text-gray-500">Top 5 de esta semana</p>
        </div>
      </div>

      <div className="space-y-3">
        {agentsRanking.map((agent, index) => (
          <div
            key={agent.id}
            className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-all duration-300 border border-gray-100"
          >
            {/* Posición */}
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getMedalColor(index)} flex items-center justify-center text-white font-bold shadow-md`}>
              {index + 1}
            </div>

            {/* Avatar */}
            <div className="text-3xl">
              {agent.avatar}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm">{agent.name}</h4>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-xs text-gray-500">
                  📞 {agent.calls} llamadas
                </span>
                <span className="text-xs text-gray-500">
                  💰 {agent.sales} ventas
                </span>
              </div>
            </div>

            {/* Performance */}
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end mb-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-lg font-bold text-gray-900">{agent.performance}%</span>
              </div>
              <div className="w-20 bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: `${agent.performance}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentRanking;
