// src/components/layout/Sidebar.jsx
import React from 'react';
import { Phone, BarChart3, Package, LogOut, ChevronLeft } from 'lucide-react';
import logoImage from "../../assets/logo-emasa1.png";

const menuItems = [
  { icon: BarChart3, label: 'Seguimiento de Metas', module: 'dashboard' },
  { icon: Phone, label: 'Gestión de Cliente', module: 'calls' },
  { icon: Package, label: 'Gestión de Pedidos', module: 'orders' }, // 🆕 NUEVO
];

const Sidebar = ({ isOpen, onToggle, currentModule, onModuleChange }) => {
  return (
    <aside className={`hidden lg:flex flex-col bg-gradient-to-b from-[#2ecc70] to-[#334a5e] text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      
      {/* Logo y Toggle */}
      <div className={`p-4 flex items-center ${isOpen ? 'justify-between' : 'justify-center'}`}>
        {isOpen && (
          <div className="flex items-center justify-center gap-3 flex-1">
            <img 
              src={logoImage} 
              alt="EMASA Logo" 
              className="h-10 w-auto object-contain"
            />
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 hover:bg-green-800 rounded-lg transition"
          title={isOpen ? 'Ocultar menú' : 'Mostrar menú'}
        >
          <ChevronLeft className={`w-5 h-5 transition-transform ${!isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Label "MENU" - Solo visible cuando está expandido */}
      {isOpen && (
        <div className="px-6 py-3">
          <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
            Menú
          </p>
        </div>
      )}

      {/* Menú de navegación */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => onModuleChange(item.module)}
            className={`w-full flex items-center gap-3 rounded-lg transition-all ${
              currentModule === item.module
                ? 'bg-white text-green-700 shadow-lg' 
                : 'hover:bg-green-800 text-white'
            } ${isOpen ? 'px-4 py-3' : 'px-3 py-3 justify-center'}`}
            title={!isOpen ? item.label : ''}
          >
            <item.icon className={`flex-shrink-0 ${isOpen ? 'w-5 h-5' : 'w-6 h-6'}`} />
            {isOpen && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
