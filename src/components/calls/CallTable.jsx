import React from 'react';
import CallTableRow from './CallTableRow';

const CallTable = ({ records, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1000px]">
        <thead className="bg-blue-200 text-white">
          <tr>
            <th className="px-6 py-3 text-left text-xs lg:text-sm font-semibold">
              Fecha Gestión
            </th>
            <th className="px-4 py-3 text-left text-xs lg:text-sm font-semibold">
              Resultados Gestión
            </th>
            <th className="px-4 py-3 text-left text-xs lg:text-sm font-semibold">
              Asesor
            </th>
            <th className="px-4 py-3 text-left text-xs lg:text-sm font-semibold">
              Contacto
            </th>
            <th className="px-4 py-3 text-left text-xs lg:text-sm font-semibold">
              Telef 1
            </th>
            <th className="px-4 py-3 text-left text-xs lg:text-sm font-semibold">
              Telef 2
            </th>
            <th className="px-4 py-3 text-left text-xs lg:text-sm font-semibold">
              Usuario
            </th>
            <th className="px-4 py-3 text-left text-xs lg:text-sm font-semibold">
              Observaciones
            </th>
            <th className="px-6 py-3 text-center text-xs lg:text-sm font-semibold">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {records.length > 0 ? (
            records.map((record, index) => (
              <CallTableRow
                key={record.id}
                record={record}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          ) : (
            <tr>
              <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                No se encontraron registros de llamadas
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CallTable;
