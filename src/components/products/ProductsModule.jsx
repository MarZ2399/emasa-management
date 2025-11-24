// src/components/products/ProductsModule.jsx
import React, { useState } from 'react';
import { Package, Search } from 'lucide-react';
import ProductSearchPanel from './ProductSearchPanel';

const ProductsModule = () => {
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Banner Hero con Gradiente */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl shadow-lg p-6 text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          
          {/* Contenido Izquierdo */}
          <div className="flex items-center gap-6 flex-1">
            <div className="bg-white bg-opacity-20 p-4 rounded-xl backdrop-blur-sm">
              <Package className="w-8 h-8 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-3xl font-bold">Consulta de Productos en Stock</h1>
              <p className="text-blue-100 text-sm md:text-base mt-1">Busca productos por código o nombre</p>
            </div>
          </div>

          {/* Botón Derecho */}
          <button
            onClick={() => setIsSearchPanelOpen(true)}
            className="bg-white hover:bg-blue-50 text-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold transition shadow-lg flex items-center gap-2 whitespace-nowrap"
          >
            <Search className="w-5 h-5 md:w-6 md:h-6" />
            <span className="hidden sm:inline">Abrir Consulta de Productos</span>
            <span className="sm:hidden">Consultar</span>
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      {/* <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-200">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Bienvenido a Consulta de Productos</h2>
          <p className="text-gray-600 mb-6">Haz click en el botón de arriba para buscar productos detallados en nuestro catálogo</p>
          
          <button
            onClick={() => setIsSearchPanelOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition inline-flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            Iniciar Búsqueda
          </button>
        </div>
      </div> */}

      {/* Product Search Panel */}
      <ProductSearchPanel 
        isOpen={isSearchPanelOpen}
        onClose={() => setIsSearchPanelOpen(false)}
      />
    </div>
  );
};

export default ProductsModule;
