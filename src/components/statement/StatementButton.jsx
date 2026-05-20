// src/components/statement/StatementButton.jsx
import React, { useState } from 'react';
import { FileDown, Eye, Loader } from 'lucide-react';
import { generateStatementPDF } from './StatementPDF';
import { getStatement } from '../../services/statementService';
import toast from 'react-hot-toast';

const StatementButton = ({ ruc, disabled }) => {
  const [loadingView, setLoadingView] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    const json = await getStatement(ruc);
    return json.data;
  };

  const handleView = async () => {
    if (!ruc || loadingView || loadingDownload) return;

    setLoadingView(true);
    setError(null);

    const toastId = toast.loading(
      'Se está generando la información correspondiente. Por favor, espere un momento...'
    );

    try {
      const data = await fetchData();
      await generateStatementPDF(ruc, data, { mode: 'view' });

      toast.success('Estado de cuenta generado correctamente.', {
        id: toastId,
      });
    } catch (e) {
      console.error('❌ StatementButton view error:', e);
      const msg = e.response?.data?.error || e.message || 'Error al visualizar el estado de cuenta';
      setError(msg);

      toast.error(msg, {
        id: toastId,
      });
    } finally {
      setLoadingView(false);
    }
  };

  const handleDownload = async () => {
    if (!ruc || loadingView || loadingDownload) return;

    setLoadingDownload(true);
    setError(null);

    const toastId = toast.loading(
      'Se está generando la información correspondiente. Por favor, espere un momento...'
    );

    try {
      const data = await fetchData();
      await generateStatementPDF(ruc, data, { mode: 'download' });

      toast.success('Estado de cuenta descargado correctamente.', {
        id: toastId,
      });
    } catch (e) {
      console.error('❌ StatementButton download error:', e);
      const msg = e.response?.data?.error || e.message || 'Error al descargar el estado de cuenta';
      setError(msg);

      toast.error(msg, {
        id: toastId,
      });
    } finally {
      setLoadingDownload(false);
    }
  };

  const isLoading = loadingView || loadingDownload;

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-2">

        <button
          onClick={handleView}
          disabled={disabled || isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#334a5e] text-white
            rounded-lg hover:bg-blue-700 transition font-semibold text-sm
            disabled:opacity-50 disabled:cursor-not-allowed"
          title="Visualizar Estado de Cuenta"
        >
          {loadingView
            ? <Loader className="w-4 h-4 animate-spin" />
            : <Eye className="w-4 h-4" />
          }
          Visualizar EECC
        </button>

        <button
          onClick={handleDownload}
          disabled={disabled || isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white
            rounded-lg hover:bg-emerald-700 transition font-semibold text-sm
            disabled:opacity-50 disabled:cursor-not-allowed"
          title="Descargar Estado de Cuenta PDF"
        >
          {loadingDownload
            ? <Loader className="w-4 h-4 animate-spin" />
            : <FileDown className="w-4 h-4" />
          }
          Descargar EECC
        </button>

      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};

export default StatementButton;