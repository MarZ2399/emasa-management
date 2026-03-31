import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { listOrders } from '../services/orderService';

const FASES_EXCLUIDAS = [50, 15, 5]; // FACTURADO, ANULADO, ABR/RCH VTA

export const useOrders = () => {
  const { user } = useContext(AuthContext);
  const [orders,         setOrders]         = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [soloPendientes, setSoloPendientes] = useState(true);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const response = await listOrders();
      if (response.success) setOrders(response.data);
    } catch (err) {
      setError(err.message || 'Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  // Excluye: FACTURADO (50), ANULADO (15), ABR/RCH VTA (5)
  const ordenesFiltradas = soloPendientes
    ? orders.filter(o => !FASES_EXCLUIDAS.includes(o.codfase))
    : orders;

  useEffect(() => { fetchOrders(); }, [user]);

  return {
    orders: ordenesFiltradas,
    allOrders: orders,
    loading,
    error,
    soloPendientes,
    setSoloPendientes,
    refetch: fetchOrders,
  };
};