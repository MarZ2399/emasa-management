// Obtiene el siguiente número de cotización
export const getNextQuotationNumber = () => {
  const stored = localStorage.getItem('quotationCounter');
  const current = stored ? parseInt(stored, 10) : 45986; // Número inicial
  const next = current + 1;
  localStorage.setItem('quotationCounter', next.toString());
  return next;
};

// Obtiene el contador actual sin incrementar
export const getCurrentQuotationNumber = () => {
  const stored = localStorage.getItem('quotationCounter');
  return stored ? parseInt(stored, 10) : 45986;
};

// Resetea el contador (opcional, solo para pruebas)
export const resetQuotationCounter = (startNumber = 45986) => {
  localStorage.setItem('quotationCounter', startNumber.toString());
};
