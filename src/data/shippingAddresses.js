// src/data/shippingAddresses.js
export const shippingAddresses = [
  {
    id: 1,
    clienteId: 1,
    direccion: "Av. Los Pinos 123, Oficina 501",
    provincia: "Lima",
    distrito: "San Isidro",
    referencia: "Edificio Corporativo Torre A",
    isDefault: true
  },
  {
    id: 2,
    clienteId: 1,
    direccion: "Jr. Las Camelias 456",
    provincia: "Lima",
    distrito: "San Borja",
    referencia: "Al costado del parque",
    isDefault: false
  },
  {
    id: 3,
    clienteId: 2,
    direccion: "Av. Javier Prado 789",
    provincia: "Lima",
    distrito: "La Victoria",
    referencia: "Frente a Plaza Vea",
    isDefault: true
  }
];

export const provincias = [
  "Lima",
  "Callao",
  "Arequipa",
  "Cusco",
  "Trujillo",
  "Chiclayo",
  "Piura",
  "Ica",
  "Tacna"
];

export const distritosByProvincia = {
  "Lima": [
    "Cercado de Lima",
    "San Isidro",
    "Miraflores",
    "San Borja",
    "La Molina",
    "Surco",
    "Lince",
    "Jesús María",
    "Magdalena",
    "Pueblo Libre",
    "San Miguel",
    "La Victoria",
    "Breña",
    "Los Olivos",
    "Independencia",
    "San Juan de Lurigancho"
  ],
  "Callao": [
    "Callao",
    "Bellavista",
    "Carmen de la Legua",
    "La Perla",
    "La Punta",
    "Ventanilla"
  ],
  "Arequipa": [
    "Cercado",
    "Cayma",
    "Cerro Colorado",
    "Yanahuara",
    "Miraflores",
    "Paucarpata"
  ],
  "Cusco": [
    "Cusco",
    "Wanchaq",
    "San Sebastián",
    "San Jerónimo",
    "Santiago"
  ],
  "Trujillo": [
    "Trujillo",
    "La Esperanza",
    "El Porvenir",
    "Víctor Larco",
    "Huanchaco"
  ]
};
