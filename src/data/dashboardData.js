// src/data/dashboardData.js

// ============================================
// CONFIGURACIÓN DE METAS
// ============================================
export const agentGoals = {
  daily: { 
    calls: 50, 
    sales: 5, 
    quotes: 10, 
    followups: 15 
  },
  weekly: { 
    calls: 250, 
    sales: 25, 
    quotes: 50, 
    followups: 75 
  },
  monthly: { 
    calls: 1000, 
    sales: 100, 
    quotes: 200, 
    followups: 300 
  }
};

// ============================================
// MÉTRICAS ACTUALES DEL AGENTE (EJEMPLO)
// ============================================
export const currentAgentMetrics = {
  calls: { value: 45, target: 50, trend: 8 },
  sales: { value: 12, target: 15, trend: 5 },
  quotes: { value: 28, target: 25, trend: -3 },
  followups: { value: 35, target: 40, trend: 12 }
};

// ============================================
// DATOS SEMANALES (PARA GRÁFICO)
// ============================================
export const weeklyCallsData = [
  { day: 'Lun', calls: 45, sales: 8, quotes: 12, meta: 50 },
  { day: 'Mar', calls: 52, sales: 6, quotes: 15, meta: 50 },
  { day: 'Mié', calls: 48, sales: 9, quotes: 10, meta: 50 },
  { day: 'Jue', calls: 55, sales: 7, quotes: 14, meta: 50 },
  { day: 'Vie', calls: 50, sales: 10, quotes: 13, meta: 50 },
  { day: 'Sáb', calls: 38, sales: 5, quotes: 8, meta: 50 },
  { day: 'Dom', calls: 30, sales: 4, quotes: 6, meta: 50 }
];

// ============================================
// RANKING DE AGENTES
// ============================================
export const agentsRanking = [
  { 
    id: 1, 
    name: 'Miguel Angel Reyes', 
    username: 'miguel.reyes',
    calls: 280, 
    sales: 32, 
    performance: 95, 
    avatar: '👨‍💼' 
  },
  { 
    id: 2, 
    name: 'Yessir Florian', 
    username: 'yessir.florian',
    calls: 265, 
    sales: 28, 
    performance: 88, 
    avatar: '👨‍💼' 
  },
  { 
    id: 3, 
    name: 'Giancarlo Nicho', 
    username: 'giancarlo.nicho',
    calls: 245, 
    sales: 25, 
    performance: 82, 
    avatar: '👨‍💼' 
  },
  { 
    id: 4, 
    name: 'Ana García', 
    username: 'ana.garcia',
    calls: 230, 
    sales: 22, 
    performance: 78, 
    avatar: '👩‍💼' 
  },
  { 
    id: 5, 
    name: 'Carlos López', 
    username: 'carlos.lopez',
    calls: 210, 
    sales: 18, 
    performance: 72, 
    avatar: '👨‍💼' 
  }
];

// ============================================
// DISTRIBUCIÓN DE RESULTADOS (PARA GRÁFICO DONA)
// ============================================
export const resultsDistribution = [
  { name: 'Ventas', value: 45, color: '#10b981' },
  { name: 'Cotizaciones', value: 68, color: '#3b82f6' },
  { name: 'Seguimientos', value: 89, color: '#f59e0b' },
  { name: 'No Contesta', value: 48, color: '#ef4444' }
];

// ============================================
// GENERADOR DE DATOS HISTÓRICOS
// ============================================
export const generateHistoricalData = (days = 30) => {
  const data = [];
  const agents = [
    'Miguel Angel Reyes', 
    'Yessir Florian', 
    'Giancarlo Nicho', 
    'Ana García', 
    'Carlos López'
  ];
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    agents.forEach(agent => {
      // Generar datos aleatorios realistas
      const basePerformance = agentsRanking.find(a => a.name === agent)?.performance || 80;
      const factor = basePerformance / 100;
      
      data.push({
        id: `${agent}-${i}`,
        date: date.toISOString().split('T')[0],
        agentName: agent,
        calls: Math.floor((Math.random() * 20 + 30) * factor),      // 30-50 llamadas ajustadas por performance
        sales: Math.floor((Math.random() * 5 + 3) * factor),        // 3-8 ventas
        quotes: Math.floor((Math.random() * 10 + 8) * factor),      // 8-18 cotizaciones
        followups: Math.floor((Math.random() * 15 + 15) * factor),  // 15-30 seguimientos
        noAnswer: Math.floor(Math.random() * 10 + 5)                // 5-15 no contesta
      });
    });
  }
  
  return data;
};

// ============================================
// DATOS HISTÓRICOS GENERADOS (30 DÍAS)
// ============================================
export const historicalCallsData = generateHistoricalData(30);

// ============================================
// FUNCIÓN HELPER: Obtener datos de un agente específico
// ============================================
export const getAgentDataByUsername = (username) => {
  return agentsRanking.find(agent => agent.username === username);
};

// ============================================
// FUNCIÓN HELPER: Filtrar datos históricos
// ============================================
export const filterHistoricalData = (startDate, endDate, agentName = null) => {
  return historicalCallsData.filter(record => {
    const recordDate = new Date(record.date);
    const isInRange = recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
    
    if (agentName) {
      return isInRange && record.agentName === agentName;
    }
    
    return isInRange;
  });
};

// ============================================
// FUNCIÓN HELPER: Calcular métricas agregadas
// ============================================
export const calculateAggregatedMetrics = (filteredData) => {
  return filteredData.reduce((acc, record) => {
    acc.calls += record.calls;
    acc.sales += record.sales;
    acc.quotes += record.quotes;
    acc.followups += record.followups;
    acc.noAnswer += record.noAnswer;
    return acc;
  }, { 
    calls: 0, 
    sales: 0, 
    quotes: 0, 
    followups: 0, 
    noAnswer: 0 
  });
};

// ============================================
// FUNCIÓN HELPER: Agrupar datos por día para gráficos
// ============================================
export const groupDataByDay = (filteredData) => {
  const grouped = {};
  
  filteredData.forEach(record => {
    const date = new Date(record.date);
    const dayKey = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
    
    if (!grouped[dayKey]) {
      grouped[dayKey] = { 
        day: dayName, 
        date: dayKey,
        calls: 0, 
        sales: 0, 
        quotes: 0, 
        followups: 0,
        meta: agentGoals.daily.calls 
      };
    }
    
    grouped[dayKey].calls += record.calls;
    grouped[dayKey].sales += record.sales;
    grouped[dayKey].quotes += record.quotes;
    grouped[dayKey].followups += record.followups;
  });
  
  // Convertir a array y ordenar por fecha
  return Object.values(grouped).sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
};
