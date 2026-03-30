import api from './api';

export const listOrders = async () => {
  try {
    const response = await api.get('/orders/list');
    return response.data;
  } catch (error) {
    console.error('❌ Error al listar pedidos:', error);
    throw error;
  }
};

export default { listOrders };
