// Base de datos de productos con categorías y características
export const allProducts = [
  // Categoría: Aceites y Lubricantes
  {
    id: 1,
    codigo: 'PROD-001',
    nombre: 'Aceite Motor 20W-50 Premium',
    categoria: 'Aceites y Lubricantes',
    subcategoria: 'Aceites Motor',
    marca: 'Castrol',
    precio: 45.00,
    stock: 150,
    descripcion: 'Aceite mineral premium para motores diesel y gasolina',
    imagen: '/productos/aceite-20w50.jpg',
    caracteristicas: ['20W-50', 'Motor', 'Diesel', 'Gasolina']
  },
  {
    id: 2,
    codigo: 'PROD-002',
    nombre: 'Aceite Motor 15W-40 Sintético',
    categoria: 'Aceites y Lubricantes',
    subcategoria: 'Aceites Motor',
    marca: 'Mobil',
    precio: 65.00,
    stock: 120,
    descripcion: 'Aceite sintético de alto rendimiento',
    imagen: '/productos/aceite-15w40.jpg',
    caracteristicas: ['15W-40', 'Motor', 'Sintético', 'Alto Rendimiento']
  },
  {
    id: 3,
    codigo: 'PROD-003',
    nombre: 'Filtro de Aceite Premium',
    categoria: 'Filtros',
    subcategoria: 'Filtros de Aceite',
    marca: 'Bosch',
    precio: 25.00,
    stock: 200,
    descripcion: 'Filtro de aceite de alta calidad compatible con múltiples motores',
    imagen: '/productos/filtro-aceite.jpg',
    caracteristicas: ['Filtro', 'Aceite', 'Compatible', 'Universal']
  },
  {
    id: 4,
    codigo: 'PROD-004',
    nombre: 'Limpiador de Inyectores Diesel',
    categoria: 'Aditivos y Químicos',
    subcategoria: 'Limpiadores',
    marca: 'Wynn\'s',
    precio: 35.00,
    stock: 80,
    descripcion: 'Limpiador profesional para sistemas de inyección diesel',
    imagen: '/productos/limpiador-inyectores.jpg',
    caracteristicas: ['Limpiador', 'Inyectores', 'Diesel', 'Mantenimiento']
  },
  {
    id: 5,
    codigo: 'PROD-005',
    nombre: 'Aceite Transmisión ATF Dexron VI',
    categoria: 'Aceites y Lubricantes',
    subcategoria: 'Aceites Transmisión',
    marca: 'Valvoline',
    precio: 55.00,
    stock: 90,
    descripcion: 'Aceite para transmisiones automáticas',
    imagen: '/productos/aceite-transmision.jpg',
    caracteristicas: ['ATF', 'Transmisión', 'Automática', 'Dexron VI']
  },
  {
    id: 6,
    codigo: 'PROD-006',
    nombre: 'Filtro de Aire Motor Diesel',
    categoria: 'Filtros',
    subcategoria: 'Filtros de Aire',
    marca: 'Mann Filter',
    precio: 30.00,
    stock: 150,
    descripcion: 'Filtro de aire de alta eficiencia para motores diesel',
    imagen: '/productos/filtro-aire.jpg',
    caracteristicas: ['Filtro', 'Aire', 'Diesel', 'Alta Eficiencia']
  },
  {
    id: 7,
    codigo: 'PROD-007',
    nombre: 'Aditivo Mejora Cetanaje Diesel',
    categoria: 'Aditivos y Químicos',
    subcategoria: 'Mejoradores',
    marca: 'Liqui Moly',
    precio: 40.00,
    stock: 70,
    descripcion: 'Mejora el arranque y la combustión del diesel',
    imagen: '/productos/aditivo-cetanaje.jpg',
    caracteristicas: ['Aditivo', 'Diesel', 'Cetanaje', 'Combustión']
  },
  {
    id: 8,
    codigo: 'PROD-008',
    nombre: 'Grasa Multiusos Litio Premium',
    categoria: 'Grasas y Lubricantes',
    subcategoria: 'Grasas Industriales',
    marca: 'Shell',
    precio: 20.00,
    stock: 180,
    descripcion: 'Grasa de litio para uso industrial y automotriz',
    imagen: '/productos/grasa-litio.jpg',
    caracteristicas: ['Grasa', 'Litio', 'Multiusos', 'Industrial']
  },
  {
    id: 9,
    codigo: 'PROD-009',
    nombre: 'Refrigerante Motor Verde Long Life',
    categoria: 'Refrigerantes',
    subcategoria: 'Refrigerantes Motor',
    marca: 'Prestone',
    precio: 28.00,
    stock: 100,
    descripcion: 'Refrigerante de larga duración para sistemas de enfriamiento',
    imagen: '/productos/refrigerante.jpg',
    caracteristicas: ['Refrigerante', 'Verde', 'Long Life', 'Enfriamiento']
  },
  {
    id: 10,
    codigo: 'PROD-010',
    nombre: 'Filtro de Combustible Diesel',
    categoria: 'Filtros',
    subcategoria: 'Filtros de Combustible',
    marca: 'Baldwin',
    precio: 35.00,
    stock: 130,
    descripcion: 'Filtro separador de agua para diesel',
    imagen: '/productos/filtro-combustible.jpg',
    caracteristicas: ['Filtro', 'Combustible', 'Diesel', 'Separador Agua']
  },
  {
    id: 11,
    codigo: 'PROD-011',
    nombre: 'Aceite Hidráulico ISO 68',
    categoria: 'Aceites y Lubricantes',
    subcategoria: 'Aceites Hidráulicos',
    marca: 'Total',
    precio: 50.00,
    stock: 60,
    descripcion: 'Aceite hidráulico para sistemas de alta presión',
    imagen: '/productos/aceite-hidraulico.jpg',
    caracteristicas: ['Hidráulico', 'ISO 68', 'Alta Presión', 'Industrial']
  },
  {
    id: 12,
    codigo: 'PROD-012',
    nombre: 'Desengrasante Industrial Heavy Duty',
    categoria: 'Aditivos y Químicos',
    subcategoria: 'Desengrasantes',
    marca: 'CRC',
    precio: 32.00,
    stock: 95,
    descripcion: 'Desengrasante de alta potencia para motores',
    imagen: '/productos/desengrasante.jpg',
    caracteristicas: ['Desengrasante', 'Industrial', 'Heavy Duty', 'Limpieza']
  }
];

// Función para obtener sugerencias basadas en compras previas
export const getProductSuggestions = (purchaseHistory) => {
  if (!purchaseHistory || purchaseHistory.length === 0) {
    return [];
  }

  // Extraer categorías, subcategorías y características de las compras
  const purchasedCategories = new Set();
  const purchasedSubcategories = new Set();
  const purchasedKeywords = new Set();
  const purchasedCodes = new Set();

  purchaseHistory.forEach(purchase => {
    purchasedCodes.add(purchase.codigoProducto);
    
    // Buscar el producto en la base de datos
    const product = allProducts.find(p => p.codigo === purchase.codigoProducto);
    
    if (product) {
      purchasedCategories.add(product.categoria);
      purchasedSubcategories.add(product.subcategoria);
      product.caracteristicas.forEach(keyword => purchasedKeywords.add(keyword.toLowerCase()));
    }
  });

  // Calcular score de relevancia para cada producto
  const suggestions = allProducts
    .filter(product => !purchasedCodes.has(product.codigo)) // Excluir productos ya comprados
    .map(product => {
      let score = 0;

      // +3 puntos si es de la misma categoría
      if (purchasedCategories.has(product.categoria)) {
        score += 3;
      }

      // +5 puntos si es de la misma subcategoría
      if (purchasedSubcategories.has(product.subcategoria)) {
        score += 5;
      }

      // +1 punto por cada característica coincidente
      product.caracteristicas.forEach(keyword => {
        if (purchasedKeywords.has(keyword.toLowerCase())) {
          score += 1;
        }
      });

      return {
        ...product,
        relevanceScore: score
      };
    })
    .filter(product => product.relevanceScore > 0) // Solo productos con alguna relevancia
    .sort((a, b) => b.relevanceScore - a.relevanceScore) // Ordenar por relevancia
    .slice(0, 8); // Top 8 sugerencias

  return suggestions;
};

// Función para obtener compras de un cliente
export const getClientPurchaseHistory = (clienteRUC, purchaseHistoryData) => {
  return purchaseHistoryData.filter(purchase => purchase.ruc === clienteRUC);
};
