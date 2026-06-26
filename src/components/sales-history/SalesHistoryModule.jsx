import React from 'react';
import {
  Package,
  Search,
  CalendarDays,
  Loader2,
  AlertTriangle,
  X,
} from 'lucide-react';
import SectionHeader from '../common/SectionHeader';
import SalesHistoryList from './SalesHistoryList';
import { useSalesHistory, intToInput, inputToInt } from '../../hooks/useSalesHistory';

const SalesHistoryModule = () => {
  const {
    anio, setAnio,
    codigo, setCodigo,
    fechaDesde, setFechaDesde,
    fechaHasta, setFechaHasta,
    hoy,
    data, total, totalRaw,
    loading, error, buscado,
    buscar, limpiar,
  } = useSalesHistory();

  const codigoValido = codigo.trim().length >= 3;
  const esFiltroFechaActivo = buscado && total !== totalRaw;

  const anioActual = new Date().getFullYear();
  const inicioAnio = Number(`${anio}0101`);
  const finAnio = anio === anioActual ? hoy : Number(`${anio}1231`);

  const inicioAnioInput = intToInput(inicioAnio);
  const finAnioInput = intToInput(finAnio);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && codigoValido) buscar();
  };

  const handleResetFecha = () => {
    setFechaDesde(inicioAnio);
    setFechaHasta(finAnio);
  };

  const handleChangeAnio = (e) => {
    const nuevoAnio = Number(e.target.value);

    setAnio(nuevoAnio);

    if (!nuevoAnio || String(nuevoAnio).length !== 4) return;

    const nuevoInicio = Number(`${nuevoAnio}0101`);
    const nuevoFin = nuevoAnio === anioActual ? hoy : Number(`${nuevoAnio}1231`);

    setFechaDesde(nuevoInicio);
    setFechaHasta(nuevoFin);
  };

  const handleFechaDesdeChange = (e) => {
    const nuevaFecha = inputToInt(e.target.value);
    if (!nuevaFecha) return;

    const fechaNormalizada = Math.max(nuevaFecha, inicioAnio);
    setFechaDesde(fechaNormalizada);

    if (fechaHasta < fechaNormalizada) {
      setFechaHasta(fechaNormalizada);
    }
  };

  const handleFechaHastaChange = (e) => {
    const nuevaFecha = inputToInt(e.target.value);
    if (!nuevaFecha) return;

    const fechaNormalizada = Math.min(nuevaFecha, finAnio);
    setFechaHasta(fechaNormalizada);

    if (fechaDesde > fechaNormalizada) {
      setFechaDesde(fechaNormalizada);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Package}
        title="Venta Anual x Cod. Producto"
        subtitle="Consulta de ventas realizadas por código de producto"
        showButton={false}
      />

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[120px]">
            <label className="block text-sm font-medium text-gray-600 mb-2 tracking-wide">
              Año <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="2020"
              max="2099"
              value={anio}
              onChange={handleChangeAnio}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm
                focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>

          <div className="flex-1 min-w-[220px]">
            <label className="block text-sm font-medium text-gray-600 mb-2 tracking-wide">
              Código de producto <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Ej. 22.0.092.S57.167"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm
                  focus:ring-2 focus:ring-green-500 focus:border-transparent transition
                  ${codigo && !codigoValido ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
              />
            </div>
            {codigo && !codigoValido && (
              <p className="text-xs text-red-500 mt-1">Ingresa al menos 3 caracteres</p>
            )}
          </div>

          {buscado && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  <CalendarDays className="inline w-3.5 h-3.5 mr-1" />
                  Desde
                </label>
                <input
                  type="date"
                  value={intToInput(fechaDesde)}
                  onChange={handleFechaDesdeChange}
                  min={inicioAnioInput}
                  max={intToInput(fechaHasta) || finAnioInput}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                    focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Hasta
                </label>
                <input
                  type="date"
                  value={intToInput(fechaHasta)}
                  onChange={handleFechaHastaChange}
                  min={intToInput(fechaDesde) || inicioAnioInput}
                  max={finAnioInput}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                    focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          <button
            onClick={buscar}
            disabled={!codigoValido || loading}
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

          {buscado && esFiltroFechaActivo && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50
              border border-blue-200 rounded-lg text-xs text-blue-700 font-medium whitespace-nowrap">
              <CalendarDays className="w-3.5 h-3.5" />
              Rango personalizado
              <button
                onClick={handleResetFecha}
                className="ml-1 text-blue-400 hover:text-blue-700 font-bold leading-none"
                aria-label="Resetear rango"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {buscado && (
          <div className="mt-3 text-xs text-gray-500">
            Después de la primera búsqueda puedes ajustar el rango de fechas dentro del año {anio} y volver a buscar.
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200
            rounded-lg text-red-700 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {buscado && !loading && (
        <SalesHistoryList
          data={data}
          total={total}
          totalRaw={totalRaw}
          codigo={codigo.trim().toUpperCase()}
          esFiltroFechaActivo={esFiltroFechaActivo}
          onResetFecha={handleResetFecha}
        />
      )}
    </div>
  );
};

export default SalesHistoryModule;