// src/components/calls/ProductsTab.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Search, Package, AlertCircle, Eye, Building2, Loader2, ShoppingCart, Lock } from 'lucide-react';
import { productService } from '../../services/productService';
import { precioService } from '../../services/precioService';
import ProdDetailModal from './ProdDetailModal';
import Tooltip from '../common/Tooltip';
import SearchableSelect from '../common/SearchableSelect';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';


const PriceCell = ({ qa, children }) => {
  if (qa?.loading) return <Loader2 className="w-4 h-4 animate-spin text-blue-400 mx-auto" />;
  if (qa?.error)   return <span className="text-xs text-red-400" title={qa.error}>—</span>;
  return children;
};


const getStockBlockReason = (product) => {
  if (!product.almacenes || product.almacenes.length === 0)
    return 'Sin almacén configurado';
  const conNombre = product.almacenes.filter(
    a => a.almacendes?.trim() || a.almacencod?.trim()
  );
  if (conNombre.length === 0) return 'Sin almacén identificado';
  if (conNombre.every(a => (a.stock || 0) === 0)) return 'Sin stock disponible';
  return null;
};


const ProductsTab = ({
  codigoProducto,
  setCodigoProducto,
  nombreProducto,
  setNombreProducto,
  hasSearched,
  setHasSearched,
  onAddToQuotation,
  clienteRuc,
  quotationItems,
  autoSearchTrigger,
  almacenSeleccionado,     
  setAlmacenSeleccionado,
}) => {
  const [modalOpen, setModalOpen]             = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage]         = useState(1);
  const [productsPerPage]                     = useState(10);
  const [productos, setProductos]             = useState([]);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState(null);

  const { user } = useContext(AuthContext);

  const codAlmacenes = user?.empresa?.cod_almacenes || [];

  const almacenOptions = codAlmacenes.map(a => ({
    value: a.cod,
    label: `${a.cod} — ${a.nombre}`,
  }));

  

  // ✅ VALIDACIÓN 2 y 3 — almacén bloqueado si hay productos en cotización
  const almacenBloqueado = quotationItems?.length > 0;

  // ── Auto-búsqueda desde PurchaseHistoryTab ─────────────────────────────
  useEffect(() => {
    if (autoSearchTrigger > 0 && codigoProducto?.trim()) {
      handleSearch();
    }
  }, [autoSearchTrigger]);

  const indexOfLastProduct  = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts     = productos.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages          = Math.ceil(productos.length / productsPerPage);
  const handlePageChange    = (pageNumber) => setCurrentPage(pageNumber);

  const calcPrecios = (preciosData, discount5, quantity) => {
    const dola  = preciosData?.importes?.dola || 0;
    const de05  = (Number(discount5) || 0) / 100;
    const unit  = dola * (1 - de05);
    const total = unit * (Number(quantity) || 1);
    return { precioUnit: unit, precioTotal: total };
  };

  const updateProductQuick = (codigo, quickData) => {
    setProductos(prev =>
      prev.map(p =>
        p.codigo === codigo
          ? { ...p, quick: { ...p.quick, ...quickData } }
          : p
      )
    );
  };

  const fetchPreciosRow = async (producto) => {
    try {
      const response = await precioService.obtenerPrecio(clienteRuc, producto.codigo.trim(), 1);
      if (response.success && response.data) {
        updateProductQuick(producto.codigo, {
          loading: false, error: null,
          preciosData: response.data, quantity: 1, discount5: ''
        });
      } else {
        updateProductQuick(producto.codigo, {
          loading: false,
          error: response.msgerror || 'Error al obtener precios'
        });
      }
    } catch (err) {
      console.error('❌ Error fetchPreciosRow:', err);
      updateProductQuick(producto.codigo, { loading: false, error: 'Error de conexión' });
    }
  };

  const handleSearch = async () => {
    // ✅ VALIDACIÓN 1 — almacén obligatorio
    if (codAlmacenes.length > 0 && !almacenSeleccionado) {
      toast.error('Debe seleccionar un almacén antes de buscar.', {
        position: 'top-right', icon: '🏭'
      });
      return;
    }

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
      if (codigoProducto.trim() && nombreProducto.trim()) {
        response = await productService.searchByCodigoAndNombre(codigoProducto, nombreProducto);
      } else if (codigoProducto.trim()) {
        response = await productService.searchByCodigo(codigoProducto);
      } else if (nombreProducto.trim()) {
        response = await productService.searchByName(nombreProducto);
      }

      if (response.success) {
        const productosFormateados = response.data.map(item => {
          const base = item.producto && item.stock
            ? (() => {
                const almacenesFiltrados = almacenSeleccionado
                  ? item.stock.filter(s => s.almacencod?.trim() === almacenSeleccionado?.cod)
                  : item.stock;

                const almacenesAll = item.stock.map(s => ({
                  almacencod: s.almacencod?.trim(),
                  almacendes: s.almacendes?.trim(),
                  stock:      s.stock   || 0,
                  reserva:    s.reserva || 0,
                }));

                return {
                  id:              item.producto.codigo?.trim(),
                  codigo:          item.producto.codigo?.trim(),
                  nombre:          item.producto.descripcion?.trim(),
                  categoria:       item.producto.linea?.trim() || 'Sin categoría',
                  proveedor:       item.producto.marca?.trim() || 'N/A',
                  precioNetoDolar: item.producto.precioListaDol || 0,
                  precioBolsa:     item.producto.precioBoletin  || 0,
                  unidad:          'UND',
                  disponibleVenta: item.producto.disponibleVenta === 'S',
                  stock:           almacenesFiltrados.reduce((sum, s) => sum + (s.stock || 0), 0),
                  almacenes:       almacenesFiltrados,
                  almacenesAll,
                  equivalencia01:  item.producto.equivalencia01?.trim(),
                  equivalencia02:  item.producto.equivalencia02?.trim(),
                  core:            item.producto.core?.trim(),
                  modelo:          item.producto.modelo?.trim()
                };
              })()
            : {
                id:              item.codigo?.trim(),
                codigo:          item.codigo?.trim(),
                nombre:          item.descripcion?.trim(),
                categoria:       item.linea?.trim() || 'Sin categoría',
                proveedor:       item.marca?.trim() || 'N/A',
                precioNetoDolar: item.precioListaDol || 0,
                unidad:          'UND',
                stock:           0,
                almacenes:       [],
                almacenesAll:    []
              };

          return {
            ...base,
            quick: { loading: true, error: null, preciosData: null, quantity: 1, discount5: 0 }
          };
        });

        setProductos(productosFormateados);

        if (productosFormateados.length === 0) {
          setError('No se encontraron productos con esos criterios');
        } else {
          productosFormateados.forEach(p => fetchPreciosRow(p));
        }
      } else {
        setError(response.msgerror || 'Error al buscar productos');
        setProductos([]);
      }
    } catch (err) {
      console.error('❌ Error al buscar productos:', err);
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

  const handleConfirm = (product) => {
    const qa = product.quick;

    const flag  = qa?.preciosData?.flag?.trim();
    const flagT = flag === 'T';
    const flagX = flag === 'X';
    const minD5 = flagT ? (qa?.preciosData?.descuentos?.de04 ?? 0)   : 0;
    const maxD5 = flagT ? (qa?.preciosData?.descuentos?.de05 ?? 100) : 100;

    const stockReason = getStockBlockReason(product);
    if (stockReason) {
      toast.error(`No se puede agregar "${product.codigo}": ${stockReason}.`,
        { position: 'top-right', duration: 4000, icon: '🚫' });
      return;
    }

    if (!qa?.preciosData) {
      toast.error('Los precios aún están cargando, por favor espere.', { position: 'top-right' });
      return;
    }

    const yaExiste = quotationItems?.some(item => item.codigo?.trim() === product.codigo?.trim());
    if (yaExiste) {
      toast.error(`"${product.codigo}" ya está en la cotización. Modifica los datos directamente en dicha sección.`,
        { position: 'top-right', duration: 4000, icon: '⚠️' });
      return;
    }

    if (flagX && Number(qa.discount5) !== 0) {
      toast.error('Este producto no permite descuento adicional.',
        { position: 'top-right', duration: 4000, icon: '🚫' });
      return;
    }

    if (flagT) {
      const raw = qa.discount5;
      const isEmpty = raw === '' || raw == null;
      if (!isEmpty) {
        const d5 = Number(raw);
        if (d5 < minD5 || d5 > maxD5) {
          toast.error(`El 5to descuento debe estar entre ${minD5}% y ${maxD5}%.`,
            { position: 'top-right', duration: 4000, icon: '⚠️' });
          return;
        }
      }
    }

    const qty = Math.max(1, Number(qa.quantity) || 1);
    const discount5 = flagX ? 0 : flagT
      ? (qa.discount5 === '' || qa.discount5 == null) ? 0 : Number(qa.discount5)
      : Math.min(100, Number(qa.discount5) || 0);

    const { precioUnit, precioTotal } = calcPrecios(qa.preciosData, discount5, qty);

    const almacenData  = codAlmacenes.find(a => a.cod === almacenSeleccionado);
    const codNumAlmacen = almacenSeleccionado?.codnum ?? null;

    console.log('🏭 Almacén seleccionado:', {
  cod:        almacenSeleccionado,
  codnum:     codNumAlmacen,
  almacenData,
});

    onAddToQuotation({
      ...product,
      quantity:       qty,
      discount1:      qa.preciosData.descuentos?.de01 || 0,
      discount5,
      precioLista:    qa.preciosData.importes?.ldol || product.precioNetoDolar,
      precioNeto:     precioUnit,
      precioCotizar:  precioTotal,
      preciosDetalle: qa.preciosData,
      warehouse:     product.almacenes?.[0]?.almacencod         || almacenSeleccionado || '',
      warehouseName: product.almacenes?.[0]?.almacendes?.trim() || almacenSeleccionado || '',
      codNumAlmacen, 
    });

    toast.success(`"${product.codigo}" agregado a la cotización`, { position: 'top-right' });
  };

  const getWarehouseStockStatus = (stock) => {
    if (stock === 0) return { icon: '❌' };
    if (stock < 10)  return { icon: '⚠️' };
    return               { icon: '✅' };
  };

  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Formulario de Búsqueda ── */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* ✅ Selector de almacén — obligatorio, se bloquea con productos en cotización */}
          {codAlmacenes.length > 0 && (
            <div>
              {/* ✅ Badge de bloqueado cuando hay productos en cotización */}
              {almacenBloqueado && (
                <div className="flex items-center gap-1.5 mb-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                  <Lock className="w-3 h-3 shrink-0" />
                  <span>Almacén fijado — hay productos en cotización</span>
                </div>
              )}
              <SearchableSelect
                label="Almacén"
                required
                value={almacenSeleccionado?.cod || ''}  
                onChange={val => {
                  if (almacenBloqueado) return; // ✅ VALIDACIÓN 2 — no permitir cambio
                  const almacenData = codAlmacenes.find(a => a.cod === val);
  setAlmacenSeleccionado(almacenData || null);
                  setProductos([]);
                  setHasSearched(false);
                }}
                options={almacenOptions}
                placeholder="Buscar almacén..."
                disabled={almacenBloqueado} // ✅ VALIDACIÓN 2 y 3
                error={
                  !almacenSeleccionado && !almacenBloqueado
                    ? 'Seleccione un almacén para buscar'
                    : null
                }
              />
            </div>
          )}

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

          <div className={`flex items-end gap-2 ${codAlmacenes.length > 0 ? 'md:col-span-3' : 'md:col-span-3 lg:col-span-1'}`}>
            <button
              onClick={handleSearch}
              disabled={(!codigoProducto.trim() && !nombreProducto.trim()) || loading}
              className="flex-1 flex items-center justify-center gap-2 bg-[#334a5e] text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /><span>Buscando...</span></>
              ) : (
                <><Search className="w-5 h-5" /><span>Buscar</span></>
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

        <p className="text-xs text-gray-500 mt-2">
          💡 Tip: Puede ingresar código completo (Q3.VBETY.4E) o parcial (Q3) para buscar
        </p>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* ── Tabla de Resultados ── */}
      {hasSearched && !loading && (
        <>
          {productos.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1400px]">
                  <thead className="bg-[#334a5e] text-white">
                    <tr>
                      <th className="px-4 py-3 text-left   text-xs font-semibold uppercase tracking-wider">Código</th>
                      <th className="px-4 py-3 text-left   text-xs font-semibold uppercase tracking-wider">Producto</th>
                      <th className="px-4 py-3 text-left   text-xs font-semibold uppercase tracking-wider">Marca</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider whitespace-normal leading-tight">Stock por<br/>Almacén</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider whitespace-normal leading-tight">P. Lista<br/>(Sin IGV)</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider bg-green-700">1er Dsco.</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider bg-green-700">5to Dsco.</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider bg-green-700 whitespace-normal leading-tight">P. Neto<br/>Unit.</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider bg-green-700">Cant.</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider bg-green-700 whitespace-normal leading-tight">P. Neto<br/>Total</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {currentProducts.map((product) => {
                      const qa = product.quick;
                      const { precioUnit, precioTotal } = qa?.preciosData
                        ? calcPrecios(qa.preciosData, qa.discount5, qa.quantity)
                        : { precioUnit: 0, precioTotal: 0 };

                      const stockReason  = getStockBlockReason(product);
                      const stockBlocked = !!stockReason;

                      const flag  = qa?.preciosData?.flag?.trim();
                      const flagT = flag === 'T';
                      const flagX = flag === 'X';
                      const minD5 = flagT ? (qa?.preciosData?.descuentos?.de04 ?? 0)   : 0;
                      const maxD5 = flagT ? (qa?.preciosData?.descuentos?.de05 ?? 100) : 100;

                      return (
                        <tr key={product.id}
                          className={`transition ${stockBlocked ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}>

                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.codigo}</td>
                          <td className="px-4 py-4 text-sm text-gray-900 max-w-[200px]">{product.nombre}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{product.proveedor}</td>

                          <td className="px-4 py-4 whitespace-nowrap">
                            {product.almacenes?.length > 0 ? (
                              <div className="space-y-1">
                                {product.almacenes.map((almacen, idx) => {
                                  const status = getWarehouseStockStatus(almacen.stock);
                                  return (
                                    <div key={idx} className="flex items-center justify-between gap-2 bg-blue-50 rounded-lg px-2 py-1.5 border border-blue-200">
                                      <div className="flex items-center gap-1">
                                        <Building2 className="w-3 h-3 text-blue-600" />
                                        <span className="text-xs font-semibold text-blue-800">
                                          {almacen.almacendes?.trim() || almacen.almacencod}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className="text-sm font-bold text-blue-900">{almacen.stock}</span>
                                        <span className="text-xs">{status.icon}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                                🚫 Sin almacén
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-semibold text-gray-800">
                            ${product.precioNetoDolar.toFixed(3)}
                          </td>

                          <td className="px-4 py-4 whitespace-nowrap text-center bg-green-50">
                            <PriceCell qa={qa}>
                              <span className="text-sm font-bold text-indigo-700">
                                {(qa?.preciosData?.descuentos?.de01 || 0).toFixed(1)}%
                              </span>
                            </PriceCell>
                          </td>

                          <td className="px-4 py-4 whitespace-nowrap text-center bg-green-50">
                            <PriceCell qa={qa}>
                              <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-0.5">
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    value={qa?.discount5 ?? ''}
                                    disabled={flagX}
                                    onChange={e => {
                                      if (flagX) return;
                                      const raw = e.target.value.replace(/\D/g, '');
                                      if (raw === '') { updateProductQuick(product.codigo, { discount5: '' }); return; }
                                      const num = Number(raw);
                                      const capped = flagT ? (num > maxD5 ? String(maxD5) : raw) : (num > 100 ? '100' : raw);
                                      updateProductQuick(product.codigo, { discount5: capped });
                                    }}
                                    onBlur={() => {
                                      if (flagX) return;
                                      const current = product.quick?.discount5;
                                      if (current === '' || current == null) return;
                                      const num = Number(current) || 0;
                                      const val = flagT ? Math.min(maxD5, Math.max(minD5, num)) : Math.min(100, Math.max(0, num));
                                      updateProductQuick(product.codigo, { discount5: val });
                                    }}
                                    className={`w-12 text-center text-sm font-bold border rounded px-1 py-0.5 focus:ring-1 outline-none ${
                                      flagX ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                                            : flagT ? 'bg-white border-orange-400 focus:ring-orange-400'
                                            : 'bg-white border-purple-300 focus:ring-purple-400'}`}
                                  />
                                  <span className="text-xs text-gray-400">%</span>
                                </div>
                                {flagX && <span className="text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-300 rounded px-1.5 py-0.5">Sin dscto.</span>}
                                {flagT && <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 rounded px-1.5 py-0.5">{minD5}% – {maxD5}%</span>}
                              </div>
                            </PriceCell>
                          </td>

                          <td className="px-4 py-4 whitespace-nowrap text-center bg-green-50">
                            <PriceCell qa={qa}>
                              <span className="text-sm font-bold text-green-700">${precioUnit.toFixed(3)}</span>
                            </PriceCell>
                          </td>

                          <td className="px-4 py-4 whitespace-nowrap text-center bg-green-50">
                            <PriceCell qa={qa}>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={qa?.quantity ?? ''}
                                onChange={e => {
                                  const raw = e.target.value.replace(/\D/g, '');
                                  updateProductQuick(product.codigo, { quantity: raw });
                                }}
                                onBlur={() => {
                                  const current = product.quick?.quantity;
                                  const val = current === '' || current == null ? 1
                                    : Math.min(product.stock || 9999, Math.max(1, Number(current) || 1));
                                  updateProductQuick(product.codigo, { quantity: val });
                                }}
                                className="w-14 text-center text-sm font-bold border border-green-300 rounded px-1 py-0.5 focus:ring-1 focus:ring-green-400 outline-none bg-white"
                              />
                            </PriceCell>
                          </td>

                          <td className="px-4 py-4 whitespace-nowrap text-center bg-green-50">
                            <PriceCell qa={qa}>
                              <span className="text-sm font-bold text-blue-700">${precioTotal.toFixed(3)}</span>
                            </PriceCell>
                          </td>

                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Tooltip text={stockBlocked ? stockReason : 'Agregar a cotización'}>
                                <button
                                  onClick={() => handleConfirm(product)}
                                  disabled={!!qa?.loading || !!qa?.error || stockBlocked}
                                  className={`px-3 py-2 text-white rounded-lg transition inline-flex items-center text-sm font-bold shadow
                                    ${stockBlocked ? 'bg-gray-400 cursor-not-allowed opacity-50'
                                      : 'bg-green-600 hover:bg-green-700 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100'}`}>
                                  <ShoppingCart className="w-4 h-4" />
                                </button>
                              </Tooltip>
                              <Tooltip text="Ver detalle">
                                <button
                                  onClick={() => handleOpenModal(product)}
                                  className="px-3 py-2 bg-[#334a5e] text-white rounded-lg hover:bg-blue-700 hover:scale-105 transition inline-flex items-center text-sm font-bold shadow">
                                  <Eye className="w-4 h-4" />
                                </button>
                              </Tooltip>
                            </div>
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
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed">
                      Anterior
                    </button>
                    <div className="flex gap-1">
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        if (pageNumber === 1 || pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)) {
                          return (
                            <button key={pageNumber} onClick={() => handlePageChange(pageNumber)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                currentPage === pageNumber ? 'bg-[#334a5e] text-white' : 'border border-gray-300 hover:bg-gray-50'}`}>
                              {pageNumber}
                            </button>
                          );
                        } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                          return <span key={pageNumber} className="px-2 text-gray-400">...</span>;
                        }
                        return null;
                      })}
                    </div>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed">
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
                <button onClick={handleClearSearch}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Nueva búsqueda
                </button>
              </div>
            )
          )}
        </>
      )}

      {/* ── Estado Inicial ── */}
      {!hasSearched && !loading && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center border-2 border-dashed border-gray-300">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Ingrese un código o nombre de producto y presione Buscar</p>
          <p className="text-sm text-gray-400 mt-2">
            💡 Tip: Puede buscar por código completo (Q3.VBETY.4E) o parcial (Q3)
          </p>
        </div>
      )}

      <ProdDetailModal
        product={selectedProduct}
        clienteRuc={clienteRuc}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAddToQuotation={onAddToQuotation}
        quotationItems={quotationItems}
      />
    </div>
  );
};

export default ProductsTab;
