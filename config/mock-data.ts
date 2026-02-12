import type { CanvasElement, Design, Linea, Mockup, Pedido } from "@/types";

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

const baseDesigns: Design[] = designNames.map((name, i) => {
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

/** Sample canvas payload for demo (first design). Replace with Supabase/fetch when backend exists. */
const sampleCanvasElements: CanvasElement[] = [
  {
    id: "sample-text-1",
    type: "text",
    x: 40,
    y: 30,
    width: 120,
    height: 40,
    content: "Mi diseño",
  },
  {
    id: "sample-shape-1",
    type: "shape",
    x: 180,
    y: 50,
    width: 80,
    height: 60,
    content: "rect",
  },
];

export const MOCK_DESIGNS: Design[] = baseDesigns.map((d, i) =>
  i === 0 ? { ...d, canvasElements: sampleCanvasElements } : d
);

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

// --- MOCK_MOCKUPS (2D / 3D preview templates) ---
export const MOCK_MOCKUPS: Mockup[] = [
  { id: "mock-2d-1", name: "Camiseta frontal", category: "2d", imageUrl: placeholder(400, 480, "mock-2d-1") },
  { id: "mock-2d-2", name: "Camiseta espalda", category: "2d", imageUrl: placeholder(400, 480, "mock-2d-2") },
  { id: "mock-2d-3", name: "Tote bag", category: "2d", imageUrl: placeholder(400, 400, "mock-2d-3") },
  { id: "mock-3d-1", name: "Camiseta 3D", category: "3d", imageUrl: placeholder(400, 400, "mock-3d-1") },
  { id: "mock-3d-2", name: "Sudadera 3D", category: "3d", imageUrl: placeholder(400, 400, "mock-3d-2") },
];

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
