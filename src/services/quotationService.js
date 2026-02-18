// services/quotationService.js
import api from './api';

/**
 * ✅ Servicio de Cotizaciones
 * Centraliza todas las llamadas API relacionadas con cotizaciones
 */

export const registerQuotation = async (cabecera, detalles) => {
  try {
    const response = await api.post('/quotations/register', { cabecera, detalles });
    return response.data;
  } catch (error) {
    console.error('❌ Error al registrar cotización:', error);
    throw error;
  }
};

export const updateQuotation = async (id, cabecera, detalles) => {
  try {
    console.log('📤 Actualizando cotización ID:', id);
    console.log('Cabecera:', cabecera);
    console.log('Detalles:', detalles.length, 'items');

    const response = await api.put(`/quotations/${id}`, { cabecera, detalles });

    console.log('✅ Respuesta del servidor:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al actualizar cotización:', error);
    throw error;
  }
};

export const getNextCorrelative = async () => {
  try {
    const response = await api.get('/quotations/correlative/next');
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener correlativo:', error);
    throw error;
  }
};

export const listQuotations = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();

    if (filtros.estado_transmision) params.append('estado_transmision', filtros.estado_transmision);
    if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
    if (filtros.cliente_ruc) params.append('cliente_ruc', filtros.cliente_ruc);
    if (filtros.vendedor) params.append('vendedor', filtros.vendedor);
    if (filtros.limit) params.append('limit', filtros.limit);
    if (filtros.offset) params.append('offset', filtros.offset);

    const response = await api.get(`/quotations/list?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error al listar cotizaciones:', error);
    throw error;
  }
};

export const getQuotationById = async (id) => {
  try {
    const response = await api.get(`/quotations/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener cotización:', error);
    throw error;
  }
};

export const cancelQuotation = async (id) => {
  try {
    const response = await api.put(`/quotations/${id}/cancel`);
    return response.data;
  } catch (error) {
    console.error('❌ Error al anular cotización:', error);
    throw error;
  }
};

// ============================================================
// HELPERS DE FORMATEO
// ============================================================

export const formatDateToYYYYMMDD = (date = new Date()) => {
  let dateObj;

  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'number') {
    return date;
  } else {
    dateObj = new Date();
  }

  if (isNaN(dateObj.getTime())) {
    console.warn('⚠️ Fecha inválida, usando fecha actual');
    dateObj = new Date();
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  return parseInt(`${year}${month}${day}`);
};

export const formatDateToInputValue = (date) => {
  if (!date) return '';

  if (typeof date === 'number') {
    const str = String(date);
    return `${str.substring(0, 4)}-${str.substring(4, 6)}-${str.substring(6, 8)}`;
  }

  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return date;
};

export const formatTimeToHHMM = (date = new Date()) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return parseInt(`${hours}${minutes}`);
};

export const normalizeRUC = (ruc) => {
  if (!ruc) return null;
  const rucStr = String(ruc).replace(/[-\s]/g, '');
  if (rucStr.length === 11) return parseInt(rucStr.substring(0, 10));
  return parseInt(rucStr);
};

export const extractRUCDigit = (ruc) => {
  if (!ruc) return null;
  const rucStr = String(ruc).replace(/[-\s]/g, '');
  if (rucStr.length === 11) return parseInt(rucStr.charAt(10));
  return null;
};

export const extractVendorCode = (vendorString) => {
  if (!vendorString) return 'VEND01';

  const str = String(vendorString).trim();
  if (str === '') return 'VEND01';

  if (str.includes(' - ')) {
    return str.split(' - ')[0].trim().substring(0, 10);
  }

  if (str.includes('-') && !str.includes(' - ')) {
    return str.split('-')[0].trim().substring(0, 10);
  }

  return str.substring(0, 10);
};

export const extractCorrelativeNumber = (correlativo) => {
  if (!correlativo) return null;
  const match = String(correlativo).match(/\d{4}$/);
  return match ? match[0] : null;
};

// ============================================================
// PAYLOADS
// ============================================================

export const prepareQuotationPayload = (
  quotationItems,
  selectedClient,
  currency,
  subtotal,
  igv,
  total,
  quotationNumber
) => {
  const now = new Date();
  const fechac = formatDateToYYYYMMDD(now);
  const horac = formatTimeToHHMM(now);

  const codigoVendedor = extractVendorCode(
    selectedClient.vendedor ||
    selectedClient.codigo_vendedor ||
    selectedClient.Vendedor
  );

  const numeroCorrelativo = extractCorrelativeNumber(quotationNumber);
  const formaPago = selectedClient.fpago || selectedClient.formaPago || 'ADE';
  const esUSD = currency === 'USD';

  console.log('🔍 Procesando datos de cliente para CREAR:');
  console.log('  - Nombre:', selectedClient.nombreCliente);
  console.log('  - Vendedor:', codigoVendedor);
  console.log('  - Forma de pago:', formaPago);

  const cabecera = {
    nomc: (selectedClient.nombreCliente || selectedClient.nombre || '').substring(0, 200),
    rucc: normalizeRUC(selectedClient.ruc),
    digc: extractRUCDigit(selectedClient.ruc),
    monedc: esUSD ? 2 : 1,
    tcvta: 3.75,
    imporc: total,
    fechac,
    horac,
    reg: numeroCorrelativo,
    succ: 1,
    vend: codigoVendedor,
    forpag: formaPago,
    fv: 15,
    cont: 0,
    dirc: (selectedClient.direccion || '').substring(0, 100),
    disc: (selectedClient.distrito || '').substring(0, 50),
    contac: (selectedClient.contacto || '').substring(0, 50),
    telef1: (selectedClient.telefono || '').substring(0, 15)
  };

  const IGV_RATE = 0.18;
  const detalles = quotationItems.map((item, idx) => {
    const precioLista = item.precioLista || item.plistadol || 0;
    const precioNeto = item.precioNeto || 0;
    const quantity = item.quantity || 0;
    const precioNetoTotal = precioNeto * quantity;
    const igvTotal = precioNetoTotal * IGV_RATE;
    const descuentoTotal = (precioLista - precioNeto) * quantity;

    return {
      itemd: idx + 1,
      codigd: (item.codigo || '').substring(0, 20),
      qaprbd: quantity,
      regd: numeroCorrelativo,
      dprun_usd: esUSD ? precioLista : 0,
      dides_usd: esUSD ? descuentoTotal : 0,
      dinet_usd: esUSD ? precioNetoTotal : 0,
      diigv_usd: esUSD ? igvTotal : 0,
      dpruns: !esUSD ? precioLista : 0,
      didess: !esUSD ? descuentoTotal : 0,
      dinets: !esUSD ? precioNetoTotal : 0,
      diigvs: !esUSD ? igvTotal : 0,
      pdsc1d: item.discount1 || 0,
      pdsc2d: 0,
      pdsc3d: 0,
      pdsc4d: 0,
      pdsc5d: item.discount5 || 0,
      fechad: fechac,
      horad: horac
    };
  });

  return { cabecera, detalles };
};

/**
 * ✅ Preparar payload para EDITAR cotización
 * @param {object} formData   - datos del formulario
 * @param {string} correlativo - correlativo completo "COT-2026-0002"
 */
export const prepareUpdatePayload = (formData, correlativo = null) => {
  console.log('🔄 === PREPARANDO PAYLOAD DE ACTUALIZACIÓN ===');
  console.log('📦 Datos recibidos:', formData);

  const fechac = formatDateToYYYYMMDD(formData.fecha || new Date());
  const horac = formatTimeToHHMM();

  // ✅ Extraer número de correlativo para regd
  const numeroCorrelativo = extractCorrelativeNumber(
    correlativo ||
    formData.correlativo_cotiza ||
    formData.correlativo ||
    null
  );

  console.log('📅 Fecha formateada:', fechac);
  console.log('🔢 Correlativo:', numeroCorrelativo);

  // ✅ Normalizar moneda a código numérico 1/2
  const monedaInput = formData.moneda || formData.currency;
  let monedcCodigo = 2; // default USD

  if (monedaInput === 'USD' || monedaInput === '2' || Number(monedaInput) === 2) {
    monedcCodigo = 2;
  } else if (monedaInput === 'PEN' || monedaInput === '1' || Number(monedaInput) === 1) {
    monedcCodigo = 1;
  }

  const esUSD = monedcCodigo === 2;

  console.log('💱 Moneda detectada:', monedcCodigo, 'desde:', monedaInput);

  if (!formData.productos || formData.productos.length === 0) {
    console.error('❌ No hay productos en formData');
    throw new Error('No hay productos para actualizar');
  }

  const IGV_RATE = 0.18;
  let subtotalCalculado = 0;

  const detalles = formData.productos.map((item, idx) => {
    console.log(`📦 Procesando producto ${idx + 1}:`, item);

    const precioLista = Number(item.precioLista || 0);
    const precioNetoUnitario = Number(item.precioNeto || item.precioUnitario || 0);
    const cantidad = Number(item.cantidad || item.quantity || 0);

    if (isNaN(precioNetoUnitario) || precioNetoUnitario === 0) {
      console.warn(`⚠️ Producto ${idx + 1} tiene precioNeto inválido:`, item);
    }

    if (isNaN(cantidad) || cantidad === 0) {
      console.warn(`⚠️ Producto ${idx + 1} tiene cantidad inválida:`, item);
    }

    const precioNetoTotal = precioNetoUnitario * cantidad;
    const igvLinea = precioNetoTotal * IGV_RATE;
    const descuentoTotal = (precioLista - precioNetoUnitario) * cantidad;

    subtotalCalculado += precioNetoTotal;

    console.log(`   ✓ Precio Lista: ${precioLista}`);
    console.log(`   ✓ Precio Neto Unitario: ${precioNetoUnitario}`);
    console.log(`   ✓ Cantidad: ${cantidad}`);
    console.log(`   ✓ Precio Neto Total: ${precioNetoTotal.toFixed(2)}`);
    console.log(`   ✓ Descuento Total: ${descuentoTotal.toFixed(2)}`);

    return {
      itemd: idx + 1,
      codigd: (item.codigo || '').substring(0, 20),
      qaprbd: cantidad,
      regd: numeroCorrelativo,          // ✅ ahora siempre se envía
      dprun_usd: esUSD ? precioLista : 0,
      dides_usd: esUSD ? descuentoTotal : 0,
      dinet_usd: esUSD ? precioNetoTotal : 0,
      diigv_usd: esUSD ? igvLinea : 0,
      dpruns: !esUSD ? precioLista : 0,
      didess: !esUSD ? descuentoTotal : 0,
      dinets: !esUSD ? precioNetoTotal : 0,
      diigvs: !esUSD ? igvLinea : 0,
      pdsc1d: Number(item.discount1 || 0),
      pdsc2d: Number(item.discount2 || 0),
      pdsc3d: Number(item.discount3 || 0),
      pdsc4d: Number(item.discount4 || 0),
      pdsc5d: Number(item.discount5 || 0),
      fechad: fechac,
      horad: horac
    };
  });

  const igvCalculado = subtotalCalculado * IGV_RATE;
  const totalCalculado = subtotalCalculado + igvCalculado;

  console.log('💰 === TOTALES CALCULADOS ===');
  console.log('  - Subtotal:', subtotalCalculado.toFixed(2));
  console.log('  - IGV (18%):', igvCalculado.toFixed(2));
  console.log('  - TOTAL:', totalCalculado.toFixed(2));

  if (totalCalculado === 0) {
    console.error('❌ ERROR: Total calculado es 0');
    throw new Error('El total calculado es 0. Verifica los datos de los productos.');
  }

  const cabecera = {
    nomc: (formData.cliente || '').substring(0, 200),
    rucc: normalizeRUC(formData.ruc),
    digc: extractRUCDigit(formData.ruc),
    dirc: (formData.direccion || '').substring(0, 100),
    contac: (formData.contacto || '').substring(0, 50),
    telef1: (formData.telefono || '').substring(0, 15),
    monedc: monedcCodigo,
    tcvta: Number(formData.tipoCambio || 3.75),
    imporc: totalCalculado,
    fechac,
    vend: extractVendorCode(formData.asesor || formData.vendedor),
    forpag: formData.formaPago || 'ADE'
  };

  console.log('✅ === PAYLOAD FINAL ===');
  console.log('Cabecera MONEDC:', cabecera.monedc, '| IMPORC:', cabecera.imporc);
  console.log('Correlativo detalles (regd):', numeroCorrelativo);
  console.log('Total detalles:', detalles.length);

  return { cabecera, detalles };
};

export default {
  registerQuotation,
  updateQuotation,
  getNextCorrelative,
  listQuotations,
  getQuotationById,
  cancelQuotation,
  formatDateToYYYYMMDD,
  formatDateToInputValue,
  formatTimeToHHMM,
  normalizeRUC,
  extractRUCDigit,
  extractVendorCode,
  extractCorrelativeNumber,
  prepareQuotationPayload,
  prepareUpdatePayload
};
