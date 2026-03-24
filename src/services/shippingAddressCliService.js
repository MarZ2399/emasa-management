// src/services/shippingAddressCliService.js
import api from './api';

export const getAddressesByCliente = async (ruc) => {
  const { data } = await api.get(`/shipping-addresses/${ruc}`);
  return data.data ?? [];
};

export const createAddress = async (payload) => {
  const { data } = await api.post(`/shipping-addresses`, payload);
  return data.data;
};

export const deleteAddress = async (id, rucCli) => {
  const { data } = await api.delete(`/shipping-addresses/${id}`, {
    data: { rucCli }
  });
  return data.data;
};
