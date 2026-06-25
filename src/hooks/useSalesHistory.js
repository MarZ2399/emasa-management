import { useState, useCallback, useMemo } from 'react';
import { salesHistoryService } from '../services/salesHistoryService';

const dateToInt = (date) =>
  date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

const todayInt = () => dateToInt(new Date());

export const intToInput = (n) => {
  if (!n) return '';
  const s = String(n).padStart(8, '0');
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
};

export const inputToInt = (s) => (s ? Number(s.replace(/-/g, '')) : null);

export const useSalesHistory = () => {
  const hoy = todayInt();
  const currentYear = new Date().getFullYear();
  const inicioAnio = Number(`${currentYear}0101`);

  const [anio, setAnio] = useState(currentYear);
  const [codigo, setCodigo] = useState('');
  const [fechaDesde, setFechaDesde] = useState(inicioAnio);
  const [fechaHasta, setFechaHasta] = useState(hoy);

  const [rawData, setRawData] = useState([]);
  const [totalRaw, setTotalRaw] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [buscado, setBuscado] = useState(false);

  const buscar = useCallback(async () => {
    const codigoTrim = codigo.trim().toUpperCase();

    if (!anio || String(anio).length !== 4) {
      setError('Ingresa un año válido');
      return;
    }

    if (!codigoTrim) {
      setError('Ingresa el código de producto');
      return;
    }

    setError(null);
    setLoading(true);
    setBuscado(false);
    setRawData([]);
    setTotalRaw(0);

    try {
      const { total, data } = await salesHistoryService.getSalesHistory(anio, codigoTrim);
      setRawData(data);
      setTotalRaw(total);
      setBuscado(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al consultar historial de ventas');
      setRawData([]);
      setTotalRaw(0);
      setBuscado(true);
    } finally {
      setLoading(false);
    }
  }, [anio, codigo]);

  const limpiar = useCallback(() => {
    const currentYearNow = new Date().getFullYear();
    setAnio(currentYearNow);
    setCodigo('');
    setFechaDesde(Number(`${currentYearNow}0101`));
    setFechaHasta(todayInt());
    setRawData([]);
    setTotalRaw(0);
    setError(null);
    setBuscado(false);
  }, []);

  const data = useMemo(() => {
    return rawData.filter((item) => {
      const fecha = Number(item.ddcmt || 0);
      return (!fechaDesde || fecha >= fechaDesde) && (!fechaHasta || fecha <= fechaHasta);
    });
  }, [rawData, fechaDesde, fechaHasta]);

  return {
    anio,
    setAnio,
    codigo,
    setCodigo,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    hoy,
    data,
    rawData,
    total: data.length,
    totalRaw,
    loading,
    error,
    buscado,
    buscar,
    limpiar,
  };
};