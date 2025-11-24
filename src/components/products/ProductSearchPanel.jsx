// src/components/products/ProductSearchPanel.jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Search, Package, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { initialProducts } from '../../data/productsData';

const ProductSearchPanel = ({ isOpen, onClose }) => {
  const [codigoProducto, setCodigoProducto] = useState('');
  const [nombreProducto, setNombreProducto] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(1);

  // Filtrar productos
  const filteredProducts = initialProducts.filter(product => {
    const matchesCodigo = product.codigo.toLowerCase().includes(codigoProducto.toLowerCase());
    const matchesNombre = product.nombre.toLowerCase().includes(nombreProducto.toLowerCase());
    
    if (codigoProducto && nombreProducto) {
      return matchesCodigo && matchesNombre;
    }
    if (codigoProducto) {
      return matchesCodigo;
    }
    if (nombreProducto) {
      return matchesNombre;
    }
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
    if (!codigoProducto.trim() && !nombreProducto.trim()) {
      return;
    }
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
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const currentProduct = currentProducts[0];

  // 📌 PORTAL CONTENT
  const portalContent = (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Side Panel */}
      <div 
        className={`fixed top-0 right-0 h-screen w-full md:w-[1200px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex items-center justify-between border-b-4 border-purple-700">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6" />
            <h2 className="text-xl font-bold">Consulta de Productos</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Search Form */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Código de Producto */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Código de Producto
                </label>
                <input
                  type="text"
                  placeholder="Ej: PROD-011"
                  value={codigoProducto}
                  onChange={(e) => setCodigoProducto(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* Nombre de Producto */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre de Producto
                </label>
                <input
                  type="text"
                  placeholder="Ej: Correa de Distribución"
                  value={nombreProducto}
                  onChange={(e) => setNombreProducto(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* Botones */}
              <div className="flex gap-2 items-end">
                <button
                  onClick={handleSearch}
                  disabled={!codigoProducto.trim() && !nombreProducto.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Search className="w-5 h-5" />
                  <span className="hidden sm:inline">Buscar</span>
                </button>
                
                {hasSearched && (
                  <button
                    onClick={handleClearSearch}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-semibold transition"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          {hasSearched ? (
            <>
              {currentProduct ? (
                <div className="space-y-6">
                  
                  {/* Counter */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>{filteredProducts.length}</strong> producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Contenedor Principal - Grid 2x2 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* SECCIÓN IZQUIERDA: BÚSQUEDA Y STOCK */}
                    <div className="space-y-4">
                      
                      {/* BÚSQUEDA */}
                      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 ring-1 ring-inset ring-gray-200">
                        <div className="bg-black text-white p-4 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.1)]">
                          <h3 className="font-bold text-lg">BÚSQUEDA</h3>
                        </div>
                        <div className="p-6 space-y-4 [box-shadow:inset_0_-1px_0_rgba(0,0,0,0.03)]">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                              Producto
                            </label>
                            <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50">
                              {currentProduct.nombre}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                              Código
                            </label>
                            <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50">
                              {currentProduct.codigo}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                              Top Venta
                            </label>
                            <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50">
                              {currentProduct.topVenta || 'N/A'}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                              Observación
                            </label>
                            <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50">
                              {currentProduct.observaciones || 'Sin observaciones'}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                              Cód. Reemplazo
                            </label>
                            <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50">
                              {currentProduct.codReemplazo || 'Sin dato'}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                              Caja Master
                            </label>
                            <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50">
                              {currentProduct.cajaMaster || 'Sin dato'}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                              Línea - Core
                            </label>
                            <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50">
                              {currentProduct.proveedor || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* PRECIOS */}
                      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 ring-1 ring-inset ring-gray-200">
                        <div className="bg-black text-white p-4 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.1)]">
                          <h3 className="font-bold text-lg">PRECIOS</h3>
                        </div>
                        <div className="p-6 space-y-3 [box-shadow:inset_0_-1px_0_rgba(0,0,0,0.03)]">
                          <div className="flex justify-between">
                            <span className="font-bold">Precio Lista:</span>
                            <span className="text-right">S/ {(currentProduct.precioLista || currentProduct.precio * 1.3).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-bold">Precio Neto:</span>
                            <span className="text-right">S/ {currentProduct.precioNeto.toFixed(2)}</span>
                          </div>
                          <div className="bg-green-100 p-3 rounded">
                            <div className="flex justify-between">
                              <span className="font-bold text-green-800">Cantidad:</span>
                              <span className="font-bold text-green-800">{currentProduct.stock}</span>
                            </div>
                          </div>
                          <div className="bg-green-100 p-3 rounded">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs font-bold">1er Dsctó</span>
                              <span className="text-xs">{currentProduct.descuento1 || '0'}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs font-bold">2do Dsctó</span>
                              <span className="text-xs">{currentProduct.descuento2 || '0'}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECCIÓN DERECHA: STOCK Y MARGEN */}
                    <div className="space-y-4">
                      
                      {/* STOCK */}
                      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 ring-1 ring-inset ring-gray-200">
                        <div className="bg-black text-white p-4 flex justify-between items-center [box-shadow:inset_0_1px_0_rgba(255,255,255,0.1)]">
                          <h3 className="font-bold text-lg">STOCK</h3>
                          <span className="text-sm">{new Date().toLocaleString('es-PE')}</span>
                        </div>
                        <div className="p-6 space-y-3 [box-shadow:inset_0_-1px_0_rgba(0,0,0,0.03)]">
                          <div className="flex justify-between border-b pb-2">
                            <span>Stock BSF</span>
                            <span className="font-bold">{currentProduct.stockBSF || 0}</span>
                          </div>
                          <div className="flex justify-between border-b pb-2">
                            <span>Stock San Luis</span>
                            <span className="font-bold">{currentProduct.stockSanLuis || 0}</span>
                          </div>
                          <div className="flex justify-between border-b pb-2">
                            <span className="font-bold">No Conforme</span>
                            <span className="font-bold text-red-600">{currentProduct.noConforme || 0}</span>
                          </div>
                          <div className="flex justify-between border-b pb-2">
                            <span>Stock GOSS</span>
                            <span className="font-bold">{currentProduct.stockGOSS || 0}</span>
                          </div>
                          <div className="flex justify-between pb-2">
                            <span className="font-bold">Stock Tránsito</span>
                            <span className="font-bold">{currentProduct.stockTransito || 0}</span>
                          </div>
                          
                          <div className="bg-yellow-100 p-3 rounded mt-4">
                            <div className="flex justify-between mb-2">
                              <span className="font-bold text-yellow-800">Fase Embarque</span>
                              <span className="text-right text-yellow-800">{currentProduct.faseEmbarque || 'N/A'}</span>
                            </div>
                          </div>

                          <div className="bg-pink-100 p-3 rounded">
                            <div className="flex justify-between mb-2">
                              <span className="font-bold">Fase Llegada</span>
                              <span>{currentProduct.faseLlegada || 'N/A'}</span>
                            </div>
                          </div>

                          <div className="bg-pink-100 p-3 rounded">
                            <div className="flex justify-between mb-2">
                              <span className="font-bold">Fecha Llegada</span>
                              <span>{currentProduct.fechaLlegada || 'N/A'}</span>
                            </div>
                          </div>

                          <div className="bg-pink-100 p-3 rounded">
                            <div className="flex justify-between">
                              <span className="font-bold">Cantidad Llegada</span>
                              <span className="font-bold">{currentProduct.cantidadLlegada || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* MARGEN */}
                      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 ring-1 ring-inset ring-gray-200">
                        <div className="bg-black text-white p-4 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.1)]">
                          <h3 className="font-bold text-lg">MARGEN</h3>
                        </div>
                        <div className="p-6 space-y-3 [box-shadow:inset_0_-1px_0_rgba(0,0,0,0.03)]">
                          <div className="flex justify-between">
                            <span>CPU (S/.)</span>
                            <span className="text-right">S/ {(currentProduct.cpuDolar || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Venta Neta (S/.)</span>
                            <span className="text-right">S/ {(currentProduct.ventaNetaDolar || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ganancia (S/.)</span>
                            <span className="text-right">{(currentProduct.gananciaDolar || 0).toFixed(2)}</span>
                          </div>
                          <div className="bg-green-100 p-3 rounded">
                            <div className="flex justify-between">
                              <span className="font-bold text-green-800">Margen (%)</span>
                              <span className="font-bold text-green-800">{currentProduct.margenPorcentaje || 0}%</span>
                            </div>
                          </div>
                          <div className="bg-green-100 p-3 rounded">
                            <div className="flex justify-between">
                              <span className="text-xs">P. Oferta Neto (US$)</span>
                              <span className="text-xs text-right">(%) Dcto otorgado</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN INFERIOR: PRECIOS EN DÓLARES Y CONDICIONES */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* PRECIO REGULAR DÓLARES */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 ring-1 ring-inset ring-gray-200">
                      <div className="bg-black text-white p-4 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.1)]">
                        <h3 className="font-bold text-lg">PRECIO REGULAR DÓLARES</h3>
                      </div>
                      <div className="p-6 space-y-3 text-sm [box-shadow:inset_0_-1px_0_rgba(0,0,0,0.03)]">
                        <div className="flex justify-between">
                          <span>Precio Neto:</span>
                          <span>$ {(currentProduct.precioNetoDolar || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Precio Unitario:</span>
                          <span>$ {((currentProduct.precioNetoDolar || 0) * 1.15).toFixed(2)} c/ IGV</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Descuento (2%):</span>
                          <span>$ {(currentProduct.descuentoDolar || 0).toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between font-bold">
                          <span>Nuevo Total (-2% Dcto):</span>
                          <span>$ {(((currentProduct.precioNetoDolar || 0) * 1.15) - (currentProduct.descuentoDolar || 0)).toFixed(2)} c/ IGV</span>
                        </div>
                      </div>
                    </div>

                    {/* PRECIO ECOMMERCE O BOLETÍN */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 ring-1 ring-inset ring-gray-200">
                      <div className="bg-black text-white p-4 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.1)]">
                        <h3 className="font-bold text-lg">PRECIO ECOMMERCE o BOLETÍN</h3>
                      </div>
                      <div className="p-6 space-y-3 text-sm [box-shadow:inset_0_-1px_0_rgba(0,0,0,0.03)]">
                        <div className="flex justify-between">
                          <span>Precio Neto:</span>
                          <span>$ {(currentProduct.precioEcommerceDolar || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Precio Oferta x unidad:</span>
                          <span>$ {(currentProduct.precioOfertaDolar || 0).toFixed(2)} c/ IGV</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Precio Dcto incluido:</span>
                          <span>$ {(currentProduct.precioOfertaDecuento || 0).toFixed(2)} c/ IGV</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between font-bold">
                          <span>Total Cotización soles:</span>
                          <span>S/ {(((currentProduct.precioOfertaDecuento || 0) * 3.85)).toFixed(2)} c/ IGV</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN INFERIOR: PRECIO EN SOLES Y CONDICIONES */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* PRECIO REGULAR SOLES */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 ring-1 ring-inset ring-gray-200">
                      <div className="bg-black text-white p-4 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.1)]">
                        <h3 className="font-bold text-lg">PRECIO REGULAR SOLES</h3>
                      </div>
                      <div className="p-6 space-y-3 text-sm [box-shadow:inset_0_-1px_0_rgba(0,0,0,0.03)]">
                        <div className="flex justify-between">
                          <span>Precio Neto:</span>
                          <span>S/ {(currentProduct.precioNeto || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Precio Ideal:</span>
                          <span>S/ {(((currentProduct.precioNeto || 0) * 1.15)).toFixed(2)} c/ IGV</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Descuento (2%):</span>
                          <span>S/ {(((currentProduct.precioNeto || 0) * 0.02)).toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between font-bold">
                          <span>Nuevo Total (-2% Dcto):</span>
                          <span>S/ {((((currentProduct.precioNeto || 0) * 1.15) * 0.98)).toFixed(2)} c/ IGV</span>
                        </div>
                      </div>
                    </div>

                    {/* CONDICIONES DE LA OFERTA */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 ring-1 ring-inset ring-gray-200">
                      <div className="bg-black text-white p-4 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.1)]">
                        <h3 className="font-bold text-lg">CONDICIONES DE LA OFERTA</h3>
                      </div>
                      <div className="p-6 space-y-2 text-sm [box-shadow:inset_0_-1px_0_rgba(0,0,0,0.03)]">
                        <div className="flex justify-between">
                          <span className="font-bold">Cantidad Mínima Compra:</span>
                          <span>1</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold">Vigencia De La Oferta</span>
                          <span>03-30 Nov</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold">Nombre Evento u Oferta</span>
                          <span>{currentProduct.categoria || 'General'}</span>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t space-y-2">
                          <p className="font-bold">Observaciones:</p>
                          <ul className="space-y-1 text-xs">
                            <li>• Por compra menor a USD 5.000</li>
                            <li>• Por compra entre USD 5.000 y 9.999</li>
                            <li>• Por compra entre USD 10.000 y 19.999</li>
                            <li>• Por compra superior a USD 20.000</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pagination */}
                  {filteredProducts.length > 1 && (
                    <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-4 border border-gray-200">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                      </button>
                      
                      <div className="text-center">
                        <p className="text-xs text-gray-600">
                          <span className="font-semibold">{currentPage}</span> de{' '}
                          <span className="font-semibold">{totalPages}</span>
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-200">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">No se encontraron productos</p>
                  <button
                    onClick={handleClearSearch}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    Nueva búsqueda
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center border-2 border-dashed border-gray-300">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">Completa los campos y presiona Buscar</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  // 📌 RENDER CON PORTAL
  return isOpen ? ReactDOM.createPortal(portalContent, document.body) : null;
};

export default ProductSearchPanel;
