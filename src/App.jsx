// src/App.jsx
import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import MainLayout from './components/layout/MainLayout';
import ClientsModule from './components/clients/ClientsModule';
import CallsModule from './components/calls/CallsModule';
import DashboardModule from './components/dashboard/DashboardModule';
import ProductsModule from './components/products/ProductsModule';


const App = () => {
  const [currentModule, setCurrentModule] = useState('dashboard');


  const renderModule = () => {
    switch (currentModule) {
      case 'clients':
        return <ClientsModule />;
      case 'calls':
        return <CallsModule />;
      case 'products':
        return <ProductsModule />;
      case 'dashboard':
        return <DashboardModule />;
      case 'reports':
        return (
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Reportes</h2>
              <p className="text-gray-600">Módulo en desarrollo</p>
            </div>
          </div>
        );
      case 'stats':
        return (
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Estadísticas</h2>
              <p className="text-gray-600">Módulo en desarrollo</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Configuración</h2>
              <p className="text-gray-600">Módulo en desarrollo</p>
            </div>
          </div>
        );
      default:
        return <CallsModule />;
    }
  };


  return (
    <>
      {/* Toaster para notificaciones */}
      <Toaster 
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#363636',
            padding: '16px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontSize: '14px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
            style: {
              border: '1px solid #10b981',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              border: '1px solid #ef4444',
            },
          },
        }}
      />


      <MainLayout currentModule={currentModule} onModuleChange={setCurrentModule}>
        {renderModule()}
      </MainLayout>
    </>
  );
};


export default App;
