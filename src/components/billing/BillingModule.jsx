// src/components/billing/BillingModule.jsx
import React from 'react';
import { FileText, Search, CalendarDays, Loader, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import SectionHeader from '../common/SectionHeader';
import BillingList from './BillingList';
import { useFacseg, intToInput, inputToInt } from '../../hooks/useFacseg';

const BillingModule = () => {
  const {
    ruc, setRuc,
    fechaDesde, setFechaDesde,
    fechaHasta, setFechaHasta,
    hoy,
    data, total, loading, error, buscado,
    sinAcceso,
    buscar, limpiar,
  } = useFacseg();

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

      {/* ── Panel de filtros ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-wrap items-end gap-4">

          {/* RUC / Documento */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
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
                onChange={e => setRuc(e.target.value.replace(/\D/g, ''))}
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

          {/* Desde */}
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

          {/* Hasta */}
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

          {/* Botón buscar */}
          <button
            onClick={buscar}
            disabled={!rucValido || loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white
              rounded-lg hover:bg-green-700 transition font-semibold text-sm
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? <Loader className="w-4 h-4 animate-spin" />
              : <Search className="w-4 h-4" />
            }
            Buscar
          </button>

          {/* Botón limpiar */}
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

          {/* Badge rango personalizado */}
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

        {/* Error genérico */}
        {error && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200
            rounded-lg text-red-700 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Sin acceso a cartera / Sin documentos en fechas */}
        {buscado && !error && total === 0 && (
          <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 text-sm">
                {sinAcceso
                  ? 'Cliente no encontrado en tu cartera'
                  : 'Sin documentos en este período'}
              </p>
              <p className="text-red-600 text-xs mt-0.5">
                {sinAcceso
                  ? 'Este RUC no pertenece a tu cartera de clientes.'
                  : 'No se encontraron documentos en el rango de fechas seleccionado.'}
              </p>
              {/* Sugerencia de ampliar fechas solo cuando no es problema de acceso */}
              {!sinAcceso && esFiltroFechaActivo && (
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

      {/* ── Lista: solo si tiene acceso y hay documentos ──────────────── */}
      {buscado && !sinAcceso && total > 0 && (
        <BillingList
          data={data}
          total={total}
          ruc={ruc}
          esFiltroFechaActivo={esFiltroFechaActivo}
          onResetFecha={handleResetFecha}
        />
      )}
    </div>
  );
};

export default BillingModule;