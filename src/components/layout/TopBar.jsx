// src/components/layout/TopBar.jsx
import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import NotificationDropdown from './header/NotificationDropdown';
import UserDropdown from './header/UserDropdown';
import DarkModeSwitcher from './header/DarkModeSwitcher';
import MobileSidebar from './MobileSidebar';
import CallReminders from '../calls/CallReminders';
import { useCallReminders } from '../../hooks/useCallReminders';
import logoImage from "../../assets/logo-emasa1.png";
// ← Se elimina: import { currentUser } from '../../data/userData';

const TopBar = ({ mobileMenuOpen, onToggleMobileMenu, currentModule, onModuleChange }) => {
  const [showReminderPanel, setShowReminderPanel] = useState(false);

  //  Sin parámetros — consume API real
  const { reminders, dismissReminder } = useCallReminders();

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 lg:px-6">

          {/* LEFT */}
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* CENTER - Mobile logo */}
          <div className="lg:hidden absolute left-1/2 transform -translate-x-1/2">
            <img src={logoImage} alt="EMASA" className="h-8 w-auto object-contain" />
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">

            {/* Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <DarkModeSwitcher />
              <NotificationDropdown
                reminders={reminders}
                onViewAll={() => setShowReminderPanel(true)}
              />
              <UserDropdown /> {/* ← Sin prop user */}
            </div>

            {/* Mobile */}
            <div className="md:hidden flex items-center gap-2">
              <NotificationDropdown
                reminders={reminders}
                onViewAll={() => setShowReminderPanel(true)}
              />
              <UserDropdown isMobile /> {/* ← Sin prop user */}
            </div>
          </div>
        </div>
      </header>

      <MobileSidebar
        isOpen={mobileMenuOpen}
        onClose={onToggleMobileMenu}
        currentModule={currentModule}
        onModuleChange={onModuleChange}
      />

      {/* Panel lateral de recordatorios */}
      <CallReminders
        reminders={reminders}
        isOpen={showReminderPanel}
        onClose={() => setShowReminderPanel(false)}
        onDismiss={dismissReminder}
      />
    </>
  );
};

export default TopBar;
