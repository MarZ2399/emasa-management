// src/hooks/useCallReminders.js
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useCallReminders = () => {
  const [reminders, setReminders] = useState([]);

  const fetchReminders = useCallback(async () => {
    try {
      const response = await api.get('/calls/reminders?dias=7');
      if (!response.data.success) return;

      const now = new Date();
      const mapped = response.data.data.map(r => {
        const fecha    = new Date(r.fecha_prox_llamada);
        const timeDiff = fecha - now;
        const minutos  = Math.floor(timeDiff / 60000);
        const horas    = Math.floor(timeDiff / 3600000);
        const dias     = Math.floor(timeDiff / 86400000);

        let urgency = 'normal', timeLabel = '';
        if      (timeDiff < 0)  { urgency = 'overdue';  timeLabel = 'Vencida'; }
        else if (minutos <= 30) { urgency = 'critical'; timeLabel = `En ${minutos} min`; }
        else if (horas < 24)    { urgency = 'urgent';   timeLabel = `En ${horas}h`; }
        else if (dias <= 3)     { urgency = 'soon';     timeLabel = `En ${dias} días`; }
        else                    {                        timeLabel = `En ${dias} días`; }

        return {
          id:               r.id_llamada,
          ruc:              r.ruc_emp_contacto,
          clienteNombre:    r.cliente_nombre,
          nombreContactado: r.nombre_contactado,
          telef1:           r.telefono_1,
          asesor:           r.nom_asesor,
          observaciones:    r.observaciones,
          proxLlamadaDate:  fecha,
          urgency,
          timeLabel,
          timeDiff
        };
      });

      mapped.sort((a, b) => a.timeDiff - b.timeDiff);
      setReminders(mapped);
    } catch (error) {
      console.error('❌ Error reminders:', error);
    }
  }, []);

  useEffect(() => {
    fetchReminders();
    const interval = setInterval(fetchReminders, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchReminders]);

  //  Descartar localmente
  const dismissReminder = (id) => setReminders(prev => prev.filter(r => r.id !== id));

  return { reminders, dismissReminder };
};
