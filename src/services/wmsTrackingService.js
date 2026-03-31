import api from './api.js'; // ← tu instancia axios ya configurada

export async function fetchTrackingPedido(numeroPedido) {
  const { data } = await api.get(`/wms/tracking/${numeroPedido}`);
  return data; // { success, cabecera, detalle }
}