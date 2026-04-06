// src/services/statementService.js
import api from './api';

/**
 * Obtiene el estado de cuenta corriente del cliente desde AS400 (SP_ECCCLI)
 * @param {string} ruc - RUC del cliente
 * @returns {Promise<{ success: boolean, ruc: string, data: object }>}
 */
export const getStatement = async (ruc) => {
  const { data } = await api.get(`/statement/${ruc}`);
  return data;
};