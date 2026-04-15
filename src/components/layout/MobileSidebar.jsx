import React from 'react';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import logoImage from "../../assets/logo-emasa1.png";

const MobileSidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const modulos = user?.modulos ?? [];

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
          <img src={logoImage} alt="EMASA Logo" className="h-10 w-auto object-contain" />
          <button onClick={onClose} className="p-2 hover:bg-green-800 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menú dinámico */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {modulos.map((modulo) => {
            const Icon = LucideIcons[modulo.icono] ?? LucideIcons.Circle;
            return (
              <NavLink
                key={modulo.id_modulo}
                to={modulo.ruta}
                onClick={onClose}
                className={({ isActive }) => `
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${isActive ? 'bg-white text-green-700 shadow-lg' : 'hover:bg-green-800 text-white'}
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{modulo.nombre}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default MobileSidebar;