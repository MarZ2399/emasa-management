// src/components/calls/ProductsTab.jsx
import React, { useState } from 'react';
import { Search, Package, AlertCircle, Eye, Building2 } from 'lucide-react';
import { initialProducts, getStockStatus, getWarehouseStockStatus } from '../../data/productsData';
import ProdDetailModal from './ProdDetailModal';

const ProductsTab = ({ 
  codigoProducto, 
  setCodigoProducto,
  nombreProducto, 
  setNombreProducto,
  hasSearched, 
  setHasSearched,
  onAddToQuotation 
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);

  // Filtrar productos
  const filteredProducts = initialProducts.filter(product => {
    const matchesCodigo = product.codigo?.toLowerCase().includes(codigoProducto.toLowerCase());
    const matchesNombre = product.nombre?.toLowerCase().includes(nombreProducto.toLowerCase());
    if (codigoProducto && nombreProducto) return matchesCodigo && matchesNombre;
    if (codigoProducto) return matchesCodigo;
    if (nombreProducto) return matchesNombre;
    return false;
  });

  // Paginación
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = () => {
    if (!codigoProducto.trim() && !nombreProducto.trim()) return;
    setHasSearched(true);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setCodigoProducto('');
    setNombreProducto('');
    setHasSearched(false);
    setCurrentPage(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Formulario de Búsqueda */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Código de Producto <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej: PROD-011"
              value={codigoProducto}
              onChange={e => setCodigoProducto(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre de Producto
            </label>
            <input
              type="text"
              placeholder="Ej: Aceite Motor"
              value={nombreProducto}
              onChange={e => setNombreProducto(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          <div className="md:col-span-3 lg:col-span-1 flex items-end gap-2">
            <button
              onClick={handleSearch}
              disabled={!codigoProducto.trim() && !nombreProducto.trim()}
              className="flex-1 flex items-center justify-center gap-2 bg-[#334a5e] text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              <Search className="w-5 h-5" />
              <span>Buscar</span>
            </button>
            {hasSearched && (
              <button
                onClick={handleClearSearch}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de Resultados */}
      {hasSearched && (
        <>
          {filteredProducts.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead className="bg-[#334a5e] text-white">
                    <tr>
                      <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Acciones</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Código</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Producto</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Categoría</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Proveedor</th>
                      {/* ✅ COLUMNA UNIFICADA DE STOCK */}
                      <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                        <div className="flex items-center justify-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Stock por Almacén
                        </div>
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider">Precio</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Unidad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {currentProducts.length > 0 ? (
                      currentProducts.map((product) => {
                        const stockStatus = getStockStatus(product.stock);
                        const stockBSFStatus = getWarehouseStockStatus(product.stockBSF);
                        const stockSanLuisStatus = getWarehouseStockStatus(product.stockSanLuis);
                        
                        return (
                          <tr key={product.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => handleOpenModal(product)}
                                className="text-blue-600 hover:text-blue-800 transition"
                                title="Ver detalle"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {product.codigo}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {product.nombre}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                                {product.categoria}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {product.proveedor}
                            </td>
                            
                            {/* ✅ STOCK POR ALMACÉN - DISEÑO VERTICAL */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="space-y-2">
                                {/* BSF */}
                                <div className="flex items-center justify-between gap-3 bg-blue-50 rounded-lg px-3 py-2 border border-blue-200">
                                  <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs font-semibold text-blue-800">BSF</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-blue-900">{product.stockBSF}</span>
                                    <span className="text-xs">{stockBSFStatus.icon}</span>
                                  </div>
                                </div>

                                {/* San Luis */}
                                <div className="flex items-center justify-between gap-3 bg-green-50 rounded-lg px-3 py-2 border border-green-200">
                                  <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-green-600" />
                                    <span className="text-xs font-semibold text-green-800">San Luis</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-green-900">{product.stockSanLuis}</span>
                                    <span className="text-xs">{stockSanLuisStatus.icon}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${stockStatus.color}`}>
                                {stockStatus.icon} {stockStatus.text}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                              $ {product.precioNetoDolar.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                              {product.unidad}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="9" className="px-6 py-12 text-center">
                          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">No se encontraron productos</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {filteredProducts.length > 0 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Mostrando <span className="font-semibold">{indexOfFirstProduct + 1}</span> a{' '}
                    <span className="font-semibold">{Math.min(indexOfLastProduct, filteredProducts.length)}</span>{' '}
                    de <span className="font-semibold">{filteredProducts.length}</span> productos
                  </div>
                  
                  <div className="flex items-center gap-2">
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
                        } else if (
                          pageNumber === currentPage - 2 ||
                          pageNumber === currentPage + 2
                        ) {
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
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No se encontraron productos</p>
              <button
                onClick={handleClearSearch}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Nueva búsqueda
              </button>
            </div>
          )}
        </>
      )}

      {!hasSearched && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center border-2 border-dashed border-gray-300">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Completa los campos y presiona Buscar para ver los productos</p>
        </div>
      )}

      {/* Modal de Detalle con selector de almacén */}
      <ProdDetailModal 
        product={selectedProduct} 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        onAddToQuotation={onAddToQuotation}
      />
    </div>
  );
};

export default ProductsTab;
