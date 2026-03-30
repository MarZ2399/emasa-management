import { useState, useEffect } from 'react';
import { listOrders } from '../services/orderService';

const useOrders = ({ diasAtras = 7, almacenes } = {}) => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listOrders({ diasAtras, almacenes });
      if (response.success) {
        setOrders(response.data);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [diasAtras, almacenes]);

  return { orders, loading, error, refetch: fetchOrders };
};

export default useOrders;
