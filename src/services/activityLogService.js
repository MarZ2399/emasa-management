import api from './api';

export const EVENTOS = {
  LOGIN:                 'LOGIN',
  LOGOUT:                'LOGOUT',
  CLIENTE_CONSULTADO:    'CLIENTE_CONSULTADO',
  COTIZACION_REGISTRADA: 'COTIZACION_REGISTRADA',
  COTIZACION_EDITADA:    'COTIZACION_EDITADA',
  COTIZACION_ANULADA:    'COTIZACION_ANULADA',
  COTIZACION_DUPLICADA:  'COTIZACION_DUPLICADA',
  LLAMADA_REGISTRADA:    'LLAMADA_REGISTRADA',
  LLAMADA_EDITADA:       'LLAMADA_EDITADA',
  LLAMADA_ELIMINADA:     'LLAMADA_ELIMINADA',
};

const getLocation = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        latitud:   pos.coords.latitude,
        longitud:  pos.coords.longitude,
        precision: Math.round(pos.coords.accuracy)
      }),
      () => resolve(null),
      { timeout: 10000, maximumAge: 300000 }
    );
  });

//  Ahora retorna objeto con dirección y ubigeo
const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'es' } }
    );
    const data = await res.json();
    console.log('🗺️ Nominatim address completo:', JSON.stringify(data.address, null, 2));
    return {
  direccion: data.display_name || null,
  pais:      data.address?.country                                    || null,
  region:    data.address?.state_district || data.address?.state      || null, // Lima Metropolitana
  provincia: data.address?.region         || data.address?.county     || null, // Lima
  distrito:  data.address?.city           || data.address?.suburb     || null  // Magdalena del Mar
};
  } catch {
    return { direccion: null, pais: null, region: null, provincia: null, distrito: null };
  }
};

export const logActivity = async (evento, referencia_id = null) => {
  try {
    const ubicacion = await getLocation();

    //  Destructurar ubigeo del reverseGeocode
    const { direccion, pais, region, provincia, distrito } = ubicacion?.latitud
      ? await reverseGeocode(ubicacion.latitud, ubicacion.longitud)
      : { direccion: null, pais: null, region: null, provincia: null, distrito: null };

    await api.post('/activity-log', {
  evento,
  referencia_id,
  latitud:   ubicacion?.latitud   ?? null,  // 
  longitud:  ubicacion?.longitud  ?? null,  // 
  precision: ubicacion?.precision ?? null,  // 
  direccion,
  pais,
  region,
  provincia,
  distrito
});
  } catch {
    // Silencioso — nunca bloquea el flujo principal
  }
};

export default { logActivity, EVENTOS };
