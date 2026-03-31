import React from 'react';
import {
  Package, RefreshCw, AlertTriangle, Filter,
  Warehouse, ShoppingCart, FileCheck, Eye, CreditCard, DollarSign
} from 'lucide-react';
import OrdersList    from './OrdersList';
import SectionHeader from '../common/SectionHeader';
import { useOrders } from '../../hooks/useOrders';
import { useAuth }   from '../../hooks/useAuth';
import toast         from 'react-hot-toast';


const NIVEL_LABEL = { 0: 'Gerencia', 1: 'Jefatura', 2: 'Vendedor' };


const FASES = [
  {
    codfase: 50, label: 'Facturado',
    icon: FileCheck,
    iconBg: 'bg-green-900/40',  iconText: 'text-green-300',
    ring: 'ring-green-400',
  },
  {
    codfase: 45, label: 'Pickeado',
    icon: ShoppingCart,
    iconBg: 'bg-teal-900/40',   iconText: 'text-teal-300',
    ring: 'ring-teal-400',
  },
  {
    codfase: 40, label: 'En Almacén',
    icon: Warehouse,
    iconBg: 'bg-blue-900/40',   iconText: 'text-blue-300',
    ring: 'ring-blue-400',
  },
  {
    codfase: 30, label: 'Obs Credito',
    icon: CreditCard,
    iconBg: 'bg-amber-900/40',  iconText: 'text-amber-300',
    ring: 'ring-amber-400',
  },
  {
    codfase: 20, label: 'Obs Ventas',
    icon: Eye,
    iconBg: 'bg-orange-900/40', iconText: 'text-orange-300',
    ring: 'ring-orange-400',
  },
];


const KpiCard = ({ icon: Icon, value, label, iconBg, iconText, ring, onClick, active }) => (
  <button
    onClick={onClick}
    className={`
      bg-gradient-to-br from-[#5982A6] to-[#1a2f3d]
      rounded-2xl border border-white/10
      shadow-sm hover:shadow-md transition-all duration-200
      p-4 text-left w-full cursor-pointer hover:brightness-110
      ${active ? `ring-2 ring-offset-2 ${ring} brightness-110` : ''}
    `}
  >
    <div className="flex items-center gap-3">
      <div className={`w-11 h-11 rounded-2xl ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${iconText}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-bold text-white leading-tight tabular-nums">{value}</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-white/70 truncate mt-0.5">
          {label}
        </p>
      </div>
    </div>
  </button>
);


const OrdersModule = () => {
  const { user } = useAuth();
  const {
    orders,
    allOrders,
    loading,
    error,
    soloPendientes,
    setSoloPendientes,
    refetch,
  } = useOrders();

  const [faseActiva, setFaseActiva] = React.useState(null);
  const [ocultarAnulados,  setOcultarAnulados]  = React.useState(false);

  const handleRefresh = () => {
    toast.promise(refetch(), {
      loading: 'Actualizando...',
      success: 'Lista actualizada',
      error:   'Error al actualizar',
    });
  };

  const contadores = React.useMemo(
  () => FASES.reduce((acc, f) => {
    const fasesAContar = f.fases ?? [f.codfase]; // ← usa array si existe, sino el codfase simple
    acc[f.codfase] = allOrders.filter(o => fasesAContar.includes(o.codfase)).length;
    return acc;
  }, {}),
  [allOrders]
);

  // ← stats simplificado: solo lo que aún se usa (contador toolbar)
  const totalVisible = orders.length;
  const totalGeneral = allOrders.length;

  const ordenesMostradas = React.useMemo(() => {
  let lista = orders;

  if (faseActiva !== null) {
    const faseDef = FASES.find(f => f.codfase === faseActiva);
    const fasesAFiltrar = faseDef?.fases ?? [faseActiva]; // ← filtra 20+22+24 si aplica
    lista = lista.filter(o => fasesAFiltrar.includes(o.codfase));
  }

  if (ocultarAnulados) lista = lista.filter(o => o.codfase !== 15);
  return lista;
}, [orders, faseActiva, ocultarAnulados]);

  const handleKpiClick = (codfase) => {
    setFaseActiva(prev => (prev === codfase ? null : codfase));
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Package}
        title="Gestión de Pedidos"
        subtitle={`Vista ${NIVEL_LABEL[user?.nivel_acceso] ?? ''} — ${user?.codigo_sis ?? ''}`}
        showButton={false}
      />

      {/* KPI cards por fase */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {FASES.map(fase => (
          <KpiCard
            key={fase.codfase}
            icon={fase.icon}
            value={contadores[fase.codfase] ?? 0}
            label={fase.label}
            iconBg={fase.iconBg}
            iconText={fase.iconText}
            ring={fase.ring}
            active={faseActiva === fase.codfase}
            onClick={() => handleKpiClick(fase.codfase)}
          />
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm p-6">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-3">

           {/* ← Badge anulados — ahora con checkbox */}
{allOrders.filter(o => o.codfase === 15).length > 0 && (
  <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition">
    <input
      type="checkbox"
      checked={ocultarAnulados}
      onChange={e => setOcultarAnulados(e.target.checked)}
      className="w-4 h-4 accent-red-500"
    />
    <AlertTriangle className="w-4 h-4" />
    <span>
      <strong>{allOrders.filter(o => o.codfase === 15).length}</strong> anulado(s)
    </span>
  </label>
)}
            
            {/* Badge fase activa */}
            
            {faseActiva !== null && (
              <div className="flex items-center gap-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
                <span>Fase: {FASES.find(f => f.codfase === faseActiva)?.label}</span>
                <button
                  onClick={() => setFaseActiva(null)}
                  className="ml-1 text-blue-400 hover:text-blue-600 font-bold leading-none"
                  aria-label="Quitar filtro de fase"
                >×</button>
              </div>
            )}

            {/* Filtro pendientes */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition">
              <input
                type="checkbox"
                checked={soloPendientes}
                onChange={e => {
                  setSoloPendientes(e.target.checked);
                  if (e.target.checked) setFaseActiva(null);
                }}
                className="w-4 h-4 accent-amber-500"
              />
              <Filter className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-medium">Solo pendientes</span>
            </label>

            {/* Contador */}
            {!loading && (
              <span className="text-xs text-gray-400 tabular-nums">
                Mostrando <strong>{ordenesMostradas.length}</strong> de {totalGeneral}
              </span>
            )}
          </div>

          {/* Botón actualizar */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        ) : (
          <OrdersList
            orders={ordenesMostradas}
            loading={loading}
            nivelAcceso={user?.nivel_acceso}
          />
        )}
      </div>
    </div>
  );
};

export default OrdersModule;