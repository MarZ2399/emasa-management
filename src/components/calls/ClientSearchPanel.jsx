import React, { useState } from 'react';
import { Search, CheckCircle, AlertCircle } from 'lucide-react';
import { findClientByRuc, findClientByName } from '../../data/callsData';

const ClientSearchPanel = ({ onClientSelect }) => {
  const [ruc, setRuc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [clientData, setClientData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = () => {
    if (!ruc && !razonSocial) {
      alert('Por favor ingrese RUC o Razón Social');
      return;
    }

    setIsSearching(true);
    setNotFound(false);
    
    setTimeout(() => {
      let foundClient = null;
      
      // Buscar por RUC primero
      if (ruc) {
        foundClient = findClientByRuc(ruc);
      }
      
      // Si no se encontró por RUC, buscar por nombre
      if (!foundClient && razonSocial) {
        foundClient = findClientByName(razonSocial);
      }

      if (foundClient) {
        setClientData(foundClient);
        setNotFound(false);
        if (onClientSelect) {
          onClientSelect(foundClient);
        }
      } else {
        setClientData(null);
        setNotFound(true);
        if (onClientSelect) {
          onClientSelect(null);
        }
      }
      
      setIsSearching(false);
    }, 500);
  };

  const handleClear = () => {
    setRuc('');
    setRazonSocial('');
    setClientData(null);
    setNotFound(false);
    if (onClientSelect) {
      onClientSelect(null);
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
            onChange={(e) => setRuc(e.target.value)}
            placeholder="Ej: 2060467759"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
            placeholder="Ej: Alta Tecnología"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <div className="md:col-span-3 flex items-end gap-2">
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="flex-1 flex items-center justify-center gap-2 bg-[#334a5e] text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 font-medium"
          >
            <Search className="w-5 h-5" />
            <span>{isSearching ? 'Buscando...' : 'Buscar'}</span>
          </button>
          
          {(clientData || notFound) && (
            <button
              onClick={handleClear}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Cliente no encontrado */}
      {notFound && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Cliente no encontrado</h3>
            <p className="text-sm text-red-700 mt-1">
              No se encontró ningún cliente con el RUC o Razón Social ingresado. Verifica los datos e intenta nuevamente.
            </p>
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
              { label: 'Últ. Venta', value: clientData.ultVenta },
              { label: 'Línea de Crédito (U$)', value: clientData.lineaCredito },
              { label: 'Deuda Total (U$)', value: clientData.deudaTotal, highlight: 'red' },
              { label: 'Días Atraso', value: clientData.diasAtraso, highlight: 'red' },
              { label: 'Cliente Mal Pagador', value: clientData.clienteMalPagador, highlight: 'red' },
              { label: 'Motivo Mal Pagador', value: clientData.motivoMalPagador }
            ]}
          />

          {/* DATOS CONTACTO */}
          <InfoCard
            title="Datos Contacto"
            color="blue"
            data={[
              { label: 'Correo 1', value: clientData.correo1 },
              { label: 'Correo 2', value: clientData.correo2 || '-' },
              { label: 'Correo 3', value: clientData.correo3 || '-' },
              { label: 'Teléf. Padrón', value: clientData.telefPadron },
              { label: 'Teléf. TV', value: clientData.telefTV },
              { label: 'Reasignado a TV', value: clientData.reasignadoTV || '-', highlight: 'red' },
              { label: 'Televentas Actual', value: clientData.televentasActual || '-', highlight: 'red' }
            ]}
          />

          {/* DATOS ECOMMERCE Y VENTAS */}
          <InfoCard
            title="Datos Ecommerce y Ventas"
            color="blue"
            data={[
              { label: 'Usuario', value: clientData.usuario },
              { label: 'Clave', value: clientData.clave },
              { label: 'Core Principal', value: clientData.corePrincipal },
              { label: 'Promedio Vtas 2025', value: clientData.promedioVtas2025 },
              { label: 'Meses con Vtas 2025', value: clientData.mesesConVtas2025 },
              { label: 'Promedio Vtas (2021-2025)', value: clientData.promedioVtas20212025 },
              { label: 'Meses con Vtas (2021-2025)', value: clientData.mesesConVtas20212025 }
            ]}
          />
        </div>
      )}
    </div>
  );
};

// Componente reutilizable para las tarjetas de información
const InfoCard = ({ title, subtitle, icon, color, data }) => {
  const colors = {
    green: {
      border: 'border-[#2ecc70]',
      header: 'bg-[#2ecc70]',
      label: 'bg-[#2ecc70]/10'
    },
    blue: {
      border: 'border-[#334a5e]',
      header: 'bg-[#334a5e]',
      label: 'bg-[#334a5e]/10'
    }
  };

  const selectedColor = colors[color] || colors.green;

  return (
    <div className={`border ${selectedColor.border} rounded-lg overflow-hidden`}>
      <div className={`${selectedColor.header} text-white px-4 py-3 flex items-center justify-between`}>
        <h3 className="font-bold flex items-center gap-2">
          {icon}
          {title}
        </h3>
        {subtitle && (
          <span className="text-xs bg-white bg-opacity-20 px-3 py-1 rounded-full">
            {subtitle}
          </span>
        )}
      </div>
      <div className="p-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="grid grid-cols-3 gap-2 text-sm">
            <div className={`${selectedColor.label} px-3 py-2 rounded font-semibold ${
              item.highlight === 'red' ? 'text-red-700' : ''
            }`}>
              {item.label}
            </div>
            <div className={`col-span-2 px-3 py-2 bg-gray-50 rounded ${
              item.highlight === 'red' ? 'font-semibold text-red-700' : ''
            }`}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientSearchPanel;
