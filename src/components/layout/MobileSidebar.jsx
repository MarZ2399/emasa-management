import React from 'react';
import { NavLink } from 'react-router-dom'; // <--- IMPORTANTE
import { Users, Phone, BarChart3, FileText, Package, X } from 'lucide-react';
import logoImage from "../../assets/logo-emasa1.png";

const menuItems = [
  { icon: BarChart3, label: 'Seguimiento de Metas', path: '/dashboard' },
  // 2. Usamos Users para la cartera de clientes
  { icon: Users,     label: 'Maestro de Clientes',  path: '/ventas/clientes' }, 
  // 3. Recuperamos el módulo de Llamadas con la ruta que definimos en App.jsx
  { icon: Phone,     label: 'Gestión de Televentas', path: '/llamadas' },        
  { icon: FileText,  label: 'Gestión de Cotización', path: '/ventas/cotizaciones' }, 
  { icon: Package,   label: 'Gestión de Pedidos',    path: '/ventas/pedidos' },
];

const MobileSidebar = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

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
            <NavLink
              key={index}
              to={item.path}
              onClick={onClose} // Cierra el menú al navegar
              className={({ isActive }) => `
                w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${isActive 
                  ? 'bg-white text-green-700 shadow-lg' 
                  : 'hover:bg-green-800 text-white'
                }
              `}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default MobileSidebar;