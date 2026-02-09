// src/components/calls/ProductsTab.jsx
import React, { useState } from 'react';
import { Search, Package, AlertCircle, Eye, Building2, Loader2 } from 'lucide-react';
import { productService } from '../../services/productService';
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
  
  // ✅ Estados para la API
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Paginación
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = productos.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(productos.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  /**
   * ✅ Buscar productos en la API
   */
  const handleSearch = async () => {
    // Validar que al menos uno de los campos esté lleno
    if (!codigoProducto.trim() && !nombreProducto.trim()) {
      setError('Ingrese al menos un código o nombre de producto');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setCurrentPage(1);

    try {
      let response;

      // ✅ Priorizar búsqueda por código
      if (codigoProducto.trim()) {
        console.log(`🔍 Buscando por código: ${codigoProducto}`);
        response = await productService.searchByCodigo(codigoProducto);
      } else if (nombreProducto.trim()) {
        console.log(`🔍 Buscando por nombre: ${nombreProducto}`);
        response = await productService.searchByName(nombreProducto);
      }

      if (response.success) {
        // ✅ Transformar los productos al formato del componente
        const productosFormateados = response.data.map(item => {
          // Si viene de searchByCodigo (con stock completo)
          if (item.producto && item.stock) {
            return {
              id: item.producto.codigo?.trim(),
              codigo: item.producto.codigo?.trim(),
              nombre: item.producto.descripcion?.trim(),
              categoria: item.producto.linea?.trim() || 'Sin categoría',
              proveedor: item.producto.marca?.trim() || 'N/A',
              precioNetoDolar: item.producto.precioListaDol || 0,
              precioBolsa: item.producto.precioBoletin || 0,
              unidad: 'UND',
              disponibleVenta: item.producto.disponibleVenta === 'S',
              
              // ✅ Stock por almacén (mapear desde el array de stock)
              stock: item.stock.reduce((sum, s) => sum + (s.stock || 0), 0),
              stockBSF: item.stock.find(s => s.almacencod?.includes('BSF'))?.stock || 0,
              stockSanLuis: item.stock.find(s => s.almacencod?.includes('SAN'))?.stock || 0,
              almacenes: item.stock, // Guardar todos los almacenes
              
              // Datos adicionales
              equivalencia01: item.producto.equivalencia01?.trim(),
              equivalencia02: item.producto.equivalencia02?.trim(),
              core: item.producto.core?.trim(),
              modelo: item.producto.modelo?.trim()
            };
          }
          
          // Si viene de searchByName (sin stock)
          return {
            id: item.codigo?.trim(),
            codigo: item.codigo?.trim(),
            nombre: item.descripcion?.trim(),
            categoria: item.linea?.trim() || 'Sin categoría',
            proveedor: item.marca?.trim() || 'N/A',
            precioNetoDolar: item.precioListaDol || 0,
            unidad: 'UND',
            stock: 0,
            stockBSF: 0,
            stockSanLuis: 0,
            almacenes: []
          };
        });

        setProductos(productosFormateados);
        console.log(`✅ ${productosFormateados.length} productos encontrados`);

        if (productosFormateados.length === 0) {
          setError('No se encontraron productos con esos criterios');
        }
      } else {
        setError(response.msgerror || 'Error al buscar productos');
        setProductos([]);
      }

    } catch (error) {
      console.error('❌ Error al buscar productos:', error);
      setError('Error al conectar con el servidor. Intente nuevamente.');
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setCodigoProducto('');
    setNombreProducto('');
    setHasSearched(false);
    setCurrentPage(1);
    setProductos([]);
    setError(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  /**
   * ✅ Función para obtener el estado del stock
   */
  const getStockStatus = (stock) => {
    if (stock === 0) {
      return {
        text: 'Sin Stock',
        color: 'bg-red-100 text-red-700 border-red-300',
        icon: '❌'
      };
    } else if (stock < 10) {
      return {
        text: 'Stock Bajo',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        icon: '⚠️'
      };
    } else {
      return {
        text: 'Disponible',
        color: 'bg-green-100 text-green-700 border-green-300',
        icon: '✅'
      };
    }
  };

  /**
   * ✅ Función para obtener el estado del stock por almacén
   */
  const getWarehouseStockStatus = (stock) => {
    if (stock === 0) return { icon: '❌' };
    if (stock < 10) return { icon: '⚠️' };
    return { icon: '✅' };
  };

  return (
    <div className="space-y-6">
      {/* Formulario de Búsqueda */}
<div className="bg-white rounded-lg shadow-md p-6">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {/* Código de Producto */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Código de Producto <span className="text-red-600">*</span>
      </label>
      <input
        type="text"
        placeholder="Ej: Q3 o Q3.VBETY.4E"
        value={codigoProducto}
        onChange={e => setCodigoProducto(e.target.value.toUpperCase())}
        onKeyPress={handleKeyPress}
        disabled={loading}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100"
      />
    </div>
    
    {/* Nombre de Producto */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Nombre de Producto
      </label>
      <input
        type="text"
        placeholder="Ej: VALVULA"
        value={nombreProducto}
        onChange={e => setNombreProducto(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={loading}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100"
      />
    </div>
    
    {/* Botones */}
    <div className="md:col-span-3 lg:col-span-1 flex items-end gap-2">
      <button
        onClick={handleSearch}
        disabled={(!codigoProducto.trim() && !nombreProducto.trim()) || loading}
        className="flex-1 flex items-center justify-center gap-2 bg-[#334a5e] text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Buscando...</span>
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            <span>Buscar</span>
          </>
        )}
      </button>
      
      {hasSearched && !loading && (
        <button
          onClick={handleClearSearch}
          className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          Limpiar
        </button>
      )}
    </div>
  </div>

  {/* Texto helper debajo del formulario (opcional) */}
  <p className="text-xs text-gray-500 mt-2">
    💡 Tip: Puede ingresar código completo (Q3.VBETY.4E) o parcial (Q3) para buscar
  </p>

  {/* Mensaje de Error */}
  {error && (
    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-700">{error}</p>
    </div>
  )}
</div>


      {/* Tabla de Resultados */}
      {hasSearched && !loading && (
        <>
          {productos.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead className="bg-[#334a5e] text-white">
                    <tr>
                      <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Acciones</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Código</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Producto</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Categoría</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Marca</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                        <div className="flex items-center justify-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Stock por Almacén
                        </div>
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider">Precio ($ USD)</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Unidad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {currentProducts.map((product) => {
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
                          
                          {/* Stock por Almacén */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {product.almacenes && product.almacenes.length > 0 ? (
                              <div className="space-y-2">
                                {product.almacenes.map((almacen, idx) => {
                                  const status = getWarehouseStockStatus(almacen.stock);
                                  return (
                                    <div key={idx} className="flex items-center justify-between gap-3 bg-blue-50 rounded-lg px-3 py-2 border border-blue-200">
                                      <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-blue-600" />
                                        <span className="text-xs font-semibold text-blue-800">
                                          {almacen.almacendes?.trim() || almacen.almacencod}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-blue-900">{almacen.stock}</span>
                                        <span className="text-xs">{status.icon}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">Sin stock</span>
                            )}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${stockStatus.color}`}>
                              {stockStatus.icon} {stockStatus.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                            ${product.precioNetoDolar.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                            {product.unidad}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {productos.length > productsPerPage && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Mostrando <span className="font-semibold">{indexOfFirstProduct + 1}</span> a{' '}
                    <span className="font-semibold">{Math.min(indexOfLastProduct, productos.length)}</span>{' '}
                    de <span className="font-semibold">{productos.length}</span> productos
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
            !error && (
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
            )
          )}
        </>
      )}

      {/* Estado inicial */}
      {!hasSearched && !loading && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center border-2 border-dashed border-gray-300">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Ingrese un código o nombre de producto y presione Buscar</p>
          <p className="text-sm text-gray-400 mt-2">
            💡 Tip: Puede buscar por código completo (Q3.VBETY.4E) o parcial (Q3)
          </p>
        </div>
      )}

      {/* Modal de Detalle */}
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
