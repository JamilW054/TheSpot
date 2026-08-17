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

export interface WarehouseRow {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  country_code: string;
  is_active: boolean;
}

// ---------------------------------------------------------------------------
// Columnas
// ---------------------------------------------------------------------------

const BRAND_COLS = "id, slug, name, logo_url, website_url, is_active";
const COUPON_COLS =
  "id, code, description, discount_type, discount_value, min_order_cents, max_uses, uses_count, max_uses_per_user, is_active, starts_at, expires_at";
const SHIPPING_COLS =
  "id, name, description, price_cents, min_days, max_days, is_active, country_code";
const WAREHOUSE_COLS = "id, name, address, city, country_code, is_active";

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

export const warehousesRepo = new Repository<WarehouseRow>({
  table: "warehouses",
  columns: WAREHOUSE_COLS,
  hasSoftDelete: true,
  defaultOrderBy: { column: "name" },
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

export const brandOptionsRepo = new Repository<OptionRow>({
  table: "brands",
  columns: "id, name",
  hasSoftDelete: true,
  defaultOrderBy: { column: "name" },
});
