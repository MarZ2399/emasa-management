// src/components/layout/TopBar.jsx
import React, { useState } from 'react';
import { Menu, Search } from 'lucide-react';
import NotificationDropdown from './header/NotificationDropdown';
import UserDropdown from './header/UserDropdown';
import DarkModeSwitcher from './header/DarkModeSwitcher';
import MobileSidebar from './MobileSidebar';
import CallReminders from '../calls/CallReminders';  // ✅ Solo el componente (sin el hook)
import { useCallReminders } from '../../hooks/useCallReminders';  // ✅ Hook desde hooks/
import { currentUser } from '../../data/userData';
import { initialCallRecords } from '../../data/callsData';
import logoImage from "../../assets/logo-emasa1.png";

const TopBar = ({ mobileMenuOpen, onToggleMobileMenu, currentModule, onModuleChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showReminderPanel, setShowReminderPanel] = useState(false);

  // ✅ Obtener recordatorios usando el hook
  const reminders = useCallReminders(initialCallRecords);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 lg:px-6">
          
          {/* LEFT SECTION */}
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile: Hamburger */}
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>

           
          </div>

          {/* CENTER - Mobile: Logo centrado */}
          <div className="lg:hidden absolute left-1/2 transform -translate-x-1/2">
            <img 
              src={logoImage} 
              alt="EMASA" 
              className="h-8 w-auto object-contain"
            />
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-3">
            {/* Desktop: Dark Mode + Notifications + User */}
            <div className="hidden md:flex items-center gap-3">
              <DarkModeSwitcher />
              <NotificationDropdown 
                reminders={reminders} 
                onViewAll={() => setShowReminderPanel(true)} 
              />
              <UserDropdown user={currentUser} />
            </div>

            {/* Mobile: Notifications + Avatar */}
            <div className="md:hidden flex items-center gap-2">
              <NotificationDropdown 
                reminders={reminders} 
                onViewAll={() => setShowReminderPanel(true)} 
              />
              <UserDropdown user={currentUser} isMobile />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileMenuOpen}
        onClose={onToggleMobileMenu}
        currentModule={currentModule}
        onModuleChange={onModuleChange}
      />

      {/* Panel completo de recordatorios */}
      <CallReminders
        callRecords={initialCallRecords}
        isOpen={showReminderPanel}
        onClose={() => setShowReminderPanel(false)}
      />
    </>
  );
};

export default TopBar;
