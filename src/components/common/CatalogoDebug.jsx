// src/components/common/CatalogoDebug.jsx
import React, { useState, useEffect } from 'react';
import { getCatalogo, getCatalogos } from '../../services/catalogoService';

const Badge = ({ children, ok }) => (
  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${
    ok ? 'bg-green-100 text-green-800 border-green-300'
       : 'bg-red-100 text-red-800 border-red-300'
  }`}>
    {children}
  </span>
);

const CatalogoTable = ({ titulo, items = [], error = null }) => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="bg-[#334a5e] text-white px-4 py-2 flex items-center justify-between">
      <span className="font-semibold text-sm">{titulo}</span>
      <Badge ok={!error && items.length > 0}>{error ? 'ERROR' : `${items.length} items`}</Badge>
    </div>
    {error && (
      <div className="p-3 bg-red-50 text-red-700 text-xs font-mono">{error}</div>
    )}
    {!error && items.length === 0 && (
      <div className="p-4 text-center text-xs text-gray-400">
        ⚠️ Array vacío — el endpoint responde pero no hay datos para este tipo_tabla
      </div>
    )}
    {items.length > 0 && (
      <table className="w-full text-xs">
        <thead className="bg-gray-50">
          <tr>
            {['value', 'typeof value', 'codigo', 'label', 'descripcion'].map(h => (
              <th key={h} className="px-3 py-2 text-left font-semibold text-gray-600">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-3 py-2 font-mono font-bold text-blue-700">{String(item.value)}</td>
              <td className="px-3 py-2">
                <Badge ok={typeof item.value === 'number'}>
                  {typeof item.value === 'number' ? '✅ number' : '❌ ' + typeof item.value}
                </Badge>
              </td>
              <td className="px-3 py-2 font-mono text-gray-500">{item.codigo ?? '—'}</td>
              <td className="px-3 py-2 font-medium">{item.label}</td>
              <td className="px-3 py-2 text-gray-500">{item.descripcion ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

const CatalogoDebug = () => {
  const [multi,   setMulti]   = useState({ loading: false, raw: null, error: null, tipos: {}, resultado: {} });
  const [single,  setSingle]  = useState({ loading: false, items: [], error: null, tipo: 'TIPO_CONTACTO' });
  const [custom,  setCustom]  = useState({ loading: false, items: [], error: null, tipo: '' });

  // ── Test múltiple — corre automáticamente ───────────────────────────────────
  const runMulti = async () => {
    setMulti(p => ({ ...p, loading: true, error: null, raw: null }));
    try {
      const r = await getCatalogos(['TIPO_CONTACTO', 'RESULTADO_GESTION']);
      console.log('🔵 getCatalogos raw:', r);
      setMulti({
        loading:   false,
        raw:       r,
        error:     null,
        tipos:     r.data?.TIPO_CONTACTO    ?? [],
        resultado: r.data?.RESULTADO_GESTION ?? [],
      });
    } catch (e) {
      console.error('🔴 getCatalogos error:', e);
      setMulti(p => ({ ...p, loading: false, error: e.message }));
    }
  };

  // ── Test individual ─────────────────────────────────────────────────────────
  const runSingle = async () => {
    setSingle(p => ({ ...p, loading: true, error: null }));
    try {
      const r = await getCatalogo(single.tipo);
      console.log(`🟡 getCatalogo(${single.tipo}) raw:`, r);
      setSingle(p => ({ ...p, loading: false, items: r.data ?? [], error: null }));
    } catch (e) {
      setSingle(p => ({ ...p, loading: false, error: e.message }));
    }
  };

  // ── Test custom ─────────────────────────────────────────────────────────────
  const runCustom = async () => {
    if (!custom.tipo.trim()) return;
    setCustom(p => ({ ...p, loading: true, error: null }));
    try {
      const r = await getCatalogo(custom.tipo.trim().toUpperCase());
      console.log(`🟢 getCatalogo(${custom.tipo}) raw:`, r);
      setCustom(p => ({ ...p, loading: false, items: r.data ?? [], error: null }));
    } catch (e) {
      setCustom(p => ({ ...p, loading: false, error: e.message }));
    }
  };

  useEffect(() => { runMulti(); }, []);

  const btn = 'px-4 py-2 bg-[#334a5e] hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50';
  const inp = 'px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">🔍 Debug — Catálogos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Verifica que <code className="bg-gray-100 px-1 rounded text-xs">/api/catalogos</code> retorna
            los <strong>id_parametro</strong> correctos como <strong>number</strong>.
          </p>
        </div>

        {/* ── Test 1: múltiple ── */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900">Test 1 — getCatalogos (múltiple)</h2>
              <code className="text-xs text-gray-400">GET /api/catalogos?tipos=TIPO_CONTACTO,RESULTADO_GESTION</code>
            </div>
            <button onClick={runMulti} disabled={multi.loading} className={btn}>
              {multi.loading ? '⏳ Cargando...' : '▶ Ejecutar'}
            </button>
          </div>
          <div className="p-5 space-y-4">
            {multi.error && (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-xs text-red-700 font-mono">
                ❌ {multi.error}
              </div>
            )}
            {multi.raw && (
              <>
                {/* Estado rápido */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded p-3 text-center">
                    <p className="text-xs text-gray-500">success</p>
                    <Badge ok={multi.raw.success}>{String(multi.raw.success)}</Badge>
                  </div>
                  <div className="bg-gray-50 rounded p-3 text-center">
                    <p className="text-xs text-gray-500">TIPO_CONTACTO items</p>
                    <Badge ok={multi.tipos.length > 0}>{multi.tipos.length}</Badge>
                  </div>
                  <div className="bg-gray-50 rounded p-3 text-center">
                    <p className="text-xs text-gray-500">RESULTADO_GESTION items</p>
                    <Badge ok={multi.resultado.length > 0}>{multi.resultado.length}</Badge>
                  </div>
                </div>

                {/* Tablas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CatalogoTable titulo="TIPO_CONTACTO"    items={multi.tipos}     error={multi.error} />
                  <CatalogoTable titulo="RESULTADO_GESTION" items={multi.resultado} error={multi.error} />
                </div>

                {/* JSON raw */}
                <details className="text-xs">
                  <summary className="cursor-pointer text-gray-500 hover:text-gray-700 font-medium">
                    Ver JSON raw completo
                  </summary>
                  <pre className="mt-2 bg-gray-50 border border-gray-200 rounded p-3 overflow-x-auto">
                    {JSON.stringify(multi.raw, null, 2)}
                  </pre>
                </details>
              </>
            )}
          </div>
        </div>

        {/* ── Test 2: individual ── */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900">Test 2 — getCatalogo (individual)</h2>
              <code className="text-xs text-gray-400">GET /api/catalogos/:tipo</code>
            </div>
            <div className="flex gap-2">
              <select className={inp} value={single.tipo}
                onChange={e => setSingle(p => ({ ...p, tipo: e.target.value }))}>
                <option value="TIPO_CONTACTO">TIPO_CONTACTO</option>
                <option value="RESULTADO_GESTION">RESULTADO_GESTION</option>
                <option value="TIPO_DOCUMENTO">TIPO_DOCUMENTO</option>
              </select>
              <button onClick={runSingle} disabled={single.loading} className={btn}>
                {single.loading ? '⏳' : '▶ Ejecutar'}
              </button>
            </div>
          </div>
          <div className="p-5">
            {single.error && (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-xs text-red-700 font-mono mb-3">
                ❌ {single.error}
              </div>
            )}
            {single.items.length > 0 && (
              <CatalogoTable titulo={single.tipo} items={single.items} />
            )}
          </div>
        </div>

        {/* ── Test 3: custom ── */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900">Test 3 — Tipo personalizado</h2>
              <code className="text-xs text-gray-400">Prueba cualquier tipo_tabla</code>
            </div>
            <div className="flex gap-2">
              <input className={inp} placeholder="Ej: TIPO_DOCUMENTO"
                value={custom.tipo}
                onChange={e => setCustom(p => ({ ...p, tipo: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && runCustom()} />
              <button onClick={runCustom} disabled={custom.loading || !custom.tipo.trim()} className={btn}>
                {custom.loading ? '⏳' : '▶ Ejecutar'}
              </button>
            </div>
          </div>
          <div className="p-5">
            {custom.error && (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-xs text-red-700 font-mono mb-3">
                ❌ {custom.error}
              </div>
            )}
            {custom.items.length > 0 && (
              <CatalogoTable titulo={custom.tipo.toUpperCase()} items={custom.items} />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CatalogoDebug;
