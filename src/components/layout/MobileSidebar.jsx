import React from 'react';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import logoImage from "../../assets/logo-emasa1.png";
import { APP_VERSION } from '../../config/version';

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
      <aside className="fixed top-0 left-0 z-50 lg:hidden h-dvh w-64 bg-gradient-to-b from-[#2ecc70] to-[#334a5e] text-white flex flex-col">
        {/* Header */}
        <div className="p-4 flex items-center justify-between shrink-0">
          <img src={logoImage} alt="EMASA Logo" className="h-10 w-auto object-contain" />
          <button onClick={onClose} className="p-2 hover:bg-green-800 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Label "MENU" */}
        <div className="px-6 py-3 shrink-0">
          <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Menú</p>
        </div>

        {/* Menú dinámico */}
        <nav className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1">
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

        {/* Footer */}
        <div className="shrink-0 border-t border-white/10 px-4 py-3">
          <div className="flex justify-center items-center">
            <span className="text-[11px] text-white/50 tracking-[0.15em]">
              {APP_VERSION}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default MobileSidebar;