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

export const paymentMethods = [
  { value: 'transferencia', label: 'Transferencia Bancaria' },
  { value: 'deposito', label: 'Depósito Bancario' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'efectivo', label: 'Efectivo' }
];

export const deliveryTypes = [
  { value: 'retiro', label: 'Retiro en Planta' },
  { value: 'despacho', label: 'Despacho a Dirección Registrada' },
  { value: 'otra_direccion', label: 'Despacho a Otra Dirección' }
];

export const transportResponsible = [
  { value: 'cliente', label: 'Cliente' },
  { value: 'empresa', label: 'Empresa (EMASA)' }
];

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
    plazos: "15 días",
    metodoPago: "transferencia",
    
    // Datos de entrega
    tipoEntrega: "despacho",
    direccionDespacho: "Av. Los Pinos 123, Oficina 501",
    provinciaDespacho: "Lima",
    distritoDespacho: "San Isidro",
    observaciones: "Entregar en horario de oficina 9am-6pm",
    
    // Agencia de despacho
    agenciaDespacho: {
      nombre: "Juan Pérez García",
      dni: "12345678",
      telefono: "987654321"
    },
    
    // Productos (desde cotización)
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
    
    pagoTransporte: "cliente",
    transporteZona: "lima_callao",
    plazos: "30 días",
    metodoPago: "deposito",
    
    tipoEntrega: "retiro",
    direccionDespacho: "",
    provinciaDespacho: "",
    distritoDespacho: "",
    observaciones: "Cliente retirará el día viernes",
    
    agenciaDespacho: null,
    
    productos: [
      {
        id: 3,
        codigo: "PROD-003",
        descripcion: "Bomba Hidráulica 50HP",
        cantidad: 2,
        precioUnitario: 3500.00,
        subtotal: 7000.00
      }
    ],
    
    subtotal: 7000.00,
    igv: 1260.00,
    total: 8260.00,
    
    asesor: "María López",
    createdBy: "admin@emasa.com",
    createdAt: "2025-12-11T14:20:00",
    updatedAt: "2025-12-12T09:15:00"
  }
];
