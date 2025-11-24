// src/data/quotationsData.js

export const initialQuotations = [
  {
    id: 1,
    numero: 'COT-2025-001',
    fecha: '12/11/2025',
    clienteRuc: '20604677590',
    clienteNombre: 'Alta Tecnologia En Diesel E.I.R.L',
    vendedor: 'Giancarlo Nicho',
    items: [
      {
        id: 1,
        codigo: 'PROD-001',
        producto: 'Aceite Motor 20W50',
        cantidad: 5,
        precioUnitario: 85.00,
        descuento: 0,
        subtotal: 425.00
      },
      {
        id: 2,
        codigo: 'PROD-002',
        producto: 'Filtro de Aire Toyota',
        cantidad: 10,
        precioUnitario: 35.00,
        descuento: 5,
        subtotal: 332.50
      }
    ],
    subtotal: 757.50,
    igv: 136.35,
    total: 893.85,
    estado: 'Pendiente',
    validezDias: 7,
    observaciones: 'Precios incluyen IGV. Entrega en 3 días hábiles.'
  },
  {
    id: 2,
    numero: 'COT-2025-002',
    fecha: '10/11/2025',
    clienteRuc: '20123456789',
    clienteNombre: 'Transportes García S.A.C.',
    vendedor: 'Yessir Florian',
    items: [
      {
        id: 1,
        codigo: 'PROD-004',
        producto: 'Llanta 195/65 R15',
        cantidad: 4,
        precioUnitario: 280.00,
        descuento: 10,
        subtotal: 1008.00
      }
    ],
    subtotal: 1008.00,
    igv: 181.44,
    total: 1189.44,
    estado: 'Aprobada',
    validezDias: 7,
    observaciones: 'Cliente frecuente. Aplicar descuento corporativo.'
  },
  {
    id: 3,
    numero: 'COT-2025-003',
    fecha: '08/11/2025',
    clienteRuc: '20987654321',
    clienteNombre: 'Servicios Industriales Lima',
    vendedor: 'Giancarlo Nicho',
    items: [
      {
        id: 1,
        codigo: 'PROD-003',
        producto: 'Batería 12V 65Ah',
        cantidad: 2,
        precioUnitario: 320.00,
        descuento: 0,
        subtotal: 640.00
      },
      {
        id: 2,
        codigo: 'PROD-005',
        producto: 'Pastillas de Freno Delanteras',
        cantidad: 3,
        precioUnitario: 95.00,
        descuento: 0,
        subtotal: 285.00
      }
    ],
    subtotal: 925.00,
    igv: 166.50,
    total: 1091.50,
    estado: 'Rechazada',
    validezDias: 7,
    observaciones: 'Cliente solicitó precio más competitivo.'
  }
];

export const quotationStatuses = [
  { value: 'Pendiente', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'Aprobada', label: 'Aprobada', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'Rechazada', label: 'Rechazada', color: 'bg-red-100 text-red-800 border-red-300' },
  { value: 'Vencida', label: 'Vencida', color: 'bg-gray-100 text-gray-800 border-gray-300' }
];

export const getStatusColor = (status) => {
  const statusObj = quotationStatuses.find(s => s.value === status);
  return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800';
};

export const calculateQuotationTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const igv = subtotal * 0.18; // 18% IGV
  const total = subtotal + igv;
  
  return {
    subtotal: Number(subtotal.toFixed(2)),
    igv: Number(igv.toFixed(2)),
    total: Number(total.toFixed(2))
  };
};
