// src/services/orderRequestService.js
import api from './api';

export const getOrderPreview = async (idCotizac) => {
  const { data } = await api.get(`/order-requests/preview/${idCotizac}`);
  return data.data;
};

export const transmitOrder = async (idCotizac, formData) => {
  const payload = {
    fase: 'C',

    // Transporte
    codigoTransporte:         formData.pagoTransporte       || '',  // → FIL2PW
    transporteZona:           formData.transporteZona,

    // Entrega
    tipoEntrega:              formData.tipoEntrega,
    observacionDespacho:      formData.direccionDespacho    || '',  // → OBDEPW
    lugarDespacho:            formData.distritoDespacho
                                ? `${formData.distritoDespacho}, ${formData.provinciaDespacho}`
                                : '',                               // → LUDEPW

    // Contacto
    telefonoAdicional:        formData.agenciaDespacho?.telefono || '', // → FIL3PW
    contactoNombre:           formData.agenciaDespacho?.nombre   || '',
    contactoDni:              formData.agenciaDespacho?.dni      || '',

    // Observaciones
    observacionPrecio:        formData.observaciones          || '', // → OBPRPW
    observacionesCreditos:    formData.observacionesCreditos  || '', // → OBREPW ✅
    observacionesLogistica:   formData.observacionesLogistica || '', // → FIL1PW ✅

    // Orden y fecha
    ordenCompra:              formData.ordenCompra            || '', // → ORDCPW ✅
    fechaEntrega:             formData.fechaEntrega           || '', // → SIPEPW ✅
  };

  const { data } = await api.post(`/order-requests/transmit/${idCotizac}`, payload);
  return data.data;
};
