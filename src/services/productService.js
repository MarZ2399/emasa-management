// src/services/productService.js
import api from './api';

export const productService = {
  /**
   * Buscar productos por código (parcial o completo)
   * @param {string} codigo - Código del producto
   * @returns {Promise<Object>} - { success, data: [...], msgerror }
   */
  searchByCodigo: async (codigo) => {
    try {
      const { data } = await api.get('/products/search', {
        params: { codigo }
      });
      return data;
    } catch (error) {
      console.error('Error en searchByCodigo:', error);
      return {
        success: false,
        data: null,
        msgerror: error.response?.data?.msgerror || error.message
      };
    }
  },

  /**
   * Buscar productos por nombre
   * @param {string} nombre - Nombre del producto
   * @returns {Promise<Object>} - { success, data: [...], msgerror }
   */
  searchByName: async (nombre) => {
    try {
      const { data } = await api.get('/products', {
        params: { Nom: nombre }
      });
      return data;
    } catch (error) {
      console.error('Error en searchByName:', error);
      return {
        success: false,
        data: null,
        msgerror: error.response?.data?.msgerror || error.message
      };
    }
  },

  /**
   * Obtener producto específico por código exacto
   * @param {string} codigo - Código exacto del producto
   * @returns {Promise<Object>} - { success, data: { producto, stock }, msgerror }
   */
  getProductByCod: async (codigo) => {
    try {
      const { data } = await api.get(`/products/cod/${codigo}`);
      return data;
    } catch (error) {
      console.error('Error en getProductByCod:', error);
      return {
        success: false,
        data: null,
        msgerror: error.response?.data?.msgerror || error.message
      };
    }
  }
};
