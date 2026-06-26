import api from './api';

export const salesHistoryService = {
  getSalesHistory: async (anio, codigo) => {
    const params = new URLSearchParams({
      anio: String(anio),
      codigo: String(codigo).trim().toUpperCase(),
    });

    const res = await api.get(`/sales-history?${params.toString()}`);
    return res.data; // { total, data[] }
  },
};