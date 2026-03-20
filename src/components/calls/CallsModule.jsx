// src/components/calls/CallsModule.jsx
import React, { useState, useContext } from 'react';
import toast from 'react-hot-toast';
import { Phone, Package, FileText, ShoppingCart, Sparkles } from 'lucide-react';
import { getClientPurchases } from '../../data/purchaseHistoryData';
import { AuthContext } from '../../context/AuthContext';
import ClientSearchPanel from './ClientSearchPanel';
import CallHistoryTab from './CallHistoryTab';
import ProductsTab from './ProductsTab';
import PurchaseHistoryTab from './PurchaseHistoryTab';
import ProductSuggestionsTab from './ProductSuggestionsTab';
import QuotationTab from './QuotationTab';
import SectionHeader from '../common/SectionHeader';


const CallsModule = () => {
  const { user } = useContext(AuthContext);

  const [activeTab,          setActiveTab]          = useState('calls');
  const [selectedClient,     setSelectedClient]     = useState(null);
  const [selectedClientRUC,  setSelectedClientRUC]  = useState(null);
  const [resetClientSearch,  setResetClientSearch]  = useState(0);
  const [quotationItems,     setQuotationItems]     = useState([]);
  const [codigoProducto,     setCodigoProducto]     = useState('');
  const [nombreProducto,     setNombreProducto]     = useState('');
  const [hasSearched,        setHasSearched]        = useState(false);
  const [autoSearchTrigger,  setAutoSearchTrigger]  = useState(0);

  // ✅ Estado elevado — sobrevive al cambio de tabs
  const codAlmacenes = user?.empresa?.cod_almacenes || [];
  const [almacenSeleccionado, setAlmacenSeleccionado] = useState(
  codAlmacenes.find(a => a.principal) || codAlmacenes[0] || null
);

  const handleClientSelect = (clientData) => {
    const newRuc = clientData?.ruc || null;

    if (newRuc !== selectedClientRUC) {
      setQuotationItems([]);
      setCodigoProducto('');
      setNombreProducto('');
      setHasSearched(false);
    }

    setSelectedClient(clientData);
    setSelectedClientRUC(newRuc);
  };

  const handleProductClick = (codigo) => {
    setCodigoProducto(codigo);
    setNombreProducto('');
    setHasSearched(false);
    setAutoSearchTrigger(prev => prev + 1);
    setActiveTab('products');
  };

  const handleRegistrationComplete = () => {
    setSelectedClient(null);
    setSelectedClientRUC(null);
    setCodigoProducto('');
    setNombreProducto('');
    setHasSearched(false);
    setResetClientSearch(prev => prev + 1);
    // ✅ Resetear almacén al completar cotización
    setAlmacenSeleccionado(
  codAlmacenes.find(a => a.principal) || codAlmacenes[0] || null  // ✅
);
    setActiveTab('calls');
    toast.success('Cotización completada. Puedes buscar un nuevo cliente', {
      position: 'top-right', duration: 3000
    });
  };

  const tabs = [
    { key: 'calls',      label: 'Historial de Contacto', icon: Phone,        color: 'blue'   },
    { key: 'purchases',  label: 'Últimas Compras',        icon: ShoppingCart, color: 'green'  },
    { key: 'products',   label: 'Consulta de Productos',  icon: Package,      color: 'indigo' },
    { key: 'quotations', label: 'Cotización',             icon: FileText,     color: 'green'  },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Phone}
        title="Gestión de Televentas"
        subtitle="Buscar cliente y gestionar llamadas"
        showButton={false}
      />

      <ClientSearchPanel
        onClientSelect={handleClientSelect}
        resetTrigger={resetClientSearch}
      />

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto whitespace-nowrap no-scrollbar">
            {tabs.map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === key
                    ? `border-${color}-600 text-${color}-600 bg-${color}-50`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                  {key === 'quotations' && quotationItems.length > 0 && (
                    <span className="ml-2 px-2.5 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                      {quotationItems.length}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div>
          {/* ── Historial de Llamadas ── */}
          {activeTab === 'calls' && (
            <CallHistoryTab selectedClient={selectedClient} />
          )}

          {/* ── Últimas Compras ── */}
          {activeTab === 'purchases' && (
            <div className="p-6">
              <PurchaseHistoryTab
                clienteRUC={selectedClientRUC}
                onProductClick={handleProductClick}
              />
            </div>
          )}

          {/* ── Sugerencias ── */}
          {activeTab === 'suggestions' && (
            <div className="p-6">
              <ProductSuggestionsTab
                clienteRUC={selectedClientRUC}
                purchaseHistory={selectedClientRUC ? getClientPurchases(selectedClientRUC) : []}
                onAddToQuotation={(productData) => {
                  setQuotationItems(items => [...items, productData]);
                  setActiveTab('quotations');
                }}
              />
            </div>
          )}

          {/* ── Consulta de Productos ── */}
          {activeTab === 'products' && (
            <div className="p-6">
              {!selectedClient ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecciona un cliente primero</h3>
                  <p className="text-gray-600">Para consultar precios de productos, debes seleccionar un cliente en el panel superior</p>
                  <button onClick={() => setActiveTab('calls')}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Ir a Búsqueda de Cliente
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg">✓</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-green-900">
                          Cliente seleccionado: {selectedClient.nombreCliente}
                          {selectedClient.giro && <span className="ml-2">/ {selectedClient.giro}</span>}
                        </p>
                        <p className="text-xs text-green-700">RUC: {selectedClient.ruc}</p>
                      </div>
                    </div>
                  </div>
                  <ProductsTab
                    codigoProducto={codigoProducto}
                    setCodigoProducto={setCodigoProducto}
                    nombreProducto={nombreProducto}
                    setNombreProducto={setNombreProducto}
                    hasSearched={hasSearched}
                    setHasSearched={setHasSearched}
                    clienteRuc={selectedClient.ruc}
                    quotationItems={quotationItems}
                    autoSearchTrigger={autoSearchTrigger}
                    onAddToQuotation={prodData => {
                      setQuotationItems(items => [...items, prodData]);
                      setActiveTab('quotations');
                    }}
                    // ✅ Props elevados — persisten entre cambios de tab
                    almacenSeleccionado={almacenSeleccionado}
                    setAlmacenSeleccionado={setAlmacenSeleccionado}
                  />
                </>
              )}
            </div>
          )}

          {/* ── Cotización ── */}
          {activeTab === 'quotations' && (
            <div className="p-6">
              <QuotationTab
                quotationItems={quotationItems}
                setQuotationItems={setQuotationItems}
                onBackToProducts={() => setActiveTab('products')}
                selectedClient={selectedClient}
                onRegistrationComplete={handleRegistrationComplete}
                // ✅ Almacén fijado — solo lectura en QuotationTab
                almacenCotizacion={almacenSeleccionado}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallsModule;
