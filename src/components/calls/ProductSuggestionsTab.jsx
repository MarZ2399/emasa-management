import React, { useState, useEffect } from 'react';
import { Sparkles, ShoppingCart, Package, TrendingUp, Star } from 'lucide-react';
import { getProductSuggestions, getClientPurchaseHistory, allProducts } from '../../data/productSuggestionsData';
import toast from 'react-hot-toast';

const ProductSuggestionsTab = ({ clienteRUC, purchaseHistory, onAddToQuotation }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clienteRUC && purchaseHistory) {
      setLoading(true);
      
      // Simular delay para mejor UX
      setTimeout(() => {
        const clientPurchases = getClientPurchaseHistory(clienteRUC, purchaseHistory);
        const productSuggestions = getProductSuggestions(clientPurchases);
        setSuggestions(productSuggestions);
        setLoading(false);
      }, 500);
    }
  }, [clienteRUC, purchaseHistory]);

  const handleAddToQuotation = (product) => {
    const quotationItem = {
      codigo: product.codigo,
      nombre: product.nombre,
      precioLista: product.precio,
      precioNeto: product.precio,
      quantity: 1,
      discount1: 0,
      discount5: 0,
      categoria: product.categoria,
      stock: product.stock
    };

    if (onAddToQuotation) {
      onAddToQuotation(quotationItem);
      toast.success(`${product.nombre} agregado a la cotización`, {
        position: 'top-right',
        icon: '✅'
      });
    }
  };

  if (!clienteRUC) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center border-2 border-dashed border-gray-300">
        <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Selecciona un cliente para ver sugerencias de productos</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Analizando historial de compras...</p>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No hay suficiente historial para generar sugerencias</p>
        <p className="text-gray-400 text-sm mt-2">Este cliente necesita realizar más compras</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-md p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Sugerencias Inteligentes</h2>
        </div>
        <p className="text-purple-100">
          Basado en las compras anteriores de este cliente, te recomendamos estos productos
        </p>
      </div>

      {/* Grid de productos sugeridos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {suggestions.map((product, index) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-purple-400 group"
          >
            {/* Badge de relevancia */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                <span className="text-white text-xs font-bold">
                  {index === 0 ? '⭐ Top Recomendado' : `Relevancia: ${product.relevanceScore}`}
                </span>
              </div>
            </div>

            {/* Contenido del producto */}
            <div className="p-4">
              <div className="mb-3">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                  {product.categoria}
                </span>
              </div>

              <h3 className="font-bold text-gray-900 text-sm mb-2 h-10 line-clamp-2">
                {product.nombre}
              </h3>

              <p className="text-xs text-gray-600 mb-3 h-12 line-clamp-3">
                {product.descripcion}
              </p>

              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500">Código</p>
                  <p className="text-sm font-semibold text-gray-900">{product.codigo}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Stock</p>
                  <p className={`text-sm font-bold ${product.stock > 50 ? 'text-green-600' : 'text-orange-600'}`}>
                    {product.stock} unid.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500">Precio</p>
                  <p className="text-xl font-bold text-blue-600">S/ {product.precio.toFixed(2)}</p>
                </div>
              </div>

              {/* Características */}
              <div className="flex flex-wrap gap-1 mb-4">
                {product.caracteristicas.slice(0, 3).map((caracteristica, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {caracteristica}
                  </span>
                ))}
              </div>

              {/* Botón agregar */}
              <button
                onClick={() => handleAddToQuotation(product)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 group-hover:scale-105"
              >
                <ShoppingCart className="w-4 h-4" />
                Agregar a Cotización
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer informativo */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">¿Cómo funcionan las sugerencias?</h4>
            <p className="text-sm text-blue-700">
              Analizamos las categorías, marcas y características de los productos que el cliente ha comprado anteriormente 
              para recomendar productos complementarios o similares que podrían interesarle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSuggestionsTab;
