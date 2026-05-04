// services/callService.js
import api from './api';

// ============================================================
// CRUD PRINCIPAL
// ============================================================

export const getCalls = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();

    if (filtros.ruc)         params.append('ruc',         filtros.ruc);
    if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
    if (filtros.id_asesor)   params.append('id_asesor',   filtros.id_asesor);
    if (filtros.page)        params.append('page',        filtros.page);
    if (filtros.limit)       params.append('limit',       filtros.limit);

    const response = await api.get(`/calls?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error al listar llamadas:', error);
    throw error;
  }
};

export const getCallById = async (id) => {
  try {
    const response = await api.get(`/calls/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener llamada:', error);
    throw error;
  }
};

export const createCall = async (body) => {
  try {
    const response = await api.post('/calls', body);
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear llamada:', error);
    throw error;
  }
};

export const updateCall = async (id, body) => {
  try {
    console.log('📤 Actualizando llamada ID:', id);
    console.log('Datos:', body);

    const response = await api.put(`/calls/${id}`, body);

    console.log(' Respuesta del servidor:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al actualizar llamada:', error);
    throw error;
  }
};

export const deleteCall = async (id) => {
  try {
    const response = await api.delete(`/calls/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error al eliminar llamada:', error);
    throw error;
  }
};

// ============================================================
// CATÁLOGOS
// ============================================================

export const getCallCatalogo = async (tipo) => {
  try {
    const response = await api.get(`/calls/catalogos/${tipo}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error al obtener catálogo ${tipo}:`, error);
    throw error;
  }
};

// ============================================================
// HELPERS
// ============================================================

/**
 * Prepara el payload para crear/editar una llamada
 * alineado al schema de ems.llamada
 */
export const prepareCallPayload = (formData, selectedClient) => {
  console.log('🔍 Preparando payload:', {
    id_tipo_contacto:     formData.id_tipo_contacto,
    tipo_contacto_nom:    formData.tipo_contacto_nom,
    id_resultado_gestion: formData.id_resultado_gestion,
    resultado_gestion_nom: formData.resultado_gestion_nom,
  });

  const payload = {
    // Empresa contactada
    ruc_emp_contacto:  (formData.ruc_emp_contacto || selectedClient?.ruc           || '').toString().trim(),
    raz_social:        (formData.raz_social        || selectedClient?.nombreCliente || '').substring(0, 200),
    nombre_contactado: (formData.nombre_contactado || '').substring(0, 200),

    // Comunicación
    estatus_llamada:   formData.estatus_llamada || null,

    //  Forzar Number — nunca dejar como string ni usar || null
    id_tipo_contacto:      formData.id_tipo_contacto     ? Number(formData.id_tipo_contacto)     : null,
    tipo_contacto_nom:     formData.tipo_contacto_nom    || '',
    telefono_1:            (formData.telefono_1 || '').substring(0, 20),
    telefono_2:            formData.telefono_2  || null,

    //  Forzar Number
    id_resultado_gestion:  formData.id_resultado_gestion  ? Number(formData.id_resultado_gestion)  : null,
    resultado_gestion_nom: formData.resultado_gestion_nom || '',

    fecha_prox_llamada:    formData.fecha_prox_llamada || null,
    observaciones:         formData.observaciones      || null,

    //  Asesor desde el form, no pisado por el backend
    codigo_vend: (formData.codigo_vend || '').trim() || null,
nom_asesor:  (formData.nom_asesor  || '').trim() || null,
  };

  console.log(' Payload final:', payload);
  return payload;
};


// ============================================================
// EXPORT DEFAULT (mismo patrón que quotationService)
// ============================================================

export const callService = {
  getCalls,
  getCallById,
  createCall,
  updateCall,
  deleteCall,
  getCallCatalogo,
  prepareCallPayload,

  // Aliases cortos para compatibilidad con CallHistoryTab
  getAll:      getCalls,
  getById:     getCallById,
  create:      createCall,
  update:      updateCall,
  remove:      deleteCall,
  getCatalogo: getCallCatalogo,
};

export default callService;
