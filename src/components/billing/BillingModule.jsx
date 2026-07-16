// src/components/billing/BillingModule.jsx
import React, { useRef, useEffect } from 'react';
import { FileText, Search, CalendarDays, Loader2, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import SectionHeader from '../common/SectionHeader';
import BillingList from './BillingList';
import { useFacseg, intToInput, inputToInt } from '../../hooks/useFacseg';
import AccountStatementPanel from './AccountStatementPanel';

const BillingModule = () => {
  const {
    ruc, setRuc,
    fechaDesde, setFechaDesde,
    fechaHasta, setFechaHasta,
    hoy,
    data, total, loading, error, buscado,
    sinAcceso,
    enCartera,
    buscar, limpiar,
    nombreInput,
    sugerencias,
    loadingSearch,
    handleNombreChange,
    handleSelectCliente,
    handleNombreBlur,
    rucBuscado,
    handleRucChange,
    nombreBuscado 
  } = useFacseg();

  // ── ref para cerrar dropdown al click afuera ──
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        handleNombreBlur();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const rucValido           = ruc.trim().length >= 7 && ruc.trim().length <= 11;
  const esFiltroFechaActivo = fechaDesde !== hoy || fechaHasta !== hoy;

  const handleKeyDown    = (e) => { if (e.key === 'Enter' && rucValido) buscar(); };
  const handleResetFecha = () => { setFechaDesde(hoy); setFechaHasta(hoy); };

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={FileText}
        title="Facturación"
        subtitle="Consulta de documentos emitidos por cliente"
        showButton={false}
      />

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-wrap items-end gap-4">
          {/* ── RUC / Documento ── */}
          <div className="flex-1 min-w-[160px]">
            <label className="block text-sm font-medium text-gray-600 mb-2 tracking-wide">
              RUC / N° Documento <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                inputMode="numeric"
                maxLength={11}
                placeholder="7 – 11 dígitos"
                value={ruc}
                onChange={e => handleRucChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm
                  focus:ring-2 focus:ring-green-500 focus:border-transparent transition
                  ${ruc && !rucValido ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
              />
            </div>
            {ruc && !rucValido && (
              <p className="text-xs text-red-500 mt-1">Ingresa entre 7 y 11 dígitos</p>
            )}
          </div>
          {/* ── Buscador por nombre ── */}
          <div className="flex-1 min-w-[200px] relative" ref={dropdownRef}>
            
            <label className="block text-sm font-medium text-gray-600 mb-2 tracking-wide">
              Razón Social / Nombre
            </label>
            <div className="relative">
              <input
                type="text"
                value={nombreInput}
                onChange={e => handleNombreChange(e.target.value)}
                placeholder="Escribe para buscar..."
                autoComplete="off"
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm
                  focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
              {loadingSearch && (
                <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-gray-400" />
              )}
            </div>

            {sugerencias.length > 0 && (
              <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg
                shadow-lg mt-1 max-h-60 overflow-y-auto">
                {sugerencias.map((cliente, idx) => (
                  <li
                    key={`${cliente.ruc}-${idx}`}
                    onMouseDown={() => handleSelectCliente(cliente)}
                    className="px-4 py-2.5 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-0"
                  >
                    <p className="text-sm font-semibold text-gray-800">{cliente.nombre}</p>
                    <p className="text-xs text-gray-500">RUC: {cliente.ruc}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          

          {/* ── Desde ── */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              <CalendarDays className="inline w-3.5 h-3.5 mr-1" />Desde
            </label>
            <input
              type="date"
              value={intToInput(fechaDesde)}
              onChange={e => setFechaDesde(inputToInt(e.target.value))}
              max={intToInput(fechaHasta) || undefined}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* ── Hasta ── */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Hasta
            </label>
            <input
              type="date"
              value={intToInput(fechaHasta)}
              onChange={e => setFechaHasta(inputToInt(e.target.value))}
              min={intToInput(fechaDesde) || undefined}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* ── Botón buscar ── */}
          <button
            onClick={buscar}
            disabled={!rucValido || loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white
              rounded-lg hover:bg-green-700 transition font-semibold text-sm
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Search className="w-4 h-4" />
            }
            Buscar
          </button>

          {/* ── Botón limpiar ── */}
          {buscado && (
            <button
              onClick={limpiar}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-gray-300
                text-gray-600 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              <X className="w-4 h-4" />
              Limpiar
            </button>
          )}

          {/* ── Badge rango personalizado ── */}
          {esFiltroFechaActivo && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50
              border border-blue-200 rounded-lg text-xs text-blue-700 font-medium whitespace-nowrap">
              <CalendarDays className="w-3.5 h-3.5" />
              Rango personalizado
              <button
                onClick={handleResetFecha}
                className="ml-1 text-blue-400 hover:text-blue-700 font-bold leading-none"
                aria-label="Volver a hoy"
              >×</button>
            </div>
          )}
        </div>

        {/* ── Error genérico ── */}
        {error && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200
            rounded-lg text-red-700 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* ── Sin acceso / Sin documentos ── */}
{buscado && !error && total === 0 && (
  <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
    <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
    <div>
      <p className="font-semibold text-red-800 text-sm">
        {enCartera === false
          ? 'Cliente no encontrado en tu cartera'
          : 'Sin documentos en este período'}
      </p>
      <p className="text-red-600 text-xs mt-0.5">
        {enCartera === false
          ? 'Este RUC no pertenece a tu cartera de clientes.'
          : 'No se encontraron documentos en el rango de fechas seleccionado.'}
      </p>
      {enCartera !== false && esFiltroFechaActivo && (
        <button
          onClick={handleResetFecha}
          className="mt-2 text-xs text-blue-600 underline hover:text-blue-800"
        >
          Volver a hoy
        </button>
      )}
    </div>
  </div>
)}
      </div>

{/* ── Estado de cuenta ── */}
{buscado && !loading && !sinAcceso && rucValido && (
  <AccountStatementPanel ruc={rucBuscado} nombreCliente={nombreBuscado} />
)}

{/* ── Lista de resultados ── */}
{buscado && !loading && enCartera !== false && total > 0 && (
  <BillingList
    data={data}
    total={total}
    ruc={rucBuscado} 
    esFiltroFechaActivo={esFiltroFechaActivo}
    onResetFecha={handleResetFecha}
  />
)}
    </div>
  );
};

export default BillingModule;