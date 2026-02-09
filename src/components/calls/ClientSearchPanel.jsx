// src/components/customer/ClientSearchPanel.jsx
import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { getClientByRuc } from '../../services/customerService';
import InfoCard from '../common/InfoCard';
import toast from 'react-hot-toast';

const ClientSearchPanel = ({ onClientSelect, resetTrigger }) => {
  const [ruc, setRuc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [clientData, setClientData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Efecto para limpiar campos cuando cambia resetTrigger
  useEffect(() => {
    if (resetTrigger > 0) {
      handleClear();
    }
  }, [resetTrigger]);

  /**
   * Buscar cliente por RUC (API Real)
   */
  const handleSearch = async () => {
    // Validaciones
    if (!ruc && !razonSocial) {
      toast.error('Por favor ingrese RUC o Razón Social');
      return;
    }

    if (ruc && ruc.length < 8) {
      toast.error('El RUC debe tener al menos 8 dígitos');
      return;
    }

    setIsSearching(true);
    setError(null);
    setClientData(null);

    try {
      // ✅ Consumir API real
      if (ruc) {
        console.log('🔍 Buscando cliente con RUC:', ruc);
        
        const data = await getClientByRuc(ruc.trim());
        
        console.log('✅ Cliente encontrado:', data);
        
        setClientData(data);
        
        toast.success('Cliente encontrado', {
          icon: '✅',
          duration: 2000,
        });
        
        if (onClientSelect) {
          onClientSelect(data);
        }
      } else {
        // Búsqueda por nombre (próximamente)
        toast.error('La búsqueda por Razón Social aún no está disponible. Por favor usa el RUC.');
      }
    } catch (err) {
      console.error('❌ Error en búsqueda:', err);
      
      const errorMessage = err.message || 'Error al buscar el cliente';
      setError(errorMessage);
      
      toast.error(errorMessage, {
        duration: 4000,
      });
      
      if (onClientSelect) {
        onClientSelect(null);
      }
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Limpiar formulario
   */
  const handleClear = () => {
    setRuc('');
    setRazonSocial('');
    setClientData(null);
    setError(null);
    
    if (onClientSelect) {
      onClientSelect(null);
    }
  };

  /**
   * Manejar Enter en inputs
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isSearching) {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Búsqueda */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div className="md:col-span-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Código / RUC *
          </label>
          <input
            type="text"
            value={ruc}
            onChange={(e) => setRuc(e.target.value.replace(/\D/g, ''))} // ✅ Solo números
            onKeyPress={handleKeyPress}
            placeholder="Ej: 2038085549"
            maxLength="11"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={isSearching}
          />
        </div>

        <div className="md:col-span-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Razón Social / Nombre
          </label>
          <input
            type="text"
            value={razonSocial}
            onChange={(e) => setRazonSocial(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ej: Alta Tecnología"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            disabled={isSearching}
          />
        </div>

        <div className="md:col-span-3 flex items-end gap-2">
          <button
            onClick={handleSearch}
            disabled={isSearching || (!ruc && !razonSocial)}
            className="flex-1 flex items-center justify-center gap-2 bg-[#334a5e] text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Buscando...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Buscar</span>
              </>
            )}
          </button>

          {(clientData || error) && (
            <button
              onClick={handleClear}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              disabled={isSearching}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Cliente no encontrado / Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Cliente no encontrado</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Información del Cliente */}
      {clientData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* DATOS DEL CLIENTE */}
          <InfoCard
            title="Datos del Cliente"
            subtitle="RUC OK"
            icon={<CheckCircle className="w-5 h-5" />}
            color="blue"
            data={[
              { label: 'Nombre Cliente', value: clientData.nombreCliente },
              { label: 'RUC', value: clientData.ruc },
              { label: 'Tipo Doc', value: clientData.tipoDoc },
              { label: 'Dirección', value: clientData.direccion },
              { label: 'Distrito', value: clientData.distrito },
              { label: 'Provincia', value: clientData.provincia },
              { label: 'Departamento', value: clientData.departamento },
              { label: 'Zona Cliente', value: clientData.zonaCliente },
              { label: 'Fecha Creación', value: clientData.fechaCreacion }
            ]}
          />

          {/* DATOS COMERCIALES */}
          <InfoCard
            title="Datos Comerciales"
            color="blue"
            data={[
              { label: 'Giro', value: clientData.giro },
              { label: 'Categoría', value: clientData.categoria },
              { label: 'Vendedor', value: clientData.vendedor },
              { label: 'Línea de Crédito (U$)', value: clientData.lineaCredito },
              { label: 'Crédito Disponible (U$)', value: clientData.creditoDisponible, highlight: 'green' },
              { label: 'Deuda Total (U$)', value: clientData.deudaTotal, highlight: 'red' },
              { label: 'Días Atraso', value: clientData.diasAtraso, highlight: clientData.diasAtraso !== '0' ? 'red' : undefined },
              { label: 'Cliente Mal Pagador', value: clientData.clienteMalPagador, highlight: clientData.clienteMalPagador === 'Sí' ? 'red' : undefined },
              { label: 'Situación Cartera', value: clientData.motivoMalPagador }
            ]}
          />

          {/* DATOS CONTACTO - 3 columnas */}
          <InfoCard
            title="Datos Contacto"
            color="blue"
            data={clientData.contactos || [
              { label: 'Teléfono', value: 'N/A' },
              { label: 'Email', value: 'N/A' },
              { label: 'Contacto', value: 'N/A' }
            ]}
          />

          {/* DATOS ECOMMERCE Y VENTAS */}
          <InfoCard
            title="Datos Ecommerce y Ventas"
            color="blue"
            data={[
              { label: 'Core Principal', value: clientData.corePrincipal || 'N/A' },
              { label: 'Venta Actual (Mes)', value: clientData.ventaActual || 'N/A' },
              { label: 'Venta Anterior', value: clientData.ventaAnterior || 'N/A' },
              { label: 'Promedio Vtas (Últ. 3 meses)', value: clientData.promedioVtas20212025 || 'N/A' },
              { label: 'Promedio Vtas 2025', value: clientData.promedioVtas2025 || 'N/A' },
              { label: 'Meses con Vtas 2025', value: clientData.mesesConVtas2025 || 'N/A' },
              { label: 'Promedio Vtas (2021-2025)', value: clientData.promedioVtas20212025 || 'N/A' },
              { label: 'Meses con Vtas (2021-2025)', value: clientData.mesesConVtas20212025 || 'N/A' }
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default ClientSearchPanel;
