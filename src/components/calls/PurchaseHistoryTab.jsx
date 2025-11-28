import React, { useState } from 'react';
import { ShoppingCart, Package, Calendar, DollarSign, FileText, Filter, X } from 'lucide-react';
import { getClientPurchases, getEstadoStyle } from '../../data/purchaseHistoryData';

const PurchaseHistoryTab = ({ clienteRUC, onProductClick }) => {
  const purchases = getClientPurchases(clienteRUC);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  
  // Estado de filtros
  const [filters, setFilters] = useState({
    fechaInicio: '',
    fechaFin: '',
    vendedor: '',
    tipoDocumento: '',
    codigoProducto: '',
    numRegistro: ''
  });

  // Aplicar filtros
  const filteredPurchases = purchases.filter(purchase => {
    // Filtro por número de registro
    if (filters.numRegistro && !purchase.numRegistro.toLowerCase().includes(filters.numRegistro.toLowerCase())) {
      return false;
    }

    // Filtro por código de producto
    if (filters.codigoProducto && !purchase.codigoProducto.toLowerCase().includes(filters.codigoProducto.toLowerCase())) {
      return false;
    }

    // Filtro por vendedor
    if (filters.vendedor && purchase.vendedorHecho !== filters.vendedor) {
      return false;
    }

    // Filtro por tipo de documento
    if (filters.tipoDocumento && purchase.tipoDocumento !== filters.tipoDocumento) {
      return false;
    }

    // Filtro por rango de fechas
    if (filters.fechaInicio || filters.fechaFin) {
      const [day, month, year] = purchase.fechaVenta.split('/');
      const purchaseDate = new Date(year, month - 1, day);

      if (filters.fechaInicio) {
        const startDate = new Date(filters.fechaInicio);
        if (purchaseDate < startDate) return false;
      }

      if (filters.fechaFin) {
        const endDate = new Date(filters.fechaFin);
        if (purchaseDate > endDate) return false;
      }
    }

    return true;
  });

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPurchases = filteredPurchases.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      fechaInicio: '',
      fechaFin: '',
      vendedor: '',
      tipoDocumento: '',
      codigoProducto: '',
      numRegistro: ''
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');
  const totalCompras = filteredPurchases.reduce((sum, p) => sum + p.total, 0);
  const cantidadCompras = filteredPurchases.length;

  if (!clienteRUC) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center border-2 border-dashed border-gray-300">
        <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Selecciona un cliente para ver su historial de compras</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen de Compras */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Compras</p>
              <p className="text-3xl font-bold">S/ {totalCompras.toFixed(2)}</p>
            </div>
            <DollarSign className="w-12 h-12 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Cantidad de Órdenes</p>
              <p className="text-3xl font-bold">{cantidadCompras}</p>
            </div>
            <FileText className="w-12 h-12 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Promedio por Orden</p>
              <p className="text-3xl font-bold">S/ {cantidadCompras > 0 ? (totalCompras / cantidadCompras).toFixed(2) : '0.00'}</p>
            </div>
            <Package className="w-12 h-12 opacity-50" />
          </div>
        </div>
      </div>

      {/* Barra de filtros */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filtros</h3>
            {hasActiveFilters && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                Activos
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Limpiar
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-1.5 text-sm rounded-lg transition flex items-center gap-1 ${
                showFilters ? 'bg-[#334a5e] text-white' : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Inicio</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filters.fechaInicio}
                  onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Fin</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filters.fechaFin}
                  onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Vendedor</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filters.vendedor}
                  onChange={(e) => handleFilterChange('vendedor', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="Yessir Florian">Yessir Florian</option>
                  <option value="Giancarlo Nicho">Giancarlo Nicho</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Código Producto</label>
                <input
                  type="text"
                  placeholder="Ej: PROD-002"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filters.codigoProducto}
                  onChange={(e) => handleFilterChange('codigoProducto', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">N° Registro</label>
                <input
                  type="text"
                  placeholder="Ej: 460278"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filters.numRegistro}
                  onChange={(e) => handleFilterChange('numRegistro', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tipo Documento</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filters.tipoDocumento}
                  onChange={(e) => handleFilterChange('tipoDocumento', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="F">Factura (F)</option>
                  <option value="B">Boleta (B)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de Compras */}
      {filteredPurchases.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1800px]">
              <thead className="bg-[#334a5e] text-white">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase">Fecha Venta</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase">Línea</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase">Vendedor</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase">RUC</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase">Razón Social</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase">Código Prod.</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase">Descripción</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold uppercase">N° Registro</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold uppercase">Tipo Doc.</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold uppercase">N° Documento</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold uppercase">Cantidad</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold uppercase">P. Unit. Neto</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold uppercase">% Dscto 1</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold uppercase">% Dscto 5</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentPurchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50 transition">
                    <td className="px-3 py-3 text-xs whitespace-nowrap">{purchase.fechaVenta}</td>
                    <td className="px-3 py-3 text-xs whitespace-nowrap">{purchase.lineaCredito}</td>
                    <td className="px-3 py-3 text-xs whitespace-nowrap">{purchase.vendedorHecho}</td>
                    <td className="px-3 py-3 text-xs whitespace-nowrap">{purchase.ruc}</td>
                    <td className="px-3 py-3 text-xs">{purchase.razonSocial}</td>
                    {/* <td className="px-3 py-3 text-xs whitespace-nowrap font-medium text-blue-600">{purchase.codigoProducto}</td> */}
                    {/* ✅ Código clickeable */}
                    <td className="px-3 py-3 text-xs whitespace-nowrap">
                      <button
                        onClick={() => onProductClick(purchase.codigoProducto)}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition cursor-pointer"
                        title="Ver producto"
                      >
                        {purchase.codigoProducto}
                      </button>
                    </td>
                    <td className="px-3 py-3 text-xs">{purchase.descripcionProducto}</td>
                    <td className="px-3 py-3 text-xs text-center font-semibold">{purchase.numRegistro}</td>
                    <td className="px-3 py-3 text-xs text-center">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">{purchase.tipoDocumento}</span>
                    </td>
                    <td className="px-3 py-3 text-xs text-center whitespace-nowrap">{purchase.numDocumento}</td>
                    <td className="px-3 py-3 text-xs text-center font-semibold">{purchase.cantidad}</td>
                    <td className="px-3 py-3 text-xs text-right whitespace-nowrap">S/ {purchase.precioUnitarioNeto.toFixed(2)}</td>
                    <td className="px-3 py-3 text-xs text-center">{purchase.descuento1.toFixed(2)}%</td>
                    <td className="px-3 py-3 text-xs text-center">{purchase.descuento8.toFixed(2)}%</td>
                    <td className="px-3 py-3 text-xs text-right font-bold whitespace-nowrap">S/ {purchase.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {filteredPurchases.length > itemsPerPage && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Mostrando <span className="font-semibold">{indexOfFirstItem + 1}</span> a{' '}
                <span className="font-semibold">{Math.min(indexOfLastItem, filteredPurchases.length)}</span>{' '}
                de <span className="font-semibold">{filteredPurchases.length}</span> compras
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            currentPage === pageNumber
                              ? 'bg-[#334a5e] text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                      return <span key={pageNumber} className="px-2 text-gray-400">...</span>;
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {hasActiveFilters 
              ? 'No se encontraron compras con los filtros aplicados' 
              : 'Este cliente no tiene compras registradas'
            }
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Limpiar Filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PurchaseHistoryTab;
