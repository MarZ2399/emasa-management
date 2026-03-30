import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { listOrders } from '../services/orderService';

export const useOrders = () => {
  const { user } = useContext(AuthContext);
  const [orders,         setOrders]         = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [soloPendientes, setSoloPendientes] = useState(true); // ← default: activo

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

  // Filtro aplicado: pendientes = fase < 50
  const ordenesFiltradas = soloPendientes
    ? orders.filter(o => o.codfase < 50)
    : orders;

  useEffect(() => { fetchOrders(); }, [user]);

  return {
    orders: ordenesFiltradas,   // ← ya viene filtrado
    allOrders: orders,          // ← por si necesitas el total sin filtro
    loading,
    error,
    soloPendientes,
    setSoloPendientes,
    refetch: fetchOrders,
  };
};
