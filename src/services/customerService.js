// src/services/customerService.js
import api from './api'; // ✅ Usar la instancia configurada con interceptores

/**
 * Buscar cliente por RUC
 * @param {string} ruc - RUC del cliente
 * @returns {Promise<Object>} - Datos del cliente formateados
 */
export const getClientByRuc = async (ruc) => {
  try {
    // ✅ El interceptor de api.js agrega el token automáticamente
    const { data } = await api.get(`/customers/ruc/${ruc}`);

    if (data.success) {
      return formatClientData(data.data);
    } else {
      throw new Error(data.msgerror || 'Cliente no encontrado');
    }
  } catch (error) {
    console.error('Error al buscar cliente por RUC:', error);
    
    // Manejo de errores específicos
    if (error.response?.status === 401) {
      throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
    }
    if (error.response?.status === 404) {
      throw new Error('Cliente no encontrado');
    }
    
    throw new Error(error.message || 'Error al consultar el cliente');
  }
};

/**
 * Buscar clientes por nombre (Búsqueda pública - no requiere token)
 * @param {string} nombre - Nombre o razón social
 * @returns {Promise<Array>} - Lista de clientes
 */
export const searchClientsByName = async (nombre) => {
  try {
    const { data } = await api.get('/customers', {
      params: { Nom: nombre }
    });

    if (data.success && data.data) {
      return data.data.map(client => ({
        ruc: client.VTNRUC,
        nombre: client.VTDRZS
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error al buscar clientes por nombre:', error);
    throw new Error('Error al buscar clientes');
  }
};

/**
 * Formatear datos del cliente desde la API al formato del componente
 * @param {Object} apiData - Datos crudos de la API
 * @returns {Object} - Datos formateados
 */
const formatClientData = (apiData) => {
  return {
    // ✅ DATOS DEL CLIENTE (Con data de la API)
    nombreCliente: apiData.NOMBRE || 'N/A',
    ruc: apiData.DOCNUMERO?.toString() || 'N/A',
    tipoDoc: apiData.DOCTIPO || 'N/A',
    direccion: apiData.DIRECCION || 'N/A',
    distrito: apiData.DISTRITO || 'N/A',
    provincia: apiData.PROVINCIA || 'N/A',
    departamento: apiData.DEPARTAMENTO || 'N/A',
    zonaCliente: apiData.PROVINCIA ? `Zona ${apiData.PROVINCIA}` : 'N/A',
    fechaCreacion: formatDate(apiData.FCREA),

    // ✅ DATOS COMERCIALES (Con data de la API)
    giro: apiData.GIRODES ? `${apiData.GIROCOD} - ${apiData.GIRODES}` : 'N/A',
    categoria: apiData.CATEG?.trim() || 'N/A',
    vendedor: apiData.VENDEDORNOM ? `${apiData.VENDEDORCOD?.trim()} - ${apiData.VENDEDORNOM}` : 'N/A',
    lineaCredito: `$${formatNumber(apiData.CREDITO)}`,
    creditoDisponible: `$${formatNumber(apiData.CREDITODISP)}`,
    deudaTotal: 'N/A',
    diasAtraso: apiData.MOROSO === 1 ? 'Sí' : '0',
    clienteMalPagador: apiData.MOROSO === 1 ? 'Sí' : 'No',
    motivoMalPagador: apiData.SITUCARTERA || 'Sin Antecedente',

    // ✅ DATOS DE VENTAS (Con data de la API)
    ventaActual: `$${formatNumber(apiData.VENTA_ACTUAL)}`,
    ventaAnterior: `$${formatNumber(apiData.VTA_ANTERIOR)}`,
    promedioVtas20212025: `$${formatNumber(apiData.VENTA_ULTI03)}`,

    // ⚠️ DATOS QUE NO VIENEN DE LA API (Temporalmente vacíos o calculados)
    ultVenta: `$${formatNumber(apiData.VENTA_ULTI03)}`,
    contactos: null, // Se llenará con otra API
    corePrincipal: null, // Se llenará con otra API
    promedioVtas2025: `$${formatNumber(apiData.VENTA_ACTUAL)}`, // Temporal
    mesesConVtas2025: calculateMonthsWithSales(apiData),
    mesesConVtas20212025: null, // Se llenará con otra API

    // Datos originales (por si acaso)
    raw: apiData
  };
};

/**
 * Formatear fecha desde formato YYYYMMDD
 * @param {number|string} dateNumber - Fecha en formato 20050419
 * @returns {string} - Fecha formateada DD/MM/YYYY
 */
const formatDate = (dateNumber) => {
  if (!dateNumber) return 'N/A';
  
  const dateStr = dateNumber.toString();
  if (dateStr.length === 8) {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${day}/${month}/${year}`;
  }
  
  return dateNumber.toString();
};

/**
 * Formatear números con separadores de miles
 * @param {number} value - Valor numérico
 * @returns {string} - Número formateado
 */
const formatNumber = (value) => {
  if (!value && value !== 0) return '0.00';
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Calcular meses con ventas (lógica personalizada)
 * @param {Object} apiData - Datos de la API
 * @returns {string} - Meses con ventas
 */
const calculateMonthsWithSales = (apiData) => {
  // Lógica básica: si tiene venta actual, cuenta como 1 mes
  if (apiData.VENTA_ACTUAL > 0) return '1 mes';
  return '0 meses';
};

export default {
  getClientByRuc,
  searchClientsByName
};
