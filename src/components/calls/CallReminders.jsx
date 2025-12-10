// src/components/calls/CallReminders.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Bell, X, Calendar, Clock, Phone, User } from 'lucide-react';
import toast from 'react-hot-toast';

const CallReminders = ({ callRecords, isOpen, onClose }) => {
  const [reminders, setReminders] = useState([]);
  const [notifiedReminders, setNotifiedReminders] = useState(new Set());

  // Función para verificar si una llamada está próxima
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
    return upcoming;
  };

  useEffect(() => {
    checkUpcomingCalls();
    const interval = setInterval(checkUpcomingCalls, 60000);
    return () => clearInterval(interval);
  }, [callRecords]);

  useEffect(() => {
    const criticalReminders = reminders.filter(r => 
      r.urgency === 'critical' || r.urgency === 'overdue'
    );
    
    criticalReminders.forEach(reminder => {
      const reminderId = `reminder-${reminder.id}`;
      
      if (!notifiedReminders.has(reminderId)) {
        toast(
          (t) => (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <Bell className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {reminder.urgency === 'overdue' ? '⚠️ Llamada vencida' : '🔔 Llamada próxima'}
                </p>
                <p className="text-sm text-gray-600">{reminder.clienteNombre}</p>
                <p className="text-xs text-gray-500 mt-1">{reminder.timeLabel}</p>
              </div>
              <button 
                onClick={() => toast.dismiss(t.id)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ),
          {
            duration: 3000,
            position: 'top-right',
            style: {
              background: reminder.urgency === 'overdue' ? '#FEE2E2' : '#FEF3C7',
              border: reminder.urgency === 'overdue' ? '2px solid #DC2626' : '2px solid #F59E0B'
            }
          }
        );
        
        setNotifiedReminders(prev => new Set(prev).add(reminderId));
      }
    });
  }, [reminders, notifiedReminders]);

  const getUrgencyStyle = (urgency) => {
    switch (urgency) {
      case 'overdue':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'critical':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'urgent':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'soon':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'overdue':
        return 'bg-red-600 text-white';
      case 'critical':
        return 'bg-orange-600 text-white';
      case 'urgent':
        return 'bg-yellow-600 text-white';
      case 'soon':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  if (!isOpen) return null;

  const portalContent = (
    <>
      <div className="fixed inset-0 bg-black/30 z-[9998]" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-[9999] overflow-hidden flex flex-col animate-slide-in-right">
        <div className="bg-gradient-to-r bg-[#334a5e] to-blue-700 text-white p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6" />
              <h3 className="text-xl font-bold">Recordatorios</h3>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-blue-100">
            {reminders.length} llamada{reminders.length !== 1 ? 's' : ''} programada{reminders.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {reminders.length > 0 ? (
            reminders.map(reminder => (
              <div key={reminder.id} className={`p-4 rounded-lg border-2 transition hover:shadow-md ${getUrgencyStyle(reminder.urgency)}`}>
                <div className="flex items-start justify-between mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${getUrgencyBadge(reminder.urgency)}`}>
                    {reminder.timeLabel}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{reminder.clienteNombre}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{reminder.asesor}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{reminder.proxLlamadaDate.toLocaleDateString('es-ES')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{reminder.proxLlamadaDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {reminder.telef1 && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${reminder.telef1}`} className="hover:text-blue-600 font-medium">
                        {reminder.telef1}
                      </a>
                    </div>
                  )}
                </div>
                {reminder.observaciones && (
                  <p className="mt-2 text-xs text-gray-600 italic border-t border-gray-200 pt-2">
                    {reminder.observaciones}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay llamadas programadas</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return ReactDOM.createPortal(portalContent, document.body);
};

export default CallReminders;
