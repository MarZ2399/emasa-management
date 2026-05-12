// src/components/billing/AccountStatementPanel.jsx
import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import StatementButton from '../statement/StatementButton';

const AccountStatementPanel = ({ ruc, nombreCliente }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Estado de Cuenta</p>
            {nombreCliente && (
              <p className="text-xs text-gray-500 mt-0.5">{nombreCliente}</p>
            )}
            {ruc && (
              <p className="text-xs text-gray-400">RUC: {ruc}</p>
            )}
          </div>
        </div>
        <StatementButton ruc={ruc} />
      </div>
    </div>
  );
};

export default AccountStatementPanel;