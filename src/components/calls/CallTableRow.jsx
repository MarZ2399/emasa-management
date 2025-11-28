import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const CallTableRow = ({ record, index, onEdit, onDelete }) => {
  return (
    <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
      <td className="pl-6 pr-4 py-3 text-sm text-gray-900 whitespace-nowrap">
        {record.fechaGestion}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">
        {record.resultadoGestion}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">
        {record.asesor}
      </td>
      {/* ✅ Nueva columna: Contactado */}
      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
        {record.contactadoNombre || '-'}
      </td>
      <td className="px-4 py-3">
        {record.contacto && (
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            record.contacto === 'Inbound' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-orange-100 text-orange-800'
          }`}>
            {record.contacto}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">
        {record.telef1}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">
        {record.telef2}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">
        {record.usuario}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
        <div className="truncate" title={record.observaciones}>
          {record.observaciones}
        </div>
      </td>
      <td className="pl-4 pr-6 py-3">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onEdit(record)}
            className="text-blue-600 hover:text-blue-800 transition p-1"
            title="Editar registro"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(record.id)}
            className="text-red-600 hover:text-red-800 transition p-1"
            title="Eliminar registro"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default CallTableRow;
