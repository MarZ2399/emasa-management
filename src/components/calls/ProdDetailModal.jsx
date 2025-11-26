import React, { useState } from 'react';
import ReactDOM from 'react-dom';

const ProdDetailModal = ({
  product,
  isOpen,
  onClose,
  onAddToQuotation // callback para agregar producto a la cotización
}) => {
  if (!product || !isOpen) return null;

  // Estados para los inputs editables
  const [quantity, setQuantity] = useState(1);
  const [discount1, setDiscount1] = useState(product.descuento1 || 0);
  const [discount5, setDiscount5] = useState(product.descuento5 || 0);

  // Cálculo del precio total con descuentos
  const precioConDescuento =
    product.precioNeto *
    ((100 - discount1) / 100) *
    ((100 - discount5) / 100);

  const handleAddToQuotation = () => {
    onAddToQuotation({
      ...product,
      quantity,
      discount1,
      discount5,
      precioCotizar: precioConDescuento,
      precioNeto: precioConDescuento
    });
    onClose(); // Cerrar el modal
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-50 rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto relative">

        {/* Header con botón de agregar */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">{product.nombre}</h2>
          <div className="flex gap-2">
            <button
              onClick={handleAddToQuotation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold"
            >
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

                {/* PRECIOS */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-black text-white p-4">
                    <h3 className="font-bold text-lg">PRECIOS</h3>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between">
                      <span className="font-bold">Precio Lista:</span>
                      <span className="text-right">S/ {(product.precioLista || product.precio * 1.3).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">Precio Neto:</span>
                      <span className="text-right">S/ {product.precioNeto.toFixed(2)}</span>
                    </div>
                    <div className="bg-green-100 p-3 rounded flex items-center justify-between">
                      <label className="font-bold text-green-800" htmlFor="inp-qty">Cantidad:</label>
                      <input
                        id="inp-qty"
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={e => setQuantity(Number(e.target.value))}
                        className="text-right font-bold text-green-800 w-20 bg-white rounded px-2 py-1 outline-none"
                      />
                    </div>
                    <div className="bg-green-100 p-3 rounded flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold" htmlFor="inp-dscto1">1er Dsctó</label>
                        <input
                          id="inp-dscto1"
                          type="number"
                          value={discount1}
                          onChange={e => setDiscount1(Number(e.target.value))}
                          className="w-16 text-right bg-white rounded px-2 py-1 outline-none"
                        />%
                      </div>
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold" htmlFor="inp-dscto8">5to Dsctó</label>
                        <input
                          id="inp-dscto5"
                          type="number"
                          value={discount5}
                          onChange={e => setDiscount5(Number(e.target.value))}
                          className="w-16 text-right bg-white rounded px-2 py-1 outline-none"
                        />%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resumen de total con descuentos */}
                <div className="p-4 bg-blue-50 rounded-lg flex justify-between font-semibold">
                  <span>Precio con descuentos x {quantity}:</span>
                  <span>S/ {(precioConDescuento * quantity).toFixed(2)}</span>
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
