import type { Design, Linea, Pedido } from "@/types";

const placeholder = (w: number, h: number, seed: string) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

function designSlug(name: string, id: string) {
  return `${name.toLowerCase().replace(/\s+/g, "-")}-${id}`;
}

// --- MOCK_DESIGNS (16 items) ---
const designNames = [
  "Camiseta verano 2024",
  "Sudadera oversize",
  "Vestido floral",
  "Pantalón cargo",
  "Chaqueta denim",
  "Top crop básico",
  "Falda midi",
  "Jersey lana",
  "Shorts deportivos",
  "Blusa manga larga",
  "Abrigo invierno",
  "Polo clásico",
  "Body elegante",
  "Pantalón wide leg",
  "Camisa lino",
  "Cardigan punto",
];

export const MOCK_DESIGNS: Design[] = designNames.map((name, i) => {
  const id = `d${String(i + 1).padStart(2, "0")}`;
  const slug = designSlug(name, id);
  return {
    id,
    slug,
    name,
    description: `Diseño personalizado: ${name}. Ideal para uso casual o destacar en eventos.`,
    updated: i < 4 ? "Hace 1 día" : i < 8 ? "Hace 3 días" : i < 12 ? "Hace 1 semana" : "Hace 2 semanas",
    coverImage: placeholder(400, 300, slug),
    gallery: [
      placeholder(600, 400, `${slug}-1`),
      placeholder(600, 400, `${slug}-2`),
      placeholder(600, 400, `${slug}-3`),
    ],
  };
});

// --- MOCK_LINEAS (10 items) ---
const lineaNames = [
  "Streetwear otoño",
  "Colección minimal",
  "Sport life",
  "Formal office",
  "Kids verano",
  "Unisex basics",
  "Evening collection",
  "Outdoor adventure",
  "Home comfort",
  "Limited edition",
];

export const MOCK_LINEAS: Linea[] = lineaNames.map((name, i) => {
  const id = `l${String(i + 1).padStart(2, "0")}`;
  const slug = `${name.toLowerCase().replace(/\s+/g, "-")}-${id}`;
  return {
    id,
    slug,
    name,
    description: `Línea de ropa: ${name}. Piezas coordinadas para tu estilo.`,
    items: 4 + (i % 7),
    published: i % 2 === 0,
    coverImage: placeholder(500, 350, slug),
    gallery: [
      placeholder(600, 400, `${slug}-a`),
      placeholder(600, 400, `${slug}-b`),
    ],
  };
});

// --- MOCK_PEDIDOS (18 items) ---
const clientes = [
  "María García",
  "Carlos López",
  "Ana Martínez",
  "Pedro Sánchez",
  "Laura Fernández",
  "José Rodríguez",
  "Elena Díaz",
  "Miguel Torres",
  "Sofia Ruiz",
  "David Pérez",
  "Carmen Gómez",
  "Antonio Hernández",
  "Isabel Jiménez",
  "Francisco Moreno",
  "Rosa Álvarez",
  "Juan Romero",
  "Lucía Navarro",
  "Pablo Gil",
];

const estados: Pedido["estado"][] = ["pendiente", "en_proceso", "completado"];
const estadoCount = 6;

export const MOCK_PEDIDOS: Pedido[] = clientes.map((cliente, i) => {
  const id = `PED-${String(i + 1).padStart(3, "0")}`;
  const items = 1 + (i % 5);
  const totalNum = (items * (15 + (i % 10)) * 10) / 10;
  const estado = estados[Math.floor(i / estadoCount) % 3] ?? "pendiente";
  return {
    id,
    cliente,
    items,
    total: `€${totalNum.toFixed(2)}`,
    estado,
  };
});
