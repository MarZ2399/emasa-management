// src/services/as400CatalogService.js
import api from './api';

export const getTransportistasByZona = async (zona) => {
  const { data } = await api.get(`/as400-catalogs/transportistas?zona=${zona}`);
  return data.data;
};

export const getTransportistasAll = async () => {
  const { data } = await api.get(`/as400-catalogs/transportistas`);
  return data.data;
};


