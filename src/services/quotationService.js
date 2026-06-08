// services/quotationService.js
import api from './api';

/**
 * Servicio de Cotizaciones
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

    console.log(' Respuesta del servidor:', response.data);
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
  if (typeof date === 'string') {
    const clean = date.split('T')[0];
    if (clean.includes('-')) {
      const [year, month, day] = clean.split('-');
      return parseInt(`${year}${month}${day}`);
    }
  }

  if (typeof date === 'number') return date;

  const dateObj = date instanceof Date ? date : new Date();

  if (isNaN(dateObj.getTime())) {
    console.warn('⚠️ Fecha inválida, usando fecha actual');
    return parseInt(new Date().toLocaleDateString('sv-SE').replace(/-/g, ''));
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
  const match = String(correlativo).match(/COT\d{2}-(\d+)/);
  return match ? match[1] : null;
};

const roundTo = (value, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
};

const roundTo6 = (value) => {
  const factor = 10 ** 6;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
};

const calcDetalleVisual = (item) => {
  const precioLista = Number(
    item.precioLista ??
    item.plistadol ??
    item.preciosDetalle?.importes?.ldol ??
    item.preciosDetalle?.importes?.dola ??
    item.dola ??
    0
  );

  const discount1 = Number(item.discount1 || 0);
  const discount5 = Number(item.discount5 || 0);
  const quantity = Math.max(1, Number(item.quantity || item.cantidad || 1));

  const de01 = discount1 / 100;
  const de05 = discount5 / 100;

  const precioUnitExactoCalculado = precioLista * (1 - de01) * (1 - de05);
  const precioUnitVisual = roundTo(precioUnitExactoCalculado, 4);

  const precioNetoTotalVisual = roundTo(precioUnitExactoCalculado * quantity, 2);
  const igvTotalVisual = roundTo(precioNetoTotalVisual * 0.18, 2);
  const importeTotalVisual = roundTo(precioNetoTotalVisual + igvTotalVisual, 2);

  const descuentoUnitExacto = precioLista - precioUnitExactoCalculado;
  const descuentoTotalVisual = roundTo(descuentoUnitExacto * quantity, 2);

  return {
    precioLista,
    discount1,
    discount5,
    quantity,
    precioUnitVisual,
    precioNetoTotalVisual,
    igvTotalVisual,
    importeTotalVisual,
    descuentoTotalVisual,
  };
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
  quotationNumber,
  codigoVendedorLogueado
) => {
  const now = new Date();
  const fechac = formatDateToYYYYMMDD(now);
  const horac = formatTimeToHHMM(now);

  const codigoVendedor = codigoVendedorLogueado
    ? extractVendorCode(codigoVendedorLogueado)
    : extractVendorCode(
        selectedClient.vendedor ||
        selectedClient.codigo_vendedor ||
        selectedClient.Vendedor
      );

  // const numeroCorrelativo = extractCorrelativeNumber(quotationNumber);
  const formaPago = selectedClient.fpago || selectedClient.formaPago || 'ADE';
  const esUSD = currency === 'USD';

  console.log('🔍 Procesando datos de cliente para CREAR:');
  console.log('  - Nombre:', selectedClient.nombreCliente);
  console.log('  - Vendedor:', codigoVendedor);
  console.log('  - Forma de pago:', formaPago);

  const detallesCalculados = quotationItems.map((item, idx) => {
    const calc = calcDetalleVisual(item);

    return {
      itemd: idx + 1,
      codigd: (item.codigo || '').substring(0, 20),
      qaprbd: calc.quantity,
      // regd: numeroCorrelativo,
      nom_prod: (item.nombre || item.descripcion || '').substring(0, 150),

      dprun_usd: esUSD ? roundTo6(calc.precioLista) : 0,
      dides_usd: esUSD ? roundTo6(calc.descuentoTotalVisual) : 0,
      dinet_usd: esUSD ? roundTo6(calc.precioNetoTotalVisual) : 0,
      diigv_usd: esUSD ? roundTo6(calc.igvTotalVisual) : 0,

      dpruns: !esUSD ? roundTo6(calc.precioLista) : 0,
      didess: !esUSD ? roundTo6(calc.descuentoTotalVisual) : 0,
      dinets: !esUSD ? roundTo6(calc.precioNetoTotalVisual) : 0,
      diigvs: !esUSD ? roundTo6(calc.igvTotalVisual) : 0,

      pdsc1d: calc.discount1,
      pdsc2d: 0,
      pdsc3d: 0,
      pdsc4d: 0,
      pdsc5d: calc.discount5,
      fechad: fechac,
      horad: horac
    };
  });

  const subtotalVisual = roundTo(detallesCalculados.reduce((acc, item) => {
    return acc + Number(esUSD ? item.dinet_usd : item.dinets);
  }, 0), 2);

  const igvVisual = roundTo(subtotalVisual * 0.18, 2);
  const totalVisual = roundTo(subtotalVisual + igvVisual, 2);

  const cabecera = {
    nomc: (selectedClient.nombreCliente || selectedClient.nombre || '').substring(0, 200),
    rucc: normalizeRUC(selectedClient.ruc),
    digc: extractRUCDigit(selectedClient.ruc),
    monedc: esUSD ? 2 : 1,
    tcvta: 3.75,
    imporc: roundTo6(totalVisual),
    fechac,
    horac,
    // reg: numeroCorrelativo,
    succ: 1,
    vend: codigoVendedor,
    forpag: formaPago,
    fv: 15,
    cont: 0,
    dirc: (selectedClient.direccion || '').substring(0, 100),
    disc: (selectedClient.distrito || '').substring(0, 50),
    contac: (selectedClient.contacto || '').substring(0, 50),
    telef1: (selectedClient.telefono || '').substring(0, 15),
    cod_alm: selectedClient.cod_alm || null,
    codnum_alm: selectedClient.codnum_alm ?? null,
  };

  console.log('🧮 Payload CREATE calculado visual:');
  console.log('  - subtotalVisual:', subtotalVisual);
  console.log('  - igvVisual:', igvVisual);
  console.log('  - totalVisual:', totalVisual);
  console.log('  - cabecera.imporc:', cabecera.imporc);
  console.log('  - detalles:', detallesCalculados);

  return { cabecera, detalles: detallesCalculados };
};

/**
 * Preparar payload para EDITAR cotización
 * @param {object} formData - datos del formulario
 * @param {string} correlativo - correlativo completo "COT-2026-0002"
 */
export const prepareUpdatePayload = (formData, correlativo = null, codigoVendedorLogueado = null) => {
  console.log('🔄 === PREPARANDO PAYLOAD DE ACTUALIZACIÓN ===');
  console.log('📦 Datos recibidos:', formData);

  const fechac = formatDateToYYYYMMDD(formData.fecha || new Date());
  const horac = formatTimeToHHMM();

  // const numeroCorrelativo = extractCorrelativeNumber(
  //   correlativo ||
  //   formData.correlativo_cotiza ||
  //   formData.correlativo ||
  //   null
  // );

  console.log('📅 Fecha formateada:', fechac);
  // console.log('🔢 Correlativo:', numeroCorrelativo);

  const monedaInput = formData.moneda || formData.currency;
  let monedcCodigo = 2;

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

  const detalles = formData.productos.map((item, idx) => {
    console.log(`📦 Procesando producto ${idx + 1}:`, item);

    const calc = calcDetalleVisual(item);

    console.log(`   ✓ Precio Lista: ${calc.precioLista}`);
    console.log(`   ✓ Precio Neto Unitario Visual: ${calc.precioUnitVisual}`);
    console.log(`   ✓ Cantidad: ${calc.quantity}`);
    console.log(`   ✓ Precio Neto Total Visual: ${calc.precioNetoTotalVisual}`);
    console.log(`   ✓ Descuento Total Visual: ${calc.descuentoTotalVisual}`);

    return {
      itemd: idx + 1,
      codigd: (item.codigo || '').substring(0, 20),
      qaprbd: calc.quantity,
      // regd: numeroCorrelativo,
      nom_prod: (item.nombre || item.descripcion || '').substring(0, 150),

      dprun_usd: esUSD ? roundTo6(calc.precioLista) : 0,
      dides_usd: esUSD ? roundTo6(calc.descuentoTotalVisual) : 0,
      dinet_usd: esUSD ? roundTo6(calc.precioNetoTotalVisual) : 0,
      diigv_usd: esUSD ? roundTo6(calc.igvTotalVisual) : 0,

      dpruns: !esUSD ? roundTo6(calc.precioLista) : 0,
      didess: !esUSD ? roundTo6(calc.descuentoTotalVisual) : 0,
      dinets: !esUSD ? roundTo6(calc.precioNetoTotalVisual) : 0,
      diigvs: !esUSD ? roundTo6(calc.igvTotalVisual) : 0,

      pdsc1d: Number(calc.discount1 || 0),
      pdsc2d: Number(item.discount2 || 0),
      pdsc3d: Number(item.discount3 || 0),
      pdsc4d: Number(item.discount4 || 0),
      pdsc5d: Number(calc.discount5 || 0),
      fechad: fechac,
      horad: horac
    };
  });

  const subtotalCalculado = roundTo(detalles.reduce((acc, item) => {
    return acc + Number(esUSD ? item.dinet_usd : item.dinets);
  }, 0), 2);

  const igvCalculado = roundTo(subtotalCalculado * 0.18, 2);
  const totalCalculado = roundTo(subtotalCalculado + igvCalculado, 2);

  console.log('💰 === TOTALES CALCULADOS VISUALES ===');
  console.log('  - Subtotal:', subtotalCalculado);
  console.log('  - IGV (18%):', igvCalculado);
  console.log('  - TOTAL:', totalCalculado);

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
    imporc: roundTo6(totalCalculado),
    fechac,
    vend: codigoVendedorLogueado
      ? extractVendorCode(codigoVendedorLogueado)
      : extractVendorCode(formData.asesor || formData.vendedor),
    forpag: formData.formaPago || 'ADE',
    cod_alm: formData.cod_alm || null,
    codnum_alm: formData.codnum_alm ?? null,
  };

  console.log('=== PAYLOAD FINAL ===');
  console.log('Cabecera MONEDC:', cabecera.monedc, '| IMPORC:', cabecera.imporc);
  // console.log('Correlativo detalles (regd):', numeroCorrelativo);
  console.log('Total detalles:', detalles.length);

  return { cabecera, detalles };
};

export const duplicateQuotation = async (id) => {
  try {
    const response = await api.post(`/quotations/${id}/duplicate`);
    return response.data;
  } catch (error) {
    console.error('❌ Error al duplicar cotización:', error);
    throw error;
  }
};

export default {
  registerQuotation,
  updateQuotation,
  getNextCorrelative,
  listQuotations,
  getQuotationById,
  cancelQuotation,
  duplicateQuotation,
  formatDateToYYYYMMDD,
  formatDateToInputValue,
  formatTimeToHHMM,
  normalizeRUC,
  extractRUCDigit,
  extractVendorCode,
  // extractCorrelativeNumber,
  prepareQuotationPayload,
  prepareUpdatePayload
};