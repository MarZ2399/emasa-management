// src/data/quotationsData.js
export const initialQuotations = [
  {
    id: 1,
    numeroCotizacion: '45989',
    fecha: '2025-12-09',
    cliente: 'Alta Tecnologia En Diesel E.I.R.L',
    ruc: '2060467759',
    asesor: 'Giancarlo Nicho',
    
    // ✅ DATOS COMPLETOS DEL CLIENTE (para PDFPreview)
    selectedClient: {
      nombreCliente: 'Alta Tecnologia En Diesel E.I.R.L',
      ruc: '2060467759',
      direccion: 'Av. Los Industriales 123, San Juan de Lurigancho',
      vendedor: 'Giancarlo Nicho',
      categoria: 'Cliente Premium'
    },
    
    // ✅ PRODUCTOS CON ESTRUCTURA COMPLETA (para PDFPreview)
    productos: [
      {
        id: 1,
        codigo: 'PROD-001',
        nombre: 'Tanque de Combustible 1000L',
        descripcion: 'Tanque de Combustible 1000L',
        cantidad: 2,
        quantity: 2, // Alias para PDFPreview
        precioLista: 1800.00,
        precioUnitario: 1500.00,
        precioNeto: 1500.00,
        discount1: 5,
        discount5: 0,
        descuento: 5,
        descuento5to: 0,
        subtotal: 3000.00
      },
      {
        id: 2,
        codigo: 'PROD-005',
        nombre: 'Filtro de Aceite Premium HD',
        descripcion: 'Filtro de Aceite Premium HD',
        cantidad: 10,
        quantity: 10,
        precioLista: 95.00,
        precioUnitario: 85.50,
        precioNeto: 85.50,
        discount1: 10,
        discount5: 0,
        descuento: 10,
        descuento5to: 0,
        subtotal: 855.00
      }
    ],
    
    subtotal: 3855.00,
    igv: 693.90,
    total: 4548.90,
    estado: 'pendiente',
    observaciones: ''
  },
  {
    id: 2,
    numeroCotizacion: '45990',
    fecha: '2025-12-10',
    cliente: 'Transportes Rápidos SAC',
    ruc: '2045678912',
    asesor: 'Giancarlo Nicho',
    
    selectedClient: {
      nombreCliente: 'Transportes Rápidos SAC',
      ruc: '2045678912',
      direccion: 'Av. Túpac Amaru 456, Independencia',
      vendedor: 'Giancarlo Nicho',
      categoria: 'Cliente Regular'
    },
    
    productos: [
      {
        id: 3,
        codigo: 'PROD-008',
        nombre: 'Batería 12V 100Ah',
        descripcion: 'Batería 12V 100Ah',
        cantidad: 5,
        quantity: 5,
        precioLista: 500.00,
        precioUnitario: 450.00,
        precioNeto: 450.00,
        discount1: 10,
        discount5: 0,
        descuento: 10,
        descuento5to: 0,
        subtotal: 2250.00
      }
    ],
    
    subtotal: 2250.00,
    igv: 405.00,
    total: 2655.00,
    estado: 'pendiente',
    observaciones: ''
  },
  {
    id: 3,
    numeroCotizacion: '45988',
    fecha: '2025-12-08',
    cliente: 'Distribuidora Nacional EIRL',
    ruc: '2034567891',
    asesor: 'María Torres',
    
    selectedClient: {
      nombreCliente: 'Distribuidora Nacional EIRL',
      ruc: '2034567891',
      direccion: 'Jr. Los Alamos 789, Ate',
      vendedor: 'María Torres',
      categoria: 'Cliente VIP'
    },
    
    productos: [
      {
        id: 4,
        codigo: 'PROD-012',
        nombre: 'Kit de Repuestos Completo',
        descripcion: 'Kit de Repuestos Completo',
        cantidad: 1,
        quantity: 1,
        precioLista: 6200.00,
        precioUnitario: 5800.00,
        precioNeto: 5800.00,
        discount1: 6.45,
        discount5: 0,
        descuento: 6.45,
        descuento5to: 0,
        subtotal: 5800.00
      }
    ],
    
    subtotal: 5800.00,
    igv: 1044.00,
    total: 6844.00,
    estado: 'convertida',
    observaciones: 'Convertida a pedido ORD-2025-001'
  }
];

export const getQuotationStatus = (estado) => {
  const statuses = {
    pendiente: {
      label: 'Pendiente',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    convertida: {
      label: 'Convertida a Pedido',
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    rechazada: {
      label: 'Rechazada',
      color: 'bg-red-100 text-red-800 border-red-200'
    }
  };
  return statuses[estado] || statuses.pendiente;
};
