// src/services/orderRequestService.js
import api from './api';

export const getOrderPreview = async (idCotizac) => {
  const { data } = await api.get(`/order-requests/preview/${idCotizac}`);
  return data.data;
};

// Mapeo tipoEntrega texto → número para FIL1PW
const tipoEntregaMap = {
  'despacho':          1,
  'retiro':            2,
  'nueva_direccion':   3,
};


export const transmitOrder = async (idCotizac, formData) => {
  const payload = {
    fase: 'C',

    // Transporte
    codigoTransporte:         formData.pagoTransporte       || '',
    transporteZona:           formData.transporteZona,

    // Entrega
    tipoEntrega:              tipoEntregaMap[formData.tipoEntrega] ?? 1, //  número para FIL1PW
    observacionDespacho:      formData.direccionDespacho    || '',
    lugarDespacho:            formData.distritoDespacho
                                ? `${formData.distritoDespacho}, ${formData.provinciaDespacho}`
                                : '',

    // Contacto
    telefonoAdicional:        formData.agenciaDespacho?.telefono || '',
    contactoNombre:           formData.agenciaDespacho?.nombre   || '',
    contactoDni:              formData.agenciaDespacho?.dni      || '',

    // Observaciones
    observacionPrecio:        formData.observaciones          || '',
    observacionesCreditos:    formData.observacionesCreditos  || '',
    observacionesLogistica:   formData.observacionesLogistica || '',

    // Orden y fecha
    ordenCompra:              formData.ordenCompra            || '',
    fechaEntrega:             formData.fechaEntrega           || '',

    //  Nueva dirección — códigos y nombres para vta.shipping_address_cli
    direccionDespacho:        formData.direccionDespacho      || '',
    deptoDespacho:            formData.deptoDespacho          || '',
    provinciaDespacho:        formData.provinciaDespacho      || '',
    distritoDespacho:         formData.distritoDespacho       || '',
    deptoNombre:              formData.deptoNombre            || '',
    provinciaNombre:          formData.provinciaNombre        || '',
    distritoNombre:           formData.distritoNombre         || '',

    formaPago:                formData.formaPago              || 'ADE',  // → OBREPW + order_request_details
    pagoTransporte:           formData.pagoTransporte         || '',     // → order_request_details (label)
    agenciaDespacho: {
      nombre:   formData.agenciaDespacho?.nombre   || '',
      dni:      formData.agenciaDespacho?.dni      || '',
      telefono: formData.agenciaDespacho?.telefono || '',
    }, 
  };

  const { data } = await api.post(`/order-requests/transmit/${idCotizac}`, payload);
  return data.data;
};
