import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Routes, Route, Navigate } from 'react-router-dom';

// Context
import { AuthProvider } from './context/AuthContext';

// Auth
import LoginForm from './components/auth/LoginForm';
import ForgotPassword from './components/auth/ForgotPassword';  // ← NUEVO
import ResetPassword from './components/auth/ResetPassword';    // ← NUEVO
import ProtectedRoute from './components/common/ProtectedRoute';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Modules
import DashboardModule from './components/dashboard/DashboardModule';
import ClientsModule from './components/clients/ClientsModule';
import OrdersModule from './components/orders/OrdersModule';
import QuotationsModule from './components/quotations/QuotationsModule';
import CallsModule from './components/calls/CallsModule';
import CallReminders from './components/calls/CallReminders';

// Data Mock
import { initialCallRecords } from './data/callsData';

const App = () => {
  return (
    <AuthProvider>
      {/* Toaster con configuración personalizada */}
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

      <Routes>
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* RUTAS PÚBLICAS */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        
        {/* Login */}
        <Route path="/login" element={<LoginForm />} />
        
        {/* Recuperación de contraseña */}
        <Route path="/forgot-password" element={<ForgotPassword />} />  {/* ← NUEVO */}
        <Route path="/reset-password" element={<ResetPassword />} />    {/* ← NUEVO */}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* RUTAS PROTEGIDAS */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              {/* ✅ MainLayoutWrapper envuelve todo el contenido autenticado */}
              <MainLayoutWrapper />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
};

// ✅ Componente interno que maneja el estado de CallReminders
const MainLayoutWrapper = () => {
  const [showReminderPanel, setShowReminderPanel] = useState(false);

  return (
    <>
      <MainLayout onOpenReminders={() => setShowReminderPanel(true)}>
        <Routes>
          {/* Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardModule />} />

          {/* Gestión Comercial */}
          <Route path="/ventas/clientes" element={<ClientsModule />} />
          <Route path="/ventas/cotizaciones" element={<QuotationsModule />} />
          <Route path="/ventas/pedidos" element={<OrdersModule />} />

          {/* Llamadas */}
          <Route path="/llamadas" element={<CallsModule />} />

          {/* Administración */}
          <Route 
            path="/admin/config" 
            element={
              <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Configuración</h2>
                  <p className="text-gray-600">Módulo en desarrollo</p>
                </div>
              </div>
            } 
          />
          
          <Route 
            path="/admin/usuarios" 
            element={
              <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Gestión de Usuarios</h2>
                  <p className="text-gray-600">Módulo en desarrollo</p>
                </div>
              </div>
            } 
          />

          {/* Reportes */}
          <Route 
            path="/reportes" 
            element={
              <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Reportes</h2>
                  <p className="text-gray-600">Módulo en desarrollo</p>
                </div>
              </div>
            } 
          />

          {/* Estadísticas */}
          <Route 
            path="/estadisticas" 
            element={
              <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Estadísticas</h2>
                  <p className="text-gray-600">Módulo en desarrollo</p>
                </div>
              </div>
            } 
          />

          {/* 404 */}
          <Route 
            path="*" 
            element={
              <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <h2 className="text-2xl font-bold text-red-600 mb-4">404 - No encontrado</h2>
                  <p className="text-gray-600">El módulo solicitado no existe</p>
                </div>
              </div>
            } 
          />
        </Routes>
      </MainLayout>

      {/* ✅ CallReminders solo se renderiza cuando el usuario está autenticado */}
      <CallReminders
        callRecords={initialCallRecords}
        isOpen={showReminderPanel}
        onClose={() => setShowReminderPanel(false)}
      />
    </>
  );
};

export default App;
