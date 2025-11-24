import React from 'react';
import { Menu, Phone, X } from 'lucide-react';
import { Home, Users, FileText, Settings, BarChart3, LogOut } from 'lucide-react';
import logoImage from "../../assets/logo-emasa1.png";

const menuItems = [
   // { icon: Home, label: 'Dashboard', module: 'dashboard' },
  { icon: BarChart3, label: 'Seguimiento de Metas', module: 'dashboard' },
  { icon: Phone, label: 'Gestión de Cliente', module: 'calls' },
  { icon: Users, label: 'Maestro de Cliente', module: 'clients' },
  
  // { icon: FileText, label: 'Reportes', module: 'reports' },
  // { icon: BarChart3, label: 'Estadísticas', module: 'stats' },
  // { icon: Settings, label: 'Configuración', module: 'settings' },
];


const TopBar = ({ mobileMenuOpen, onToggleMobileMenu, currentModule, onModuleChange }) => {
  return (
    <>
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-end">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        {/* <div className="flex items-center gap-2">
          <Phone className="text-blue-600 w-6 h-6" />
          <span className="font-bold text-gray-800">Llamadas PostVenta</span>
        </div>
        <div className="w-10" /> */}
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onToggleMobileMenu} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-blue-300 to-green-700 text-white flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-green-600">
              <div className="flex items-center justify-center gap-3 flex-1">
                                      
                                      <img 
                                        src={logoImage} 
                                        alt="CallCenter Logo" 
                                        className="h-10 w-auto object-contain"
                                      />
                                    </div>
              <button
                onClick={onToggleMobileMenu}
                className="p-2 hover:bg-green-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onModuleChange(item.module);
                    onToggleMobileMenu();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    currentModule === item.module
                      ? 'bg-white text-green-700 shadow-lg' 
                      : 'hover:bg-green-800 text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-green-600">
              <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-800 rounded-lg transition">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default TopBar;