// src/components/layout/MobileSidebar.jsx
import React from 'react';
import { Phone, BarChart3,FileText,Package, LogOut, X } from 'lucide-react';
import logoImage from "../../assets/logo-emasa1.png";
import { currentUser } from '../../data/userData';

const menuItems = [
   { icon: BarChart3, label: 'Seguimiento de Metas', module: 'dashboard' },
  { icon: Phone, label: 'Gestión de Cliente', module: 'calls' },
  { icon: FileText, label: 'Gestión de Cotización', module: 'quotations' }, 
  { icon: Package, label: 'Gestión de Pedidos', module: 'orders' },
];

const MobileSidebar = ({ isOpen, onClose, currentModule, onModuleChange }) => {
  if (!isOpen) return null;

  const handleModuleChange = (module) => {
    onModuleChange(module);
    onClose(); // Cierra el sidebar al seleccionar
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-[#2ecc70] to-[#334a5e] text-white z-50 transform transition-transform duration-300 lg:hidden">
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <img 
            src={logoImage} 
            alt="EMASA Logo" 
            className="h-10 w-auto object-contain"
          />
          <button
            onClick={onClose}
            className="p-2 hover:bg-green-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleModuleChange(item.module)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentModule === item.module
                  ? 'bg-white text-green-700 shadow-lg' 
                  : 'hover:bg-green-800 text-white'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        
      </aside>
    </>
  );
};

export default MobileSidebar;
