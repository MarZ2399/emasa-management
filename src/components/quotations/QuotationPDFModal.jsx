// src/components/quotations/QuotationPDFModal.jsx
import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Download, FileText, Loader } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import PDFPreview from '../calls/PDFPreview';
import toast from 'react-hot-toast';

const QuotationPDFModal = ({ quotation, isOpen, onClose }) => {
  const pdfRef       = useRef(null);
  const [pdfUrl, setPdfUrl]         = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (isOpen && quotation) {
      generatePdfBlob();
    }
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
    };
  }, [isOpen, quotation]);

  const generatePdfBlob = async () => {
    setTimeout(async () => {
      if (!pdfRef.current) return;

      try {
        setGenerating(true);

        const element = pdfRef.current;

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: 1100,           // ✅ mismo ancho que w-[1100px]
          windowWidth: 1100,
          scrollX: 0,
          scrollY: 0
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        const pageWidth  = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth   = pageWidth;
        const imgHeight  = (canvas.height * pageWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position   = 0;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position -= pageHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        const blob = pdf.output('blob');
        const url  = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (error) {
        console.error('Error al generar preview PDF:', error);
        toast.error('Error al generar la vista previa');
      } finally {
        setGenerating(false);
      }
    }, 300);
  };

  const handleDownloadPDF = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `Cotizacion_${quotation.numeroCotizacion}.pdf`;
    a.click();
    toast.success('PDF descargado exitosamente');
  };

  if (!isOpen || !quotation) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[95vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#2ecc70] to-[#27ae60] text-white px-6 py-4 flex items-center justify-between z-10 flex-shrink-0">
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
              disabled={!pdfUrl || generating}
              className="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition flex items-center gap-2 font-medium disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Descargar PDF
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Iframe con PDF generado */}
        <div className="flex-1 overflow-hidden relative">
          {generating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
              <Loader className="w-10 h-10 text-green-600 animate-spin mb-3" />
              <p className="text-gray-600 font-medium">Generando vista previa...</p>
            </div>
          )}
          {pdfUrl && !generating && (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="Vista previa cotización"
            />
          )}
        </div>
      </div>

      {/* PDFPreview oculto a 1100px para captura exacta */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '1100px',
          overflow: 'visible',
          zIndex: -1,
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      >
        <div ref={pdfRef}>
          <PDFPreview
            selectedClient={quotation.selectedClient}
            quotationItems={quotation.productos}
            subtotal={quotation.subtotal}
            igv={quotation.igv}
            total={quotation.total}
            quotationNumber={quotation.numeroCotizacion}
            currency={quotation.currency}
            isVisible={true}
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default QuotationPDFModal;
