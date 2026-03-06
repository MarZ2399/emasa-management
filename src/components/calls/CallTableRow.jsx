import React from 'react';
import { Edit2, Trash2, Eye, Calendar, Clock } from 'lucide-react';
import Tooltip from '../common/Tooltip';

const formatProxLlamada = (fecha) => {
  if (!fecha) return <span className="text-gray-400">—</span>;
  try {
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return <span className="text-gray-400">—</span>;
    const now        = new Date();
    const isPast     = date < now;
    const isToday    = date.toDateString() === now.toDateString();
    const isTomorrow = new Date(now.getTime() + 86400000).toDateString() === date.toDateString();

    const dateStr = date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

    let badge = '', badgeCls = '';
    if      (isPast)     { badge = '🔴 Vencida'; badgeCls = 'bg-red-100 text-red-700 border-red-300'; }
    else if (isToday)    { badge = '🟠 Hoy';     badgeCls = 'bg-orange-100 text-orange-700 border-orange-300'; }
    else if (isTomorrow) { badge = '🟡 Mañana';  badgeCls = 'bg-yellow-100 text-yellow-700 border-yellow-300'; }
    else                 {                        badgeCls = 'bg-blue-50 text-blue-700 border-blue-200'; }

    return (
      <div className="space-y-1 min-w-[110px]">
        {badge && (
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${badgeCls}`}>
            {badge}
          </span>
        )}
        <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
          <Calendar className="w-3 h-3 shrink-0" /><span>{dateStr}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
          <Clock className="w-3 h-3 shrink-0" /><span>{timeStr}</span>
        </div>
      </div>
    );
  } catch { return <span className="text-gray-400">—</span>; }
};

// ── Colores por resultado ─────────────────────────────────────────────────────
const RESULTADO_COLORS = {
  'COTIZACIÓN':        'bg-blue-100 text-blue-800 border-blue-300',
  'SEGUIMIENTO PEDIDO':'bg-purple-100 text-purple-800 border-purple-300',
  'NO CONTESTA':       'bg-gray-100 text-gray-700 border-gray-300',
  'AGENDAR VISITA':    'bg-green-100 text-green-800 border-green-300',
  'NO INTERESADO':     'bg-red-100 text-red-700 border-red-300',
};

const TIPO_COLORS = {
  'INBOUND':  'bg-green-100 text-green-800 border-green-300',
  'OUTBOUND': 'bg-indigo-100 text-indigo-800 border-indigo-300',
};

const CallTableRow = ({ record, index, onEdit, onDelete, onView }) => (
  <tr className={`hover:bg-blue-50/30 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}`}>

    {/* Fecha */}
    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
      {new Date(record.fecha_registro).toLocaleDateString('es-PE')}
    </td>

    {/* Contactado */}
    <td className="px-4 py-3 text-xs font-semibold text-gray-800 max-w-[130px]">
      <span className="line-clamp-2">{record.nombre_contactado || '—'}</span>
    </td>

    {/* Tipo */}
    <td className="px-4 py-3 text-xs whitespace-nowrap">
      <span className={`px-2 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${
        TIPO_COLORS[record.tipo_contacto_nom] ?? 'bg-gray-100 text-gray-700 border-gray-300'
      }`}>
        {record.tipo_contacto_nom || '—'}
      </span>
    </td>

    {/* Resultado — nowrap para evitar el descuadre */}
    <td className="px-4 py-3 text-xs">
      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${
        RESULTADO_COLORS[record.resultado_gestion_nom] ?? 'bg-purple-100 text-purple-800 border-purple-300'
      }`}>
        {record.resultado_gestion_nom || '—'}
      </span>
    </td>

    {/* Asesor */}
    <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
      {record.codigo_vend && record.nom_asesor
        ? <><span className="font-semibold text-gray-900">{record.codigo_vend}</span> · {record.nom_asesor}</>
        : record.nom_asesor || '—'
      }
    </td>

    {/* Teléfonos */}
    <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">{record.telefono_1 || '—'}</td>
    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{record.telefono_2 || '—'}</td>

    {/* Próxima llamada */}
    <td className="px-4 py-3 text-xs">{formatProxLlamada(record.fecha_prox_llamada)}</td>

    {/* Observaciones */}
    <td className="px-4 py-3 text-xs text-gray-600 max-w-[180px]">
      <span className="line-clamp-2" title={record.observaciones}>
        {record.observaciones || '—'}
      </span>
    </td>

    {/* Acciones */}
    <td className="px-4 py-3 whitespace-nowrap">
  <div className="flex items-center justify-center gap-1">
    <Tooltip text="Ver detalle">
  <button
    onClick={() => onView(record)}
    className="px-3 py-2 bg-[#334a5e] text-white rounded-lg hover:bg-blue-700 hover:scale-105 transition inline-flex items-center text-sm font-bold shadow"
  >
    <Eye className="w-4 h-4" />
  </button>
</Tooltip>
    {/* <button onClick={() => onEdit(record)}
      className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition" title="Editar">
      <Edit2 className="w-4 h-4" />
    </button>
    <button onClick={() => onDelete(record.id_llamada)}
      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Eliminar">
      <Trash2 className="w-4 h-4" />
    </button> */}
  </div>
</td>
  </tr>
);

export default CallTableRow;
