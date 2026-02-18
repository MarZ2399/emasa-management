// src/components/products/ProductSelectorModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Search, X, Package, Filter, Loader } from 'lucide-react';
import { searchProducts } from '../../services/productService';
import { precioService } from '../../services/precioService';

const ProductSelectorModal = ({
  isOpen,
  onClose,
  onSelect,
  selectedClient,
  title = 'Seleccionar producto',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [products, setProducts] = useState([]);
  const [productsWithPrices, setProductsWithPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setCategoryFilter('all');
      setProducts([]);
      setProductsWithPrices([]);
      setCategories([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchTerm.trim() !== '') {
      const debounceTimer = setTimeout(() => {
        loadProducts(searchTerm);
      }, 500);

      return () => clearTimeout(debounceTimer);
    } else if (isOpen && searchTerm.trim() === '') {
      setProducts([]);
      setProductsWithPrices([]);
    }
  }, [searchTerm, isOpen]);

  const mapProductFromAPI = (item) => {
    const producto = item.producto || item;
    const stockData = item.stock || [];
    
    const stockTotal = stockData.reduce((sum, almacen) => {
      return sum + (almacen.stock || 0);
    }, 0);
    
    const codigoLimpio = (producto.codigo || '').trim();
    
    return {
      Codigo: codigoLimpio,
      Nombre: (producto.descripcion || '').trim(),
      Familia: producto.core ? producto.core.trim() : 'Sin categoría',
      Proveedor: (producto.marca || '').trim(),
      Stotal: stockTotal,
      precioListaDol: producto.precioListaDol || 0,
      linea: producto.linea || '',
      modelo: (producto.modelo || '').trim(),
      stockDetalle: stockData,
    };
  };

  const loadProducts = async (term) => {
    setLoading(true);
    console.log('🔍 === BUSCANDO PRODUCTOS ===');
    console.log('Término:', term);
    
    try {
      const response = await searchProducts(term);

      if (response.success && response.data) {
        const rawData = Array.isArray(response.data) ? response.data : [];
        const productList = rawData.map(mapProductFromAPI);
        
        setProducts(productList);
        console.log(`✅ ${productList.length} productos encontrados`);

        const uniqueCategories = [...new Set(productList.map(p => p.Familia))];
        setCategories(uniqueCategories.sort());

        if (selectedClient?.ruc && productList.length > 0) {
          await loadPricesForProducts(productList);
        } else {
          setProductsWithPrices(productList.map(p => ({
            ...p,
            precioLista: p.precioListaDol || 0,
            precioNeto: p.precioListaDol || 0,
            discount1: 0,
            discount2: 0,
            discount3: 0,
            discount4: 0,
            discount5: 0,
            hasPriceData: false,
          })));
        }
      } else {
        setProducts([]);
        setProductsWithPrices([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar productos:', error);
      setProducts([]);
      setProductsWithPrices([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ Cargar precios CON LA ESTRUCTURA REAL DE LA API
   */
  const loadPricesForProducts = async (productList) => {
    if (!selectedClient?.ruc) {
      console.warn('⚠️ No hay cliente seleccionado');
      return;
    }

    setLoadingPrices(true);
    console.log('💰 === CONSULTANDO PRECIOS ===');
    console.log('Cliente RUC:', selectedClient.ruc);

    try {
      const productsWithPriceData = await Promise.all(
        productList.map(async (product) => {
          try {
            if (!product.Codigo || product.Codigo.trim() === '') {
              console.warn('⚠️ Producto sin código:', product);
              return {
                ...product,
                precioLista: product.precioListaDol || 0,
                precioNeto: product.precioListaDol || 0,
                discount1: 0,
                discount2: 0,
                discount3: 0,
                discount4: 0,
                discount5: 0,
                hasPriceData: false,
              };
            }

            console.log(`🔍 Consultando precio para: ${product.Codigo}`);
            
            const precioResponse = await precioService.obtenerPrecio(
              selectedClient.ruc,
              product.Codigo.trim(),
              1
            );

            console.log(`📊 Respuesta precio ${product.Codigo}:`, precioResponse);

            // ✅ MAPEAR LA ESTRUCTURA REAL DE LA API
            if (precioResponse.success && precioResponse.data) {
              const data = precioResponse.data;
              
              // Extraer descuentos
              const descuentos = data.descuentos || {};
              const discount1 = descuentos.de01 || 0;
              const discount2 = descuentos.de02 || 0;
              const discount3 = descuentos.de03 || 0;
              const discount4 = descuentos.de04 || 0;
              const discount5 = descuentos.de05 || 0;
              
              // Extraer importes
              const importes = data.importes || {};
              const precioListaDolares = importes.ldol || product.precioListaDol || 0;
              const precioNetoDolares = importes.dola || product.precioListaDol || 0;
              
              console.log(`💰 Precios mapeados para ${product.Codigo}:`, {
                precioLista: precioListaDolares,
                precioNeto: precioNetoDolares,
                descuentos: { discount1, discount2, discount3, discount4, discount5 }
              });
              
              return {
                ...product,
                precioLista: precioListaDolares,
                precioNeto: precioNetoDolares,
                discount1,
                discount2,
                discount3,
                discount4,
                discount5,
                hasPriceData: true,
                // Guardar datos completos para referencia
                descuentosCompletos: descuentos,
                importesCompletos: importes,
                costosCompletos: data.costos || {},
              };
            }

            // Sin precio específico, usar precio de lista
            console.warn(`⚠️ Sin precio para ${product.Codigo}`);
            return {
              ...product,
              precioLista: product.precioListaDol || 0,
              precioNeto: product.precioListaDol || 0,
              discount1: 0,
              discount2: 0,
              discount3: 0,
              discount4: 0,
              discount5: 0,
              hasPriceData: false,
            };
          } catch (error) {
            console.error(`❌ Error precio ${product.Codigo}:`, error);
            return {
              ...product,
              precioLista: product.precioListaDol || 0,
              precioNeto: product.precioListaDol || 0,
              discount1: 0,
              discount2: 0,
              discount3: 0,
              discount4: 0,
              discount5: 0,
              hasPriceData: false,
            };
          }
        })
      );

      setProductsWithPrices(productsWithPriceData);
      console.log('✅ Precios cargados correctamente');
    } catch (error) {
      console.error('❌ Error general al cargar precios:', error);
    } finally {
      setLoadingPrices(false);
      console.log('=== FIN CONSULTA PRECIOS ===\n');
    }
  };

  const filteredProducts = useMemo(() => {
    const dataToFilter = productsWithPrices.length > 0 ? productsWithPrices : products;

    if (categoryFilter === 'all') {
      return dataToFilter;
    }

    return dataToFilter.filter(p => p.Familia === categoryFilter);
  }, [categoryFilter, products, productsWithPrices]);

  if (!isOpen) return null;

  const handleSelect = product => {
    console.log('✅ === PRODUCTO SELECCIONADO ===');
    
    const productToSend = {
      id: product.Codigo,
      codigo: product.Codigo,
      nombre: product.Nombre,
      proveedor: product.Proveedor,
      categoria: product.Familia,
      precioLista: product.precioLista || 0,
      precioNeto: product.precioNeto || 0,
      discount1: product.discount1 || 0,
      discount2: product.discount2 || 0,
      discount3: product.discount3 || 0,
      discount4: product.discount4 || 0,
      discount5: product.discount5 || 0,
      stock: product.Stotal || 0,
      hasPriceData: product.hasPriceData || false,
      // Datos extras para debug
      descuentosCompletos: product.descuentosCompletos,
      importesCompletos: product.importesCompletos,
      costosCompletos: product.costosCompletos,
    };

    console.log('Producto a enviar:', productToSend);
    console.log('=== FIN SELECCIÓN ===\n');
    
    onSelect(productToSend);
    onClose();
  };

  const content = (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b bg-gradient-to-r from-sky-500 to-blue-600 text-white">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            <div>
              <h2 className="text-sm md:text-base font-semibold">{title}</h2>
              <p className="text-[11px] md:text-xs text-sky-100">
                {selectedClient 
                  ? `Precios para: ${selectedClient.nombreCliente || selectedClient.nombre || selectedClient.ruc}`
                  : 'Busca productos por código'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filtros */}
        <div className="px-5 py-3 border-b bg-gray-50 flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Escribe el código del producto (ej: 21.0.986.AF1.001)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              disabled={loading}
              autoFocus
            />
          </div>

          {categories.length > 0 && (
            <div className="w-full md:w-60 flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="all">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading && (
          <div className="py-10 flex flex-col items-center justify-center">
            <Loader className="w-8 h-8 text-sky-600 animate-spin mb-2" />
            <p className="text-sm text-gray-600">Buscando productos...</p>
          </div>
        )}

        {loadingPrices && !loading && (
          <div className="px-5 py-2 bg-blue-50 border-b border-blue-200 flex items-center gap-2 text-sm text-blue-700">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Consultando precios...</span>
          </div>
        )}

        {!loading && (
          <div className="overflow-y-auto max-h-[60vh]">
            {searchTerm.trim() === '' ? (
              <div className="py-16 flex flex-col items-center justify-center text-gray-500 text-sm">
                <Search className="w-12 h-12 mb-3 text-gray-300" />
                <p className="text-base font-medium text-gray-700">Busca un producto</p>
                <p className="text-xs mt-2 text-gray-500">
                  Escribe el código del producto para comenzar
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-10 flex flex-col items-center justify-center text-gray-500 text-sm">
                <Package className="w-10 h-10 mb-2 text-gray-300" />
                <p>No se encontraron productos</p>
                <p className="text-xs mt-1">No hay resultados para "{searchTerm}"</p>
              </div>
            ) : (
              <table className="min-w-full text-xs md:text-sm">
                <thead className="bg-gray-100 border-b sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Código</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Nombre</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Categoría</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700">Precio Lista</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700">Dscto 1(%)</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700">Precio Neto</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700">Stock</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-700">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map(product => (
                    <tr key={product.Codigo} className="hover:bg-blue-50/60 transition">
                      <td className="px-3 py-2 whitespace-nowrap text-[11px] md:text-xs font-medium text-gray-800">
                        {product.Codigo}
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-xs md:text-sm font-semibold text-gray-900">
                          {product.Nombre}
                        </div>
                        {product.Proveedor && (
                          <div className="text-[11px] text-gray-500">
                            {product.Proveedor}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-[11px] text-gray-700">
                        {product.Familia}
                      </td>
                      <td className="px-3 py-2 text-right text-[11px] md:text-xs text-gray-800">
                        {product.precioLista > 0 ? `$${product.precioLista.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-3 py-2 text-right text-[11px] md:text-xs text-blue-600 font-medium">
                        {product.hasPriceData && product.discount1 > 0 ? `${product.discount1}%` : '-'}
                      </td>
                      <td className="px-3 py-2 text-right text-[11px] md:text-xs font-semibold">
                        {product.precioNeto > 0 ? (
                          <span className="text-emerald-700">${product.precioNeto.toFixed(2)}</span>
                        ) : '-'}
                      </td>
                      <td className="px-3 py-2 text-right text-[11px] text-gray-800">
                        {product.Stotal || 0}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleSelect(product)}
                          className="inline-flex items-center px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          Usar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
};

export default ProductSelectorModal;
