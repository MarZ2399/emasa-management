// src/hooks/useClientShippingAddresses.js
import { useState, useEffect } from 'react';
import { getAddressesByCliente } from '../services/shippingAddressCliService';
import { getClientShippingInfo } from '../services/customerService';

const normalizeText = (value) =>
  String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();

const buildAddressKey = (addr) => {
  const direccion = normalizeText(addr?.direccion);
  const depto = normalizeText(addr?.ubigeoDepto || addr?.deptoNombre);
  const prov = normalizeText(
    addr?.ubigeoProvinca || addr?.ubigeoProvincia || addr?.provinciaNombre
  );
  const dist = normalizeText(addr?.ubigeoDistrito || addr?.distritoNombre);

  return `${direccion}|${depto}|${prov}|${dist}`;
};

const useClientShippingAddresses = (rucCli) => {
  const [addresses, setAddresses] = useState([]);
  const [registeredAddress, setRegisteredAddress] = useState(null);
  const [registeredAddresses, setRegisteredAddresses] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [otherAddresses, setOtherAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!rucCli) {
      setAddresses([]);
      setRegisteredAddress(null);
      setRegisteredAddresses([]);
      setSavedAddresses([]);
      setOtherAddresses([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [savedRaw, as400Raw] = await Promise.all([
          getAddressesByCliente(rucCli),
          getClientShippingInfo(rucCli),
        ]);

        const saved = Array.isArray(savedRaw) ? savedRaw : [];
        const as400 = as400Raw || {};

        const combined = [];
        const onlySaved = [];
        const seen = new Set();
        let as400Address = null;

        if (as400.direccion) {
          as400Address = {
            id: 'as400',
            rucCli,
            direccion: as400.direccion,
            ubigeoDepto: as400.ubigeoDepto || '',
            ubigeoProvinca: as400.ubigeoProvinca || '',
            ubigeoDistrito: as400.ubigeoDistrito || '',
            deptoNombre: as400.deptoNombre || '',
            provinciaNombre: as400.provinciaNombre || '',
            distritoNombre: as400.distritoNombre || '',
            isDefault: 1,
            source: 'as400',
            label: `📍 ${as400.direccion} — ${as400.distritoNombre || ''}, ${as400.provinciaNombre || ''} (Dirección registrada)`,
          };

          const key = buildAddressKey(as400Address);
          seen.add(key);
          combined.push(as400Address);
        }

        for (const addr of saved) {
          const normalized = {
            ...addr,
            ubigeoDepto: addr?.ubigeoDepto || '',
            ubigeoProvinca: addr?.ubigeoProvinca || addr?.ubigeoProvincia || '',
            ubigeoDistrito: addr?.ubigeoDistrito || '',
            deptoNombre: addr?.deptoNombre || '',
            provinciaNombre: addr?.provinciaNombre || '',
            distritoNombre: addr?.distritoNombre || '',
            isDefault: Number(addr?.isDefault) === 1 ? 1 : 0,
            source: 'bd',
            label: `📦 ${addr?.direccion || ''} — ${addr?.distritoNombre || ''}, ${addr?.provinciaNombre || ''}${Number(addr?.isDefault) === 1 ? ' (Principal)' : ''}`,
          };

          const key = buildAddressKey(normalized);
          if (seen.has(key)) continue;

          seen.add(key);
          combined.push(normalized);
          onlySaved.push(normalized);
        }

        if (!cancelled) {
          setAddresses(combined);
          setRegisteredAddress(as400Address);
          setRegisteredAddresses(as400Address ? [as400Address] : []);
          setSavedAddresses(onlySaved);
          setOtherAddresses(onlySaved);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || 'Error al cargar direcciones');
          setAddresses([]);
          setRegisteredAddress(null);
          setRegisteredAddresses([]);
          setSavedAddresses([]);
          setOtherAddresses([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [rucCli]);

  return {
    addresses,
    registeredAddress,
    registeredAddresses,
    savedAddresses,
    otherAddresses,
    loading,
    error,
  };
};

export default useClientShippingAddresses;