// src/services/precioService.js
import api from './api';

export const precioService = {
  /**
   * Obtener precio con descuentos del SP
   * @param {string} ruc - RUC del cliente (puede tener 10 u 11 dígitos)
   * @param {string} codigo - Código del producto
   * @param {number} cantidad - Cantidad solicitada
   */
  async obtenerPrecio(ruc, codigo, cantidad) {
    try {
      console.log('🔍 === DEBUG PRECIO SERVICE ===');
      console.log('📦 Parámetros originales:', { ruc, codigo, cantidad });

      // Validaciones básicas
      if (!ruc || !codigo || !cantidad) {
        console.error('❌ Faltan parámetros');
        return {
          success: false,
          msgerror: 'Faltan parámetros requeridos',
          data: null
        };
      }

      // ✅ Normalizar RUC a 10 dígitos (quitar dígito verificador si existe)
      let rucNormalizado = ruc.toString().replace(/[-\s]/g, '');
      
      if (rucNormalizado.length === 11) {
        rucNormalizado = rucNormalizado.substring(0, 10);
        console.log('📦 RUC normalizado: 11 → 10 dígitos:', rucNormalizado);
      } else if (rucNormalizado.length === 10) {
        console.log('✅ RUC ya tiene 10 dígitos:', rucNormalizado);
      } else {
        console.warn('⚠️ RUC con longitud inusual:', rucNormalizado.length);
      }

      // ✅ Limpiar código del producto
      const codigoLimpio = codigo.trim();

      const datos = {
        ruc: rucNormalizado,
        codigo: codigoLimpio,
        cantidad: cantidad
      };

      console.log('📡 Endpoint:', '/precios/precio');
      console.log('📦 Datos finales a enviar:', datos);

      // Hacer la petición
      const response = await api.post('/precios/precio', datos);

      console.log('✅ Respuesta del servidor:', response.data);
      console.log('=== FIN DEBUG ===\n');

      // Validar respuesta
      if (response.data && response.data.success) {
        return response.data;
      } else {
        return {
          success: false,
          msgerror: response.data?.msgerror || 'No se encontraron precios',
          data: null
        };
      }
      
    } catch (error) {
      console.error('❌ === ERROR EN PRECIO SERVICE ===');
      console.error('Error completo:', error);
      console.error('Status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('URL:', error.config?.url);
      console.error('=== FIN ERROR ===\n');
      
      return {
        success: false,
        msgerror: error.response?.data?.msgerror || 
                  error.response?.data?.message || 
                  error.message || 
                  'Error al consultar precios del servidor',
        data: null
      };
    }
  }
};
