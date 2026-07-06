import api from './api.js';

const getReporteLlamadas = async ({
  fecha_desde,
  fecha_hasta,
  vendedor = '',
  limit = 5000,
  offset = 0,
}) => {
  const { data } = await api.get('/reportes/llamadas', {
    params: {
      fecha_desde,
      fecha_hasta,
      vendedor,
      limit,
      offset,
    },
  });

  return data;
};

export default {
  getReporteLlamadas,
};