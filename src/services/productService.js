// src/services/productService.js
import api from './api';

export const productService = {
  /**
   * Buscar productos por código (parcial o completo)
   */
  searchByCodigo: async (codigo) => {
    try {
      if (!codigo || codigo.trim() === '') {
        return {
          success: true,
          data: [],
          msgerror: null
        };
      }

      const { data } = await api.get('/products/search', {
        params: { codigo: codigo.trim() }
      });
      
      return data;
    } catch (error) {
      console.error('❌ Error en searchByCodigo:', error);
      return {
        success: false,
        data: [],
        msgerror: error.response?.data?.msgerror || error.message
      };
    }
  },

  /**
   * Buscar productos por nombre
   */
  searchByName: async (nombre) => {
    try {
      if (!nombre || nombre.trim() === '') {
        return {
          success: true,
          data: [],
          msgerror: null
        };
      }

      const { data } = await api.get('/products', {
        params: { Nom: nombre.trim() }
      });
      
      return data;
    } catch (error) {
      console.error('❌ Error en searchByName:', error);
      return {
        success: false,
        data: [],
        msgerror: error.response?.data?.msgerror || error.message
      };
    }
  },

  /**
   * Obtener producto específico por código exacto
   */
  getProductByCod: async (codigo) => {
    try {
      if (!codigo || codigo.trim() === '') {
        return {
          success: false,
          data: null,
          msgerror: 'Código requerido'
        };
      }

      const { data } = await api.get(`/products/cod/${codigo.trim()}`);
      return data;
    } catch (error) {
      console.error('❌ Error en getProductByCod:', error);
      return {
        success: false,
        data: null,
        msgerror: error.response?.data?.msgerror || error.message
      };
    }
  }
};

/**
 * ✅ Export para ProductSelectorModal
 */
export const searchProducts = async (searchTerm = '') => {
  try {
    if (!searchTerm || searchTerm.trim() === '') {
      return {
        success: true,
        data: [],
        msgerror: null
      };
    }

    const result = await productService.searchByCodigo(searchTerm.trim());
    
    return {
      success: result.success !== false,
      data: result.data || [],
      msgerror: result.msgerror || null
    };
  } catch (error) {
    console.error('❌ Error en searchProducts:', error);
    return {
      success: false,
      data: [],
      msgerror: error.message
    };
  }
};

export default productService;
