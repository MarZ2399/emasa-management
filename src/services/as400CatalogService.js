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

// ── UBIGEO ────────────────────────────────────────────────────────────────

export const getDepartamentos = async () => {
  const { data } = await api.get(`/as400-catalogs/ubigeo/departamentos`);
  return data.data;
};

export const getProvincias = async (codDepto) => {
  const cod = String(codDepto).substring(0, 2); // '150000' → '15'
  const { data } = await api.get(`/as400-catalogs/ubigeo/provincias?depto=${cod}`);
  return data.data;
};

export const getDistritos = async (codProvincia) => {
  const cod = String(codProvincia).substring(0, 4); // '150100' → '1501'
  const { data } = await api.get(`/as400-catalogs/ubigeo/distritos?provincia=${cod}`);
  return data.data;
};


