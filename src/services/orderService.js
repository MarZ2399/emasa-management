import api from './api';

export const listOrders = async ({ diasAtras = 7, almacenes } = {}) => {
  try {
    const params = new URLSearchParams();
    params.append('dias_atras', diasAtras);
    if (almacenes) params.append('almacenes', almacenes);

    const response = await api.get(`/orders/list?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error al listar pedidos:', error);
    throw error;
  }
};

export default { listOrders };
