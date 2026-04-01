// src/services/facseg-service.js
import api from './api';

export const facsegService = {
  /**
   * Consulta documentos de CRM_FACSEG por RUC y rango de fechas
   * @param {string} ruc       - RUC o N° documento (8-10 dígitos)
   * @param {number} desde     - Fecha inicio en formato YYYYMMDD
   * @param {number} hasta     - Fecha fin en formato YYYYMMDD
   */
  getFacseg: async (ruc, desde, hasta) => {
    const params = new URLSearchParams({ ruc });
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);

    const res = await api.get(`/facseg?${params.toString()}`);
    return res.data; // { total, data[] }
  },
};