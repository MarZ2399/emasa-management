import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import logoImage from "../../assets/logo-emasa1.png";

const Sidebar = ({ isOpen, onToggle }) => {
  const { user } = useAuth();
  const modulos = user?.modulos ?? [];

  return (
    <aside className={`hidden lg:flex flex-col bg-gradient-to-b from-[#2ecc70] to-[#334a5e] text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>

      {/* Logo y Toggle */}
      <div className={`p-4 flex items-center ${isOpen ? 'justify-between' : 'justify-center'}`}>
        {isOpen && (
          <div className="flex items-center justify-center gap-3 flex-1">
            <img src={logoImage} alt="EMASA Logo" className="h-10 w-auto object-contain" />
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

      {/* Label "MENU" */}
      {isOpen && (
        <div className="px-6 py-3">
          <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Menú</p>
        </div>
      )}

      {/* Menú dinámico */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {modulos.map((modulo) => {
          const Icon = LucideIcons[modulo.icono] ?? LucideIcons.Circle;
          return (
            <NavLink
              key={modulo.id_modulo}
              to={modulo.ruta}
              className={({ isActive }) => `
                w-full flex items-center gap-3 rounded-lg transition-all
                ${isOpen ? 'px-4 py-3' : 'px-3 py-3 justify-center'}
                ${isActive ? 'bg-white text-green-700 shadow-lg' : 'hover:bg-green-800 text-white'}
              `}
              title={!isOpen ? modulo.nombre : ''}
            >
              <Icon className={`flex-shrink-0 ${isOpen ? 'w-5 h-5' : 'w-6 h-6'}`} />
              {isOpen && <span className="font-medium">{modulo.nombre}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;