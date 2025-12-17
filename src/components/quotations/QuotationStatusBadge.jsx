// src/components/quotations/QuotationStatusBadge.jsx
import React from 'react';
import { getQuotationStatus } from '../../data/quotationsData';

const QuotationStatusBadge = ({ estado }) => {
  const status = getQuotationStatus(estado);
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
      {status.label}
    </span>
  );
};

export default QuotationStatusBadge;
