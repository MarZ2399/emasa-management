// src/services/followService.js
import api from './api';

export const followService = {

  /**
   * Get goals for the logged-in user
   * Backend auto-applies level filter (vendor / manager / director)
   * @param {number} ano  - Year  (optional, defaults to current year)
   * @param {number} mes  - Month (optional, defaults to current month)
   */
  getGoals: async ({ ano, mes } = {}) => {
    const params = {};
    if (ano) params.ano = ano;
    if (mes) params.mes = mes;
    const { data } = await api.get('/follow/goals', { params });
    return data;
  },

  /**
   * Get team members (managers and directors only)
   * Manager  → list of vendors under them
   * Director → all managers + their vendors
   */
  getTeam: async () => {
    const { data } = await api.get('/follow/team');
    return data;
  },

  /**
   * Get goals for a specific vendor (drill-down)
   * Used by managers/directors to view individual vendor performance
   * @param {string} codVen - Vendor code (e.g. 'DM1')
   * @param {number} ano    - Year  (optional)
   * @param {number} mes    - Month (optional)
   */
  getGoalsByVendor: async (codVen, { ano, mes } = {}) => {
    const params = {};
    if (ano) params.ano = ano;
    if (mes) params.mes = mes;
    const { data } = await api.get(`/follow/goals/${codVen}`, { params });
    return data;
  },
  /**
   * Get vendor-exclusive KPIs (solo nivel_acceso === 2)
   * - clientesFacturados: clientes únicos facturados en el período
   * - clientesCartera:    cartera total activa asignada al vendedor
   */
  getVendorClientKpis: async ({ ano, mes, codigo } = {}) => {
  const params = {};
  if (ano)    params.ano    = ano;
  if (mes)    params.mes    = mes;
  if (codigo) params.codigo = codigo;  // ← solo se envía en drill-down
  const { data } = await api.get('/follow/vendor-kpis', { params });
  return data;
},

 /**
   * Get credit ranking by core (solo nivel_acceso === 2 / drill-down vendedor)
   * @param {string|number} metgrp - Código del core (e.g. 4, 46)
   */
  getCreditRanking: async ({ metgrp, codigo } = {}) => {
  const params = {};
  if (metgrp !== undefined) params.metgrp = metgrp;
  if (codigo)               params.codigo = codigo;  // ← para jefe/gerente en drill-down
  const { data } = await api.get('/follow/credit-ranking', { params });
  return data;
},
};
