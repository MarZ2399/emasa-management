import React, { useState } from 'react';
import {
  Search, Package, Calendar, Eye,
  ChevronDown, ChevronUp, Loader
} from 'lucide-react';

// Mapa de fases para mostrar etiqueta + color
const FASES = {
  5:  { label: 'Anulado',             color: 'bg-red-100 text-red-700' },
  10: { label: 'Pendiente',           color: 'bg-yellow-100 text-yellow-700' },
  15: { label: 'Bloqueado créditos',  color: 'bg-orange-100 text-orange-700' },
  16: { label: 'En observación',      color: 'bg-purple-100 text-purple-700' },
  30: { label: 'En despacho',         color: 'bg-blue-100 text-blue-700' },
  40: { label: 'En WMS',              color: 'bg-indigo-100 text-indigo-700' },
  45: { label: 'Despachado parcial',  color: 'bg-teal-100 text-teal-700' },
  50: { label: 'Despachado',          color: 'bg-green-100 text-green-700' },
};

const FaseBadge = ({ codfase }) => {
  const fase = FASES[codfase] || { label: `Fase ${codfase}`, color: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${fase.color}`}>
      {fase.label}
    </span>
  );
};

const formatFecha = (fechaInt) => {
  if (!fechaInt) return '—';
  const s = String(fechaInt).padStart(8, '0');
  return `${s.substring(6, 8)}/${s.substring(4, 6)}/${s.substring(0, 4)}`;
};

const OrdersList = ({ orders, loading }) => {
  const [searchTerm,   setSearchTerm]   = useState('');
  const [faseFilter,   setFaseFilter]   = useState('all');
  const [sortField,    setSortField]    = useState('fecped');
  const [sortDir,      setSortDir]      = useState('desc');

  const filtered = orders.filter(o => {
    const matchSearch =
      String(o.reg   || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(o.nomc  || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(o.rucc  || '').includes(searchTerm);

    const matchFase = faseFilter === 'all' || String(o.codfase) === faseFilter;

    return matchSearch && matchFase;
  });

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortField] ?? '';
    const bv = b[sortField] ?? '';
    if (sortDir === 'asc') return av > bv ? 1 : -1;
    return av < bv ? 1 : -1;
  });

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3" />
      : <ChevronDown className="w-3 h-3" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 text-green-600 animate-spin" />
        <span className="ml-3 text-gray-500">Cargando pedidos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por N° Pedido, cliente o RUC..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
          />
        </div>

        <select
          value={faseFilter}
          onChange={e => setFaseFilter(e.target.value)}
          className="md:w-56 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
        >
          <option value="all">Todas las fases</option>
          {Object.entries(FASES).map(([cod, { label }]) => (
            <option key={cod} value={cod}>{label}</option>
          ))}
        </select>
      </div>

      {/* Contador */}
      <p className="text-sm text-gray-500">
        Mostrando <strong>{sorted.length}</strong> de <strong>{orders.length}</strong> pedidos
      </p>

      {/* Tabla */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[
                  { label: 'N° Pedido',  field: 'reg'     },
                  { label: 'Fecha',      field: 'fecped'  },
                  { label: 'RUC',        field: 'rucc'    },
                  { label: 'Cliente',    field: 'nomc'    },
                  { label: 'Vendedor',   field: 'vend'    },
                  { label: 'Jefe Venta', field: 'jvta'    },
                  { label: 'Almacén',    field: 'almdes'  },
                  { label: 'Neto S/',    field: 'netos'   },
                  { label: 'Neto USD',   field: 'netod'   },
                  { label: 'Fase',       field: 'codfase' },
                ].map(({ label, field }) => (
                  <th
                    key={field}
                    onClick={() => handleSort(field)}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      <SortIcon field={field} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center text-gray-400">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>No se encontraron pedidos</p>
                  </td>
                </tr>
              ) : (
                sorted.map((order, idx) => (
                  <tr key={`${order.reg}-${idx}`} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-semibold text-green-700">{order.reg}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatFecha(order.fecped)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.rucc}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">
                      {order.nomc}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.vend}</td>
                    <td className="px-4 py-3 text-gray-600">{order.jvta}</td>
                    <td className="px-4 py-3 text-gray-600">{order.almdes}</td>
                    <td className="px-4 py-3 text-gray-700">
                      S/ {Number(order.netos || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-green-700">
                      $ {Number(order.netod || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <FaseBadge codfase={order.codfase} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersList;
