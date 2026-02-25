// src/services/salesService.js
import api from './api';

export const salesService = {

  /**
   * Obtener últimas compras del cliente (últimos 5 meses)
   * @param {string} ruc - RUC del cliente (10 dígitos)
   */
  async getLastPurchases(ruc) {
    try {
      const response = await api.get(`/sales/${ruc}`);
      return response.data;
    } catch (error) {
      return {
        success:  false,
        data:     null,
        msgerror: error.response?.data?.msgerror || 'Error al obtener historial de compras'
      };
    }
  }

};
