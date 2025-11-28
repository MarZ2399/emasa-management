// Base de datos de clientes con toda su información
export const clientsDatabase = [
  {
    // Identificador
    ruc: '2060467759',
    
    // DATOS DEL CLIENTE
    nombreCliente: 'Alta Tecnologia En Diesel E.I.R.L',
    tipoDoc: 'RUC',
    direccion: 'Av Las Torres De Huachipa 131 - Fnd La Estrella Ate',
    distrito: 'Ate',
    provincia: 'Lima',
    departamento: 'Lima',
    zonaCliente: 'Zona Lima',
    fechaCreacion: '24/11/2022',
    
    // DATOS COMERCIALES
    giro: '12 - Tienda (Minorista)',
    categoria: '02',
    vendedor: 'Giancarlo Nicho',
    ultVenta: '29/04/2025',
    lineaCredito: '$0.00',
    deudaTotal: '$0.00',
    diasAtraso: '0',
    clienteMalPagador: 'No',
    motivoMalPagador: 'Sin Antecedente',
    
    // DATOS CONTACTO (Array de contactos)
    contactos: [
      {
        title: 'Contacto 1',
        email: 'altatecnologiadiesel@gmail.com',
        phone: '973996878',
        fullName: 'Juan Carlos Pérez',
        birthday: '12/03/1985'
      },
      {
        title: 'Contacto 2',
        email: 'jperez@altatecnologia.com',
        phone: '987654321',
        fullName: 'María Elena Torres',
        birthday: '22/07/1990'
      },
      {
        title: 'Contacto 3',
        email: 'ventas@altatecnologia.com',
        phone: '965432178',
        fullName: 'Roberto Sánchez',
        birthday: '15/11/1988'
      }
    ],
    
    // DATOS ECOMMERCE
    usuario: 'ALTA.TEC',
    clave: '123',
    corePrincipal: 'Inyección y Encendido -> USD 29370',
    promedioVtas2025: '$5,263',
    mesesConVtas2025: '2',
    promedioVtas20212025: '$2,999',
    mesesConVtas20212025: '10'
  },
  {
    ruc: '2045678901',
    nombreCliente: 'Comercial Los Andes S.A.C.',
    tipoDoc: 'RUC',
    direccion: 'Jr. Los Pinos 456 - San Juan de Lurigancho',
    distrito: 'San Juan de Lurigancho',
    provincia: 'Lima',
    departamento: 'Lima',
    zonaCliente: 'Zona Este',
    fechaCreacion: '15/03/2023',
    
    giro: '08 - Distribuidor',
    categoria: '01',
    vendedor: 'Yessir Flores',
    ultVenta: '05/06/2025',
    lineaCredito: '$5,000.00',
    deudaTotal: '$1,200.00',
    diasAtraso: '15',
    clienteMalPagador: 'No',
    motivoMalPagador: 'Sin Antecedente',
    
    contactos: [
      {
        title: 'Contacto 1',
        email: 'ventas@losandes.com',
        phone: '987123456',
        fullName: 'Luis Alberto Díaz',
        birthday: '05/08/1982'
      },
      {
        title: 'Contacto 2',
        email: 'administracion@losandes.com',
        phone: '945678123',
        fullName: 'Carmen Rosa Vargas',
        birthday: '18/12/1991'
      },
      {
        title: 'Contacto 3',
        email: 'logistica@losandes.com',
        phone: '912345678',
        fullName: 'Fernando Quispe',
        birthday: '30/04/1987'
      }
    ],
    
    usuario: 'LOS.ANDES',
    clave: '456',
    corePrincipal: 'Repuestos Generales -> USD 15000',
    promedioVtas2025: '$3,500',
    mesesConVtas2025: '5',
    promedioVtas20212025: '$2,100',
    mesesConVtas20212025: '18'
  }
];

// Registros de llamadas asociados por RUC
export const initialCallRecords = [
  {
    id: 1,
    clienteRuc: '2060467759',
    fechaGestion: '08/06/2025 15:36:32',
    resultadoGestion: 'No Contesta',
    asesor: 'Yessir Flores',
    contacto: 'Outbound',
    telef1: '973996878', // Juan Carlos Pérez
    telef2: '',
    usuario: 'ALTA.TEC',
    clave: '',
    contactadoNombre: 'Juan Carlos Pérez',
    observaciones: 'Primera llamada, no respondió'
  },
  {
    id: 2,
    clienteRuc: '2060467759',
    fechaGestion: '07/05/2025 14:06:20',
    resultadoGestion: 'Seguimiento / Consulta De Pedido',
    asesor: 'Giancarlo Nicho',
    contacto: 'Inbound',
    telef1: '987654321', // María Elena Torres
    telef2: '973996878',
    usuario: 'ALTA.TEC',
    clave: '',
    contactadoNombre: 'María Elena Torres',
    observaciones: 'Cliente solicitó información sobre pedido #12345'
  },
  {
    id: 3,
    clienteRuc: '2060467759',
    fechaGestion: '29/04/2025 11:18:33',
    resultadoGestion: 'Venta',
    asesor: 'Giancarlo Nicho',
    contacto: 'Inbound',
    telef1: '965432178', // Roberto Sánchez
    telef2: '',
    usuario: 'ALTA.TEC',
    clave: '',
    contactadoNombre: 'Roberto Sánchez',
    observaciones: 'Venta exitosa de producto Premium'
  },
  {
    id: 4,
    clienteRuc: '2060467759',
    fechaGestion: '29/04/2025 11:18:18',
    resultadoGestion: 'Venta',
    asesor: 'Giancarlo Nicho',
    contacto: 'Inbound',
    telef1: '973996878', // Juan Carlos Pérez
    telef2: '987654321',
    usuario: 'ALTA.TEC',
    clave: '',
    contactadoNombre: 'Juan Carlos Pérez',
    observaciones: 'Cliente recurrente, compra mensual'
  },
  {
    id: 5,
    clienteRuc: '2060467759',
    fechaGestion: '29/04/2025 11:10:19',
    resultadoGestion: '- Cotización',
    asesor: 'Giancarlo Nicho',
    contacto: 'Inbound',
    telef1: '987654321', // María Elena Torres
    telef2: '',
    usuario: 'ALTA.TEC',
    clave: '',
    contactadoNombre: 'María Elena Torres',
    observaciones: 'Solicitó cotización para 50 unidades'
  },
  {
    id: 6,
    clienteRuc: '2060467759',
    fechaGestion: '29/04/2025 09:54:35',
    resultadoGestion: '- Cotización',
    asesor: 'Giancarlo Nicho',
    contacto: 'Inbound',
    telef1: '965432178', // Roberto Sánchez
    telef2: '973996878',
    usuario: 'ALTA.TEC',
    clave: '',
    contactadoNombre: 'Roberto Sánchez',
    observaciones: 'Envió cotización por correo'
  },
  {
    id: 7,
    clienteRuc: '2060467759',
    fechaGestion: '28/04/2025 17:34:25',
    resultadoGestion: 'No Contesta',
    asesor: 'Giancarlo Nicho',
    contacto: 'Outbound',
    telef1: '973996878', // Juan Carlos Pérez
    telef2: '',
    usuario: 'ALTA.TEC',
    clave: '',
    contactadoNombre: 'Juan Carlos Pérez',
    observaciones: 'Intentar nuevamente mañana'
  },
  {
    id: 8,
    clienteRuc: '2045678901',
    fechaGestion: '06/06/2025 10:25:10',
    resultadoGestion: 'Venta',
    asesor: 'Yessir Flores',
    contacto: 'Outbound',
    telef1: '987123456', // Luis Alberto Díaz
    telef2: '',
    usuario: 'LOS.ANDES',
    clave: '',
    contactadoNombre: 'Luis Alberto Díaz',
    observaciones: 'Venta de repuestos por $800'
  },
  {
    id: 9,
    clienteRuc: '2045678901',
    fechaGestion: '01/06/2025 15:30:45',
    resultadoGestion: 'Seguimiento / Consulta De Pedido',
    asesor: 'Yessir Flores',
    contacto: 'Inbound',
    telef1: '945678123', // Carmen Rosa Vargas
    telef2: '987123456',
    usuario: 'LOS.ANDES',
    clave: '',
    contactadoNombre: 'Carmen Rosa Vargas',
    observaciones: 'Consulta sobre pago pendiente'
  }
];



// Función helper para buscar cliente por RUC
export const findClientByRuc = (ruc) => {
  return clientsDatabase.find(client => client.ruc === ruc);
};

// Función helper para obtener llamadas de un cliente
export const getCallsByClientRuc = (ruc) => {
  return initialCallRecords.filter(call => call.clienteRuc === ruc);
};

// Función helper para buscar cliente por nombre (búsqueda parcial)
export const findClientByName = (nombre) => {
  const searchTerm = nombre.toLowerCase();
  return clientsDatabase.find(client => 
    client.nombreCliente.toLowerCase().includes(searchTerm)
  );
};
