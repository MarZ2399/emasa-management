// src/components/quotations/QuotationPDFModal.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Download, FileText, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

// IMPORTANTE: Asegúrate de importar la nueva función que creamos.
// Ajusta esta ruta según la carpeta donde hayas guardado tu archivo de jsPDF.
import { previewQuotationPDF } from '../../utils/pdfGenerator'; 

const QuotationPDFModal = ({ quotation, isOpen, onClose }) => {
  // Ya no necesitamos pdfRef
  const [pdfUrl, setPdfUrl] = useState(null);
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
    try {
      setGenerating(true);

      // 1. Mapeamos los datos tal cual los enviabas antes a PDFPreview, 
      // pero ahora se los pasamos a nuestra nueva función jsPDF.
      const pdfData = {
        quotation: quotation,
        selectedClient: quotation.selectedClient,
        quotationItems: quotation.productos,
        quotationNumber: quotation.numeroCotizacion,
        currency: quotation.currency,
      };

      // 2. Generamos el PDF directamente con código (mucho más rápido)
      const pdf = await previewQuotationPDF(null, pdfData);

      // 3. Obtenemos el Blob y creamos la URL para el iframe
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

    } catch (error) {
      console.error('Error al generar preview PDF:', error);
      toast.error('Error al generar la vista previa');
    } finally {
      setGenerating(false);
    }
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
              // Importante: No ponemos 'sandbox' aquí para evitar el bloqueo de Chrome
            />
          )}
        </div>
      </div>
      
      {/* ¡Adiós al div oculto! 
        Ya no necesitamos renderizar el HTML invisible a -9999px.
        Esto hará que tu modal cargue casi al instante.
      */}
    </div>,
    document.body
  );
};

export default QuotationPDFModal;