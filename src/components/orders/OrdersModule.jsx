import React from 'react';
import {
  Package, TrendingUp, Clock, CheckCircle, DollarSign, RefreshCw
} from 'lucide-react';
import OrdersList    from './OrdersList';
import SectionHeader from '../common/SectionHeader';
import useOrders     from '../../hooks/useOrders';
import toast         from 'react-hot-toast';

const OrdersModule = () => {
  const { orders, loading, error, refetch } = useOrders({ diasAtras: 7 });

  const handleRefresh = () => {
    toast.promise(refetch(), {
      loading: 'Actualizando...',
      success: 'Lista actualizada',
      error:   'Error al actualizar',
    });
  };

  // KPIs basados en codfase
  const stats = {
    total:       orders.length,
    pendientes:  orders.filter(o => o.codfase === 10).length,
    enProceso:   orders.filter(o => [30, 40, 45].includes(o.codfase)).length,
    despachados: orders.filter(o => o.codfase === 50).length,
    totalNetos:  orders.reduce((s, o) => s + (o.netod || 0), 0), // en USD
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Package}
        title="Gestión de Pedidos"
        subtitle="Administra y da seguimiento a todos los pedidos generados"
        showButton={false}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Package className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{stats.total}</span>
          </div>
          <p className="text-sm opacity-90">Total Pedidos</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{stats.pendientes}</span>
          </div>
          <p className="text-sm opacity-90">Pendientes</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{stats.enProceso}</span>
          </div>
          <p className="text-sm opacity-90">En Proceso</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{stats.despachados}</span>
          </div>
          <p className="text-sm opacity-90">Despachados</p>
        </div>

        <div className="bg-gradient-to-br from-[#2ecc70] to-[#27ae60] text-white rounded-lg p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">
              ${(stats.totalNetos / 1000).toFixed(1)}K
            </span>
          </div>
          <p className="text-sm opacity-90">Monto Total USD</p>
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-end mb-4">
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
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            ⚠ {error}
          </div>
        ) : (
          <OrdersList orders={orders} loading={loading} />
        )}
      </div>
    </div>
  );
};

export default OrdersModule;
