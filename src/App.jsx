import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Context
import { AuthProvider } from './context/AuthContext';

// Auth
import LoginForm from './components/auth/LoginForm';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
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

import CatalogoDebug from './components/common/CatalogoDebug';
import FindStockProduct from './components/products/FindStockProduct';
import BillingModule from './components/billing/BillingModule';

import { useAuth } from './hooks/useAuth';



// ── Página Sin Acceso (inline) ────────────────────────────────────
const SinAccesoPage = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-red-600 mb-2">Acceso denegado</h2>
        <p className="text-gray-500 mb-6">No tienes permisos para ver esta sección.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-[#334a5e] text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Volver
        </button>
      </div>
    </div>
  );
};

// ── App principal ─────────────────────────────────────────────────
const App = () => {
  return (
    <AuthProvider>
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
            iconTheme: { primary: '#10b981', secondary: '#fff' },
            style: { border: '1px solid #10b981' },
          },
          error: {
            duration: 4000,
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
            style: { border: '1px solid #ef4444' },
          },
        }}
      />

      <Routes>
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* RUTAS PÚBLICAS                                   */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <Route path="/debug/catalogos" element={<CatalogoDebug />} />
        <Route path="/login"           element={<LoginForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* RUTAS PROTEGIDAS                                 */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayoutWrapper />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
};

// ── MainLayoutWrapper ─────────────────────────────────────────────
const MainLayoutWrapper = () => {
  const [showReminderPanel, setShowReminderPanel] = useState(false);
  const { user } = useAuth();

  const rutaInicial = user?.modulos?.[0]?.ruta ?? '/dashboard';

  return (
    <>
      <MainLayout onOpenReminders={() => setShowReminderPanel(true)}>
        <Routes>

          {/* Redirect raíz */}
           <Route path="/" element={<Navigate to={rutaInicial} replace />} />

          {/* ── Dashboard ── */}
          <Route path="/dashboard" element={
            <ProtectedRoute ruta="/dashboard">
              <DashboardModule />
            </ProtectedRoute>
          } />

          {/* ── Gestión Comercial ── */}
          <Route path="/ventas/clientes" element={
            <ProtectedRoute ruta="/ventas/clientes">
              <ClientsModule />
            </ProtectedRoute>
          } />

          <Route path="/ventas/cotizaciones" element={
            <ProtectedRoute ruta="/ventas/cotizaciones">
              <QuotationsModule />
            </ProtectedRoute>
          } />

          <Route path="/ventas/pedidos" element={
            <ProtectedRoute ruta="/ventas/pedidos">
              <OrdersModule />
            </ProtectedRoute>
          } />

          {/* ── Llamadas ── */}
          <Route path="/llamadas" element={
            <ProtectedRoute ruta="/llamadas">
              <CallsModule />
            </ProtectedRoute>
          } />

          {/* ── Facturación ── */}
          <Route path="/facturacion" element={
            <ProtectedRoute ruta="/facturacion">
              <BillingModule />
            </ProtectedRoute>
          } />

          {/* ── Stock (sin restricción de módulo) ── */}
          <Route path="/stock" element={<FindStockProduct />} />

          {/* ── Sin Acceso ── */}
          <Route path="/sin-acceso" element={<SinAccesoPage />} />

        
          {/* ── 404 ── */}
          <Route path="*" element={
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">404 - No encontrado</h2>
                <p className="text-gray-600">El módulo solicitado no existe</p>
              </div>
            </div>
          } />

        </Routes>
      </MainLayout>

      <CallReminders
        
        isOpen={showReminderPanel}
        onClose={() => setShowReminderPanel(false)}
      />
    </>
  );
};

export default App;