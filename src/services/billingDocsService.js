import { apiDocs } from './api';

export const buildDocFilename = (ruc, tipoDoc, serie, numero, ext) => {
  const numPadded = String(numero).padStart(8, '0');
  return `${ruc}-${tipoDoc}-${serie}-${numPadded}.${ext}`;
};

export const openPdf = async (filename) => {
  const response = await apiDocs.get(`/docs/pdf/${filename}`, { responseType: 'blob' });
  const url = URL.createObjectURL(response.data);
  window.open(url, '_blank');
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