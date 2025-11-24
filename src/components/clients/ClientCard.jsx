import React from 'react';
import { Edit2, Trash2, User, Building2, Mail, Phone, MapPin } from 'lucide-react';

const ClientCard = ({ client, onEdit, onDelete, onToggleStatus }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{client.nombre}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${
              client.activo 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {client.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(client)}
            className="text-blue-600 hover:text-blue-800 transition p-1"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(client.id)}
            className="text-red-600 hover:text-red-800 transition p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span className="truncate">{client.empresa}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="truncate">{client.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="w-4 h-4 text-gray-400" />
          <span>{client.telefono1}</span>
        </div>
        {client.telefono2 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>{client.telefono2}</span>
          </div>
        )}
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
          <span className="line-clamp-2">{client.direccion}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Creado: {client.created_at}
        </span>
        <button
          onClick={() => onToggleStatus(client.id)}
          className={`text-xs px-3 py-1 rounded-full transition ${
            client.activo
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {client.activo ? 'Desactivar' : 'Activar'}
        </button>
      </div>
    </div>
  );
};

export default ClientCard;