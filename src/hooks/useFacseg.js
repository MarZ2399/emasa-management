// src/hooks/useFacseg.js
import { useState, useCallback, useRef } from 'react';
import { facsegService } from '../services/facseg-service';

// ── Helpers ────────────────────────────────────────────────────────────────────
const dateToInt = (date) =>
  date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

const todayInt = () => dateToInt(new Date());

const daysAgoInt = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return dateToInt(d);
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
  const desdeInicial = daysAgoInt(3);

  const [ruc, setRuc] = useState('');
  const [fechaDesde, setFechaDesde] = useState(desdeInicial);
  const [fechaHasta, setFechaHasta] = useState(hoy);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [buscado, setBuscado] = useState(false);
  const [sinAcceso, setSinAcceso] = useState(false);
  const [enCartera, setEnCartera] = useState(null);

  // ── Buscador sensitivo por nombre ──────────────────────────────────────────
  const [nombreInput, setNombreInput] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [rucBuscado, setRucBuscado] = useState('');
  const [nombreBuscado, setNombreBuscado] = useState('');
  const debounceRef = useRef(null);
  const rucDesdeSelector = useRef(false);

  const handleNombreChange = useCallback((texto) => {
    setNombreInput(texto);
    setSugerencias([]);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (texto.trim().length < 2) return;

    debounceRef.current = setTimeout(async () => {
      try {
        setLoadingSearch(true);
        const data = await facsegService.searchClientes(texto);
        setSugerencias(data);
      } catch (err) {
        console.error('Error buscando clientes:', err);
        setSugerencias([]);
      } finally {
        setLoadingSearch(false);
      }
    }, 350);
  }, []);

  // Al seleccionar del dropdown → rellena RUC automáticamente
  const handleSelectCliente = useCallback((cliente) => {
    rucDesdeSelector.current = true;
    setNombreInput(cliente.nombre);
    setRuc(cliente.ruc);
    setSugerencias([]);
  }, []);

  const handleRucChange = useCallback((valor) => {
    rucDesdeSelector.current = false;
    setRuc(valor.replace(/\D/g, ''));
    setNombreInput('');
    setSugerencias([]);
  }, []);

  // Cierra el dropdown al perder foco
  const handleNombreBlur = useCallback(() => {
    setTimeout(() => setSugerencias([]), 150);
  }, []);

  // ── Buscar facturas ────────────────────────────────────────────────────────
  const buscar = useCallback(async () => {
    const rucTrim = ruc.trim();

    if (rucTrim.length < 7 || rucTrim.length > 11) {
      setError('El RUC/documento debe tener entre 7 y 11 caracteres');
      return;
    }

    setError(null);
    setSinAcceso(false);
    setBuscado(false);
    setData([]);
    setTotal(0);
    setLoading(true);

    try {
      const { total, data, sinAcceso, enCartera } = await facsegService.getFacseg(
        rucTrim,
        fechaDesde,
        fechaHasta
      );

      setData(data);
      setTotal(total);
      setBuscado(true);
      setSinAcceso(sinAcceso ?? false);
      setEnCartera(enCartera ?? null);
      setRucBuscado(rucTrim);
      setNombreBuscado(nombreInput);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al consultar');
      setData([]);
      setTotal(0);
      setSinAcceso(false);
      setBuscado(true);
    } finally {
      setLoading(false);
    }
  }, [ruc, fechaDesde, fechaHasta, nombreInput]);

  const limpiar = useCallback(() => {
    setRuc('');
    setNombreInput('');
    setSugerencias([]);
    setFechaDesde(daysAgoInt(3));
    setFechaHasta(todayInt());
    setData([]);
    setTotal(0);
    setError(null);
    setBuscado(false);
    setSinAcceso(false);
    setRucBuscado('');
    setNombreBuscado('');
  }, []);

  return {
    // filtros
    ruc,
    setRuc,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    hoy,

    // resultados
    data,
    total,
    loading,
    error,
    buscado,
    sinAcceso,
    enCartera,

    // acciones
    buscar,
    limpiar,

    // buscador por nombre
    nombreInput,
    sugerencias,
    loadingSearch,
    handleNombreChange,
    handleSelectCliente,
    handleNombreBlur,
    rucBuscado,
    handleRucChange,
    nombreBuscado,
  };
};