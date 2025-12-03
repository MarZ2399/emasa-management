import React from 'react';
import { Edit2, Trash2, Calendar, Clock } from 'lucide-react';

const CallTableRow = ({ record, index, onEdit, onDelete }) => {
  // Función para formatear la fecha de próxima llamada
  const formatProxLlamada = (proxLlamada) => {
    if (!proxLlamada) return '-';
    
    try {
      const date = new Date(proxLlamada);
      if (isNaN(date.getTime())) return '-';
      
      const now = new Date();
      const isPast = date < now;
      const isToday = date.toDateString() === now.toDateString();
      const isTomorrow = new Date(now.getTime() + 86400000).toDateString() === date.toDateString();
      
      const dateStr = date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
      const timeStr = date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      let badge = '';
      let badgeClass = '';
      
      if (isPast) {
        badge = '🔴 Vencida';
        badgeClass = 'bg-red-100 text-red-800 border-red-300';
      } else if (isToday) {
        badge = '🟠 Hoy';
        badgeClass = 'bg-orange-100 text-orange-800 border-orange-300';
      } else if (isTomorrow) {
        badge = '🟡 Mañana';
        badgeClass = 'bg-yellow-100 text-yellow-800 border-yellow-300';
      } else {
        badgeClass = 'bg-blue-100 text-blue-800 border-blue-300';
      }
      
      return (
        <div className="space-y-1">
          {badge && (
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}`}>
              {badge}
            </span>
          )}
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Calendar className="w-3 h-3" />
            <span>{dateStr}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Clock className="w-3 h-3" />
            <span>{timeStr}</span>
          </div>
        </div>
      );
    } catch (error) {
      return '-';
    }
  };

  return (
    <tr className={`hover:bg-gray-50 transition ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
      <td className="pl-6 pr-4 py-4 text-xs text-gray-900 whitespace-nowrap">
        {record.fechaGestion}
      </td>
      <td className="px-4 py-4 text-xs text-gray-900">
        {record.resultadoGestion}
      </td>
      <td className="px-4 py-4 text-xs text-gray-900 whitespace-nowrap">
        {record.asesor}
      </td>
      <td className="px-4 py-4 text-xs text-gray-900 whitespace-nowrap">
        {record.contactadoNombre || '-'}
      </td>
      <td className="px-4 py-4 text-xs whitespace-nowrap">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          record.contacto === 'Inbound' 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : 'bg-blue-100 text-blue-800 border border-blue-300'
        }`}>
          {record.contacto}
        </span>
      </td>
      {/* ✅ NUEVA CELDA: Próxima Llamada */}
      <td className="px-4 py-4 text-xs">
        {formatProxLlamada(record.proxLlamada)}
      </td>
      <td className="px-4 py-4 text-xs text-gray-900 whitespace-nowrap">
        {record.telef1 || '-'}
      </td>
      <td className="px-4 py-4 text-xs text-gray-900 whitespace-nowrap">
        {record.telef2 || '-'}
      </td>
      <td className="px-4 py-4 text-xs text-gray-900 whitespace-nowrap">
        {record.usuario || '-'}
      </td>
      <td className="px-4 py-4 text-xs text-gray-700 max-w-xs truncate">
        {record.observaciones || '-'}
      </td>
      <td className="pl-4 pr-6 py-4 whitespace-nowrap text-center">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onEdit(record)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(record.id)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default CallTableRow;
