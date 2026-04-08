import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { fetchTrackingPedido } from '../../services/wmsTrackingService';
import { X, Package, Clock, Truck, MapPin, AlertCircle, ListOrdered, History } from 'lucide-react';


const TIMELINE_STEPS = [
  { key: 'fechaEmision',       label: 'Pedido Recibido', icon: Package },
  { key: 'fechaInicioPicking', label: 'Inicio Picking',  icon: Clock   },
  { key: 'fechaFinPicking',    label: 'Fin Picking',     icon: Clock   },
  { key: 'fechaInicioPacking', label: 'Inicio Embalaje', icon: Package },
  { key: 'fechaFinPacking',    label: 'Fin Embalaje',    icon: Package },
  { key: 'fechaDespacho',      label: 'Despachado',      icon: Truck   },
];


function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr.replace('T', ' ').replace('Z', ''));
  if (isNaN(d)) return null;
  return d.toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}


function EstadoBadge({ estado }) {
  const colors = {
    ENTREGADO:  'bg-green-100 text-green-700 border-green-200',
    DESPACHADO: 'bg-blue-100 text-blue-700 border-blue-200',
    PICKING:    'bg-teal-100 text-teal-700 border-teal-200',
    PICKEADO:   'bg-yellow-100 text-yellow-700 border-yellow-200',
    ANULADO:    'bg-red-100 text-red-700 border-red-200',
  };
  const cls = colors[estado?.toUpperCase()] ?? 'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cls}`}>
      {estado}
    </span>
  );
}


function TimelineStep({ step, date, isCompleted, isLast, animDelay }) {
  const Icon = step.icon;
  return (
    <div
      className="flex gap-3 items-start"
      style={{ opacity: 0, animation: 'fadeSlideIn 0.4s ease forwards', animationDelay: `${animDelay}ms` }}
    >
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-all ${
          isCompleted
            ? 'bg-teal-600 border-teal-600 text-white shadow-sm shadow-teal-200'
            : 'bg-white border-gray-200 text-gray-300'
        }`}>
          <Icon size={14} />
        </div>
        {!isLast && (
          <div className={`w-0.5 flex-1 min-h-[20px] mt-1 rounded-full ${
            isCompleted ? 'bg-teal-400' : 'bg-gray-200'
          }`} />
        )}
      </div>
      <div className="pb-4">
        <p className={`text-sm font-semibold leading-tight ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
          {step.label}
        </p>
        {date
          ? <p className="text-xs text-gray-500 mt-0.5">{date}</p>
          : <p className="text-xs text-gray-300 mt-0.5 italic">Pendiente</p>
        }
      </div>
    </div>
  );
}


function InfoRow({ label, value, icon }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <div className="flex items-start gap-1 font-medium text-gray-700">
        {icon}
        <span className="text-sm break-words">{value ?? '—'}</span>
      </div>
    </div>
  );
}


// ── Panel izquierdo: info + artículos ──────────────────────────────────────
function PanelInfo({ cabecera, detalle }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Info cabecera */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <InfoRow label="Cliente"     value={cabecera.nombreCliente} />
        <InfoRow label="Tipo"        value={cabecera.tipoDocumento} />
        <InfoRow label="N° Doc. WMS" value={cabecera.idDocumentoSalida} />
        <InfoRow label="Estado"      value={<EstadoBadge estado={cabecera.estado} />} />
        {cabecera.numeroDocumento && (
          <div className="col-span-2">
            <InfoRow label="Documento Legal" value={cabecera.numeroDocumento} />
          </div>
        )}
        {cabecera.agencia && cabecera.agencia !== 'Sin Agencia' && (
          <div className="col-span-2">
            <InfoRow label="Agencia" value={cabecera.agencia} />
          </div>
        )}
        {cabecera.direccion && (
          <div className="col-span-2">
            <InfoRow
              label="Dirección"
              value={`${cabecera.direccion}${cabecera.ciudad ? ` — ${cabecera.ciudad}` : ''}`}
              icon={<MapPin size={12} className="text-gray-400 mt-0.5 shrink-0" />}
            />
          </div>
        )}
      </div>

      <hr className="border-gray-100" />

      {/* Artículos */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Artículos ({detalle.length})
        </p>
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-3 py-2.5 text-left font-medium">Artículo</th>
                <th className="px-3 py-2.5 text-left font-medium">Descripción</th>
                <th className="px-3 py-2.5 text-center font-medium">Cant.</th>
                <th className="px-3 py-2.5 text-center font-medium">Pick.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {detalle.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-3 py-2.5 font-mono text-xs text-gray-600">{item.articulo}</td>
                  <td className="px-3 py-2.5 text-gray-700 text-xs">{item.descripcion}</td>
                  <td className="px-3 py-2.5 text-center font-medium text-gray-700">{item.cantidad}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`font-semibold text-sm ${
                      item.cantidadPickeada >= item.cantidad ? 'text-teal-600' : 'text-orange-500'
                    }`}>
                      {item.cantidadPickeada}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


// ── Panel derecho: timeline ───────────────────────────────────────────────
function PanelTimeline({ cabecera }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Historial del pedido
      </p>
      <div className="flex flex-col">
        {TIMELINE_STEPS.map((step, i) => (
          <TimelineStep
            key={step.key}
            step={step}
            date={formatDate(cabecera[step.key])}
            isCompleted={!!cabecera[step.key]}
            isLast={i === TIMELINE_STEPS.length - 1}
            animDelay={i * 80}
          />
        ))}
      </div>
    </div>
  );
}


// ── Modal principal ───────────────────────────────────────────────────────
export default function WmsTrackingModal({ numeroPedido, onClose }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [tab,     setTab]     = useState('info');


  useEffect(() => {
    if (!numeroPedido) return;
    setLoading(true);
    setError(null);
    fetchTrackingPedido(numeroPedido)
      .then(res => {
        if (!res.success) throw new Error(res.message);
        setData(res);
      })
      .catch(err => setError(err.message || 'Error al obtener el tracking'))
      .finally(() => setLoading(false));
  }, [numeroPedido]);


  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4"
        onClick={onClose}
      >
        <div
          className="bg-white w-full sm:max-w-4xl sm:rounded-2xl rounded-t-2xl shadow-2xl
                     max-h-[92vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
          style={{ animation: 'modalIn 0.25s ease forwards' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 shrink-0">
            <div>
              <h2 className="text-base font-bold text-gray-800">Tracking de Pedido</h2>
              <p className="text-xs text-gray-400">N° {numeroPedido}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs — solo visibles en móvil */}
          {data && !loading && !error && (
            <div className="flex sm:hidden border-b border-gray-100 shrink-0">
              <button
                onClick={() => setTab('info')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  tab === 'info'
                    ? 'text-teal-600 border-b-2 border-teal-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <ListOrdered size={15} />
                Info y Artículos
              </button>
              <button
                onClick={() => setTab('timeline')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  tab === 'timeline'
                    ? 'text-teal-600 border-b-2 border-teal-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <History size={15} />
                Historial
              </button>
            </div>
          )}

          {/* Body */}
          <div className="overflow-y-auto flex-1">

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-400">Consultando WMS...</p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-20 gap-2 text-center px-4">
                <AlertCircle size={36} className="text-red-400" />
                <p className="text-sm font-medium text-gray-700">No se pudo obtener el tracking</p>
                <p className="text-xs text-gray-400">{error}</p>
              </div>
            )}

            {/* Contenido */}
            {!loading && !error && data && (
              <>
                {/* ── MÓVIL: tabs ── */}
                <div className="sm:hidden px-4 py-5">
                  {tab === 'info' && (
                    <PanelInfo cabecera={data.cabecera} detalle={data.detalle} />
                  )}
                  {tab === 'timeline' && (
                    <PanelTimeline cabecera={data.cabecera} />
                  )}
                </div>

                {/* ── DESKTOP: 2 columnas ── */}
                <div className="hidden sm:flex divide-x divide-gray-100 min-h-0">
                  <div className="flex-1 px-6 py-5 overflow-y-auto">
                    <PanelInfo cabecera={data.cabecera} detalle={data.detalle} />
                  </div>
                  <div className="w-64 shrink-0 px-6 py-5 overflow-y-auto bg-gray-50/50">
                    <PanelTimeline cabecera={data.cabecera} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.98) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>,
    document.body
  );
}