import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateQuotationPDF = async (element, filename = 'cotizacion.pdf') => {
  try {
    // Captura el elemento como canvas
    const canvas = await html2canvas(element, { 
      scale: 2,
      useCORS: true,
      allowTaint: true
    });

    // Obtiene dimensiones
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // ancho A4 en mm
    const pageHeight = 297; // alto A4 en mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Crea PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let heightLeft = imgHeight;
    let position = 0;

    // Si la imagen es más larga que una página, divide en múltiples páginas
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Descarga o retorna
    pdf.save(filename);
    return pdf;
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw error;
  }
};

// Alternativa: Mostrar en nueva ventana en vez de descargar
export const previewQuotationPDF = async (element) => {
  try {
    console.log("NODE PARA PDF:", element);

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: false,
      allowTaint: false,
      backgroundColor: '#fff'
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Abre en nueva ventana
    window.open(pdf.output('bloburl'));
  } catch (error) {
    console.error('Error previsualizando PDF:', error);
  }
};
