// src/components/quotations/QuotationPDFModal.jsx
import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import { X, Download, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import PDFPreview from '../calls/PDFPreview';
import toast from 'react-hot-toast';

const QuotationPDFModal = ({ quotation, isOpen, onClose }) => {
  const pdfRef = useRef(null);

  if (!isOpen || !quotation) return null;

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) {
      toast.error('No se pudo generar el PDF');
      return;
    }

    try {
      toast.loading('Generando PDF...', { id: 'pdf-download' });

      const element = pdfRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Cotizacion_${quotation.numeroCotizacion}.pdf`);
      toast.success('PDF descargado exitosamente', { id: 'pdf-download' });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast.error('Error al generar el PDF', { id: 'pdf-download' });
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-8 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#2ecc70] to-[#27ae60] text-white px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Vista Previa - Cotización</h2>
              <p className="text-sm text-green-100">#{quotation.numeroCotizacion}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition flex items-center gap-2 font-medium"
            >
              <Download className="w-4 h-4" />
              Descargar PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body - Vista Previa del PDF */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <div className="bg-white rounded-lg shadow-lg p-8 mx-auto" style={{ maxWidth: '1100px' }}>
            <PDFPreview
              ref={pdfRef}
              selectedClient={quotation.selectedClient}
              quotationItems={quotation.productos}
              subtotal={quotation.subtotal}
              igv={quotation.igv}
              total={quotation.total}
              quotationNumber={quotation.numeroCotizacion}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default QuotationPDFModal;
