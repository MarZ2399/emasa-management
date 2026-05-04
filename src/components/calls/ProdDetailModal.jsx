// src/components/calls/ProdDetailModal.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Building2, AlertCircle, Loader2, Package, Tag, Layers, Ship, BookOpen } from 'lucide-react';
import { precioService }  from '../../services/precioService';
import { productService } from '../../services/productService';
import toast from 'react-hot-toast';

const ProdDetailModal = ({ product, clienteRuc, isOpen, onClose }) => {

 
  const [preciosData,     setPreciosData]     = useState(null);
  const [loadingPrecios,  setLoadingPrecios]  = useState(false);
  const [errorPrecios,    setErrorPrecios]    = useState(null);
  const [fases,           setFases]           = useState([]);
  const [loadingFases,    setLoadingFases]    = useState(false);
  const [carteras,        setCarteras]        = useState([]);
  const [loadingCarteras, setLoadingCarteras] = useState(false);
  const [detalle,         setDetalle]         = useState(null);
  const [loadingDetalle,  setLoadingDetalle]  = useState(false);

  // ── Código normalizado — soporta cualquier casing ─────────────────────────
  const codigoProducto = product?.codigo?.trim()
                      || product?.CODIGO?.trim()
                      || '';

  // ── Normalizar almacenes ──────────────────────────────────────────────────
  const almacenes = (
    product?.almacenesAll ??
    product?.almacenes    ??
    product?.stock        ??
    []
  ).map(a => ({
    almacencod: (a.almacencod ?? '').trim(),
    almacendes: (a.almacendes ?? '').trim(),
    stock:       a.stock   || 0,
    reserva:     a.reserva || 0,
  }));

  const totalStock = almacenes.reduce((sum, a) => sum + a.stock, 0);

  // ── useEffect ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && product && codigoProducto) {
      if (clienteRuc) fetchPrecios();
      fetchFases();
      fetchCarteras();
      fetchDetalle();
    }
    if (!isOpen) {
      setPreciosData(null);
      setErrorPrecios(null);
      setFases([]);
      setCarteras([]);
      setDetalle(null);
    }
  }, [isOpen, codigoProducto, clienteRuc]);

  
  if (!product || !isOpen) return null;

  // ── Fetch precios ─────────────────────────────────────────────────────────
  const fetchPrecios = async () => {
    if (!clienteRuc || !codigoProducto) {
      setErrorPrecios('Faltan datos para consultar precios');
      return;
    }
    try {
      setLoadingPrecios(true);
      setErrorPrecios(null);
      const response = await precioService.obtenerPrecio(clienteRuc, codigoProducto, 1);
      if (response.success && response.data) {
        setPreciosData(response.data);
      } else {
        setErrorPrecios(response.msgerror || response.error || 'No se pudieron obtener los precios');
      }
    } catch (error) {
      console.error('❌ Error al obtener precios:', error);
      setErrorPrecios('Error al consultar precios del servidor');
      toast.error('No se pudieron cargar los precios', { position: 'top-right' });
    } finally {
      setLoadingPrecios(false);
    }
  };

  // ── Fetch fases ───────────────────────────────────────────────────────────
  const fetchFases = async () => {
    try {
      setLoadingFases(true);
      const response = await productService.getFasesImportacion(codigoProducto);
      if (response.success) setFases(response.data || []);
    } catch (error) {
      console.error('❌ Error al obtener fases:', error);
    } finally {
      setLoadingFases(false);
    }
  };

  // ── Fetch carteras ────────────────────────────────────────────────────────
  const fetchCarteras = async () => {
    try {
      setLoadingCarteras(true);
      const response = await productService.getCarteras(codigoProducto);
      if (response.success) setCarteras(response.data || []);
    } catch (error) {
      console.error('❌ Error al obtener carteras:', error);
    } finally {
      setLoadingCarteras(false);
    }
  };

  // ── Fetch detalle (PostgreSQL) ────────────────────────────────────────────
  const fetchDetalle = async () => {
    try {
      setLoadingDetalle(true);
      const response = await productService.getDetalle(codigoProducto);
      if (response.success && response.data) setDetalle(response.data);
    } catch (error) {
      console.error('❌ Error al obtener detalle:', error);
    } finally {
      setLoadingDetalle(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getStockStyle = (stock) => {
    if (stock === 0) return { badge: 'bg-red-100 text-red-700 border-red-300',          icon: '❌', label: 'Sin Stock'  };
    if (stock < 10)  return { badge: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: '⚠️', label: 'Stock Bajo' };
    return                   { badge: 'bg-green-100 text-green-700 border-green-300',   icon: '✅', label: 'Disponible' };
  };

  const InfoRow = ({ label, value, cls = '' }) => (
    <div className="grid grid-cols-[180px_1fr] text-sm">
      <div className="bg-gray-50 px-4 py-2.5 font-semibold text-gray-600">{label}</div>
      <div className={`px-4 py-2.5 text-gray-800 ${cls}`}>{value ?? '—'}</div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b bg-white sticky top-0 z-10 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-gray-800 leading-tight">{product.nombre}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <span className="text-sm text-gray-500">
                Código: <span className="font-semibold text-gray-700">{codigoProducto}</span>
              </span>
              {product.categoria && (
                <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 font-medium">
                  {product.categoria}
                </span>
              )}
              {product.proveedor && (
                <span className="text-xs bg-purple-100 text-purple-700 border border-purple-200 rounded-full px-2 py-0.5 font-medium">
                  {product.proveedor}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition text-xl font-bold"
            title="Cerrar"
          >
            ✖
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ════════ COLUMNA IZQUIERDA ════════ */}
            <div className="space-y-5">

              {/* Información general */}
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="bg-[#334a5e] text-white px-4 py-3 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  <h3 className="font-bold text-sm uppercase tracking-wide">Información del Producto</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  <InfoRow label="Producto"        value={product.nombre}           />
                  <InfoRow label="Código"          value={codigoProducto}           />
                  <InfoRow label="Categoría"       value={product.categoria}        />
                  <InfoRow label="Marca"           value={product.proveedor}        />
                  <InfoRow label="Equivalencia 01" value={product.equivalencia01}   />
                  <InfoRow label="Equivalencia 02" value={product.equivalencia02}   />
                  <InfoRow label="Core"            value={product.core}             />
                </div>
              </div>

              {/* Detalle extendido (PostgreSQL) */}
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="bg-[#1e3a4f] text-white px-4 py-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <h3 className="font-bold text-sm uppercase tracking-wide">Detalle del Producto</h3>
                </div>

                {loadingDetalle ? (
                  <div className="flex items-center gap-3 p-4 text-blue-700 bg-blue-50 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">Cargando detalle...</span>
                  </div>
                ) : detalle ? (
                  <div className="divide-y divide-gray-100">
                    <InfoRow label="Nom. Web"    value={detalle.nom_web}            />
                    <InfoRow label="Rubro"       value={detalle.nom_rubro}          />
                    <InfoRow label="Familia"     value={detalle.nom_familia}        />
                    <InfoRow label="Marca"       value={detalle.nom_marca_producto} />
                    <InfoRow label="Estado"      value={detalle.estado}             />
                    <InfoRow label="eCommerce"   value={detalle.pub_ecommerce}      />
                    {detalle.glosas?.length > 0 && (
                      <>
                        <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                            Especificaciones técnicas
                          </p>
                        </div>
                        {detalle.glosas.map((g, i) => (
                          <InfoRow key={i} label={g.etiqueta} value={g.valor} />
                        ))}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-medium">Sin detalle disponible</p>
                  </div>
                )}
              </div>

              {/* Precios */}
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="bg-gray-800 text-white px-4 py-3 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  <h3 className="font-bold text-sm uppercase tracking-wide">Precios (referencial)</h3>
                </div>

                {loadingPrecios && (
                  <div className="flex items-center gap-3 p-4 text-blue-700 bg-blue-50 border-b border-blue-100 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">Consultando precios...</span>
                  </div>
                )}
                {errorPrecios && !loadingPrecios && (
                  <div className="flex items-center gap-3 p-4 text-red-700 bg-red-50 border-b border-red-100">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium block">{errorPrecios}</span>
                      <button onClick={fetchPrecios} className="text-xs text-red-600 underline mt-0.5">
                        Reintentar
                      </button>
                    </div>
                  </div>
                )}

                <div className="divide-y divide-gray-100 text-sm">
                  {preciosData ? (
                    <>
                      {[
                        { label: 'Precio Lista (LDOL)',          value: `$ ${(preciosData.importes?.ldol || 0).toFixed(3)}`, highlight: false },
                        { label: 'Precio Unitario Neto (DOLP)',  value: `$ ${(preciosData.importes?.dolp || 0).toFixed(3)}`, highlight: false },
                        { label: 'Precio c/ desctos. (DOLA)',    value: `$ ${(preciosData.importes?.dola || 0).toFixed(3)}`, highlight: true  },
                        { label: 'Precio Unitario Soles (SOLP)', value: `S/ ${(preciosData.importes?.solp || 0).toFixed(3)}`, highlight: false },
                        { label: 'Total en Soles (SOLE)',        value: `S/ ${(preciosData.importes?.sole || 0).toFixed(3)}`, highlight: false },
                      ].map((row, i) => (
                        <div key={i} className={`grid grid-cols-[1fr_auto] px-4 py-2.5 ${row.highlight ? 'bg-green-50' : ''}`}>
                          <span className={`font-medium ${row.highlight ? 'text-green-800' : 'text-gray-600'}`}>{row.label}</span>
                          <span className={`font-bold tabular-nums ${row.highlight ? 'text-green-700' : 'text-gray-800'}`}>{row.value}</span>
                        </div>
                      ))}

                      {/* Descuentos */}
                      <div className="bg-indigo-50 px-4 py-3 space-y-1.5">
                        <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-2">Descuentos aplicados</p>
                        {[
                          ['1er Descuento (DE01)', preciosData.descuentos?.de01],
                          ['2do Descuento (DE02)', preciosData.descuentos?.de02],
                          ['3er Descuento (DE03)', preciosData.descuentos?.de03],
                          ['4to Descuento (DE04)', preciosData.descuentos?.de04],
                          ['5to Descuento (DE05)', preciosData.descuentos?.de05],
                        ].map(([label, val], i) => (
                          <div key={i} className="flex justify-between text-xs text-indigo-800">
                            <span>{label}:</span>
                            <span className="font-semibold tabular-nums">{(val || 0).toFixed(2)}%</span>
                          </div>
                        ))}
                        {preciosData.flag && (
                          <div className="flex justify-between text-xs text-indigo-800 border-t border-indigo-200 pt-2 mt-2">
                            <span className="font-bold">Flag:</span>
                            <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] border ${
                              preciosData.flag === 'OK' ? 'bg-green-100 text-green-700 border-green-300'    :
                              preciosData.flag === 'T'  ? 'bg-orange-100 text-orange-700 border-orange-300' :
                              preciosData.flag === 'X'  ? 'bg-red-100 text-red-700 border-red-300'          :
                              'bg-gray-100 text-gray-700 border-gray-300'
                            }`}>
                              {preciosData.flag}
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : !loadingPrecios ? (
                    <div className="text-center text-gray-400 py-8 text-sm">Sin datos de precios</div>
                  ) : null}
                </div>
              </div>

            </div>

            {/* ════════ COLUMNA DERECHA ════════ */}
            <div className="space-y-5">

              {/* Stock por almacén */}
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    <h3 className="font-bold text-sm uppercase tracking-wide">Stock por Almacén</h3>
                  </div>
                  <span className="text-xs text-gray-300">{new Date().toLocaleString('es-PE')}</span>
                </div>

                <div className="p-4 space-y-3">
                  {almacenes.length > 0 ? (
                    <>
                      {almacenes.map((almacen, idx) => {
                        const status        = getStockStyle(almacen.stock);
                        const almacenNombre = almacen.almacendes || almacen.almacencod;
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                          >
                            <div className="flex items-center gap-3">
                              <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-gray-800 text-sm">{almacenNombre}</p>
                                <p className="text-xs text-gray-400">{almacen.almacencod}</p>
                                {almacen.reserva > 0 && (
                                  <p className="text-xs text-orange-600 mt-0.5">
                                    ⚠️ Reservado: <span className="font-bold">{almacen.reserva}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-2xl font-extrabold ${
                                almacen.stock === 0 ? 'text-gray-400' :
                                almacen.stock < 10  ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                                {almacen.stock}
                              </p>
                              <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border mt-0.5 ${status.badge}`}>
                                {status.icon} {status.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {/* Total */}
                      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mt-2">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-blue-700" />
                          <span className="font-bold text-blue-900 text-sm">Stock Total</span>
                        </div>
                        <span className="text-2xl font-extrabold text-blue-800">{totalStock}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-10 text-gray-400">
                      <AlertCircle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <p className="font-medium text-sm">Sin información de almacenes</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Fases de Importación */}
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="bg-[#334a5e] text-white px-4 py-3 flex items-center gap-2">
                  <Ship className="w-5 h-5" />
                  <h3 className="font-bold text-sm uppercase tracking-wide">STOCK EN TRÁNSITO</h3>
                </div>

                {loadingFases ? (
                  <div className="flex items-center gap-3 p-4 text-blue-700 bg-blue-50 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">Cargando fases...</span>
                  </div>
                ) : fases.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600 uppercase">Cantidad</th>
                          <th className="px-4 py-2.5 text-left   text-xs font-semibold text-gray-600 uppercase">Fase</th>
                          <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                          <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600 uppercase">F. Bodega</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {fases.map((f, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-2.5 text-center font-bold text-blue-700">{f.cantidad ?? '—'}</td>
                            <td className="px-4 py-2.5 font-semibold text-gray-800">{f.fase || '—'}</td>
                            <td className="px-4 py-2.5 text-center text-gray-600 text-xs">{f.fecha   ?? '—'}</td>
                            <td className="px-4 py-2.5 text-center text-gray-600 text-xs">{f.fbodega ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Ship className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-medium">Sin fases de importación</p>
                  </div>
                )}
              </div>

              {/* Carteras / Tránsito detallado */}
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="bg-[#1e3a4f] text-white px-4 py-3 flex items-center gap-2">
                  <Ship className="w-5 h-5" />
                  <h3 className="font-bold text-sm uppercase tracking-wide">Detalle de Tránsito (Cartera)</h3>
                </div>

                {loadingCarteras ? (
                  <div className="flex items-center gap-3 p-4 text-blue-700 bg-blue-50 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">Cargando cartera...</span>
                  </div>
                ) : carteras.length > 0 ? (
                  <div className="p-4 space-y-4">
                    {carteras.map((r, i) => (
                      <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">

                        {/* Encabezado de la card */}
                        <div className="bg-gray-100 px-4 py-2 flex items-center justify-between border-b border-gray-200">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                            Registro #{i + 1}
                          </span>
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                            FASE: {r.fase ?? '—'}
                          </span>
                        </div>

                        {/* Campos siempre visibles */}
                        <div className="divide-y divide-gray-100">
                          {[
                            { label: 'N° Solicitud.', value: r.nsolic                              },
                            { label: 'Ped. Origen.',  value: r.pedori                              },
                            { label: 'N° Ped.',       value: r.nvoped                              },
                            { label: 'Cantidad',      value: r.cantidad, cls: 'font-bold text-blue-700' },
                            { label: 'Fecha',         value: r.fecha                               },
                            { label: 'F. Bodega',     value: r.fbodega                             },
                            { label: 'TCOMEP',        value: r.tcomep                              },
                          ].map((row, j) => (
                            <div key={j} className="grid grid-cols-[160px_1fr] text-xs">
                              <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-500">{row.label}</div>
                              <div className={`px-4 py-2 ${row.cls ?? 'text-gray-800'}`}>{row.value ?? '—'}</div>
                            </div>
                          ))}

                          {/* Campos condicionales */}
                          {r.carcanstkd != null && (
                            <div className="grid grid-cols-[160px_1fr] text-xs">
                              <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-500">Stk. CD</div>
                              <div className="px-4 py-2 tabular-nums text-gray-800">{r.carcanstkd}</div>
                            </div>
                          )}
                          {r.carcantra1 != null && (
                            <div className="grid grid-cols-[160px_1fr] text-xs">
                              <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-500">Cant. Trán. 1</div>
                              <div className="px-4 py-2 font-semibold tabular-nums text-indigo-700">{r.carcantra1}</div>
                            </div>
                          )}
                          {r.carfectra1 != null && (
                            <div className="grid grid-cols-[160px_1fr] text-xs">
                              <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-500">Fec. Trán. 1</div>
                              <div className="px-4 py-2 text-gray-800">{r.carfectra1}</div>
                            </div>
                          )}
                          {r.carcantra2 != null && (
                            <div className="grid grid-cols-[160px_1fr] text-xs">
                              <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-500">Cant. Trán. 2</div>
                              <div className="px-4 py-2 font-semibold tabular-nums text-indigo-700">{r.carcantra2}</div>
                            </div>
                          )}
                          {r.carfectra2 != null && (
                            <div className="grid grid-cols-[160px_1fr] text-xs">
                              <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-500">Fec. Trán. 2</div>
                              <div className="px-4 py-2 text-gray-800">{r.carfectra2}</div>
                            </div>
                          )}
                          {r.carcantra3 != null && (
                            <div className="grid grid-cols-[160px_1fr] text-xs">
                              <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-500">Cant. Trán. 3</div>
                              <div className="px-4 py-2 font-semibold tabular-nums text-indigo-700">{r.carcantra3}</div>
                            </div>
                          )}
                          {r.carfectra3 != null && (
                            <div className="grid grid-cols-[160px_1fr] text-xs">
                              <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-500">Fec. Trán. 3</div>
                              <div className="px-4 py-2 text-gray-800">{r.carfectra3}</div>
                            </div>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Ship className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-medium">Sin datos de cartera</p>
                  </div>
                )}
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