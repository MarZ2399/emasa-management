// src/components/calls/ProdDetailModal.jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Building2, AlertCircle, ShoppingCart } from 'lucide-react';
import { getWarehouseStockStatus } from '../../data/productsData';
import toast from 'react-hot-toast';

const ProdDetailModal = ({
  product,
  isOpen,
  onClose,
  onAddToQuotation
}) => {
  if (!product || !isOpen) return null;

  // Estados para los inputs editables
  const [quantity, setQuantity] = useState(1);
  const [discount1] = useState(product.descuento1 || 0); // ✅ Solo lectura
  const [discount5, setDiscount5] = useState(product.descuento5 || 0); // ✅ Editable
  const [selectedWarehouse, setSelectedWarehouse] = useState('');

  // Obtener estados de stock por almacén
  const stockBSFStatus = getWarehouseStockStatus(product.stockBSF);
  const stockSanLuisStatus = getWarehouseStockStatus(product.stockSanLuis);

  // Cálculo del precio total con descuentos
 const precioNetoDolar = product.precioNetoDolar; // 68.00
const precioConDescuento =
  precioNetoDolar *
  ((100 - discount1) / 100) *
  ((100 - discount5) / 100);

  // Validar stock disponible según almacén seleccionado
  const getAvailableStock = () => {
    if (selectedWarehouse === 'BSF') return product.stockBSF;
    if (selectedWarehouse === 'SAN_LUIS') return product.stockSanLuis;
    return 0;
  };

  const availableStock = getAvailableStock();
  const canAdd = selectedWarehouse && quantity > 0 && quantity <= availableStock;

  const handleAddToQuotation = () => {
    if (!selectedWarehouse) {
      toast.error('Por favor selecciona un almacén', { position: 'top-right' });
      return;
    }

    if (quantity > availableStock) {
      toast.error(`Stock insuficiente en ${selectedWarehouse === 'BSF' ? 'BSF' : 'San Luis'}`, {
        position: 'top-right'
      });
      return;
    }

    if (quantity <= 0) {
      toast.error('La cantidad debe ser mayor a 0', { position: 'top-right' });
      return;
    }

    onAddToQuotation({
      ...product,
      quantity,
      discount1,
      precioLista: product.precioListaDolar, // ✅ Precio lista en dólares
    precioNeto: precioConDescuento, // ✅ Precio neto con descuentos en dólares
    precioCotizar: precioConDescuento,
    warehouse: selectedWarehouse,
    warehouseName: selectedWarehouse === 'BSF' ? 'BSF' : 'San Luis'
    });

    toast.success(`Producto agregado desde almacén ${selectedWarehouse === 'BSF' ? 'BSF' : 'San Luis'}`, {
      position: 'top-right'
    });

    setQuantity(1);
    setDiscount5(product.descuento5 || 0);
    setSelectedWarehouse('');
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-50 rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto relative">

        {/* Header con botón de agregar */}
        <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-gray-800">{product.nombre}</h2>
          <div className="flex gap-2">
            <button
              onClick={handleAddToQuotation}
              disabled={!canAdd}
              className={`px-4 py-2 rounded font-bold transition flex items-center gap-2 ${
                canAdd
                  ? 'bg-[#334a5e] hover:bg-[#2c3e50] text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={!canAdd ? 'Selecciona un almacén y verifica el stock' : 'Agregar producto'}
            >
              <ShoppingCart className="w-5 h-5" />
              Agregar producto
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

                {/* BÚSQUEDA */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-[#334a5e] text-white p-4">
                    <h3 className="font-bold text-lg">BÚSQUEDA</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {[
                        { label: 'Producto', value: product.nombre },
                        { label: 'Código:', value: product.codigo },
                        { label: 'Top Venta', value: product.topVenta || 'N/A' },
                        { label: 'Observación', value: product.observaciones || 'Sin observaciones' },
                        { label: 'Cód. Reemplazo', value: product.codReemplazo || 'Sin dato' },
                        { label: 'Caja Master', value: product.cajaMaster || 'Sin dato' },
                        { label: 'Línea - Core', value: product.proveedor || 'N/A' }
                      ].map((item, i) => (
                        <div key={i} className="grid grid-cols-[200px_1fr] gap-4">
                          <div className="bg-gray-100 px-4 py-2 font-semibold text-gray-700">{item.label}</div>
                          <div className="px-4 py-2">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ✅ SELECTOR DE ALMACÉN + CANTIDAD + DESCUENTOS */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-blue-200">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Building2 className="w-6 h-6" />
                      SELECCIONAR ALMACÉN
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    
                    {/* SELECCIÓN DE ALMACENES */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Almacén BSF */}
                      <button
                        onClick={() => setSelectedWarehouse('BSF')}
                        disabled={product.stockBSF === 0}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedWarehouse === 'BSF'
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
                            : 'border-gray-300 hover:border-blue-300'
                        } ${
                          product.stockBSF === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            <span className="font-bold text-gray-900">BSF</span>
                          </div>
                          {selectedWarehouse === 'BSF' && (
                            <span className="text-blue-600 text-xl">✓</span>
                          )}
                        </div>
                        <div className="text-left mb-2">
                          <span className="text-3xl font-bold text-blue-600">{product.stockBSF}</span>
                          <span className="text-sm text-gray-600 ml-1">unidades</span>
                        </div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${stockBSFStatus.color}`}>
                          {stockBSFStatus.icon} {stockBSFStatus.text}
                        </span>
                      </button>

                      {/* Almacén San Luis */}
                      <button
                        onClick={() => setSelectedWarehouse('SAN_LUIS')}
                        disabled={product.stockSanLuis === 0}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedWarehouse === 'SAN_LUIS'
                            ? 'border-green-500 bg-green-50 ring-2 ring-green-300'
                            : 'border-gray-300 hover:border-green-300'
                        } ${
                          product.stockSanLuis === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-green-600" />
                            <span className="font-bold text-gray-900">San Luis</span>
                          </div>
                          {selectedWarehouse === 'SAN_LUIS' && (
                            <span className="text-green-600 text-xl">✓</span>
                          )}
                        </div>
                        <div className="text-left mb-2">
                          <span className="text-3xl font-bold text-green-600">{product.stockSanLuis}</span>
                          <span className="text-sm text-gray-600 ml-1">unidades</span>
                        </div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${stockSanLuisStatus.color}`}>
                          {stockSanLuisStatus.icon} {stockSanLuisStatus.text}
                        </span>
                      </button>
                    </div>

                    {/* Mensaje informativo */}
                    {!selectedWarehouse && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                        <span className="text-sm text-yellow-800 font-medium">
                          Selecciona un almacén para continuar
                        </span>
                      </div>
                    )}

                    {selectedWarehouse && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">
                          📍 Almacén seleccionado: <span className="font-bold">{selectedWarehouse === 'BSF' ? 'BSF' : 'San Luis'}</span>
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          Stock disponible: <span className="font-bold">{availableStock}</span> unidades
                        </p>
                      </div>
                    )}

                    {/* ✅ CANTIDAD */}
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
  onChange={e => {
    const value = e.target.value.replace(/\D/g, ""); // Solo números
    
    if (value === "") {
      setQuantity(""); // Permitir campo vacío temporalmente
    } else {
      const numValue = parseInt(value);
      
      // Validar contra stock disponible
      if (selectedWarehouse && numValue > availableStock) {
        setQuantity(availableStock);
      } else {
        setQuantity(numValue);
      }
    }
  }}
  onBlur={() => {
    // Solo cuando pierde el foco, si está vacío o es 0, establecer 1
    if (!quantity || quantity === "" || quantity === 0) {
      setQuantity(1);
    }
  }}
  disabled={!selectedWarehouse}
  className="text-right font-bold text-green-800 text-lg w-24 bg-white rounded-lg px-3 py-2 outline-none border-2 border-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
/>
                      </div>
                    </div>

                    {/* ✅ VALIDACIÓN DE STOCK */}
                    {selectedWarehouse && quantity > availableStock && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="text-sm text-red-600 font-medium">
                          Stock insuficiente. Solo hay {availableStock} unidades disponibles.
                        </span>
                      </div>
                    )}

                    {/* ✅ DESCUENTOS */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 p-4 rounded-lg space-y-3">
                      {/* 1er Descuento - READONLY */}
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-indigo-800">1er Dsctó</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={discount1}
                            readOnly
                            className="w-20 text-right bg-gray-200 border border-gray-400 rounded-lg px-3 py-1.5 font-semibold text-gray-700 cursor-not-allowed"
                          />
                          <span className="font-bold text-gray-700">%</span>
                        </div>
                      </div>

                      {/* 5to Descuento - EDITABLE */}
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-purple-800" htmlFor="inp-dscto5">
                          5to Dsctó
                        </label>
                        <div className="flex items-center gap-2">
                          <input
      id="inp-dscto5"
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={discount5}
      onChange={e => {
        const value = e.target.value.replace(/\D/g, ""); // Solo números
        
        if (value === "") {
          setDiscount5(""); // Permitir campo vacío temporalmente
        } else {
          const numValue = parseInt(value);
          
          // Limitar a máximo 100
          if (numValue > 100) {
            setDiscount5(100);
          } else {
            setDiscount5(numValue);
          }
        }
      }}
      onBlur={() => {
        // Al salir del campo, si está vacío establecer en 0
        if (discount5 === "" || discount5 === null || discount5 === undefined) {
          setDiscount5(0);
        }
      }}
      className="w-20 text-right bg-white border-2 border-purple-300 rounded-lg px-3 py-1.5 font-semibold text-purple-800 outline-none focus:ring-2 focus:ring-purple-500"
    />
                          <span className="font-bold text-purple-800">%</span>
                        </div>
                      </div>
                    </div>

                    {/* ✅ PRECIO FINAL CON DESCUENTOS */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-lg text-white">
  <div className="flex justify-between items-center">
    <span className="font-bold text-base">Precio con descuentos x {quantity}:</span>
    <span className="font-extrabold text-xl">$ {(precioConDescuento * quantity).toFixed(2)}</span>
  </div>
</div>
                  </div>
                </div>

                {/* ✅ PRECIOS - CONTENEDOR SEPARADO */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-black text-white p-4">
                    <h3 className="font-bold text-lg">PRECIOS</h3>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between">
                      <span className="font-bold">Precio Lista:</span>
                      <span className="text-right">$ {(product.precioListaDolar || product.precio * 1.3).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">Precio Neto:</span>
                      <span className="text-right">$ {product.precioNetoDolar.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* PRECIO REGULAR DÓLARES */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-black text-white p-4">
                    <h3 className="font-bold text-lg">PRECIO REGULAR DÓLARES</h3>
                  </div>
                  <div className="p-6 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Precio Neto:</span>
                      <span>$ {product.precioNetoDolar.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Precio Unitario:</span>
                      <span>$ {(product.precioNetoDolar * 1.15).toFixed(2)} dólares incluido IGV</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Descuento (2%):</span>
                      <span>$ {product.descuentoDolar.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-bold">
                      <span>Nuevo Total (-2% Dcto):</span>
                      <span>$ {(product.precioNetoDolar * 1.15 - product.descuentoDolar).toFixed(2)} dólares incluido IGV</span>
                    </div>
                  </div>
                </div>

                {/* PRECIO REGULAR SOLES */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-black text-white p-4">
                    <h3 className="font-bold text-lg">PRECIO REGULAR SOLES</h3>
                  </div>
                  <div className="p-6 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Precio Neto:</span>
                      <span>S/ {product.precioNeto.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Precio Ideal:</span>
                      <span>S/ {(product.precioNeto * 1.15).toFixed(2)} soles incluido IGV</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Descuento (2%):</span>
                      <span>S/ {(product.precioNeto * 0.02).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-bold">
                      <span>Nuevo Total (-2% Dcto):</span>
                      <span>S/ {(product.precioNeto * 1.15 * 0.98).toFixed(2)} soles incluido IGV</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUMNA DERECHA */}
              <div className="space-y-6">

                {/* STOCK */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-black text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg">STOCK</h3>
                    <span className="text-sm">{new Date().toLocaleString('es-PE')}</span>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between border-b pb-2">
                      <span>Stock BSF</span>
                      <span className="font-bold">{product.stockBSF}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span>Stock San Luis</span>
                      <span className="font-bold">{product.stockSanLuis}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-bold">No Conforme</span>
                      <span className="font-bold text-red-600">{product.noConforme}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span>Stock GOSS</span>
                      <span className="font-bold">{product.stockGOSS}</span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="font-bold">Stock Tránsito</span>
                      <span className="font-bold">{product.stockTransito}</span>
                    </div>

                    <div className="bg-yellow-100 p-3 rounded mt-4">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-yellow-800">Fase Embarque</span>
                        <span className="text-right text-yellow-800">{product.faseEmbarque}</span>
                      </div>
                    </div>

                    <div className="bg-pink-100 p-3 rounded">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold">Fase Llegada</span>
                        <span>{product.faseLlegada}</span>
                      </div>
                    </div>

                    <div className="bg-pink-100 p-3 rounded">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold">Fecha Llegada</span>
                        <span>{product.fechaLlegada}</span>
                      </div>
                    </div>

                    <div className="bg-pink-100 p-3 rounded">
                      <div className="flex justify-between">
                        <span className="font-bold">Cantidad Llegada</span>
                        <span className="font-bold">{product.cantidadLlegada}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MARGEN */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-black text-white p-4">
                    <h3 className="font-bold text-lg">MARGEN</h3>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between">
                      <span>CPU (S/.)</span>
                      <span className="text-right">S/ {product.cpuDolar.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Venta Neta (S/.)</span>
                      <span className="text-right">S/ {product.ventaNetaDolar.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ganancia (S/.)</span>
                      <span className="text-right">{product.gananciaDolar.toFixed(2)}</span>
                    </div>
                    <div className="bg-green-100 p-3 rounded">
                      <div className="flex justify-between">
                        <span className="font-bold text-green-800">Margen (%)</span>
                        <span className="font-bold text-green-800">{product.margenPorcentaje}%</span>
                      </div>
                    </div>
                    <div className="bg-green-100 p-3 rounded">
                      <div className="flex justify-between">
                        <span className="text-xs">Indicar P. Oferta Neto (US$)</span>
                        <span className="text-xs text-right">(%) Dcto. otorgado</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PRECIO ECOMMERCE O BOLETÍN */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-black text-white p-4">
                    <h3 className="font-bold text-lg">PRECIO ECOMMERCE o BOLETÍN</h3>
                  </div>
                  <div className="p-6 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Precio Neto:</span>
                      <span>$ {product.precioEcommerceDolar.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Precio Oferta x unidad:</span>
                      <span>$ {product.precioOfertaDolar.toFixed(2)} dólares incluido IGV</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Precio Dcto incluido:</span>
                      <span>$ {product.precioOfertaDecuento.toFixed(2)} dólares incluido IGV</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-bold">
                      <span>Total Cotización soles:</span>
                      <span>S/ {(product.precioOfertaDecuento * 3.85).toFixed(2)} soles incluido IGV</span>
                    </div>
                  </div>
                </div>

                {/* CONDICIONES DE LA OFERTA */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-black text-white p-4">
                    <h3 className="font-bold text-lg">CONDICIONES DE LA OFERTA</h3>
                  </div>
                  <div className="p-6 space-y-2 text-sm">
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
                      <span>{product.categoria}</span>
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
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProdDetailModal;
