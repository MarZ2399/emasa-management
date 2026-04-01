// src/hooks/useFacseg.js
import { useState, useCallback } from 'react';
import { facsegService } from '../services/facseg-service';

// ── Helpers ────────────────────────────────────────────────────────────────────
const todayInt = () => {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
};

export const intToInput = (n) => {
  if (!n) return '';
  const s = String(n).padStart(8, '0');
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
};

export const inputToInt = (s) => (s ? Number(s.replace(/-/g, '')) : null);

// ── Hook ───────────────────────────────────────────────────────────────────────
export const useFacseg = () => {
  const hoy = todayInt();

  const [ruc,        setRuc]        = useState('');
  const [fechaDesde, setFechaDesde] = useState(hoy);
  const [fechaHasta, setFechaHasta] = useState(hoy);
  const [data,       setData]       = useState([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [buscado,    setBuscado]    = useState(false);

  const buscar = useCallback(async () => {
    const rucTrim = ruc.trim();
    if (rucTrim.length < 7 || rucTrim.length > 11) {
      setError('El RUC/documento debe tener entre 7 y 11 caracteres');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { total, data } = await facsegService.getFacseg(
        rucTrim,
        fechaDesde,
        fechaHasta
      );
      setData(data);
      setTotal(total);
      setBuscado(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al consultar');
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [ruc, fechaDesde, fechaHasta]);

  const limpiar = useCallback(() => {
    setRuc('');
    setFechaDesde(hoy);
    setFechaHasta(hoy);
    setData([]);
    setTotal(0);
    setError(null);
    setBuscado(false);
  }, [hoy]);

  return {
    // filtros
    ruc,        setRuc,
    fechaDesde, setFechaDesde,
    fechaHasta, setFechaHasta,
    hoy,
    // resultados
    data, total, loading, error, buscado,
    // acciones
    buscar, limpiar,
  };
};