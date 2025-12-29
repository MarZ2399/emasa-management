// src/data/ordersData.js

export const orderStatuses = {
  PENDING: { value: 'pending', label: 'Pendiente', color: 'yellow' },
  CONFIRMED: { value: 'confirmed', label: 'Confirmado', color: 'blue' },
  IN_PRODUCTION: { value: 'in_production', label: 'En Producción', color: 'purple' },
  READY: { value: 'ready', label: 'Listo para Despacho', color: 'indigo' },
  SHIPPED: { value: 'shipped', label: 'Despachado', color: 'cyan' },
  DELIVERED: { value: 'delivered', label: 'Entregado', color: 'green' },
  CANCELLED: { value: 'cancelled', label: 'Cancelado', color: 'red' }
};

// 🆕 Tipos de Moneda
export const currencyTypes = [
  { value: 'PEN', label: 'Soles (S/)', symbol: 'S/' },
  { value: 'USD', label: 'Dólares ($)', symbol: '$' }
];

// 🆕 Formas de Pago (Condiciones de Pago)
export const paymentTerms = [
  { value: 'ADE', label: 'ADELANTOS PAGOS - CONTADO' },
  { value: 'F30', label: 'FACTURA 30 DIAS' },
  { value: 'F45', label: 'FACTURA 45 DIAS' },
  { value: 'F60', label: 'FACTURA 60 DIAS' },
  { value: 'F90', label: 'FACTURA 90 DIAS' }
];

// Métodos de Pago (Cómo se realiza el pago)
export const paymentMethods = [
  { value: 'transferencia', label: 'Transferencia Bancaria' },
  { value: 'deposito', label: 'Depósito Bancario' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'efectivo', label: 'Efectivo' }
];

export const deliveryTypes = [
  { value: 'retiro', label: 'Retiro en Agencia' },
  { value: 'despacho', label: 'Despacho a Dirección Registrada' },
  { value: 'nueva_direccion', label: 'Despacho a Otra Dirección' }
];

// Agencias de transporte para provincia
export const shippingAgencies = [
  { value: 'oltursa', label: 'Oltursa' },
  { value: 'cruz_del_sur', label: 'Cruz del Sur' },
  { value: 'movil_tours', label: 'Móvil Tours' },
  { value: 'shalom', label: 'Shalom Empresarial' },
  { value: 'flores', label: 'Flores Hermanos' },
  { value: 'linea', label: 'Línea' },
  { value: 'tepsa', label: 'Tepsa' },
  { value: 'civa', label: 'CIVA' },
  { value: 'exalmar', label: 'Exalmar' },
  { value: 'turismo_dias', label: 'Turismo Días' }
];

// Responsables de transporte por zona
export const transportResponsibleByZone = {
  lima_callao: [
    { value: 'empresa', label: 'Empresa (EMASA)' }
  ],
  provincia: [
    ...shippingAgencies
  ]
};

export const transportZones = [
  { value: 'lima_callao', label: 'Lima - Callao' },
  { value: 'provincia', label: 'Provincia' }
];

export const initialOrders = [
  {
    id: 1,
    numeroPedido: "PED-2025-001",
    quotationId: 1,
    clienteId: 1,
    clienteNombre: "Alta Tecnología En Diesel E.I.R.L",
    clienteRuc: "20600467759",
    ordenCompra: "OC-2025-0123",
    fechaPedido: "2025-12-10T10:30:00",
    fechaEntrega: "2025-12-20",
    status: 'confirmed',
    
    // Datos de pago y transporte
    pagoTransporte: "empresa",
    transporteZona: "lima_callao",
    tipoMoneda: "PEN",
    formaPago: "F30",
    metodoPago: "transferencia",
    
    // Datos de entrega
    tipoEntrega: "despacho",
    direccionDespacho: "Av. Los Pinos 123, Oficina 501",
    provinciaDespacho: "Lima",
    distritoDespacho: "San Isidro",
    observaciones: "Entregar en horario de oficina 9am-6pm",
    observacionesCreditos: "Pago contra entrega. Factura a 30 días.",
    observacionesLogistica: "Coordinar con recepción. Contacto: Juan Pérez (987654321)",
    
    // Agencia de despacho
    agenciaDespacho: {
      nombre: "Juan Pérez García",
      dni: "12345678",
      telefono: "987654321"
    },
    
    // Productos
    productos: [
      {
        id: 1,
        codigo: "PROD-001",
        descripcion: "Tanque de Combustible 1000L",
        cantidad: 5,
        precioUnitario: 1500.00,
        subtotal: 7500.00
      },
      {
        id: 2,
        codigo: "PROD-002",
        descripcion: "Válvula de Seguridad Industrial",
        cantidad: 10,
        precioUnitario: 250.00,
        subtotal: 2500.00
      }
    ],
    
    subtotal: 10000.00,
    igv: 1800.00,
    total: 11800.00,
    
    asesor: "Carlos Mendoza",
    createdBy: "admin@emasa.com",
    createdAt: "2025-12-10T10:30:00",
    updatedAt: "2025-12-10T10:30:00"
  },
  {
    id: 2,
    numeroPedido: "PED-2025-002",
    quotationId: 2,
    clienteId: 2,
    clienteNombre: "Comercial Los Andes S.A.C.",
    clienteRuc: "20987654321",
    ordenCompra: "OC-2025-0124",
    fechaPedido: "2025-12-11T14:20:00",
    fechaEntrega: "2025-12-25",
    status: 'in_production',
    
    // Datos de pago y transporte
    pagoTransporte: "oltursa",
    transporteZona: "provincia",
    tipoMoneda: "USD",
    formaPago: "ADE",
    metodoPago: "deposito",
    
    // Datos de entrega
    tipoEntrega: "despacho",
    direccionDespacho: "Av. Javier Prado 789",
    provinciaDespacho: "Arequipa",
    distritoDespacho: "Cercado",
    observaciones: "Coordinar con almacén antes de despachar",
    observacionesCreditos: "Adelanto 50% antes de producción, saldo contra entrega.",
    observacionesLogistica: "Envío por Oltursa a Arequipa. Contacto almacén: María Torres (912345678)",
    
    // Agencia de despacho
    agenciaDespacho: {
      nombre: "María Torres",
      dni: "87654321",
      telefono: "912345678"
    },
    
    // Productos
    productos: [
      {
        id: 1,
        codigo: "PROD-003",
        descripcion: "Sistema Hidráulico Industrial",
        cantidad: 2,
        precioUnitario: 3500.00,
        subtotal: 7000.00
      }
    ],
    
    subtotal: 7000.00,
    igv: 1260.00,
    total: 8260.00,
    
    asesor: "Ana Silva",
    createdBy: "admin@emasa.com",
    createdAt: "2025-12-11T14:20:00",
    updatedAt: "2025-12-11T14:20:00"
  },
  {
    id: 3,
    numeroPedido: "PED-2025-003",
    quotationId: 3,
    clienteId: 1,
    clienteNombre: "Alta Tecnología En Diesel E.I.R.L",
    clienteRuc: "20600467759",
    ordenCompra: "OC-2025-0125",
    fechaPedido: "2025-12-12T09:15:00",
    fechaEntrega: "2025-12-28",
    status: 'pending',
    
    // Datos de pago y transporte
    pagoTransporte: "empresa",
    transporteZona: "lima_callao",
    tipoMoneda: "PEN",
    formaPago: "F45",
    metodoPago: "transferencia",
    
    // Datos de entrega
    tipoEntrega: "retiro",
    direccionDespacho: "",
    provinciaDespacho: "",
    distritoDespacho: "",
    observaciones: "Cliente retirará personalmente",
    observacionesCreditos: "Factura a 45 días. Línea de crédito pre-aprobada.",
    observacionesLogistica: "Retiro en planta. Avisar con 24h de anticipación.",
    
    // Sin agencia de despacho (retiro)
    agenciaDespacho: null,
    
    // Productos
    productos: [
      {
        id: 1,
        codigo: "PROD-004",
        descripcion: "Bomba Hidráulica 500HP",
        cantidad: 1,
        precioUnitario: 8500.00,
        subtotal: 8500.00
      },
      {
        id: 2,
        codigo: "PROD-005",
        descripcion: "Accesorios de Instalación",
        cantidad: 3,
        precioUnitario: 450.00,
        subtotal: 1350.00
      }
    ],
    
    subtotal: 9850.00,
    igv: 1773.00,
    total: 11623.00,
    
    asesor: "Carlos Mendoza",
    createdBy: "admin@emasa.com",
    createdAt: "2025-12-12T09:15:00",
    updatedAt: "2025-12-12T09:15:00"
  }
];
