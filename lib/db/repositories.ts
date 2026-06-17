import { Repository } from "./repository";

/**
 * Registro de repositorios por entidad. Única fuente de verdad para el acceso
 * a datos de los módulos del catálogo extendido y marketing. Cada CRUD (server
 * actions) y cada página de listado consume estos repositorios.
 */

// ---------------------------------------------------------------------------
// Tipos de fila
// ---------------------------------------------------------------------------

export interface BrandRow {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  is_active: boolean;
}

export interface CouponRow {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_order_cents: number | null;
  max_uses: number | null;
  uses_count: number;
  max_uses_per_user: number | null;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
}

export interface ShippingMethodRow {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  min_days: number | null;
  max_days: number | null;
  is_active: boolean;
  country_code: string | null;
}

export interface BannerRow {
  id: string;
  title: string;
  subtitle: string | null;
  eyebrow: string | null;
  image_url: string | null;
  image_url_mobile: string | null;
  accent_color: string | null;
  link_path: string | null;
  is_active: boolean;
  sort_order: number;
  starts_at: string | null;
  expires_at: string | null;
}

export interface SubcategoryRow {
  id: string;
  slug: string;
  name: string;
  category_id: string;
  sort_order: number;
  image_url: string | null;
  size_preset_id: string | null;
  is_active: boolean;
}

export interface FlashSaleRow {
  id: string;
  name: string;
  discount_percent: number;
  is_active: boolean;
  starts_at: string;
  ends_at: string;
  flash_sale_items?: { id: string }[] | null;
}

export interface FlashSaleItemRow {
  id: string;
  flash_sale_id: string;
  product_id: string;
  discount_percent_override: number | null;
  stock_limit: number | null;
  sort_order: number;
}

export interface WarehouseRow {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  country_code: string;
  is_active: boolean;
}

export interface NotificationRow {
  id: string;
  type: string;
  target: string;
  title: string;
  body: string;
  link_path: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Columnas
// ---------------------------------------------------------------------------

const BRAND_COLS = "id, slug, name, logo_url, website_url, is_active";
const COUPON_COLS =
  "id, code, description, discount_type, discount_value, min_order_cents, max_uses, uses_count, max_uses_per_user, is_active, starts_at, expires_at";
const SHIPPING_COLS =
  "id, name, description, price_cents, min_days, max_days, is_active, country_code";
const BANNER_COLS =
  "id, title, subtitle, eyebrow, image_url, accent_color, link_path, is_active, sort_order, starts_at, expires_at";
const SUBCAT_COLS =
  "id, slug, name, category_id, sort_order, image_url, size_preset_id, is_active";
const FLASH_COLS =
  "id, name, discount_percent, is_active, starts_at, ends_at, flash_sale_items(id)";
const FLASH_ITEM_COLS =
  "id, flash_sale_id, product_id, discount_percent_override, stock_limit, sort_order";
const WAREHOUSE_COLS = "id, name, address, city, country_code, is_active";
const NOTIF_COLS = "id, type, target, title, body, link_path, created_at";

// ---------------------------------------------------------------------------
// Repositorios
// ---------------------------------------------------------------------------

export const brandsRepo = new Repository<BrandRow>({
  table: "brands",
  columns: BRAND_COLS,
  hasSoftDelete: true,
  defaultOrderBy: { column: "name" },
});

export const couponsRepo = new Repository<CouponRow>({
  table: "coupons",
  columns: COUPON_COLS,
  hasSoftDelete: true,
  defaultOrderBy: { column: "created_at", ascending: false },
});

export const shippingMethodsRepo = new Repository<ShippingMethodRow>({
  table: "shipping_methods",
  columns: SHIPPING_COLS,
  hasSoftDelete: true,
  defaultOrderBy: { column: "price_cents" },
});

export const bannersRepo = new Repository<BannerRow>({
  table: "banners",
  columns: BANNER_COLS,
  defaultOrderBy: { column: "sort_order" },
});

export const subcategoriesRepo = new Repository<SubcategoryRow>({
  table: "subcategories",
  columns: SUBCAT_COLS,
  hasSoftDelete: true,
  defaultOrderBy: { column: "sort_order" },
});

export const flashSalesRepo = new Repository<FlashSaleRow>({
  table: "flash_sales",
  columns: FLASH_COLS,
  defaultOrderBy: { column: "starts_at", ascending: false },
});

export const flashSaleItemsRepo = new Repository<FlashSaleItemRow>({
  table: "flash_sale_items",
  columns: FLASH_ITEM_COLS,
  defaultOrderBy: { column: "sort_order" },
});

export const warehousesRepo = new Repository<WarehouseRow>({
  table: "warehouses",
  columns: WAREHOUSE_COLS,
  hasSoftDelete: true,
  defaultOrderBy: { column: "name" },
});

export const notificationsRepo = new Repository<NotificationRow>({
  table: "notifications",
  columns: NOTIF_COLS,
  defaultOrderBy: { column: "created_at", ascending: false },
});

// ---------------------------------------------------------------------------
// Repos auxiliares para selects (opciones)
// ---------------------------------------------------------------------------

export interface OptionRow {
  id: string;
  name: string;
}

export const productOptionsRepo = new Repository<OptionRow>({
  table: "products",
  columns: "id, name",
  hasSoftDelete: true,
  defaultOrderBy: { column: "name" },
});

export const categoryOptionsRepo = new Repository<OptionRow>({
  table: "categories",
  columns: "id, name",
  hasSoftDelete: true,
  defaultOrderBy: { column: "name" },
});

export const sizePresetOptionsRepo = new Repository<OptionRow>({
  table: "size_presets",
  columns: "id, name",
  hasSoftDelete: true,
  defaultOrderBy: { column: "name" },
});

export const lineaOptionsRepo = new Repository<OptionRow>({
  table: "lineas",
  columns: "id, name",
  hasSoftDelete: true,
  defaultOrderBy: { column: "name" },
});

export const brandOptionsRepo = new Repository<OptionRow>({
  table: "brands",
  columns: "id, name",
  hasSoftDelete: true,
  defaultOrderBy: { column: "name" },
});

// ---------------------------------------------------------------------------
// Líneas de ropa (admin)
// ---------------------------------------------------------------------------

export interface LineasAdminRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  published: boolean;
  sort_order: number;
}

const LINEA_ADMIN_COLS =
  "id, slug, name, description, cover_image_url, published, sort_order";

export const lineasAdminRepo = new Repository<LineasAdminRow>({
  table: "lineas",
  columns: LINEA_ADMIN_COLS,
  defaultOrderBy: { column: "sort_order" },
});
