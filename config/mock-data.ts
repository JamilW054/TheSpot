import { formatDOPFromCents } from "@/lib/format-currency";
import { buildSlug } from "@/lib/slug";
import type {
  CanvasElement,
  CatalogProduct,
  Design,
  Linea,
  Mockup,
  Pedido,
} from "@/types";

const placeholder = (w: number, h: number, seed: string) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

/** Unsplash: ropa real para demo. Formato ?w=&h=&fit=crop para next/image. */
const unsplash = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop`;

// --- MOCK_DESIGNS (16 items) — fotos Unsplash verificadas (extraídas de búsquedas Unsplash) ---
// Solo IDs que aparecen en images.unsplash.com en t-shirt, dress-fashion y hoodie.
const designNames: {
  name: string;
  coverId: string;
  galleryIds: [string, string, string];
}[] = [
  {
    name: "Camiseta verano 2024",
    coverId: "1521572163474-6864f9cf17ab",
    galleryIds: [
      "1521572163474-6864f9cf17ab",
      "1586790170083-2f9ceadc732d",
      "1562157873-818bc0726f68",
    ],
  },
  {
    name: "Sudadera oversize",
    coverId: "1556821840-3a63f95609a7",
    galleryIds: [
      "1556821840-3a63f95609a7",
      "1564557287817-3785e38ec1f5",
      "1601063476271-a159c71ab0b3",
    ],
  },
  {
    name: "Vestido floral",
    coverId: "1762154057377-cc9d3dd6900c",
    galleryIds: [
      "1762154057377-cc9d3dd6900c",
      "1756483510820-4b9302a27556",
      "1583433306546-ded68847fd0d",
    ],
  },
  {
    name: "Pantalón cargo",
    coverId: "1583744946564-b52ac1c389c8",
    galleryIds: [
      "1583744946564-b52ac1c389c8",
      "1745695894760-600be9c8c307",
      "1568251863885-adcac989de24",
    ],
  },
  {
    name: "Chaqueta denim",
    coverId: "1620799140188-3b2a02fd9a77",
    galleryIds: [
      "1620799140188-3b2a02fd9a77",
      "1643792132036-859d3be55fa7",
      "1706875765091-4c7e533e1f9c",
    ],
  },
  {
    name: "Top crop básico",
    coverId: "1562157873-818bc0726f68",
    galleryIds: [
      "1562157873-818bc0726f68",
      "1554568218-0f1715e72254",
      "1622470953794-aa9c70b0fb9d",
    ],
  },
  {
    name: "Falda midi",
    coverId: "1509182469511-7f0b50bfa63e",
    galleryIds: [
      "1509182469511-7f0b50bfa63e",
      "1484328256245-34b71758c30b",
      "1745695894760-600be9c8c307",
    ],
  },
  {
    name: "Jersey lana",
    coverId: "1635447272615-a414b7ea1df4",
    galleryIds: [
      "1635447272615-a414b7ea1df4",
      "1579572331145-5e53b299c64e",
      "1615397587950-3cbb55f95b77",
    ],
  },
  {
    name: "Shorts deportivos",
    coverId: "1622470953794-aa9c70b0fb9d",
    galleryIds: [
      "1622470953794-aa9c70b0fb9d",
      "1521572163474-6864f9cf17ab",
      "1586790170083-2f9ceadc732d",
    ],
  },
  {
    name: "Blusa manga larga",
    coverId: "1745695894760-600be9c8c307",
    galleryIds: [
      "1745695894760-600be9c8c307",
      "1568251863885-adcac989de24",
      "1756483510820-4b9302a27556",
    ],
  },
  {
    name: "Abrigo invierno",
    coverId: "1706875765091-4c7e533e1f9c",
    galleryIds: [
      "1706875765091-4c7e533e1f9c",
      "1643792132036-859d3be55fa7",
      "1620799140188-3b2a02fd9a77",
    ],
  },
  {
    name: "Polo clásico",
    coverId: "1586790170083-2f9ceadc732d",
    galleryIds: [
      "1586790170083-2f9ceadc732d",
      "1571945153237-4929e783af4a",
      "1523381294911-8d3cead13475",
    ],
  },
  {
    name: "Body elegante",
    coverId: "1554568218-0f1715e72254",
    galleryIds: [
      "1554568218-0f1715e72254",
      "1562157873-818bc0726f68",
      "1627225924765-552d49cf47ad",
    ],
  },
  {
    name: "Pantalón wide leg",
    coverId: "1583744946564-b52ac1c389c8",
    galleryIds: [
      "1583744946564-b52ac1c389c8",
      "1743080331389-3517430d2cc8",
      "1568251863885-adcac989de24",
    ],
  },
  {
    name: "Camisa lino",
    coverId: "1571945153237-4929e783af4a",
    galleryIds: [
      "1571945153237-4929e783af4a",
      "1620799140408-edc6dcb6d633",
      "1521572163474-6864f9cf17ab",
    ],
  },
  {
    name: "Cardigan punto",
    coverId: "1615397587950-3cbb55f95b77",
    galleryIds: [
      "1615397587950-3cbb55f95b77",
      "1578768079052-aa76e52ff62e",
      "1513789181297-6f2ec112c0bc",
    ],
  },
];

const baseDesigns: Design[] = designNames.map((item, i) => {
  const id = `d${String(i + 1).padStart(2, "0")}`;
  const slug = buildSlug(item.name, id);
  return {
    id,
    slug,
    name: item.name,
    description: `Diseño personalizado: ${item.name}. Ideal para uso casual o destacar en eventos.`,
    updated:
      i < 4
        ? "Hace 1 día"
        : i < 8
          ? "Hace 3 días"
          : i < 12
            ? "Hace 1 semana"
            : "Hace 2 semanas",
    coverImage: unsplash(item.coverId, 400, 300),
    gallery: item.galleryIds.map((photoId) => unsplash(photoId, 600, 400)),
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
  i === 0 ? { ...d, canvasElements: sampleCanvasElements } : d,
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

/** Product names per line for "Productos de esta línea". Some lineas have none to show placeholders. */
const lineaProducts: (string[] | undefined)[] = [
  ["Sudadera oversize", "Pantalón cargo", "Gorro básico", "Zapatillas urban"],
  [
    "Camiseta minimal",
    "Pantalón lino",
    "Cardigan corto",
    "Tote bag",
    "Zapatos blancos",
  ],
  ["Top deportivo", "Shorts running", "Leggings", "Sujetador sport", "Mochila"],
  ["Camisa oxford", "Pantalón vestir", "Chaqueta blazer", "Zapatos negros"],
  ["Camiseta kids", "Pantalón corto niño", "Vestido niña"],
  undefined, // Unisex basics: sin products → placeholders
  ["Vestido noche", "Bolso clutch", "Tacones"],
  ["Chaqueta lluvia", "Pantalón trekking", "Botas", "Mochila 20L"],
  ["Pijama set", "Bata", "Zapatillas casa"],
  undefined, // Limited edition: placeholders
];

export const MOCK_LINEAS: Linea[] = lineaNames.map((name, i) => {
  const id = `l${String(i + 1).padStart(2, "0")}`;
  const slug = buildSlug(name, id);
  const productList = lineaProducts[i];
  const items = productList ? productList.length : 4 + (i % 7);
  return {
    id,
    slug,
    name,
    description: `Línea de ropa: ${name}. Piezas coordinadas para tu estilo.`,
    items,
    published: i % 2 === 0,
    coverImage: placeholder(500, 350, slug),
    gallery: [
      placeholder(600, 400, `${slug}-a`),
      placeholder(600, 400, `${slug}-b`),
    ],
    ...(productList && { products: productList }),
  };
});

// --- MOCK_MOCKUPS (referencias 2D para el panel Prendas) ---
export const MOCK_MOCKUPS: Mockup[] = [
  {
    id: "mock-shirt",
    name: "Camiseta",
    category: "2d",
    imageUrl: unsplash("1521572163474-6864f9cf17ab", 480, 600),
  },
  {
    id: "mock-shirt-male",
    name: "Camiseta hombre",
    category: "2d",
    imageUrl: unsplash("1586790170083-2f9ceadc732d", 480, 600),
  },
  {
    id: "mock-hoodie",
    name: "Hoodie",
    category: "2d",
    imageUrl: unsplash("1556821840-3a63f95609a7", 480, 600),
  },
  {
    id: "mock-robe",
    name: "Bata",
    category: "2d",
    imageUrl: unsplash("1615397587950-3cbb55f95b77", 480, 600),
  },
  {
    id: "mock-poloche",
    name: "Poloche mujer",
    category: "2d",
    imageUrl: unsplash("1745695894760-600be9c8c307", 480, 600),
  },
];

// --- CATÁLOGO PÚBLICO: ropa a la venta, personalizable en el editor ---
const catalogProductRowsBase: Omit<
  CatalogProduct,
  "slug" | "price" | "categorySlug"
>[] = [
  {
    id: "p01",
    name: "Camiseta personalizable",
    description:
      "Camiseta de algodón con diseño único. Elige tu talla y personaliza el estampado en el editor.",
    priceCents: 2499,
    coverImage: unsplash("1521572163474-6864f9cf17ab", 600, 600),
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "p02",
    name: "Camiseta hombre",
    description:
      "Corte clásico para hombre. Añade texto, imágenes o dibujos con el pincel en la zona de diseño.",
    priceCents: 2699,
    coverImage: unsplash("1586790170083-2f9ceadc732d", 600, 600),
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "p03",
    name: "Hoodie",
    description:
      "Sudadera con capucha. Personalízala en el editor con tu propio diseño.",
    priceCents: 4499,
    coverImage: unsplash("1556821840-3a63f95609a7", 600, 600),
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: "p04",
    name: "Bata",
    description: "Bata cómoda para casa. Ideal para regalo personalizado.",
    priceCents: 3499,
    coverImage: unsplash("1615397587950-3cbb55f95b77", 600, 600),
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "p05",
    name: "Poloche mujer",
    description:
      "Manga larga y tejido suave. Diseña tu propio estampado en el editor.",
    priceCents: 3299,
    coverImage: unsplash("1745695894760-600be9c8c307", 600, 600),
    sizes: ["XS", "S", "M", "L"],
  },
];

const catalogProductRows: Omit<CatalogProduct, "slug">[] =
  catalogProductRowsBase.map((row) => ({
    ...row,
    price: formatDOPFromCents(row.priceCents),
    categorySlug: null,
  }));

export const MOCK_CATALOG_PRODUCTS: CatalogProduct[] = catalogProductRows.map(
  (p) => ({
    ...p,
    slug: buildSlug(p.name, p.id),
  }),
);

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

function mockFecha(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export const MOCK_PEDIDOS: Pedido[] = clientes.map((cliente, i) => {
  const id = `PED-${String(i + 1).padStart(3, "0")}`;
  const items = 1 + (i % 5);
  const totalNum = (items * (15 + (i % 10)) * 10) / 10;
  const estado = estados[Math.floor(i / estadoCount) % 3] ?? "pendiente";
  return {
    id,
    cliente,
    items,
    total: formatDOPFromCents(Math.round(totalNum * 100)),
    estado,
    createdAt: mockFecha(i * 2),
  };
});
