// src/components/layout/header/NotificationDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';

const NotificationDropdown = ({ reminders = [], onViewAll }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Calcular notificaciones urgentes
  const urgentReminders = reminders.filter(r => 
    r.urgency === 'overdue' || r.urgency === 'critical' || r.urgency === 'urgent'
  );
  
  const unreadCount = urgentReminders.length;

  // Tomar solo las 4 más recientes para la vista corta
  const recentReminders = reminders.slice(0, 4);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'overdue':
        return '⚠️';
      case 'critical':
        return '🔔';
      case 'urgent':
        return '⏰';
      case 'soon':
        return '📅';
      default:
        return '🔔';
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    onViewAll?.();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon with Badge - SIN animate-pulse */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Notificaciones ({reminders.length})
            </h3>
            {unreadCount > 0 && (
              <button className="text-xs text-[#2ecc70] hover:underline font-medium">
                Marcar todo como leído
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {recentReminders.length > 0 ? (
              recentReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    reminder.urgency === 'overdue' || reminder.urgency === 'critical' 
                      ? 'bg-red-50' 
                      : reminder.urgency === 'urgent' 
                      ? 'bg-yellow-50' 
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {(reminder.urgency === 'overdue' || reminder.urgency === 'critical' || reminder.urgency === 'urgent') && (
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm ${
                        reminder.urgency === 'overdue' || reminder.urgency === 'critical' 
                          ? 'font-semibold text-gray-900' 
                          : 'text-gray-700'
                      }`}>
                        {getUrgencyIcon(reminder.urgency)} Llamada programada - {reminder.clienteNombre}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{reminder.timeLabel}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No hay llamadas programadas</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 text-center border-t border-gray-200">
            <button 
              onClick={handleViewAll}
              className="text-sm text-[#2ecc70] hover:underline font-medium"
            >
              Ver todas las notificaciones...
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
