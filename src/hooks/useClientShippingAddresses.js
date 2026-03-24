// src/hooks/useClientShippingAddresses.js
import { useState, useEffect } from 'react';
import { getAddressesByCliente } from '../services/shippingAddressCliService';
import { getClientShippingInfo }  from '../services/customerService';

const useClientShippingAddresses = (rucCli) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  useEffect(() => {
    if (!rucCli) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [saved, as400] = await Promise.all([
          getAddressesByCliente(rucCli),
          getClientShippingInfo(rucCli),
        ]);

        const combined = [];

        // 1️⃣ Dirección AS400 siempre primero
        if (as400.direccion) {
          combined.push({
            id:              'as400',
            rucCli,
            direccion:       as400.direccion,
            ubigeoDepto:     as400.ubigeoDepto,
            ubigeoProvinca:  as400.ubigeoProvinca,
            ubigeoDistrito:  as400.ubigeoDistrito,
            deptoNombre:     as400.deptoNombre,
            provinciaNombre: as400.provinciaNombre,
            distritoNombre:  as400.distritoNombre,
            isDefault:       1,
            source:          'as400',
          });
        }

        // 2️⃣ Luego direcciones guardadas en BD
        if (saved.length > 0) {
          combined.push(...saved.map(addr => ({ ...addr, source: 'bd' })));
        }

        setAddresses(combined);
      } catch (e) {
        setError(e.message);
        setAddresses([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [rucCli]);

  return { addresses, loading, error };
};

export default useClientShippingAddresses;
