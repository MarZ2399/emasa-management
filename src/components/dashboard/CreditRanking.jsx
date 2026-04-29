// src/modules/dashboard/CreditRanking.jsx
import { useEffect, useState } from 'react';
import { Users, AlertCircle, X, TrendingDown } from 'lucide-react';
import { followService } from '../../services/followService';

const fmt = (v) =>
  Number(v || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CreditRanking({ selectedCore,codigoVendor, onClose }) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!selectedCore?.METGRP) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setData([]);
      try {
        const res = await followService.getCreditRanking({ metgrp: selectedCore.METGRP, codigo: codigoVendor || undefined });
        const raw = res?.data ?? res;
        setData(Array.isArray(raw) ? raw : []);
      } catch (e) {
        setError(e.response?.data?.msgerror || e.response?.data?.error || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCore]);

  if (!selectedCore) return null;

  const noComprados = Array.isArray(data) ? data.filter(c => Number(c.ACTUAL) === 0) : [];
  const siComprados = Array.isArray(data) ? data.filter(c => Number(c.ACTUAL) > 0)  : [];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────── */}
<div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
  <div>
    <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
      Ranking de Crédito — {selectedCore.METGRD}
    </h3>
    <p className="text-xs text-gray-400 mt-0.5">
      Clientes con línea de crédito activa · Grupo {String(selectedCore.METGRP).padStart(3, '0')}
    </p>
  </div>

  <div className="flex items-center gap-3">
    {noComprados.length > 0 && !loading && (
      <span className="flex items-center gap-1.5 bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-red-200">
        <TrendingDown className="w-3 h-3" />
        {noComprados.length} sin compra este mes
      </span>
    )}
    {siComprados.length > 0 && !loading && (
      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200">
        {siComprados.length} activos
      </span>
    )}
    <button
      onClick={onClose}
      className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded"
      title="Cerrar"
    >
      <X className="w-4 h-4" />
    </button>
  </div>
</div>

{/* ── Body ───────────────────────────────────────────────── */}
{loading ? (
  <div className="flex items-center justify-center py-16 text-gray-400 gap-3">
    <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
    <span className="text-sm">Cargando ranking...</span>
  </div>

) : error ? (
  <div className="flex items-center justify-center gap-2 py-12 text-red-500">
    <AlertCircle className="w-5 h-5" />
    <span className="text-sm">{error}</span>
  </div>

) : data.length === 0 ? (
  <div className="text-center py-12 text-gray-400 text-sm">
    No hay clientes con línea de crédito para este core.
  </div>

) : (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="bg-gradient-to-r from-[#5982A6] to-[#1a2f3d]">
        <tr>
          <th className="px-4 py-3 text-left   text-xs font-semibold text-white/90 uppercase tracking-wider">#</th>
          <th className="px-4 py-3 text-left   text-xs font-semibold text-white/90 uppercase tracking-wider">Cliente</th>
          <th className="px-4 py-3 text-center text-xs font-semibold text-white/90 uppercase tracking-wider">Estado</th>
          <th className="px-4 py-3 text-right  text-xs font-semibold text-white/90 uppercase tracking-wider">Prom. 3 meses</th>
          <th className="px-4 py-3 text-right  text-xs font-semibold text-white/90 uppercase tracking-wider">Mes anterior</th>
          <th className="px-4 py-3 text-right  text-xs font-semibold text-white/90 uppercase tracking-wider">Compra actual</th>
          <th className="px-4 py-3 text-right  text-xs font-semibold text-white/90 uppercase tracking-wider">Disponible</th>
        </tr>
      </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((c, i) => {
                const sinCompra  = Number(c.ACTUAL) === 0;
                const disponible = Number(c.DISPONIBLE);

                return (
                  <tr
                    key={`${c.RUC11}-${i}`}
                    className={`transition-colors ${
                      sinCompra
                        ? 'bg-red-50/60 hover:bg-red-50'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs w-8">
                      {i + 1}
                    </td>

                    <td className="px-4 py-3">
                      <p className={`font-medium ${sinCompra ? 'text-red-700' : 'text-gray-800'}`}>
                        { c.TSCLIE }
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">{c.RUC11}</p>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.SITCAR === 'ACTIVA'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {c.SITCAR}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right font-mono text-gray-700">
                      {fmt(c.PROM03)}
                    </td>

                    <td className="px-4 py-3 text-right font-mono text-gray-500">
                      {fmt(c.MES01)}
                    </td>

                    <td className={`px-4 py-3 text-right font-mono font-semibold ${
                      sinCompra ? 'text-red-500' : 'text-green-600'
                    }`}>
                      {fmt(c.ACTUAL)}
                    </td>

                    <td className={`px-4 py-3 text-right font-mono text-xs ${
                      disponible < 0 ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {fmt(c.DISPONIBLE)}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {data.length > 0 && (
              <tfoot>
                <tr className="bg-gray-100 border-t-2 border-gray-300 font-bold">
                  <td colSpan={3} className="px-4 py-3 text-gray-700 text-xs">
                    {data.length} clientes · {noComprados.length} sin compra
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-800">
                    {fmt(data.reduce((s, c) => s + Number(c.PROM03 || 0), 0))}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-800">
                    {fmt(data.reduce((s, c) => s + Number(c.MES01 || 0), 0))}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-800">
                    {fmt(data.reduce((s, c) => s + Number(c.ACTUAL || 0), 0))}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-800">
                    {fmt(data.reduce((s, c) => s + Number(c.DISPONIBLE || 0), 0))}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}