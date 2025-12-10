// src/components/layout/header/DarkModeSwitcher.jsx
import React, { useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const DarkModeSwitcher = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Aquí puedes agregar la lógica para cambiar el tema
    // document.documentElement.classList.toggle('dark');
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      title={darkMode ? 'Light mode' : 'Dark mode'}
    >
      {darkMode ? (
        <Sun className="w-6 h-6 text-gray-600" />
      ) : (
        <Moon className="w-6 h-6 text-gray-600" />
      )}
    </button>
  );
};

export default DarkModeSwitcher;
