// services/catalogoService.js
import api from './api';

/**
 * Obtiene un catálogo específico
 * GET /api/catalogos/TIPO_CONTACTO
 */
export const getCatalogo = async (tipo) => {
  try {
    console.log('📋 Cargando catálogo:', tipo);
    const response = await api.get(`/catalogos/${tipo}`);
    console.log(` ${tipo}: ${response.data.data?.length} items`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error al obtener catálogo ${tipo}:`, error);
    throw error;
  }
};

/**
 * Obtiene múltiples catálogos en una sola llamada
 * GET /api/catalogos?tipos=TIPO_CONTACTO,RESULTADO_GESTION
 */
export const getCatalogos = async (tipos = []) => {
  try {
    console.log('📋 Cargando catálogos:', tipos);
    const response = await api.get('/catalogos', {
      params: { tipos: tipos.join(',') }
    });
    console.log(' Catálogos recibidos:', Object.keys(response.data.data ?? {}).join(', '));
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener catálogos:', error);
    throw error;
  }
};

export default { getCatalogo, getCatalogos };
