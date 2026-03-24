// src/services/customerService.js
import api from './api'; // ✅ Usar la instancia configurada con interceptores


/**
 * Buscar cliente por RUC
 * @param {string} ruc - RUC del cliente
 * @returns {Promise<Object>} - Datos del cliente formateados
 */
export const getClientByRuc = async (ruc) => {
  try {
    // ✅ Llamadas en paralelo — cliente + contactos al mismo tiempo
    const [clientResponse, contactsResponse] = await Promise.all([
      api.get(`/customers/ruc/${ruc}`),
      api.get(`/customers/${ruc}/contacts`)
    ]);

    if (!clientResponse.data.success) {
      throw new Error(clientResponse.data.msgerror || 'Cliente no encontrado');
    }

    

    const clientFormatted = formatClientData(clientResponse.data.data);

    // ✅ Mapear contactos al formato de InfoCard
    const contactos = (contactsResponse.data.data || []).map((c) => ({
  email:    c.EMAIL?.trim()          || '-',
  phone:    c.TELEFONO?.trim()       || '-',
  fullName: c.NOMBRECOMPLETO?.trim() || '-',
  birthday: formatDate(c.FECHANACIMIENTO) || '-',
}));

    return {
      ...clientFormatted,
      contactos: contactos.length > 0 ? contactos : null
    };

  } catch (error) {
    console.error('Error al buscar cliente por RUC:', error);

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
    fpago:    apiData.FPAGO    || null,       // ✅ código: "ADE", "CR30", etc.
    fpagdes:  apiData.FPAGDES  || 'N/A',
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
    contactos: null, // ✅ Se sobreescribe en getClientByRuc con Promise.all
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
    const year  = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day   = dateStr.substring(6, 8);
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
  if (apiData.VENTA_ACTUAL > 0) return '1 mes';
  return '0 meses';
};


export const getClientContacts = async (ruc) => {
  const response = await api.get(`/customers/${ruc}/contacts`);
  return response.data;
};

/**
 * Extrae solo los campos de dirección/ubigeo del cliente para el modal de pedido
 */
export const getClientShippingInfo = async (ruc) => {
  try {
    const { data } = await api.get(`/customers/ruc/${ruc}`);
    if (!data.success) throw new Error(data.msgerror);

    const d = data.data;
    return {
      direccion:       d.DIRECCION?.trim()             || '',
      ubigeoDistrito:  d.UBIGEO?.trim()                || '', // '150136'
      ubigeoProvinca:  d.UBIGEO?.trim().substring(0, 4) || '', // '1501'
      ubigeoDepto:     d.UBIGEO?.trim().substring(0, 2) || '', // '15'
      distritoNombre:  d.DISTRITO?.trim()              || '',
      provinciaNombre: d.PROVINCIA?.trim()              || '',
      deptoNombre:     d.DEPARTAMENTO?.trim()           || '',
    };
  } catch (e) {
    console.error('❌ Error getClientShippingInfo:', e);
    throw e;
  }
};

export default {
  getClientByRuc,
  searchClientsByName
};
