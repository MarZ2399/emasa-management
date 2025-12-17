// src/components/orders/OrdersModule.jsx
import React, { useState } from 'react';
import { Package, Plus, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import OrdersList from './OrdersList';
import { initialOrders, orderStatuses } from '../../data/ordersData';
import SectionHeader from '../common/SectionHeader'; 

const OrdersModule = () => {
  const [orders, setOrders] = useState(initialOrders);

  // Actualizar estado del pedido
  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      )
    );
  };

  // Calcular estadísticas
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inProgress: orders.filter(o => 
      ['confirmed', 'in_production', 'ready'].includes(o.status)
    ).length,
    completed: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalAmount: orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader
        icon={Package}
        title="Gestión de Pedidos"
        subtitle="Administra y da seguimiento a todos los pedidos generados"
        showButton={false} // Si no necesitas botón
      />

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total de Pedidos */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Package className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{stats.total}</span>
          </div>
          <p className="text-sm opacity-90">Total Pedidos</p>
        </div>

        {/* Pendientes */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{stats.pending}</span>
          </div>
          <p className="text-sm opacity-90">Pendientes</p>
        </div>

        {/* En Proceso */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{stats.inProgress}</span>
          </div>
          <p className="text-sm opacity-90">En Proceso</p>
        </div>

        {/* Completados */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{stats.completed}</span>
          </div>
          <p className="text-sm opacity-90">Completados</p>
        </div>

        {/* Monto Total */}
        <div className="bg-gradient-to-br from-[#2ecc70] to-[#27ae60] text-white rounded-lg p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-bold">S/</span>
            <span className="text-2xl font-bold">
              {(stats.totalAmount / 1000).toFixed(1)}K
            </span>
          </div>
          <p className="text-sm opacity-90">Monto Total</p>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <OrdersList 
          orders={orders} 
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </div>
  );
};

export default OrdersModule;
