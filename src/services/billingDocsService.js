// src/services/billingDocsService.js
import { apiDocs } from './api';

const RUC_EMISOR = '20100154138';

export const buildDocFilename = (tipoDoc, serie, numero, ext) => {
  const numPadded = String(numero).padStart(8, '0');
  const base = `${RUC_EMISOR}-${tipoDoc}-${serie}-${numPadded}`;

  if (ext === 'cdr') return `R-${base}.xml`;   // CDR: R-{base}.xml
  return `${base}.${ext}`;                      // PDF/XML: {base}.pdf / {base}.xml
};

export const openPdf = async (filename) => {
  const response = await apiDocs.get(`/docs/pdf/${filename}`, { responseType: 'blob' });
  const url = URL.createObjectURL(response.data);

  // Abre en nueva pestaña
  window.open(url, '_blank');

  // Descarga automática
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();

  setTimeout(() => URL.revokeObjectURL(url), 10000);
};

export const downloadFile = async (filename, type) => {
  const response = await apiDocs.get(`/docs/${type}/${filename}`, { responseType: 'blob' });
  const url = URL.createObjectURL(response.data);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};