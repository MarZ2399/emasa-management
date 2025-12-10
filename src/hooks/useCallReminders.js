// src/hooks/useCallReminders.js
import { useState, useEffect } from 'react';

export const useCallReminders = (callRecords) => {
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    const checkUpcomingCalls = () => {
      const now = new Date();
      const upcoming = [];

      callRecords.forEach(record => {
        if (!record.proxLlamada) return;

        let proxLlamadaDate;
        
        if (record.proxLlamada.includes('T')) {
          proxLlamadaDate = new Date(record.proxLlamada);
        } else {
          const [datePart, timePart] = record.proxLlamada.split(' ');
          if (!datePart || !timePart) return;
          
          const [day, month, year] = datePart.split('/');
          const [hours, minutes] = timePart.split(':');
          
          proxLlamadaDate = new Date(year, month - 1, day, hours, minutes);
        }

        if (isNaN(proxLlamadaDate.getTime())) return;

        const timeDiff = proxLlamadaDate - now;
        const minutesDiff = Math.floor(timeDiff / (1000 * 60));
        const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        let urgency = 'normal';
        let timeLabel = '';

        if (timeDiff < 0) {
          urgency = 'overdue';
          timeLabel = 'Vencida';
        } else if (minutesDiff <= 30) {
          urgency = 'critical';
          timeLabel = `En ${minutesDiff} minutos`;
        } else if (hoursDiff < 24) {
          urgency = 'urgent';
          timeLabel = `En ${hoursDiff} horas`;
        } else if (daysDiff <= 3) {
          urgency = 'soon';
          timeLabel = `En ${daysDiff} días`;
        } else {
          timeLabel = `En ${daysDiff} días`;
        }

        upcoming.push({
          ...record,
          proxLlamadaDate,
          urgency,
          timeLabel,
          timeDiff
        });
      });

      upcoming.sort((a, b) => a.timeDiff - b.timeDiff);
      setReminders(upcoming);
    };

    checkUpcomingCalls();
    const interval = setInterval(checkUpcomingCalls, 60000);
    return () => clearInterval(interval);
  }, [callRecords]);

  return reminders;
};
