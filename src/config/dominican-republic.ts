/**
 * Provincias de República Dominicana y sus municipios principales, para el
 * checkout. El cliente elige provincia y luego ciudad/municipio de la lista,
 * pero siempre puede escribir otro (sector, distrito municipal, etc.).
 */
export interface DRProvince {
  name: string;
  cities: string[];
}

export const DR_PROVINCES: DRProvince[] = [
  { name: "Distrito Nacional", cities: ["Santo Domingo de Guzmán"] },
  {
    name: "Santo Domingo",
    cities: [
      "Santo Domingo Este",
      "Santo Domingo Oeste",
      "Santo Domingo Norte",
      "Boca Chica",
      "Los Alcarrizos",
      "Pedro Brand",
      "San Antonio de Guerra",
    ],
  },
  {
    name: "Santiago",
    cities: [
      "Santiago de los Caballeros",
      "Bisonó (Navarrete)",
      "Jánico",
      "Licey al Medio",
      "Puñal",
      "Sabana Iglesia",
      "San José de las Matas",
      "Tamboril",
      "Villa González",
    ],
  },
  {
    name: "Azua",
    cities: [
      "Azua de Compostela",
      "Estebanía",
      "Guayabal",
      "Las Charcas",
      "Las Yayas de Viajama",
      "Padre Las Casas",
      "Peralta",
      "Pueblo Viejo",
      "Sabana Yegua",
      "Tábara Arriba",
    ],
  },
  {
    name: "Bahoruco",
    cities: ["Neiba", "Galván", "Los Ríos", "Tamayo", "Villa Jaragua"],
  },
  {
    name: "Barahona",
    cities: [
      "Santa Cruz de Barahona",
      "Cabral",
      "El Peñón",
      "Enriquillo",
      "Fundación",
      "Jaquimeyes",
      "La Ciénaga",
      "Las Salinas",
      "Paraíso",
      "Polo",
      "Vicente Noble",
    ],
  },
  {
    name: "Dajabón",
    cities: [
      "Dajabón",
      "El Pino",
      "Loma de Cabrera",
      "Partido",
      "Restauración",
    ],
  },
  {
    name: "Duarte",
    cities: [
      "San Francisco de Macorís",
      "Arenoso",
      "Castillo",
      "Eugenio María de Hostos",
      "Las Guáranas",
      "Pimentel",
      "Villa Riva",
    ],
  },
  { name: "El Seibo", cities: ["El Seibo", "Miches"] },
  {
    name: "Elías Piña",
    cities: [
      "Comendador",
      "Bánica",
      "El Llano",
      "Hondo Valle",
      "Juan Santiago",
      "Pedro Santana",
    ],
  },
  {
    name: "Espaillat",
    cities: ["Moca", "Cayetano Germosén", "Gaspar Hernández", "Jamao al Norte"],
  },
  {
    name: "Hato Mayor",
    cities: ["Hato Mayor del Rey", "El Valle", "Sabana de la Mar"],
  },
  { name: "Hermanas Mirabal", cities: ["Salcedo", "Tenares", "Villa Tapia"] },
  {
    name: "Independencia",
    cities: [
      "Jimaní",
      "Cristóbal",
      "Duvergé",
      "La Descubierta",
      "Mella",
      "Postrer Río",
    ],
  },
  {
    name: "La Altagracia",
    cities: ["Higüey", "Punta Cana", "Bávaro", "San Rafael del Yuma"],
  },
  { name: "La Romana", cities: ["La Romana", "Guaymate", "Villa Hermosa"] },
  {
    name: "La Vega",
    cities: [
      "La Concepción de La Vega",
      "Constanza",
      "Jarabacoa",
      "Jima Abajo",
    ],
  },
  {
    name: "María Trinidad Sánchez",
    cities: ["Nagua", "Cabrera", "El Factor", "Río San Juan"],
  },
  { name: "Monseñor Nouel", cities: ["Bonao", "Maimón", "Piedra Blanca"] },
  {
    name: "Monte Cristi",
    cities: [
      "San Fernando de Monte Cristi",
      "Castañuelas",
      "Guayubín",
      "Las Matas de Santa Cruz",
      "Pepillo Salcedo",
      "Villa Vásquez",
    ],
  },
  {
    name: "Monte Plata",
    cities: [
      "Monte Plata",
      "Bayaguana",
      "Peralvillo",
      "Sabana Grande de Boyá",
      "Yamasá",
    ],
  },
  { name: "Pedernales", cities: ["Pedernales", "Oviedo"] },
  { name: "Peravia", cities: ["Baní", "Nizao"] },
  {
    name: "Puerto Plata",
    cities: [
      "San Felipe de Puerto Plata",
      "Altamira",
      "Guananico",
      "Imbert",
      "Los Hidalgos",
      "Luperón",
      "Sosúa",
      "Cabarete",
      "Villa Isabela",
      "Villa Montellano",
    ],
  },
  {
    name: "Samaná",
    cities: ["Santa Bárbara de Samaná", "Las Terrenas", "Sánchez"],
  },
  {
    name: "San Cristóbal",
    cities: [
      "San Cristóbal",
      "Bajos de Haina",
      "Cambita Garabitos",
      "Los Cacaos",
      "Sabana Grande de Palenque",
      "San Gregorio de Nigua",
      "Villa Altagracia",
      "Yaguate",
    ],
  },
  {
    name: "San José de Ocoa",
    cities: ["San José de Ocoa", "Rancho Arriba", "Sabana Larga"],
  },
  {
    name: "San Juan",
    cities: [
      "San Juan de la Maguana",
      "Bohechío",
      "El Cercado",
      "Juan de Herrera",
      "Las Matas de Farfán",
      "Vallejuelo",
    ],
  },
  {
    name: "San Pedro de Macorís",
    cities: [
      "San Pedro de Macorís",
      "Consuelo",
      "Guayacanes",
      "Quisqueya",
      "Ramón Santana",
      "San José de los Llanos",
    ],
  },
  {
    name: "Sánchez Ramírez",
    cities: ["Cotuí", "Cevicos", "Fantino", "La Mata"],
  },
  {
    name: "Santiago Rodríguez",
    cities: ["San Ignacio de Sabaneta", "Los Almácigos", "Monción"],
  },
  { name: "Valverde", cities: ["Mao", "Esperanza", "Laguna Salada"] },
];

export function citiesForProvince(
  province: string | null | undefined,
): string[] {
  if (!province) return [];
  return DR_PROVINCES.find((p) => p.name === province)?.cities ?? [];
}
