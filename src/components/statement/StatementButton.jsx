// src/components/statement/StatementButton.jsx
import React, { useState } from 'react';
import { FileDown, Loader } from 'lucide-react';
import { generateStatementPDF } from './StatementPDF';
import { getStatement } from '../../services/statementService';


const StatementButton = ({ ruc, disabled }) => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);


  const handleGenerate = async () => {
    if (!ruc || loading) return;
    setLoading(true);
    setError(null);

    try {
      const json = await getStatement(ruc);
      await generateStatementPDF(ruc, json.data);
    } catch (e) {
      console.error('❌ StatementButton error:', e);
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleGenerate}
        disabled={disabled || loading}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white
          rounded-lg hover:bg-blue-700 transition font-semibold text-sm
          disabled:opacity-50 disabled:cursor-not-allowed"
        title="Generar Estado de Cuenta PDF"
      >
        {loading
          ? <Loader className="w-4 h-4 animate-spin" />
          : <FileDown className="w-4 h-4" />
        }
        Estado de Cuenta
      </button>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};


export default StatementButton;