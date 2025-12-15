// src/components/orders/OrderStatusBadge.jsx
import React from 'react';
import { orderStatuses } from '../../data/ordersData';

const OrderStatusBadge = ({ status, size = 'md' }) => {
  const statusConfig = Object.values(orderStatuses).find(s => s.value === status) || orderStatuses.PENDING;
  
  const colorClasses = {
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    purple: 'bg-purple-100 text-purple-800 border-purple-300',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    cyan: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    green: 'bg-green-100 text-green-800 border-green-300',
    red: 'bg-red-100 text-red-800 border-red-300'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm'
  };

  return (
    <span className={`rounded-full font-semibold border ${colorClasses[statusConfig.color]} ${sizeClasses[size]}`}>
      {statusConfig.label}
    </span>
  );
};

export default OrderStatusBadge;
