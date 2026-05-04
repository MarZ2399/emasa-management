// src/hooks/useTransportistas.js
import { useState, useEffect } from 'react';
import { getTransportistasByZona } from '../services/as400CatalogService';

const useTransportistas = (zona) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!zona) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTransportistasByZona(zona);
        setOptions(
          data
            .filter(t => t.nombre !== '')       //  excluir registros vacíos
            .map(t => ({
              value: String(t.codigo),           //  CRUCTR como ID único
              label: t.nombre,
            }))
        );
      } catch (err) {
        console.error('Error cargando transportistas:', err);
        setError('No se pudieron cargar los transportistas');
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [zona]);

  return { options, loading, error };
};

export default useTransportistas;
