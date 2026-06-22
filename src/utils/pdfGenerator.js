import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CANVAS_OPTIONS = {
  scale: 2,
  useCORS: true,
  allowTaint: true,
  backgroundColor: '#ffffff',
  logging: false,
};

const renderPagesToPdf = async (element) => {
  if (!element) {
    throw new Error('No se recibió el elemento para generar el PDF');
  }

  const pageNodes = element.querySelectorAll('.pdf-page');

  if (!pageNodes.length) {
    throw new Error('No se encontraron páginas .pdf-page para exportar');
  }

  // Medidas estándar de una hoja A4 en milímetros
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = 210;
  const pdfHeight = 297;

  for (let i = 0; i < pageNodes.length; i += 1) {
    const pageNode = pageNodes[i];

    const canvas = await html2canvas(pageNode, CANVAS_OPTIONS);
    const imgData = canvas.toDataURL('image/png');

    if (i > 0) {
      pdf.addPage();
    }

    // Ya no calculamos la altura dinámicamente. 
    // Forzamos la imagen a ocupar exactamente el 100% de la hoja A4 (210x297)
    // porque el contenedor HTML ya tiene esa proporción exacta.
    pdf.addImage(
      imgData,
      'PNG',
      0,
      0,
      pdfWidth,
      pdfHeight,
      undefined,
      'FAST'
    );
  }

  return pdf;
};

export const generateQuotationPDF = async (element, filename = 'cotizacion.pdf') => {
  try {
    const pdf = await renderPagesToPdf(element);
    pdf.save(filename);
    return pdf;
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw error;
  }
};

export const previewQuotationPDF = async (element) => {
  try {
    const pdf = await renderPagesToPdf(element);
    const blobUrl = pdf.output('bloburl');
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
    return pdf;
  } catch (error) {
    console.error('Error previsualizando PDF:', error);
    throw error;
  }
};