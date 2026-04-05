export interface Event {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  date: string;
  time: string;
  venue: string;
  provincia: string;
  localidad: string;
  price: number;
  category: string;
  image: string;
  flyer: string;
  flyerPosition?: string;
  featured: boolean;
  tags: string[];
  direccion: string;
  organizador: string;
  totalEntradas: number;
  entradasVendidas: number;
  mediosDePago: ("transferencia" | "mercadopago")[];
  mercadoPagoId: string;
  cbuCvu?: string;
  creatorId?: string;
  creatorRole?: "ORGANIZADOR" | "ADMIN";
  status?: "ACTIVO" | "AGOTADO" | "CANCELADO";
}

export const events: Event[] = [
  {
    id: "1",
    title: "Folk You Mondays 30/3",
    description:
      "Noche de folk y acustico con artistas independientes en un bar con historia.",
    longDescription:
      "Cada lunes, La Dama de Bollini abre sus puertas para una noche intima de folk y musica acustica. Artistas emergentes y consagrados comparten escenario en un ambiente unico. Entrada libre con consumicion minima.",
    date: "30 Marzo, 2026",
    time: "20:30",
    venue: "La Dama de Bollini, Buenos Aires",
    provincia: "Buenos Aires",
    localidad: "CABA",
    price: 0,
    category: "Musica en Vivo",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=500&fit=crop",
    flyer:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=700&fit=crop",
    flyerPosition: "center 35%",
    featured: true,
    tags: ["EVENTO DESTACADO", "MUSICA EN VIVO"],
    direccion: "",
    organizador: "La Dama Producciones",
    totalEntradas: 200,
    entradasVendidas: 0,
    mediosDePago: ["mercadopago"],
    mercadoPagoId: "",
  },
  {
    id: "2",
    title: "Carpe Diem - Decompression 2026",
    description:
      "Festival al aire libre con musica electronica, arte y experiencias inmersivas.",
    longDescription:
      "El Vivero de Carlos Keen se transforma en un espacio de libertad y expresion. Tres escenarios, instalaciones artisticas interactivas, food trucks y la mejor seleccion de DJs nacionales e internacionales. Una experiencia que va mas alla de la musica.",
    date: "2 Abril, 2026",
    time: "11:00",
    venue: "El Vivero de Carlos Keen, Buenos Aires",
    provincia: "Buenos Aires",
    localidad: "CABA",
    price: 65,
    category: "Fiestas",
    image:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=500&fit=crop",
    flyer:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=700&fit=crop",
    flyerPosition: "center 30%",
    featured: true,
    tags: ["EVENTO DESTACADO", "FIESTAS"],
    direccion: "",
    organizador: "Carpe Diem Eventos",
    totalEntradas: 500,
    entradasVendidas: 0,
    mediosDePago: ["mercadopago", "transferencia"],
    mercadoPagoId: "",
  },
  {
    id: "3",
    title: "After Mar - Vinocio 02/4",
    description:
      "Noche de vinos, tapas y musica en vivo frente al mar en un espacio unico.",
    longDescription:
      "Bai Bai presenta una velada donde el vino y la musica se encuentran. Degustacion de bodegas boutique, tabla de quesos artesanales y sets acusticos en un ambiente relajado con vista al atardecer.",
    date: "2 Abril, 2026",
    time: "20:00",
    venue: "Bai Bai, Mar del Plata",
    provincia: "Buenos Aires",
    localidad: "Mar del Plata",
    price: 35,
    category: "Recreacion",
    image:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=500&fit=crop",
    flyer:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=700&fit=crop",
    flyerPosition: "center 40%",
    featured: false,
    tags: ["RECREACION"],
    direccion: "",
    organizador: "Bai Bai Producciones",
    totalEntradas: 150,
    entradasVendidas: 0,
    mediosDePago: ["mercadopago"],
    mercadoPagoId: "",
  },
  {
    id: "4",
    title: "Ritmo y Sabor - Los Gallos / DJ Santo Cumbiero",
    description:
      "Noche de cumbia con Los Gallos en vivo y DJ Santo Cumbiero en los platos.",
    longDescription:
      "La mejor cumbia en vivo llega a Bai Bai. Los Gallos presentan su nuevo repertorio mientras DJ Santo Cumbiero mantiene la pista encendida toda la noche. Semana Santa arranca con ritmo y sabor.",
    date: "4 Abril, 2026",
    time: "20:00",
    venue: "Bai Bai, Buenos Aires",
    provincia: "Buenos Aires",
    localidad: "CABA",
    price: 25,
    category: "Fiestas",
    image:
      "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&h=500&fit=crop",
    flyer:
      "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400&h=700&fit=crop",
    flyerPosition: "center 28%",
    featured: false,
    tags: ["FIESTAS"],
    direccion: "",
    organizador: "Bai Bai Producciones",
    totalEntradas: 300,
    entradasVendidas: 0,
    mediosDePago: ["mercadopago"],
    mercadoPagoId: "",
  },
  {
    id: "5",
    title: "Mochi - Acustico",
    description:
      "Show acustico intimo de Mochi en el Centro Cultural Keuken Aonikenk.",
    longDescription:
      "Mochi presenta un show acustico especial en un formato reducido e intimo. Un recorrido por sus canciones mas queridas y adelantos de su nuevo material, en un espacio pensado para conectar con la musica de cerca.",
    date: "4 Abril, 2026",
    time: "21:00",
    venue: "Centro Cultural Keuken Aonikenk, Buenos Aires",
    provincia: "Buenos Aires",
    localidad: "CABA",
    price: 30,
    category: "Musica en Vivo",
    image:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=500&fit=crop",
    flyer:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=700&fit=crop",
    flyerPosition: "center 30%",
    featured: true,
    tags: ["EVENTO DESTACADO", "MUSICA EN VIVO"],
    direccion: "",
    organizador: "Mochi Music",
    totalEntradas: 200,
    entradasVendidas: 0,
    mediosDePago: ["mercadopago"],
    mercadoPagoId: "",
  },
  {
    id: "6",
    title: "Ezequiel Valdez Cuarteto + Hugo Fattoruso",
    description:
      "Jazz fusion en vivo con Ezequiel Valdez Cuarteto y el legendario Hugo Fattoruso.",
    longDescription:
      "Una noche irrepetible donde el jazz fusion argentino y uruguayo se encuentran. Ezequiel Valdez presenta su cuarteto junto al maestro Hugo Fattoruso en un show que promete ser historico. Patagonia 2026.",
    date: "9 Abril, 2026",
    time: "22:00",
    venue: "Nene Bar, Bariloche",
    provincia: "Cordoba",
    localidad: "Cordoba Capital",
    price: 45,
    category: "Musica en Vivo",
    image:
      "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&h=500&fit=crop",
    flyer:
      "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=700&fit=crop",
    flyerPosition: "center 34%",
    featured: false,
    tags: ["MUSICA EN VIVO"],
    direccion: "",
    organizador: "Nene Bar Producciones",
    totalEntradas: 250,
    entradasVendidas: 0,
    mediosDePago: ["mercadopago"],
    mercadoPagoId: "",
  },
  {
    id: "7",
    title: "Noche de Stand Up - Humor en Vivo",
    description:
      "Los mejores comediantes del momento en una noche de stand up imperdible.",
    longDescription:
      "Cuatro comediantes, un escenario y muchas risas. La noche de stand up reune a lo mejor del humor argentino en un formato dinamico y cercano. Cada funcion es unica e irrepetible.",
    date: "11 Abril, 2026",
    time: "21:30",
    venue: "Teatro Vorterix, Buenos Aires",
    provincia: "Buenos Aires",
    localidad: "CABA",
    price: 20,
    category: "Teatro",
    image:
      "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&h=500&fit=crop",
    flyer:
      "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=400&h=700&fit=crop",
    featured: false,
    tags: ["TEATRO"],
    direccion: "",
    organizador: "Vorterix Entretenimiento",
    totalEntradas: 180,
    entradasVendidas: 0,
    mediosDePago: ["mercadopago"],
    mercadoPagoId: "",
  },
  {
    id: "8",
    title: "Feria de Vinilos y Musica Independiente",
    description:
      "Compra, vende e intercambia vinilos con musica en vivo y cerveza artesanal.",
    longDescription:
      "Mas de 30 puestos de vinilos nuevos y usados, ediciones limitadas, merchandising y musica sonando todo el dia. Un punto de encuentro para coleccionistas y amantes de la musica en formato fisico.",
    date: "12 Abril, 2026",
    time: "14:00 - 22:00",
    venue: "Centro Cultural Recoleta, Buenos Aires",
    provincia: "Buenos Aires",
    localidad: "CABA",
    price: 0,
    category: "Recreacion",
    image:
      "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=800&h=500&fit=crop",
    flyer:
      "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=400&h=700&fit=crop",
    featured: false,
    tags: ["RECREACION"],
    direccion: "",
    organizador: "Colectivo Vinilo",
    totalEntradas: 150,
    entradasVendidas: 0,
    mediosDePago: ["mercadopago"],
    mercadoPagoId: "",
  },
  {
    id: "9",
    title: "Milonga del Angel",
    description:
      "Milonga tradicional con orquesta tipica en vivo y clase de tango para principiantes.",
    longDescription:
      "Cada sabado, la Milonga del Angel abre sus puertas con una clase gratuita para principiantes seguida de milonga con orquesta tipica en vivo. Un espacio donde el tango se vive como en sus origenes.",
    date: "18 Abril, 2026",
    time: "22:00",
    venue: "Salon Canning, Buenos Aires",
    provincia: "Buenos Aires",
    localidad: "CABA",
    price: 15,
    category: "Danza",
    image:
      "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&h=500&fit=crop",
    flyer:
      "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400&h=700&fit=crop",
    featured: false,
    tags: ["DANZA"],
    direccion: "",
    organizador: "Milonga del Angel",
    totalEntradas: 120,
    entradasVendidas: 0,
    mediosDePago: ["mercadopago"],
    mercadoPagoId: "",
  },
  {
    id: "10",
    title: "Cosquin Rock - Edicion Otono",
    description:
      "El festival de rock mas importante de Argentina vuelve con una edicion especial de otono.",
    longDescription:
      "Cosquin Rock presenta su edicion de otono con mas de 40 bandas en 3 escenarios. Rock nacional e internacional, camping, food court y una experiencia festivalera completa en el corazon de las sierras cordobesas.",
    date: "25 Abril, 2026",
    time: "15:00 - 04:00",
    venue: "Aerodromo Santa Maria de Punilla, Cordoba",
    provincia: "Cordoba",
    localidad: "Villa Carlos Paz",
    price: 80,
    category: "Fiestas",
    image:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=500&fit=crop",
    flyer:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=700&fit=crop",
    featured: true,
    tags: ["EVENTO DESTACADO", "FIESTAS"],
    direccion: "",
    organizador: "Cosquin Rock SA",
    totalEntradas: 500,
    entradasVendidas: 0,
    mediosDePago: ["mercadopago", "transferencia"],
    mercadoPagoId: "",
  },
  {
    id: "11",
    title: "Cine al Aire Libre - Clasicos Argentinos",
    description:
      "Proyeccion de peliculas clasicas argentinas bajo las estrellas en el Parque Centenario.",
    longDescription:
      "Traeete tu manta, tu mate y disfruta de una seleccion curada de clasicos del cine argentino proyectados en pantalla gigante. Entrada libre y gratuita. Food trucks disponibles.",
    date: "3 Mayo, 2026",
    time: "20:30",
    venue: "Parque Centenario, Buenos Aires",
    provincia: "Buenos Aires",
    localidad: "CABA",
    price: 0,
    category: "Recreacion",
    image:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=500&fit=crop",
    flyer:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=700&fit=crop",
    featured: false,
    tags: ["RECREACION"],
    direccion: "",
    organizador: "Municipalidad de Buenos Aires",
    totalEntradas: 150,
    entradasVendidas: 0,
    mediosDePago: ["mercadopago"],
    mercadoPagoId: "",
  },
  {
    id: "12",
    title: "Duki - Antes de Amanecer Tour",
    description:
      "Duki presenta su nuevo album en un show masivo en el Estadio Unico de La Plata.",
    longDescription:
      "El artista mas grande del trap argentino llega al Estadio Unico con su gira Antes de Amanecer. Produccion de primer nivel, invitados especiales y un setlist que recorre toda su carrera. Entradas limitadas.",
    date: "10 Mayo, 2026",
    time: "20:00",
    venue: "Estadio Unico, La Plata",
    provincia: "Buenos Aires",
    localidad: "La Plata",
    price: 90,
    category: "Musica en Vivo",
    image:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=500&fit=crop",
    flyer:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=700&fit=crop",
    featured: true,
    tags: ["EVENTO DESTACADO", "MUSICA EN VIVO"],
    direccion: "",
    organizador: "Dale Play Producciones",
    totalEntradas: 200,
    entradasVendidas: 0,
    mediosDePago: ["mercadopago"],
    mercadoPagoId: "",
  },
  {
    id: "13",
    title: "La Delio Valdez en Tucuman",
    description:
      "La cumbia orquestal mas popular de Argentina llega al norte con todo su ritmo.",
    longDescription:
      "La Delio Valdez trae su energia inconfundible al Anfiteatro de Tucuman. Una noche de cumbia colombiana, ska y ritmos latinos con la orquesta mas convocante del pais.",
    date: "15 Mayo, 2026",
    time: "21:00",
    venue: "Anfiteatro Municipal, Tucuman",
    provincia: "Tucuman",
    localidad: "San Miguel de Tucuman",
    price: 35,
    category: "Musica en Vivo",
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=500&fit=crop",
    flyer:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=700&fit=crop",
    featured: false,
    tags: ["MUSICA EN VIVO"],
    direccion: "",
    organizador: "La Delio Valdez Management",
    totalEntradas: 250,
    entradasVendidas: 0,
    mediosDePago: ["mercadopago"],
    mercadoPagoId: "",
  },
  {
    id: "14",
    title: "Tango Under the Stars",
    description:
      "Milonga al aire libre con show de tango y clase abierta para principiantes.",
    longDescription:
      "Una noche magica en el corazon de San Telmo. Show de tango profesional, clase gratuita para quienes quieran dar sus primeros pasos y milonga abierta hasta la medianoche.",
    date: "16 Mayo, 2026",
    time: "20:00",
    venue: "Plaza Dorrego, Buenos Aires",
    provincia: "Buenos Aires",
    localidad: "CABA",
    price: 0,
    category: "Danza",
    image:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&h=500&fit=crop",
    flyer:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=700&fit=crop",
    featured: false,
    tags: ["DANZA"],
    direccion: "",
    organizador: "Tango Buenos Aires",
    totalEntradas: 120,
    entradasVendidas: 0,
    mediosDePago: ["mercadopago"],
    mercadoPagoId: "",
  },
  {
    id: "15",
    title: "Wos - Oscuro Extasis Tour",
    description:
      "Wos llega a Mendoza con su nueva gira presentando material inedito.",
    longDescription:
      "El fenomeno del rap argentino presenta Oscuro Extasis en un show que combina hip hop, rock y experimentacion sonora. Una produccion visual impactante y un repertorio que abarca toda su carrera.",
    date: "22 Mayo, 2026",
    time: "21:00",
    venue: "Arena Maipu, Mendoza",
    provincia: "Mendoza",
    localidad: "Mendoza Capital",
    price: 70,
    category: "Musica en Vivo",
    image:
      "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&h=500&fit=crop",
    flyer:
      "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=400&h=700&fit=crop",
    featured: false,
    tags: ["MUSICA EN VIVO"],
    direccion: "",
    organizador: "Kraken Music Group",
    totalEntradas: 250,
    entradasVendidas: 0,
    mediosDePago: ["mercadopago"],
    mercadoPagoId: "",
  },
];

export const categories = [
  "Todos los Eventos",
  "Musica en Vivo",
  "Fiestas",
  "Teatro",
  "Danza",
  "Recreacion",
];
