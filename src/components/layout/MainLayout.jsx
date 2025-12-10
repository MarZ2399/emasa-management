// src/components/layout/MainLayout.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const MainLayout = ({ children, currentModule, onModuleChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentModule={currentModule}
        onModuleChange={onModuleChange}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          mobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          currentModule={currentModule}
          onModuleChange={onModuleChange}
        />

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
