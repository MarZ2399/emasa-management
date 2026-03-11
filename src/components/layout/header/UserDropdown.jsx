// src/components/layout/header/UserDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

const UserDropdown = ({ isMobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { logout, user } = useAuth(); // ← lee user directo del context

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  const menuItems = [
    // { icon: User,       label: 'Editar Usuario',    onClick: () => {} },
    // { icon: Settings,   label: 'Ajustes de Cuenta', onClick: () => {} },
    // { icon: HelpCircle, label: 'Soporte',            onClick: () => {} },
    { icon: LogOut, label: 'Cerrar Sesión', onClick: handleLogout, danger: true },
  ];

  // ✅ Fallbacks defensivos por si acaso llega data cruda
  const nombre = user?.nombreCompleto
    || user?.nombre_completo
    || user?.username
    || 'Usuario';

  const email = user?.email
    || user?.correo
    || user?.username
    || '';

  const fotoUrl = user?.foto
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=e0f2fe&color=0369a1&bold=true`;

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 py-2 hover:bg-gray-50 rounded-lg transition-colors ${
          isMobile ? 'px-0' : 'px-3'
        }`}
      >
        {/* Avatar */}
        <div className={`rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0 ${
          isMobile ? 'w-9 h-9' : 'w-10 h-10'
        }`}>
          <img
            src={fotoUrl}
            alt={nombre}
            className="w-full h-full object-cover bg-white"
          />
        </div>

        {/* User Info — Solo Desktop */}
        {!isMobile && (
          <div className="hidden lg:block text-left max-w-[180px]">
            <p className="text-sm font-semibold text-gray-900 truncate">{nombre}</p>
            <p className="text-xs text-gray-500 truncate">{email}</p>
          </div>
        )}

        {/* Chevron — Solo Desktop */}
        {!isMobile && (
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">

          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-semibold text-gray-900 truncate">{nombre}</p>
            <p className="text-xs text-gray-500 truncate">{email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  item.danger
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
