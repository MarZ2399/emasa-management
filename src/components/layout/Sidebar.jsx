// src/components/layout/Sidebar.jsx
import React from 'react';
import { Phone, Home, Users, FileText, Settings, BarChart3, LogOut, ChevronLeft, Package } from 'lucide-react';
import logoImage from "../../assets/logo-emasa1.png";
import UserProfile from './UserProfile';
import { currentUser } from '../../data/userData';


const menuItems = [
  // { icon: Home, label: 'Dashboard', module: 'dashboard' },
  { icon: BarChart3, label: 'Seguimiento de Metas', module: 'dashboard' },
  { icon: Phone, label: 'Gestión de Cliente', module: 'calls' },
  // { icon: Users, label: 'Maestro de Cliente', module: 'clients' },
  { icon: Package, label: 'Consulta de Productos', module: 'products' },
  
  // { icon: FileText, label: 'Reportes', module: 'reports' },
  // { icon: BarChart3, label: 'Estadísticas', module: 'stats' },
  // { icon: Settings, label: 'Configuración', module: 'settings' },
];


const Sidebar = ({ isOpen, onToggle, currentModule, onModuleChange }) => {
  return (
    <aside className={`hidden lg:flex flex-col bg-gradient-to-b from-[#2ecc70] to-[#334a5e]   text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>  {/* Logo y Toggle */}
      <div className={`p-4 flex items-center border-b border-green-600 ${isOpen ? 'justify-between' : 'justify-center'}`}>
        {isOpen && (
          <div className="flex items-center justify-center gap-3 flex-1">
            <img 
              src={logoImage} 
              alt="CallCenter Logo" 
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


      {/* UserProfile completo cuando está expandido */}
      {isOpen && <UserProfile user={currentUser} isOpen={isOpen} />}


      {/* Solo avatar cuando está colapsado */}
      {!isOpen && (
        <div className="py-4 border-b border-green-600 flex justify-center">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 shadow-lg">
            <img 
              src={currentUser.foto} 
              alt={currentUser.nombreCompleto}
              className="w-full h-full object-cover bg-white"
              title={currentUser.nombreCompleto}
            />
          </div>
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


      {/* Cerrar Sesión */}
      <div className="p-3 border-t border-green-600">
        <button 
          className={`w-full flex items-center gap-3 hover:bg-green-800 rounded-lg transition-all ${
            isOpen ? 'px-4 py-3' : 'px-3 py-3 justify-center'
          }`}
          title={!isOpen ? 'Cerrar Sesión' : ''}
        >
          <LogOut className={`flex-shrink-0 ${isOpen ? 'w-5 h-5' : 'w-6 h-6'}`} />
          {isOpen && <span className="font-medium">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
};


export default Sidebar;
