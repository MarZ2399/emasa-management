// src/data/purchaseHistoryData.js

export const purchaseHistory = {
  // Compras del cliente: Alta Tecnologia En Diesel E.I.R.L (RUC: 2060467759)
  '2060467759': [
    {
      id: 1,
      fechaVenta: '15/07/2025',
      lineaCredito: 'MS',
      vendedorHecho: 'Yessir Florian',
      ruc: '2060467759',
      razonSocial: 'Alta Tecnologia En Diesel E.I.R.L',
      codigoProducto: '1.GSO.601.721',
      descripcionProducto: 'BAT 135 CARLS TEMASA',
      numRegistro: '460278',
      tipoDocumento: 'F',
      numDocumento: '190-0216504',
      cantidad: 5,
      precioUnitarioNeto: 156.80,
      descuento1: 25.00,
      descuento8: 12.00,
      total: 31.93,
      estado: 'Entregado',
      formaPago: 'Crédito 30 días'
    },
    {
      id: 2,
      fechaVenta: '10/06/2025',
      lineaCredito: 'MS',
      vendedorHecho: 'Giancarlo Nicho',
      ruc: '2060467759',
      razonSocial: 'Alta Tecnologia En Diesel E.I.R.L',
      codigoProducto: 'PROD-002',
      descripcionProducto: 'Filtro de Aire Toyota',
      numRegistro: '460279',
      tipoDocumento: 'F',
      numDocumento: '190-0216505',
      cantidad: 10,
      precioUnitarioNeto: 35.00,
      descuento1: 15.00,
      descuento8: 8.50,
      total: 350.00,
      estado: 'Entregado',
      formaPago: 'Contado'
    },
    {
      id: 3,
      fechaVenta: '05/06/2025',
      lineaCredito: 'MS',
      vendedorHecho: 'Giancarlo Nicho',
      ruc: '2060467759',
      razonSocial: 'Alta Tecnologia En Diesel E.I.R.L',
      codigoProducto: 'PROD-003',
      descripcionProducto: 'Batería 12V 65Ah Premium',
      numRegistro: '460280',
      tipoDocumento: 'B',
      numDocumento: '190-0216506',
      cantidad: 2,
      precioUnitarioNeto: 320.00,
      descuento1: 20.00,
      descuento8: 10.50,
      total: 640.00,
      estado: 'En tránsito',
      formaPago: 'Crédito 60 días'
    },
    {
      id: 4,
      fechaVenta: '28/05/2025',
      lineaCredito: 'MS',
      vendedorHecho: 'Yessir Florian',
      ruc: '2060467759',
      razonSocial: 'Alta Tecnologia En Diesel E.I.R.L',
      codigoProducto: 'PROD-005',
      descripcionProducto: 'Pastillas de Freno Delanteras',
      numRegistro: '460281',
      tipoDocumento: 'F',
      numDocumento: '190-0216507',
      cantidad: 8,
      precioUnitarioNeto: 95.00,
      descuento1: 18.00,
      descuento8: 9.50,
      total: 760.00,
      estado: 'Entregado',
      formaPago: 'Crédito 30 días'
    },
    {
      id: 5,
      fechaVenta: '15/05/2025',
      lineaCredito: 'MS',
      vendedorHecho: 'Giancarlo Nicho',
      ruc: '2060467759',
      razonSocial: 'Alta Tecnologia En Diesel E.I.R.L',
      codigoProducto: 'PROD-010',
      descripcionProducto: 'Aceite Motor Castrol 5W-30',
      numRegistro: '460282',
      tipoDocumento: 'F',
      numDocumento: '190-0216508',
      cantidad: 20,
      precioUnitarioNeto: 45.50,
      descuento1: 12.00,
      descuento8: 6.00,
      total: 910.00,
      estado: 'Entregado',
      formaPago: 'Contado'
    }
  ],
  
  // Compras del cliente: Comercial Los Andes S.A.C. (RUC: 2045678901)
  '2045678901': [
    {
      id: 6,
      fechaVenta: '20/06/2025',
      lineaCredito: 'MS',
      vendedorHecho: 'Yessir Florian',
      ruc: '2045678901',
      razonSocial: 'Comercial Los Andes S.A.C.',
      codigoProducto: 'PROD-004',
      descripcionProducto: 'Llanta 195/65 R15',
      numRegistro: '460283',
      tipoDocumento: 'F',
      numDocumento: '190-0216509',
      cantidad: 4,
      precioUnitarioNeto: 280.00,
      descuento1: 25.00,
      descuento8: 12.00,
      total: 1120.00,
      estado: 'Entregado',
      formaPago: 'Contado'
    },
    {
      id: 7,
      fechaVenta: '10/06/2025',
      lineaCredito: 'MS',
      vendedorHecho: 'Yessir Florian',
      ruc: '2045678901',
      razonSocial: 'Comercial Los Andes S.A.C.',
      codigoProducto: 'PROD-006',
      descripcionProducto: 'Refrigerante Verde 50/50',
      numRegistro: '460284',
      tipoDocumento: 'B',
      numDocumento: '190-0216510',
      cantidad: 15,
      precioUnitarioNeto: 42.00,
      descuento1: 16.00,
      descuento8: 8.00,
      total: 630.00,
      estado: 'Entregado',
      formaPago: 'Crédito 30 días'
    }
  ]
};

export const getClientPurchases = (ruc) => {
  return purchaseHistory[ruc] || [];
};

export const getEstadoStyle = (estado) => {
  const styles = {
    'Entregado': 'bg-green-100 text-green-800 border-green-200',
    'En tránsito': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Pendiente': 'bg-orange-100 text-orange-800 border-orange-200',
    'Cancelado': 'bg-red-100 text-red-800 border-red-200'
  };
  return styles[estado] || 'bg-gray-100 text-gray-800 border-gray-200';
};
