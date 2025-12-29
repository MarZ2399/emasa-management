// src/components/orders/OrderDetails.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  X, Package, User, Calendar, MapPin, Truck, 
  DollarSign, FileText, MessageSquare, Phone, 
  CreditCard, Edit2, Save, Coins
} from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';
import { orderStatuses, currencyTypes } from '../../data/ordersData';
import toast from 'react-hot-toast';

const OrderDetails = ({ order, onClose, onUpdateStatus }) => {
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState(order.status);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Cerrar con tecla ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleUpdateStatus = () => {
    if (newStatus !== order.status) {
      onUpdateStatus(order.id, newStatus);
      toast.success('Estado actualizado correctamente');
      setIsEditingStatus(false);
    }
  };

  // Obtener símbolo de moneda
  const getCurrencySymbol = () => {
    return order.tipoMoneda === 'USD' ? '$' : 'S/';
  };

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">{order.numeroPedido}</h2>
              <p className="text-sm text-blue-100">Detalles del Pedido</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Estado del Pedido */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Estado del Pedido</h3>
              {!isEditingStatus && (
                <button
                  onClick={() => setIsEditingStatus(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Edit2 className="w-4 h-4" />
                  Cambiar Estado
                </button>
              )}
            </div>

            {isEditingStatus ? (
              <div className="flex items-center gap-3">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.values(orderStatuses).map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleUpdateStatus}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
                <button
                  onClick={() => {
                    setIsEditingStatus(false);
                    setNewStatus(order.status);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <OrderStatusBadge status={order.status} size="lg" />
            )}
          </div>

          {/* Información del Cliente */}
          <div className="border border-gray-200 rounded-lg p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-700" />
              Información del Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Razón Social:</div>
                <div className="font-medium text-gray-900 mt-1">{order.clienteNombre}</div>
              </div>
              <div>
                <div className="text-gray-500">RUC:</div>
                <div className="font-medium text-gray-900 mt-1">{order.clienteRuc}</div>
              </div>
              <div>
                <div className="text-gray-500">Asesor Comercial:</div>
                <div className="font-medium text-gray-900 mt-1">{order.asesor}</div>
              </div>
              <div>
                <div className="text-gray-500">N° Cotización:</div>
                <div className="font-medium text-gray-900 mt-1">
                  COT-{String(order.quotationId).padStart(4, '0')}
                </div>
              </div>
            </div>
          </div>

          {/* Datos de la Orden */}
          <div className="border border-gray-200 rounded-lg p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-700" />
              Datos de la Orden
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">N° Orden de Compra:</div>
                <div className="font-medium text-gray-900 mt-1">{order.ordenCompra}</div>
              </div>
              <div>
                <div className="text-gray-500">Fecha de Pedido:</div>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900">
                    {new Date(order.fechaPedido).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-gray-500">Fecha de Entrega:</div>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900">
                    {new Date(order.fechaEntrega).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-gray-500">Tipo de Moneda:</div>
                <div className="flex items-center gap-2 mt-1">
                  <Coins className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-gray-900">
                    {order.tipoMoneda === 'PEN' ? 'Soles (S/)' : 'Dólares ($)'}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-gray-500">Forma de Pago:</div>
                <div className="font-medium text-gray-900 mt-1 uppercase">
                  {order.formaPago?.replace(/_/g, ' ')}
                </div>
              </div>
              
            </div>
          </div>

          {/* Datos de Transporte */}
          <div className="border border-gray-200 rounded-lg p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-gray-700" />
              Datos de Transporte y Entrega
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Responsable de Transporte:</div>
                <div className="font-medium text-gray-900 mt-1 capitalize">
                  {order.pagoTransporte}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Zona de Transporte:</div>
                <div className="font-medium text-gray-900 mt-1">
                  {order.transporteZona === 'lima_callao' ? 'Lima - Callao' : 'Provincia'}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Tipo de Entrega:</div>
                <div className="font-medium text-gray-900 mt-1 capitalize">
                  {order.tipoEntrega.replace('_', ' ')}
                </div>
              </div>
            </div>

            {order.tipoEntrega !== 'retiro' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-start gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-gray-500 text-sm">Dirección de Despacho:</div>
                    <div className="font-medium text-gray-900 mt-1">{order.direccionDespacho}</div>
                    <div className="text-gray-600 mt-1">
                      {order.distritoDespacho}, {order.provinciaDespacho}
                    </div>
                  </div>
                </div>

                {order.agenciaDespacho && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Contacto de Despacho</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-gray-500">Nombre:</div>
                          <div className="font-medium text-gray-900">
                            {order.agenciaDespacho.nombre}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-gray-500">DNI:</div>
                          <div className="font-medium text-gray-900">
                            {order.agenciaDespacho.dni}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-gray-500">Teléfono:</div>
                          <div className="font-medium text-gray-900">
                            {order.agenciaDespacho.telefono}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Productos */}
          <div className="border border-gray-200 rounded-lg p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-700" />
              Productos del Pedido
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Código
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Descripción
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700">
                      Cant.
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
                      P. Unit.
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.productos.map(producto => (
                    <tr key={producto.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {producto.codigo}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {producto.descripcion}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">
                        {producto.cantidad}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">
                         {producto.precioUnitario.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                         {producto.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                  <tr>
                    <td colSpan="4" className="px-4 py-2 text-right font-semibold text-gray-700">
                      Subtotal:
                    </td>
                    <td className="px-4 py-2 text-right font-semibold text-gray-900">
                      {order.subtotal.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="4" className="px-4 py-2 text-right font-semibold text-gray-700">
                      IGV (18%):
                    </td>
                    <td className="px-4 py-2 text-right font-semibold text-gray-900">
                       {order.igv.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="4" className="px-4 py-2 text-right font-bold text-gray-900 text-lg">
                      TOTAL:
                    </td>
                    <td className="px-4 py-2 text-right font-bold text-green-600 text-lg">
                       {order.total.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Observaciones */}
{(order.observaciones || order.observacionesCreditos || order.observacionesLogistica) && (
  <div className="border border-gray-200 rounded-lg p-5 space-y-4">
    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
      <MessageSquare className="w-5 h-5 text-gray-700" />
      Observaciones
    </h3>

    {/* Observaciones Generales */}
    {order.observaciones && (
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-1.5">
          Observaciones Generales
        </h4>
        <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 border border-gray-200">
          {order.observaciones}
        </p>
      </div>
    )}

    {/* Observaciones de Créditos */}
    {order.observacionesCreditos && (
      <div>
        <h4 className="text-sm font-semibold text-blue-700 mb-1.5">
          Observaciones de Créditos
        </h4>
        <p className="text-sm text-gray-700 whitespace-pre-wrap bg-blue-50 rounded-lg p-3 border border-blue-200">
          {order.observacionesCreditos}
        </p>
      </div>
    )}

    {/* Observaciones de Logística */}
    {order.observacionesLogistica && (
      <div>
        <h4 className="text-sm font-semibold text-orange-700 mb-1.5">
          Observaciones de Logística
        </h4>
        <p className="text-sm text-gray-700 whitespace-pre-wrap bg-orange-50 rounded-lg p-3 border border-orange-200">
          {order.observacionesLogistica}
        </p>
      </div>
    )}
  </div>
)}


          {/* Botón Cerrar */}
          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default OrderDetails;
