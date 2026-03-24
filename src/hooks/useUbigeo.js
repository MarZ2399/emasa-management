// src/hooks/useUbigeo.js
import { useState, useEffect } from 'react';
import {
  getDepartamentos,
  getProvincias,
  getDistritos,
} from '../services/as400CatalogService';

const useUbigeo = () => {
  const [departamentos, setDepartamentos] = useState([]);
  const [provincias,    setProvincias]    = useState([]);
  const [distritos,     setDistritos]     = useState([]);

  const [codDepto,     setCodDepto]     = useState('');
  const [codProvincia, setCodProvincia] = useState('');

  const [loadingDeptos,   setLoadingDeptos]   = useState(false);
  const [loadingProvs,    setLoadingProvs]     = useState(false);
  const [loadingDistritos,setLoadingDistritos] = useState(false);

  const [error, setError] = useState(null);

  // Cargar departamentos al montar
  useEffect(() => {
    setLoadingDeptos(true);
    getDepartamentos()
      .then(setDepartamentos)
      .catch(() => setError('Error al cargar departamentos'))
      .finally(() => setLoadingDeptos(false));
  }, []);

  // Cargar provincias cuando cambia departamento
  useEffect(() => {
    if (!codDepto) { setProvincias([]); setCodProvincia(''); setDistritos([]); return; }
    setLoadingProvs(true);
    setProvincias([]); setCodProvincia(''); setDistritos([]);
    getProvincias(codDepto)
      .then(setProvincias)
      .catch(() => setError('Error al cargar provincias'))
      .finally(() => setLoadingProvs(false));
  }, [codDepto]);

  // Cargar distritos cuando cambia provincia
  useEffect(() => {
    if (!codProvincia) { setDistritos([]); return; }
    setLoadingDistritos(true);
    setDistritos([]);
    getDistritos(codProvincia)
      .then(setDistritos)
      .catch(() => setError('Error al cargar distritos'))
      .finally(() => setLoadingDistritos(false));
  }, [codProvincia]);

  const reset = () => {
    setCodDepto(''); setCodProvincia('');
    setProvincias([]); setDistritos([]);
  };

  return {
    departamentos, provincias, distritos,
    codDepto,     setCodDepto,
    codProvincia, setCodProvincia,
    loadingDeptos, loadingProvs, loadingDistritos,
    error, reset,
  };
};

export default useUbigeo;
