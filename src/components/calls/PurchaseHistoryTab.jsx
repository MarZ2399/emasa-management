// src/components/calls/PurchaseHistoryTab.jsx
import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, Package, DollarSign, FileText,
  Filter, X, Loader2, AlertCircle
} from 'lucide-react';
import { salesService } from '../../services/salesService';

// ─── Formatea fecha YYYYMMDD → DD/MM/YYYY ───────────────────────────────────
const formatDate = (dateNum) => {
  if (!dateNum) return '—';
  const s = String(dateNum);
  if (s.length !== 8) return s;
  return `${s.slice(6, 8)}/${s.slice(4, 6)}/${s.slice(0, 4)}`;
};

// ─── Parsea fecha YYYYMMDD → Date (para filtros) ─────────────────────────────
const parseDate = (dateNum) => {
  if (!dateNum) return null;
  const s = String(dateNum);
  if (s.length !== 8) return null;
  return new Date(Number(s.slice(0, 4)), Number(s.slice(4, 6)) - 1, Number(s.slice(6, 8)));
};

// ─────────────────────────────────────────────────────────────────────────────

const PurchaseHistoryTab = ({ clienteRUC, onProductClick }) => {

  const [purchases, setPurchases]   = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage]              = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    fechaInicio:  '',
    fechaFin:     '',
    vendedor:     '',
    tipoDoc:      '',
    codigoItem:   '',
    nroDoc:       ''
  });

  // ── Carga automática al recibir el RUC ──────────────────────────────────────
  useEffect(() => {
    if (!clienteRUC) return;
    fetchPurchases();
  }, [clienteRUC]);

  const fetchPurchases = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await salesService.getLastPurchases(clienteRUC);
      if (response.success) {
        setPurchases(response.data || []);
      } else {
        setError(response.msgerror || 'Error al obtener el historial de compras');
        setPurchases([]);
      }
    } catch (err) {
      setError('Error de conexión');
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Vendedores únicos para el select ────────────────────────────────────────
  const vendedoresUnicos = [...new Set(purchases.map(p => p.vendedor).filter(Boolean))];

  // ── Filtros ─────────────────────────────────────────────────────────────────
  const filteredPurchases = purchases.filter(p => {
    if (filters.nroDoc     && !String(p.nroDoc).toLowerCase().includes(filters.nroDoc.toLowerCase()))     return false;
    if (filters.codigoItem && !p.codigoItem.toLowerCase().includes(filters.codigoItem.toLowerCase()))    return false;
    if (filters.vendedor   && p.vendedor !== filters.vendedor)   return false;
    if (filters.tipoDoc    && p.tipoDoc  !== filters.tipoDoc)    return false;

    if (filters.fechaInicio || filters.fechaFin) {
      const pd = parseDate(p.fecha);
      if (pd) {
        if (filters.fechaInicio && pd < new Date(filters.fechaInicio)) return false;
        if (filters.fechaFin    && pd > new Date(filters.fechaFin))    return false;
      }
    }
    return true;
  });

  // ── Paginación ───────────────────────────────────────────────────────────────
  const indexOfLastItem    = currentPage * itemsPerPage;
  const indexOfFirstItem   = indexOfLastItem - itemsPerPage;
  const currentPurchases   = filteredPurchases.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages         = Math.ceil(filteredPurchases.length / itemsPerPage);
  const handlePageChange   = (page) => setCurrentPage(page);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ fechaInicio: '', fechaFin: '', vendedor: '', tipoDoc: '', codigoItem: '', nroDoc: '' });
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  // ── Resumen ──────────────────────────────────────────────────────────────────
  const totalCompras    = filteredPurchases.reduce((sum, p) => sum + (p.precioVenta || 0), 0);
  const cantidadCompras = filteredPurchases.length;

  // ── Estados de pantalla ──────────────────────────────────────────────────────
  if (!clienteRUC) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center border-2 border-dashed border-gray-300">
        <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Selecciona un cliente para ver su historial de compras</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Cargando historial de compras...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-600 text-lg">{error}</p>
        <button
          onClick={fetchPurchases}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Resumen ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Compras</p>
              <p className="text-3xl font-bold">$ {totalCompras.toFixed(2)}</p>
            </div>
            <DollarSign className="w-12 h-12 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Cantidad de Registros</p>
              <p className="text-3xl font-bold">{cantidadCompras}</p>
            </div>
            <FileText className="w-12 h-12 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Promedio por Registro</p>
              <p className="text-3xl font-bold">
                $ {cantidadCompras > 0 ? (totalCompras / cantidadCompras).toFixed(2) : '0.00'}
              </p>
            </div>
            <Package className="w-12 h-12 opacity-50" />
          </div>
        </div>
      </div>

      {/* ── Filtros ── */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filtros</h3>
            {hasActiveFilters && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Activos</span>
            )}
          </div>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-1"
              >
                <X className="w-4 h-4" /> Limpiar
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
                <input type="date"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filters.fechaInicio}
                  onChange={e => handleFilterChange('fechaInicio', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Fin</label>
                <input type="date"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filters.fechaFin}
                  onChange={e => handleFilterChange('fechaFin', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Vendedor</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filters.vendedor}
                  onChange={e => handleFilterChange('vendedor', e.target.value)}
                >
                  <option value="">Todos</option>
                  {vendedoresUnicos.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Código Producto</label>
                <input type="text" placeholder="Ej: Q3.VBETY.4E"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filters.codigoItem}
                  onChange={e => handleFilterChange('codigoItem', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">N° Documento</label>
                <input type="text" placeholder="Ej: 1800334615"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filters.nroDoc}
                  onChange={e => handleFilterChange('nroDoc', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tipo Documento</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filters.tipoDoc}
                  onChange={e => handleFilterChange('tipoDoc', e.target.value)}
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

      {/* ── Tabla ── */}
      {filteredPurchases.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-[#334a5e] text-white">
                <tr>
                  <th className="px-3 py-3 text-left   text-xs font-semibold uppercase">Fecha</th>
                  
                  <th className="px-3 py-3 text-left   text-xs font-semibold uppercase">Cód. Producto</th>
                  <th className="px-3 py-3 text-left   text-xs font-semibold uppercase">Descripción</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold uppercase">N° Interno</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold uppercase">Tipo Doc.</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold uppercase">N° SUNAT</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold uppercase">Cantidad</th>
                  <th className="px-3 py-3 text-right  text-xs font-semibold uppercase">Precio Venta</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold uppercase">Condición</th>
<th className="px-3 py-3 text-left   text-xs font-semibold uppercase">Core</th>
<th className="px-3 py-3 text-left   text-xs font-semibold uppercase">Vendedor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentPurchases.map((p, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="px-3 py-3 text-xs whitespace-nowrap">{formatDate(p.fecha)}</td>
                    
                    <td className="px-3 py-3 text-xs whitespace-nowrap">
                      <button
                        onClick={() => onProductClick?.(p.codigoItem)}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition"
                        title="Ver producto"
                      >
                        {p.codigoItem}
                      </button>
                    </td>
                    <td className="px-3 py-3 text-xs max-w-[220px] truncate" title={p.descripcion}>{p.descripcion}</td>
                    <td className="px-3 py-3 text-xs text-center font-semibold">{p.nroDoc || '—'}</td>
                    <td className="px-3 py-3 text-xs text-center">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">{p.tipoDoc || '—'}</span>
                    </td>
                    <td className="px-3 py-3 text-xs text-center whitespace-nowrap">{p.nroSunat || '—'}</td>
                    <td className="px-3 py-3 text-xs text-center font-semibold">{p.cantidad}</td>
                    <td className="px-3 py-3 text-xs text-right whitespace-nowrap font-bold text-green-700">
                      $ {Number(p.precioVenta).toFixed(2)}
                    </td>
                   <td className="px-3 py-3 text-xs text-center whitespace-nowrap">
  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
    {p.condicionVenta || '—'}
  </span>
</td>
<td className="px-3 py-3 text-xs whitespace-nowrap text-gray-600">
  {p.core || '—'}
</td>
<td className="px-3 py-3 text-xs whitespace-nowrap font-medium">{p.vendedor || '—'}</td>
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
                de <span className="font-semibold">{filteredPurchases.length}</span> registros
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
                    const page = index + 1;
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            currentPage === page ? 'bg-[#334a5e] text-white' : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2 text-gray-400">...</span>;
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
              : 'Este cliente no tiene compras en los últimos 5 meses'}
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
