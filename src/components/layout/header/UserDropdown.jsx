// src/components/layout/header/UserDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, Settings, HelpCircle, LogOut } from 'lucide-react';

const UserDropdown = ({ user, isMobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { icon: User, label: 'Editar Usuario', onClick: () => console.log('Edit profile') },
    { icon: Settings, label: 'Ajustes de Cuenta', onClick: () => console.log('Settings') },
    { icon: HelpCircle, label: 'Soporte', onClick: () => console.log('Support') },
    { icon: LogOut, label: 'Cerrar Sesión', onClick: () => console.log('Logout'), danger: true }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors ${
          isMobile ? 'px-0' : ''
        }`}
      >
        {/* Avatar */}
        <div className={`rounded-full overflow-hidden border-2 border-gray-200 ${
          isMobile ? 'w-9 h-9' : 'w-10 h-10'
        }`}>
          <img
            src={user.foto}
            alt={user.nombreCompleto}
            className="w-full h-full object-cover bg-white"
          />
        </div>

        {/* User Info - Solo Desktop */}
        {!isMobile && (
          <div className="hidden lg:block text-left max-w-[180px]">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user.nombreCompleto}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.email || user.correo || 'usuario@emasa.com'}
            </p>
          </div>
        )}

        {/* Chevron Icon - Solo Desktop */}
        {!isMobile && (
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user.nombreCompleto}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.email || user.correo || 'usuario@emasa.com'}
            </p>
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
