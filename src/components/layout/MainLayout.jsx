import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar'; // Asegúrate de importar esto si no lo tenías
import TopBar from './TopBar';

const MainLayout = ({ children, onOpenReminders }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar de Escritorio */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Sidebar Móvil */}
      <MobileSidebar 
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          mobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          onOpenReminders={onOpenReminders}
        />

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Aquí se renderizarán las rutas (el contenido cambiante) */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;