import { useMemo, useState } from 'react';
import reportService from '../services/reportService';

const formatearFechaInput = (fecha) => {
  return fecha.toISOString().split('T')[0];
};

const obtenerHoy = () => {
  return formatearFechaInput(new Date());
};

const obtenerInicioMesActual = () => {
  const ahora = new Date();
  return formatearFechaInput(new Date(ahora.getFullYear(), ahora.getMonth(), 1));
};

export const useCallReport = () => {
  const [fechaDesde, setFechaDesde] = useState(obtenerInicioMesActual);
  const [fechaHasta, setFechaHasta] = useState(obtenerHoy);
  const [vendedor, setVendedor] = useState('');
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalRaw, setTotalRaw] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [buscado, setBuscado] = useState(false);

  const vendedores = useMemo(() => {
    const map = new Map();

    data.forEach((row) => {
      const key = row.id_asesor || row.codigo_vend || row.nom_asesor;
      const label = row.nom_asesor || row.codigo_vend || 'Sin asesor';

      if (key && !map.has(String(key))) {
        map.set(String(key), {
          value: String(key),
          label,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.label.localeCompare(b.label, 'es', { sensitivity: 'base' })
    );
  }, [data]);

  const buscar = async () => {
    try {
      setLoading(true);
      setError('');
      setBuscado(true);

      const resp = await reportService.getReporteLlamadas({
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
        vendedor,
      });

      setData(resp.data || []);
      setTotal(resp.total || 0);
      setTotalRaw(resp.total || 0);
    } catch (e) {
      setError(e?.response?.data?.message || 'Error al consultar el reporte de llamadas');
      setData([]);
      setTotal(0);
      setTotalRaw(0);
    } finally {
      setLoading(false);
    }
  };

  const limpiar = () => {
    setFechaDesde(obtenerInicioMesActual());
    setFechaHasta(obtenerHoy());
    setVendedor('');
    setData([]);
    setTotal(0);
    setTotalRaw(0);
    setError('');
    setBuscado(false);
  };

  const filtrarData = useMemo(() => {
    if (!vendedor) return data;

    return data.filter((row) => {
      const key = String(row.id_asesor || row.codigo_vend || row.nom_asesor || '');
      return key === String(vendedor);
    });
  }, [data, vendedor]);

  return {
    loading,
    error,
    buscado,
    data: filtrarData,
    total: filtrarData.length,
    totalRaw,
    vendedores,
    vendedor,
    setVendedor,
    fechaDesde,
    fechaHasta,
    setFechaDesde,
    setFechaHasta,
    buscar,
    limpiar,
  };
};