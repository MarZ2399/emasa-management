// src/components/calls/ProdDetailModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Building2, AlertCircle, ShoppingCart, Loader2 } from 'lucide-react';
import { precioService } from '../../services/precioService';
import toast from 'react-hot-toast';

const ProdDetailModal = ({
  product,
  clienteRuc,
  isOpen,
  onClose,
  onAddToQuotation
}) => {
  if (!product || !isOpen) return null;

  // Estados para los inputs editables
  const [quantity, setQuantity] = useState(1);
  const [discount1, setDiscount1] = useState(0);
  const [discount5, setDiscount5] = useState(0);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  
  // Estados para datos de precios del SP
  const [preciosData, setPreciosData] = useState(null);
  const [loadingPrecios, setLoadingPrecios] = useState(false);
  const [errorPrecios, setErrorPrecios] = useState(null);

  // Ref para controlar si ya se hizo la carga inicial
  const initialLoadDone = useRef(false);
  const debounceTimer = useRef(null);

  // ✅ CARGAR PRECIOS SOLO AL ABRIR EL MODAL (una vez)
  useEffect(() => {
    if (isOpen && product && clienteRuc && !initialLoadDone.current) {
      console.log('🎯 Modal abierto - Cargando precios iniciales');
      fetchPrecios(1);
      initialLoadDone.current = true;
    }

    // Reset cuando se cierra el modal
    if (!isOpen) {
      initialLoadDone.current = false;
      setPreciosData(null);
      setQuantity(1);
      setDiscount1(0);
      setDiscount5(0);
      setSelectedWarehouse('');
    }
  }, [isOpen, product?.codigo, clienteRuc]);

  /**
   * ✅ Función para obtener precios del SP
   */
  const fetchPrecios = async (cant) => {
    if (!clienteRuc || !product?.codigo) {
      setErrorPrecios('Faltan datos para consultar precios');
      return;
    }

    // Validar que la cantidad sea válida
    if (!cant || cant <= 0) {
      console.warn('⚠️ Cantidad inválida:', cant);
      return;
    }

    try {
      setLoadingPrecios(true);
      setErrorPrecios(null);

      console.log('📞 Consultando precios:', {
        ruc: clienteRuc,
        codigo: product.codigo.trim(),
        cantidad: cant
      });

      const response = await precioService.obtenerPrecio(
        clienteRuc,
        product.codigo.trim(),
        cant
      );

      console.log('📦 Respuesta del servicio:', response);

      if (response.success && response.data) {
        setPreciosData(response.data);
        
        // ✅ Actualizar descuentos desde el SP
        setDiscount1(response.data.descuentos?.de01 || 0);
        setDiscount5(response.data.descuentos?.de05 || 0);

        console.log('✅ Precios obtenidos:', response.data);
      } else {
        setErrorPrecios(response.msgerror || response.error || 'No se pudieron obtener los precios');
        console.error('❌ Error en respuesta:', response);
      }

    } catch (error) {
      console.error('❌ Error al obtener precios:', error);
      setErrorPrecios('Error al consultar precios del servidor');
      toast.error('No se pudieron cargar los precios', { position: 'top-right' });
    } finally {
      setLoadingPrecios(false);
    }
  };

  /**
   * Función para obtener el estado del stock
   */
  const getWarehouseStockStatus = (stock) => {
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

  // Cálculo del precio usando datos del SP o fallback
  const precioNetoDolar = preciosData?.importes?.dolp || product.precioNetoDolar || 0;
  const precioTotal = preciosData?.importes?.dola || (precioNetoDolar * quantity);

  // Validar stock disponible según almacén seleccionado
  const getAvailableStock = () => {
    if (!selectedWarehouse || !product.almacenes) return 0;
    
    const almacen = product.almacenes.find(a => a.almacencod === selectedWarehouse);
    return almacen?.stock || 0;
  };

  const availableStock = getAvailableStock();
  const canAdd = selectedWarehouse && quantity > 0 && quantity <= availableStock;

  /**
   * ✅ Manejar cambio de cantidad CON DEBOUNCE
   */
  const handleQuantityChange = (value) => {
    const cleanValue = value.replace(/\D/g, "");
    
    if (cleanValue === "") {
      setQuantity("");
      return;
    }

    const numValue = parseInt(cleanValue);
    
    // Validar contra stock disponible
    if (selectedWarehouse && numValue > availableStock) {
      setQuantity(availableStock);
      debounceFetchPrecios(availableStock);
    } else {
      setQuantity(numValue);
      debounceFetchPrecios(numValue);
    }
  };

  /**
   * ✅ Debounce para no llamar al SP en cada tecla
   */
  const debounceFetchPrecios = (cant) => {
    // Limpiar el timer anterior
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Crear nuevo timer
    debounceTimer.current = setTimeout(() => {
      console.log('⏱️ Debounce terminado - Consultando precios para cantidad:', cant);
      fetchPrecios(cant);
    }, 800); // Esperar 800ms después de que el usuario deje de escribir
  };

  const handleAddToQuotation = () => {
    if (!selectedWarehouse) {
      toast.error('Por favor selecciona un almacén', { position: 'top-right' });
      return;
    }

    if (quantity > availableStock) {
      toast.error('Stock insuficiente en el almacén seleccionado', {
        position: 'top-right'
      });
      return;
    }

    if (quantity <= 0) {
      toast.error('La cantidad debe ser mayor a 0', { position: 'top-right' });
      return;
    }

    const almacenSeleccionado = product.almacenes?.find(a => a.almacencod === selectedWarehouse);

    onAddToQuotation({
      ...product,
      quantity,
      discount1,
      discount5,
      precioLista: preciosData?.importes?.ldol || product.precioListaDolar || product.precioNetoDolar,
      precioNeto: precioNetoDolar,
      precioCotizar: precioTotal,
      preciosDetalle: preciosData,
      warehouse: selectedWarehouse,
      warehouseName: almacenSeleccionado?.almacendes?.trim() || selectedWarehouse
    });

    toast.success(`Producto agregado desde almacén ${almacenSeleccionado?.almacendes?.trim() || selectedWarehouse}`, {
      position: 'top-right'
    });

    // Reset
    setQuantity(1);
    setDiscount5(0);
    setSelectedWarehouse('');
    setPreciosData(null);
    initialLoadDone.current = false;
    onClose();
  };

  // ✅ Cleanup del debounce
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-50 rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto relative">

        {/* Header con botón de agregar */}
        <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{product.nombre}</h2>
            <p className="text-sm text-gray-600">Código: {product.codigo}</p>
            {/* ✅ Mostrar RUC para debug */}
            {clienteRuc && (
              <p className="text-xs text-gray-500">Cliente RUC: {clienteRuc}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddToQuotation}
              disabled={!canAdd || loadingPrecios}
              className={`px-4 py-2 rounded font-bold transition flex items-center gap-2 ${
                canAdd && !loadingPrecios
                  ? 'bg-[#334a5e] hover:bg-[#2c3e50] text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={!canAdd ? 'Selecciona un almacén y verifica el stock' : 'Agregar producto'}
            >
              {loadingPrecios ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Agregar producto
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-red-600 text-2xl font-bold z-10"
              title="Cerrar"
            >
              ✖
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Grid Principal 2 Columnas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* COLUMNA IZQUIERDA */}
              <div className="space-y-6">

                {/* INDICADOR DE CARGA/ERROR DE PRECIOS */}
                {loadingPrecios && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3 animate-pulse">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    <span className="text-sm text-blue-800 font-medium">
                      Consultando precios para cantidad: {quantity}...
                    </span>
                  </div>
                )}

                {errorPrecios && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div className="flex-1">
                      <span className="text-sm text-red-800 font-medium block">{errorPrecios}</span>
                      <button 
                        onClick={() => fetchPrecios(quantity)}
                        className="text-xs text-red-600 underline mt-1"
                      >
                        Reintentar
                      </button>
                    </div>
                  </div>
                )}

                {/* ✅ MOSTRAR CUANDO LOS PRECIOS SE CARGARON */}
                {preciosData && !loadingPrecios && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <span className="text-green-600 text-2xl">✓</span>
                    <span className="text-sm text-green-800 font-medium">
                      Precios cargados correctamente desde el SP
                    </span>
                  </div>
                )}

                {/* BÚSQUEDA */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-[#334a5e] text-white p-4">
                    <h3 className="font-bold text-lg">INFORMACIÓN DEL PRODUCTO</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {[
                        { label: 'Producto', value: product.nombre },
                        { label: 'Código', value: product.codigo },
                        { label: 'Cliente RUC', value: clienteRuc || '⚠️ No seleccionado' },
                        { label: 'Categoría', value: product.categoria || 'N/A' },
                        { label: 'Marca', value: product.proveedor || 'N/A' },
                        { label: 'Equivalencia 01', value: product.equivalencia01 || 'N/A' },
                        { label: 'Equivalencia 02', value: product.equivalencia02 || 'N/A' },
                        { label: 'Core', value: product.core || 'N/A' }
                      ].map((item, i) => (
                        <div key={i} className="grid grid-cols-[200px_1fr] gap-4">
                          <div className="bg-gray-100 px-4 py-2 font-semibold text-gray-700">{item.label}</div>
                          <div className={`px-4 py-2 ${!clienteRuc && item.label === 'Cliente RUC' ? 'text-red-600 font-bold' : ''}`}>
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SELECTOR DE ALMACÉN + CANTIDAD + DESCUENTOS */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-blue-200">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Building2 className="w-6 h-6" />
                      SELECCIONAR ALMACÉN Y CANTIDAD
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    
                    {/* SELECCIÓN DE ALMACENES - Dinámico */}
                    {product.almacenes && product.almacenes.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {product.almacenes.map((almacen, idx) => {
                          const stockStatus = getWarehouseStockStatus(almacen.stock);
                          const isSelected = selectedWarehouse === almacen.almacencod;
                          const almacenNombre = almacen.almacendes?.trim() || almacen.almacencod?.trim();
                          
                          return (
                            <button
                              key={idx}
                              onClick={() => setSelectedWarehouse(almacen.almacencod)}
                              disabled={almacen.stock === 0}
                              className={`p-4 rounded-lg border-2 transition-all text-left ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
                                  : 'border-gray-300 hover:border-blue-300'
                              } ${
                                almacen.stock === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                              }`}
                            >
                              {/* Header del almacén */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Building2 className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                                  <div>
                                    <span className="font-bold text-gray-900 text-sm block">
                                      {almacenNombre}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {almacen.almacencod?.trim()}
                                    </span>
                                  </div>
                                </div>
                                {isSelected && (
                                  <span className="text-blue-600 text-2xl">✓</span>
                                )}
                              </div>

                              {/* Stock */}
                              <div className="text-left mb-2">
                                <span className={`text-3xl font-bold ${
                                  almacen.stock === 0 ? 'text-gray-400' : 
                                  almacen.stock < 10 ? 'text-yellow-600' : 
                                  'text-green-600'
                                }`}>
                                  {almacen.stock}
                                </span>
                                <span className="text-sm text-gray-600 ml-1">unidades</span>
                              </div>

                              {/* Badge de estado */}
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${stockStatus.color}`}>
                                {stockStatus.icon} {stockStatus.text}
                              </span>

                              {/* Mostrar reserva si existe */}
                              {almacen.reserva > 0 && (
                                <div className="mt-2 text-xs text-orange-600">
                                  ⚠️ Reservado: {almacen.reserva}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="font-medium">No hay almacenes disponibles</p>
                        <p className="text-sm">Este producto no tiene stock en ningún almacén</p>
                      </div>
                    )}

                    {/* Mensaje informativo */}
                    {!selectedWarehouse && product.almacenes && product.almacenes.length > 0 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                        <span className="text-sm text-yellow-800 font-medium">
                          Selecciona un almacén para continuar
                        </span>
                      </div>
                    )}

                    {/* Info del almacén seleccionado */}
                    {selectedWarehouse && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">
                          📍 Almacén seleccionado: <span className="font-bold">
                            {product.almacenes?.find(a => a.almacencod === selectedWarehouse)?.almacendes?.trim() || selectedWarehouse}
                          </span>
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          Stock disponible: <span className="font-bold">{availableStock}</span> unidades
                        </p>
                        {product.almacenes?.find(a => a.almacencod === selectedWarehouse)?.reserva > 0 && (
                          <p className="text-sm text-orange-700 mt-1">
                            ⚠️ Reservado: <span className="font-bold">
                              {product.almacenes?.find(a => a.almacencod === selectedWarehouse)?.reserva}
                            </span> unidades
                          </p>
                        )}
                      </div>
                    )}

                    {/* CANTIDAD */}
                    <div className="bg-green-100 border-2 border-green-300 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-green-800 text-base" htmlFor="inp-qty">
                          Cantidad:
                        </label>
                        <input
                          id="inp-qty"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={quantity}
                          onChange={e => handleQuantityChange(e.target.value)}
                          onBlur={() => {
                            if (!quantity || quantity === "" || quantity === 0) {
                              setQuantity(1);
                              fetchPrecios(1);
                            }
                          }}
                          disabled={!selectedWarehouse}
                          className="text-right font-bold text-green-800 text-lg w-24 bg-white rounded-lg px-3 py-2 outline-none border-2 border-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                      <p className="text-xs text-green-700 mt-2">
                        💡 Los precios se actualizarán automáticamente
                      </p>
                    </div>

                    {/* VALIDACIÓN DE STOCK */}
                    {selectedWarehouse && quantity > availableStock && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="text-sm text-red-600 font-medium">
                          Stock insuficiente. Solo hay {availableStock} unidades disponibles.
                        </span>
                      </div>
                    )}

                    {/* DESCUENTOS */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 p-4 rounded-lg space-y-3">
                      {/* 1er Descuento - READONLY (desde SP) */}
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-indigo-800">
                          1er Dsctó (DE01)
                          {preciosData && <span className="ml-1 text-xs text-gray-500">(desde SP)</span>}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={(discount1 || 0).toFixed(2)}
                            readOnly
                            className="w-20 text-right bg-gray-200 border border-gray-400 rounded-lg px-3 py-1.5 font-semibold text-gray-700 cursor-not-allowed"
                          />
                          <span className="font-bold text-gray-700">%</span>
                        </div>
                      </div>

                      {/* 5to Descuento - EDITABLE */}
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-purple-800" htmlFor="inp-dscto5">
                          5to Dsctó (DE05)
                          {preciosData && <span className="ml-1 text-xs text-gray-500">(editable)</span>}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            id="inp-dscto5"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={discount5}
                            onChange={e => {
                              const value = e.target.value.replace(/\D/g, "");
                              
                              if (value === "") {
                                setDiscount5("");
                              } else {
                                const numValue = parseInt(value);
                                if (numValue > 100) {
                                  setDiscount5(100);
                                } else {
                                  setDiscount5(numValue);
                                }
                              }
                            }}
                            onBlur={() => {
                              if (discount5 === "" || discount5 === null || discount5 === undefined) {
                                setDiscount5(preciosData?.descuentos?.de05 || 0);
                              }
                            }}
                            className="w-20 text-right bg-white border-2 border-purple-300 rounded-lg px-3 py-1.5 font-semibold text-purple-800 outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <span className="font-bold text-purple-800">%</span>
                        </div>
                      </div>

                      {/* Mostrar otros descuentos del SP */}
                      {preciosData && (
                        <div className="pt-3 border-t border-indigo-200 space-y-2 text-xs text-indigo-700">
                          <div className="flex justify-between">
                            <span>2do Descuento (DE02):</span>
                            <span className="font-semibold">{(preciosData.descuentos?.de02 || 0).toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>3er Descuento (DE03):</span>
                            <span className="font-semibold">{(preciosData.descuentos?.de03 || 0).toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>4to Descuento (DE04):</span>
                            <span className="font-semibold">{(preciosData.descuentos?.de04 || 0).toFixed(2)}%</span>
                          </div>
                        </div>
                      )}

                      {/* Mostrar importes del SP */}
                      {preciosData && (
                        <div className="mt-3 pt-3 border-t border-indigo-200">
                          <div className="text-xs text-indigo-900 space-y-1">
                            <div className="flex justify-between">
                              <span>Precio Lista (LDOL):</span>
                              <span className="font-bold">$ {(preciosData.importes?.ldol || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Precio con Descuentos (DOLA):</span>
                              <span className="font-bold text-green-700">$ {(preciosData.importes?.dola || 0).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* PRECIO FINAL CON DESCUENTOS */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-lg text-white">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm">Precio unitario:</span>
                          <span className="font-bold text-lg">$ {(precioNetoDolar || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-blue-400 pt-2">
                          <span className="font-bold text-base">Total x {quantity}:</span>
                          <span className="font-extrabold text-2xl">$ {(precioTotal || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PRECIOS - Datos del SP */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-black text-white p-4">
                    <h3 className="font-bold text-lg">PRECIOS (desde SP)</h3>
                  </div>
                  <div className="p-6 space-y-3">
                    {preciosData ? (
                      <>
                        <div className="flex justify-between">
                          <span className="font-bold">Precio Lista (LDOL):</span>
                          <span className="text-right">$ {(preciosData.importes?.ldol || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold">Precio Unitario (DOLP):</span>
                          <span className="text-right">$ {(preciosData.importes?.dolp || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold">Total (DOLA):</span>
                          <span className="text-right font-extrabold text-green-600">$ {(preciosData.importes?.dola || 0).toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-3">
                          <div className="flex justify-between text-sm">
                            <span>Precio en Soles (SOLP):</span>
                            <span>S/ {(preciosData.importes?.solp || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Total en Soles (SOLE):</span>
                            <span>S/ {(preciosData.importes?.sole || 0).toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="bg-gray-100 p-3 rounded">
                          <div className="flex justify-between text-sm">
                            <span className="font-bold">Flag Status:</span>
                            <span className={`font-bold ${preciosData.flag === 'OK' ? 'text-green-600' : 'text-red-600'}`}>
                              {preciosData.flag || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        {loadingPrecios ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <p className="text-sm">Cargando precios...</p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium">Esperando datos del SP</p>
                            <p className="text-sm mt-1">Los precios se cargarán automáticamente</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* COSTOS (usando datos del SP) */}
                {preciosData && preciosData.costos && (
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-black text-white p-4">
                      <h3 className="font-bold text-lg">COSTOS (desde SP)</h3>
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="flex justify-between">
                        <span>CPU Soles (CPUS):</span>
                        <span className="text-right">S/ {(preciosData.costos?.cpuSoles || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CPU Dólares (CPUD):</span>
                        <span className="text-right">$ {(preciosData.costos?.cpuDolares || 0).toFixed(2)}</span>
                      </div>
                      {preciosData.costos?.cpuDolares > 0 && precioNetoDolar > 0 && (
                        <div className="bg-green-100 p-3 rounded">
                          <div className="flex justify-between">
                            <span className="font-bold text-green-800">Margen Calculado:</span>
                            <span className="font-bold text-green-800">
                              {(((precioNetoDolar - preciosData.costos.cpuDolares) / preciosData.costos.cpuDolares) * 100).toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* COLUMNA DERECHA */}
              <div className="space-y-6">

                {/* STOCK POR ALMACÉN */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-black text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg">STOCK POR ALMACÉN</h3>
                    <span className="text-sm">{new Date().toLocaleString('es-PE')}</span>
                  </div>
                  <div className="p-6 space-y-3">
                    {product.almacenes && product.almacenes.length > 0 ? (
                      <>
                        {product.almacenes.map((almacen, idx) => {
                          const status = getWarehouseStockStatus(almacen.stock);
                          return (
                            <div key={idx} className="flex justify-between items-center border-b pb-2">
                              <div>
                                <span className="font-semibold text-gray-900">
                                  {almacen.almacendes?.trim() || almacen.almacencod}
                                </span>
                                <span className="text-xs text-gray-500 block">
                                  {almacen.almacencod?.trim()}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-lg">{almacen.stock}</span>
                                <span className="text-xs ml-1">{status.icon}</span>
                                {almacen.reserva > 0 && (
                                  <div className="text-xs text-orange-600">
                                    Reserva: {almacen.reserva}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Stock total */}
                        <div className="bg-blue-50 p-3 rounded mt-4">
                          <div className="flex justify-between">
                            <span className="font-bold text-blue-900">Stock Total:</span>
                            <span className="font-bold text-blue-900 text-xl">
                              {product.stock || 0}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-center text-gray-500">Sin información de stock</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProdDetailModal;
