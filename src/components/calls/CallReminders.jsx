// src/components/calls/CallReminders.jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { Bell, X, Calendar, Clock, Phone, User } from 'lucide-react';

const URGENCY_STYLE = {
  overdue:  'bg-red-50 border-red-200',
  critical: 'bg-orange-50 border-orange-200',
  urgent:   'bg-yellow-50 border-yellow-200',
  soon:     'bg-blue-50 border-blue-200',
  normal:   'bg-gray-50 border-gray-200',
};

const URGENCY_BADGE = {
  overdue:  'bg-red-600 text-white',
  critical: 'bg-orange-500 text-white',
  urgent:   'bg-yellow-500 text-white',
  soon:     'bg-blue-500 text-white',
  normal:   'bg-gray-500 text-white',
};

const URGENCY_ICON = {
  overdue:  '⚠️',
  critical: '🔔',
  urgent:   '⏰',
  soon:     '📅',
  normal:   '🔔',
};

const CallReminders = ({ reminders = [], isOpen, onClose, onDismiss }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 bg-black/30 z-[9998]" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-[9999] flex flex-col">

        {/* Header */}
        <div className="bg-[#334a5e] text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Recordatorios</h3>
              <p className="text-xs text-blue-200">
                {reminders.length} llamada{reminders.length !== 1 ? 's' : ''} programada{reminders.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {reminders.length > 0 ? reminders.map(reminder => (
            <div
              key={reminder.id}
              className={`rounded-xl border-2 p-4 transition hover:shadow-md ${URGENCY_STYLE[reminder.urgency] ?? URGENCY_STYLE.normal}`}
            >
              {/* Top row: badge + dismiss */}
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${URGENCY_BADGE[reminder.urgency] ?? URGENCY_BADGE.normal}`}>
                  {URGENCY_ICON[reminder.urgency]} {reminder.timeLabel}
                </span>
                {/*  Botón descartar */}
                <button
                  onClick={() => onDismiss?.(reminder.id)}
                  className="p-1 rounded-full hover:bg-black/10 text-gray-400 hover:text-gray-600 transition"
                  title="Descartar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Cliente */}
              <h4 className="font-bold text-gray-900 text-sm mb-2 truncate">
                {reminder.clienteNombre}
              </h4>

              {/* Datos */}
              <div className="space-y-1.5 text-xs text-gray-600">
                {reminder.asesor && (
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                    <span>{reminder.asesor}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                  <span>{reminder.proxLlamadaDate?.toLocaleDateString('es-PE')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                  <span>
                    {reminder.proxLlamadaDate?.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {reminder.telef1 && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                    <a href={`tel:${reminder.telef1}`} className="hover:text-blue-600 font-medium">
                      {reminder.telef1}
                    </a>
                  </div>
                )}
              </div>

              {reminder.observaciones && (
                <p className="mt-2 text-xs text-gray-500 italic border-t border-gray-200 pt-2 line-clamp-2">
                  {reminder.observaciones}
                </p>
              )}
            </div>
          )) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">Sin recordatorios pendientes</p>
              <p className="text-gray-400 text-xs mt-1">Las próximas llamadas aparecerán aquí</p>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

export default CallReminders;
