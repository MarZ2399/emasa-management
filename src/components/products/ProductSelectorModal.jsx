// src/components/products/ProductSelectorModal.jsx
import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { Search, X, Package, Filter } from 'lucide-react';
import { initialProducts, productCategories } from '../../data/productsData';

const ProductSelectorModal = ({
  isOpen,
  onClose,
  onSelect, // (product) => void
  title = 'Seleccionar producto',
}) => {
  // 🔹 Hooks SIEMPRE al inicio
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredProducts = useMemo(() => {
    if (!isOpen) return []; // si está cerrado, devolvemos lista vacía
    return initialProducts.filter(p => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        p.codigo.toLowerCase().includes(term) ||
        p.nombre.toLowerCase().includes(term) ||
        p.categoria.toLowerCase().includes(term);

      const matchesCategory =
        categoryFilter === 'all' || p.categoria === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, categoryFilter, isOpen]);

  if (!isOpen) return null;

  const handleSelect = product => {
    onSelect(product);
    onClose();
  };

  const content = (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b bg-gradient-to-r from-sky-500 to-blue-600 text-white">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            <div>
              <h2 className="text-sm md:text-base font-semibold">{title}</h2>
              <p className="text-[11px] md:text-xs text-sky-100">
                Busca por código, nombre o filtra por categoría
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10"
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
              placeholder="Buscar por código, nombre o categoría..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          <div className="w-full md:w-60 flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none acompanhado focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="all">Todas las categorías</option>
              {productCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista */}
        <div className="overflow-y-auto max-h-[60vh]">
          {filteredProducts.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-gray-500 text-sm">
              <Package className="w-10 h-10 mb-2 text-gray-300" />
              <p>No se encontraron productos.</p>
              <p className="text-xs">Ajusta el texto de búsqueda o la categoría.</p>
            </div>
          ) : (
            <table className="min-w-full text-xs md:text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">
                    Código
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">
                    Nombre
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">
                    Categoría
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-700">
                    Precio Lista
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-700">
                    Precio Neto
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-700">
                    Stock
                  </th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-700">
                    Seleccionar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map(product => (
                  <tr
                    key={product.id}
                    className="hover:bg-blue-50/60 transition cursor-pointer"
                  >
                    <td className="px-3 py-2 whitespace-nowrap text-[11px] md:text-xs font-medium text-gray-800">
                      {product.codigo}
                    </td>
                    <td className="px-3 py-2 text-gray-900">
                      <div className="text-xs md:text-sm font-semibold">
                        {product.nombre}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {product.proveedor}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-[11px] text-gray-700">
                      {product.categoria}
                    </td>
                    <td className="px-3 py-2 text-right text-[11px] md:text-xs text-gray-800">
                      {product.precioLista.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-right text-[11px] md:text-xs text-emerald-700 font-semibold">
                      {product.precioNeto.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-right text-[11px] text-gray-800">
                      {product.stock}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleSelect(product)}
                        className="inline-flex items-center px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
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
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
};

export default ProductSelectorModal;
