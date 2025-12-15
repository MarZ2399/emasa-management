// src/components/orders/OrdersList.jsx
import React, { useState } from 'react';
import { 
  Search, Filter, Package, Calendar, User, 
  DollarSign, Eye, Truck, ChevronDown, ChevronUp 
} from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';
import OrderDetails from './OrderDetails';
import { orderStatuses } from '../../data/ordersData';

const OrdersList = ({ orders, onUpdateStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [sortField, setSortField] = useState('fechaPedido');
  const [sortDirection, setSortDirection] = useState('desc');

  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.numeroPedido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.ordenCompra.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Ordenar pedidos
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === 'fechaPedido' || sortField === 'fechaEntrega') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Buscador */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por N° Pedido, Cliente, OC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ecc70] focus:border-transparent"
          />
        </div>

        {/* Filtro por estado */}
        <div className="w-full md:w-64">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ecc70] focus:border-transparent appearance-none bg-white"
            >
              <option value="all">Todos los estados</option>
              {Object.values(orderStatuses).map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Mostrando <strong>{sortedOrders.length}</strong> de <strong>{orders.length}</strong> pedidos
        </span>
      </div>

      {/* Tabla de pedidos - Desktop */}
      <div className="hidden lg:block bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th 
                  onClick={() => handleSort('numeroPedido')}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-1">
                    N° Pedido
                    <SortIcon field="numeroPedido" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('clienteNombre')}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-1">
                    Cliente
                    <SortIcon field="clienteNombre" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  OC
                </th>
                <th 
                  onClick={() => handleSort('fechaPedido')}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-1">
                    Fecha Pedido
                    <SortIcon field="fechaPedido" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('fechaEntrega')}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-1">
                    Fecha Entrega
                    <SortIcon field="fechaEntrega" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('total')}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-1">
                    Total
                    <SortIcon field="total" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedOrders.length > 0 ? (
                sortedOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{order.numeroPedido}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{order.clienteNombre}</div>
                        <div className="text-gray-500">RUC: {order.clienteRuc}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900">{order.ordenCompra}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.fechaPedido).toLocaleDateString('es-ES')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.fechaEntrega).toLocaleDateString('es-ES')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-gray-900">
                          S/ {order.total.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No se encontraron pedidos</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards de pedidos - Mobile */}
      <div className="lg:hidden space-y-3">
        {sortedOrders.length > 0 ? (
          sortedOrders.map(order => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="font-bold text-gray-900">{order.numeroPedido}</span>
                  </div>
                  <p className="text-sm text-gray-600">{order.clienteNombre}</p>
                </div>
                <OrderStatusBadge status={order.status} size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">OC:</span>
                  <p className="font-medium text-gray-900">{order.ordenCompra}</p>
                </div>
                <div>
                  <span className="text-gray-500">Total:</span>
                  <p className="font-semibold text-green-600">S/ {order.total.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Fecha Pedido:</span>
                  <p className="font-medium text-gray-900">
                    {new Date(order.fechaPedido).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Entrega:</span>
                  <p className="font-medium text-gray-900">
                    {new Date(order.fechaEntrega).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleViewDetails(order)}
                className="w-full py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition font-medium flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Ver Detalles
              </button>
            </div>
          ))
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No se encontraron pedidos</p>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {showDetails && selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => {
            setShowDetails(false);
            setSelectedOrder(null);
          }}
          onUpdateStatus={onUpdateStatus}
        />
      )}
    </div>
  );
};

export default OrdersList;
