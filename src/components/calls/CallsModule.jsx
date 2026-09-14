// src/components/calls/CallsModule.jsx
import React, { useState, useContext, useEffect, useRef } from 'react';
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

const DRAFT_PREFIX = 'cotizacion_draft_';
const ACTIVE_CLIENT_PREFIX = 'cliente_activo_';
const DRAFT_EXPIRATION_MS = 24 * 60 * 60 * 1000;

const guardarDraft = (ruc, data) => {
  if (!ruc) return;
  try {
    localStorage.setItem(`${DRAFT_PREFIX}${ruc}`, JSON.stringify({
      ...data,
      guardadoEn: new Date().toISOString(),
    }));
  } catch (err) {
    console.error('❌ Error al guardar borrador de cotización:', err);
  }
};

const leerDraft = (ruc) => {
  if (!ruc) return null;
  try {
    const raw = localStorage.getItem(`${DRAFT_PREFIX}${ruc}`);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    const guardadoEn = new Date(draft.guardadoEn).getTime();
    if (Number.isNaN(guardadoEn) || Date.now() - guardadoEn > DRAFT_EXPIRATION_MS) {
      localStorage.removeItem(`${DRAFT_PREFIX}${ruc}`);
      return null;
    }
    return draft;
  } catch (err) {
    console.error('❌ Error al leer borrador de cotización:', err);
    return null;
  }
};

const borrarDraft = (ruc) => {
  if (!ruc) return;
  localStorage.removeItem(`${DRAFT_PREFIX}${ruc}`);
};

const guardarClienteActivo = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify({
      ...data,
      guardadoEn: new Date().toISOString(),
    }));
  } catch (err) {
    console.error('❌ Error al guardar cliente activo:', err);
  }
};

const leerClienteActivo = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const guardadoEn = new Date(data.guardadoEn).getTime();
    if (Number.isNaN(guardadoEn) || Date.now() - guardadoEn > DRAFT_EXPIRATION_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch (err) {
    console.error('❌ Error al leer cliente activo:', err);
    return null;
  }
};

const borrarClienteActivo = (key) => {
  localStorage.removeItem(key);
};

const CallsModule = () => {
  const { user } = useContext(AuthContext);
  const codigoUsuario = String(
    user?.codigo_sis || user?.codigo || user?.id || 'usuario'
  ).trim();
  const activeClientKey = `${ACTIVE_CLIENT_PREFIX}${codigoUsuario}`;

  const [activeTab, setActiveTab] = useState('calls');
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedClientRUC, setSelectedClientRUC] = useState(null);
  const [clienteRestaurado, setClienteRestaurado] = useState(null);
  const [rucRestaurado, setRucRestaurado] = useState('');
  const [nombreRestaurado, setNombreRestaurado] = useState('');
  const [resetClientSearch, setResetClientSearch] = useState(0);
  const [quotationItems, setQuotationItems] = useState([]);
  const [codigoProducto, setCodigoProducto] = useState('');
  const [nombreProducto, setNombreProducto] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [autoSearchTrigger, setAutoSearchTrigger] = useState(0);
  const [productosBusqueda, setProductosBusqueda] = useState([]);

  const codAlmacenes = user?.empresa?.cod_almacenes || [];
  const [almacenSeleccionado, setAlmacenSeleccionado] = useState(
    codAlmacenes.find(a => a.principal) || codAlmacenes[0] || null
  );

  const draftTimeoutRef = useRef(null);

  useEffect(() => {
    const activo = leerClienteActivo(activeClientKey);
    if (!activo?.cliente) return;

    const rucActivo = activo.ruc || activo.cliente.ruc || '';
    const draft = leerDraft(rucActivo);

    setClienteRestaurado(activo.cliente);
    setRucRestaurado(String(rucActivo));
    setNombreRestaurado(activo.nombreQuery || activo.cliente.nombreCliente || '');
    setSelectedClient(activo.cliente);
    setSelectedClientRUC(rucActivo);

    if (activo.almacen) setAlmacenSeleccionado(activo.almacen);
    if (draft?.items && Array.isArray(draft.items)) setQuotationItems(draft.items);
    if (activo.activeTab) setActiveTab(activo.activeTab);
  }, [activeClientKey]);

  const handleClientSelect = (clientData) => {
    const newRuc = clientData?.ruc || null;

    if (newRuc !== selectedClientRUC) {
      setCodigoProducto('');
      setNombreProducto('');
      setHasSearched(false);
      setProductosBusqueda([]);

      const draft = leerDraft(newRuc);
      if (draft && Array.isArray(draft.items) && draft.items.length > 0) {
        setQuotationItems(draft.items);
        if (draft.almacen) setAlmacenSeleccionado(draft.almacen);
        toast.success(
          `Se restauró una cotización en curso de ${draft.items.length} producto(s) para este cliente`,
          { position: 'top-right', duration: 4000, icon: '📝' }
        );
      } else {
        setQuotationItems([]);
      }
    }

    setSelectedClient(clientData);
    setSelectedClientRUC(newRuc);

    if (clientData && newRuc) {
      guardarClienteActivo(activeClientKey, {
        ruc: newRuc,
        nombreQuery: clientData.nombreCliente || '',
        cliente: clientData,
        almacen: almacenSeleccionado,
        activeTab: 'calls',
      });
      setClienteRestaurado(clientData);
      setRucRestaurado(String(newRuc));
      setNombreRestaurado(clientData.nombreCliente || '');
    }
  };

  useEffect(() => {
    if (!selectedClientRUC) return;
    if (draftTimeoutRef.current) clearTimeout(draftTimeoutRef.current);

    draftTimeoutRef.current = setTimeout(() => {
      if (quotationItems.length > 0) {
        guardarDraft(selectedClientRUC, {
          ruc: selectedClientRUC,
          cliente: selectedClient,
          items: quotationItems,
          almacen: almacenSeleccionado,
        });
      } else {
        borrarDraft(selectedClientRUC);
      }

      if (selectedClient && selectedClientRUC) {
        guardarClienteActivo(activeClientKey, {
          ruc: selectedClientRUC,
          nombreQuery: selectedClient.nombreCliente || '',
          cliente: selectedClient,
          almacen: almacenSeleccionado,
          activeTab,
        });
      }
    }, 400);

    return () => clearTimeout(draftTimeoutRef.current);
  }, [
    quotationItems,
    selectedClientRUC,
    selectedClient,
    almacenSeleccionado,
    activeTab,
    activeClientKey,
  ]);

  const handleProductClick = (codigo) => {
    setCodigoProducto(codigo);
    setNombreProducto('');
    setHasSearched(false);
    setAutoSearchTrigger(prev => prev + 1);
    setActiveTab('products');
  };

  const handleRegistrationComplete = () => {
    borrarDraft(selectedClientRUC);
    borrarClienteActivo(activeClientKey);
    setClienteRestaurado(null);
    setRucRestaurado('');
    setNombreRestaurado('');

    setSelectedClient(null);
    setSelectedClientRUC(null);
    setCodigoProducto('');
    setNombreProducto('');
    setHasSearched(false);
    setProductosBusqueda([]);
    setResetClientSearch(prev => prev + 1);
    setAlmacenSeleccionado(
      codAlmacenes.find(a => a.principal) || codAlmacenes[0] || null
    );
    setActiveTab('calls');
    toast.success('Cotización completada. Puedes buscar un nuevo cliente', {
      position: 'top-right', duration: 3000
    });
  };

  const tabs = [
    { key: 'calls', label: 'Historial de Contacto', icon: Phone, color: 'blue' },
    { key: 'purchases', label: 'Últimas Compras', icon: ShoppingCart, color: 'green' },
    { key: 'products', label: 'Consulta de Productos', icon: Package, color: 'indigo' },
    { key: 'quotations', label: 'Cotización', icon: FileText, color: 'green' },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader icon={Phone} title="Gestión de Ventas" subtitle="Buscar cliente y gestionar llamadas" showButton={false} />

      <ClientSearchPanel
        onClientSelect={handleClientSelect}
        resetTrigger={resetClientSearch}
        clienteRestaurado={clienteRestaurado}
        rucRestaurado={rucRestaurado}
        nombreRestaurado={nombreRestaurado}
      />

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto whitespace-nowrap no-scrollbar">
            {tabs.map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key);
                  if (selectedClient && selectedClientRUC) {
                    guardarClienteActivo(activeClientKey, {
                      ruc: selectedClientRUC,
                      nombreQuery: selectedClient.nombreCliente || '',
                      cliente: selectedClient,
                      almacen: almacenSeleccionado,
                      activeTab: key,
                    });
                  }
                }}
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
                    <span className="ml-2 px-2.5 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">{quotationItems.length}</span>
                  )}
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div>
          {activeTab === 'calls' && <CallHistoryTab selectedClient={selectedClient} />}

          {activeTab === 'purchases' && (
            <div className="p-6">
              <PurchaseHistoryTab clienteRUC={selectedClientRUC} onProductClick={handleProductClick} />
            </div>
          )}

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

          {activeTab === 'products' && (
            <div className="p-6">
              {!selectedClient ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecciona un cliente primero</h3>
                  <p className="text-gray-600">Para consultar precios de productos, debes seleccionar un cliente en el panel superior</p>
                  <button onClick={() => setActiveTab('calls')} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Ir a Búsqueda de Cliente</button>
                </div>
              ) : (
                <>
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center"><span className="text-white text-lg">✓</span></div>
                      <div>
                        <p className="text-sm font-semibold text-green-900">Cliente seleccionado: {selectedClient.nombreCliente}{selectedClient.giro && <span className="ml-2">/ {selectedClient.giro}</span>}</p>
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
                    almacenSeleccionado={almacenSeleccionado}
                    setAlmacenSeleccionado={setAlmacenSeleccionado}
                    productos={productosBusqueda}
                    setProductos={setProductosBusqueda}
                  />
                </>
              )}
            </div>
          )}

          {activeTab === 'quotations' && (
            <div className="p-6">
              <QuotationTab
                quotationItems={quotationItems}
                setQuotationItems={setQuotationItems}
                onBackToProducts={() => setActiveTab('products')}
                selectedClient={selectedClient}
                onRegistrationComplete={handleRegistrationComplete}
                almacenCotizacion={almacenSeleccionado}
                codigoVendedor={user?.codigo_sis}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallsModule;