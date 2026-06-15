import type {
  BannerRow,
  BrandRow,
  CouponRow,
  FlashSaleRow,
  LineasAdminRow,
  ShippingMethodRow,
  SubcategoryRow,
  WarehouseRow,
} from "@/lib/db/repositories";
import type { ResourceField, ResourceFieldOption } from "./resource-form";

/** céntimos → string DOP para inputs money. */
function dop(cents: number | null | undefined): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(2);
}

/** ISO → valor de `datetime-local` (YYYY-MM-DDTHH:mm). */
function localDt(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function brandFields(initial?: BrandRow): ResourceField[] {
  return [
    {
      name: "name",
      label: "Nombre",
      type: "text",
      required: true,
      defaultValue: initial?.name ?? "",
      placeholder: "Ej. Nike",
    },
    {
      name: "slug",
      label: "Slug (opcional)",
      type: "text",
      colSpan: 1,
      defaultValue: initial?.slug ?? "",
      help: "Vacío = se genera desde el nombre.",
    },
    {
      name: "website_url",
      label: "Sitio web",
      type: "url",
      colSpan: 1,
      defaultValue: initial?.website_url ?? "",
      placeholder: "https://…",
    },
    {
      name: "logo_url",
      label: "Logo (URL)",
      type: "url",
      defaultValue: initial?.logo_url ?? "",
      placeholder: "https://…",
    },
    {
      name: "is_active",
      label: "Activa",
      type: "checkbox",
      defaultValue: initial?.is_active ?? true,
    },
  ];
}

export function couponFields(initial?: CouponRow): ResourceField[] {
  return [
    {
      name: "code",
      label: "Código",
      type: "text",
      required: true,
      colSpan: 1,
      defaultValue: initial?.code ?? "",
      placeholder: "VERANO10",
    },
    {
      name: "discount_type",
      label: "Tipo de descuento",
      type: "select",
      required: true,
      colSpan: 1,
      defaultValue: initial?.discount_type ?? "percent",
      options: [
        { value: "percent", label: "Porcentaje (%)" },
        { value: "fixed", label: "Monto fijo (DOP)" },
      ],
    },
    {
      name: "discount_value",
      label: "Valor del descuento",
      type: "number",
      required: true,
      colSpan: 1,
      min: 0,
      defaultValue: initial?.discount_value ?? 0,
      help: "% si es porcentaje; cantidad si es monto fijo (en céntimos para fijo).",
    },
    {
      name: "min_order_dop",
      label: "Pedido mínimo (DOP)",
      type: "money",
      colSpan: 1,
      defaultValue: dop(initial?.min_order_cents),
    },
    {
      name: "max_uses",
      label: "Usos máximos (total)",
      type: "number",
      colSpan: 1,
      min: 0,
      defaultValue: initial?.max_uses ?? "",
    },
    {
      name: "max_uses_per_user",
      label: "Usos por usuario",
      type: "number",
      colSpan: 1,
      min: 0,
      defaultValue: initial?.max_uses_per_user ?? "",
    },
    {
      name: "starts_at",
      label: "Inicio",
      type: "datetime",
      colSpan: 1,
      defaultValue: localDt(initial?.starts_at),
    },
    {
      name: "expires_at",
      label: "Expira",
      type: "datetime",
      colSpan: 1,
      defaultValue: localDt(initial?.expires_at),
    },
    {
      name: "description",
      label: "Descripción",
      type: "textarea",
      defaultValue: initial?.description ?? "",
    },
    {
      name: "is_active",
      label: "Activo",
      type: "checkbox",
      defaultValue: initial?.is_active ?? true,
    },
  ];
}

export function shippingFields(initial?: ShippingMethodRow): ResourceField[] {
  return [
    {
      name: "name",
      label: "Nombre",
      type: "text",
      required: true,
      defaultValue: initial?.name ?? "",
      placeholder: "Ej. Envío estándar",
    },
    {
      name: "price_dop",
      label: "Precio (DOP)",
      type: "money",
      colSpan: 1,
      defaultValue: dop(initial?.price_cents),
    },
    {
      name: "country_code",
      label: "País (código)",
      type: "text",
      colSpan: 1,
      defaultValue: initial?.country_code ?? "DO",
      placeholder: "DO",
    },
    {
      name: "min_days",
      label: "Días mínimos",
      type: "number",
      colSpan: 1,
      min: 0,
      defaultValue: initial?.min_days ?? "",
    },
    {
      name: "max_days",
      label: "Días máximos",
      type: "number",
      colSpan: 1,
      min: 0,
      defaultValue: initial?.max_days ?? "",
    },
    {
      name: "description",
      label: "Descripción",
      type: "textarea",
      defaultValue: initial?.description ?? "",
    },
    {
      name: "is_active",
      label: "Activo",
      type: "checkbox",
      defaultValue: initial?.is_active ?? true,
    },
  ];
}

export function bannerFields(initial?: BannerRow): ResourceField[] {
  return [
    {
      name: "title",
      label: "Título",
      type: "text",
      required: true,
      defaultValue: initial?.title ?? "",
    },
    {
      name: "eyebrow",
      label: "Antetítulo",
      type: "text",
      colSpan: 1,
      defaultValue: initial?.eyebrow ?? "",
    },
    {
      name: "accent_color",
      label: "Color de acento",
      type: "color",
      colSpan: 1,
      defaultValue: initial?.accent_color ?? "#000000",
    },
    {
      name: "subtitle",
      label: "Subtítulo",
      type: "textarea",
      defaultValue: initial?.subtitle ?? "",
    },
    {
      name: "image_url",
      label: "Imagen (URL)",
      type: "url",
      defaultValue: initial?.image_url ?? "",
      placeholder: "https://…",
    },
    {
      name: "link_path",
      label: "Enlace",
      type: "text",
      colSpan: 1,
      defaultValue: initial?.link_path ?? "",
      placeholder: "/catalogo",
    },
    {
      name: "sort_order",
      label: "Orden",
      type: "number",
      colSpan: 1,
      min: 0,
      defaultValue: initial?.sort_order ?? 0,
    },
    {
      name: "starts_at",
      label: "Inicio",
      type: "datetime",
      colSpan: 1,
      defaultValue: localDt(initial?.starts_at),
    },
    {
      name: "expires_at",
      label: "Expira",
      type: "datetime",
      colSpan: 1,
      defaultValue: localDt(initial?.expires_at),
    },
    {
      name: "is_active",
      label: "Activo",
      type: "checkbox",
      defaultValue: initial?.is_active ?? true,
    },
  ];
}

export function subcategoryFields(
  categoryOptions: ResourceFieldOption[],
  sizePresetOptions: ResourceFieldOption[],
  initial?: SubcategoryRow,
): ResourceField[] {
  return [
    {
      name: "name",
      label: "Nombre",
      type: "text",
      required: true,
      colSpan: 1,
      defaultValue: initial?.name ?? "",
    },
    {
      name: "slug",
      label: "Slug (opcional)",
      type: "text",
      colSpan: 1,
      defaultValue: initial?.slug ?? "",
    },
    {
      name: "category_id",
      label: "Categoría",
      type: "select",
      required: true,
      colSpan: 1,
      defaultValue: initial?.category_id ?? "",
      options: categoryOptions,
    },
    {
      name: "size_preset_id",
      label: "Tipo de talla",
      type: "select",
      colSpan: 1,
      defaultValue: initial?.size_preset_id ?? "",
      options: sizePresetOptions,
    },
    {
      name: "image_url",
      label: "Imagen (URL)",
      type: "url",
      defaultValue: initial?.image_url ?? "",
    },
    {
      name: "sort_order",
      label: "Orden",
      type: "number",
      colSpan: 1,
      min: 0,
      defaultValue: initial?.sort_order ?? 0,
    },
    {
      name: "is_active",
      label: "Activa",
      type: "checkbox",
      defaultValue: initial?.is_active ?? true,
    },
  ];
}

export function warehouseFields(initial?: WarehouseRow): ResourceField[] {
  return [
    {
      name: "name",
      label: "Nombre",
      type: "text",
      required: true,
      defaultValue: initial?.name ?? "",
    },
    {
      name: "city",
      label: "Ciudad",
      type: "text",
      colSpan: 1,
      defaultValue: initial?.city ?? "",
    },
    {
      name: "country_code",
      label: "País (código)",
      type: "text",
      colSpan: 1,
      defaultValue: initial?.country_code ?? "DO",
    },
    {
      name: "address",
      label: "Dirección",
      type: "textarea",
      defaultValue: initial?.address ?? "",
    },
    {
      name: "is_active",
      label: "Activo",
      type: "checkbox",
      defaultValue: initial?.is_active ?? true,
    },
  ];
}

export function notificationFields(): ResourceField[] {
  return [
    {
      name: "title",
      label: "Título",
      type: "text",
      required: true,
      defaultValue: "",
    },
    {
      name: "type",
      label: "Tipo",
      type: "select",
      colSpan: 1,
      defaultValue: "system",
      options: [
        { value: "system", label: "Sistema" },
        { value: "promo", label: "Promoción" },
        { value: "order", label: "Pedido" },
        { value: "delivery", label: "Entrega" },
      ],
    },
    {
      name: "link_path",
      label: "Enlace (opcional)",
      type: "text",
      colSpan: 1,
      defaultValue: "",
      placeholder: "/catalogo",
    },
    {
      name: "body",
      label: "Mensaje",
      type: "textarea",
      required: true,
      defaultValue: "",
    },
  ];
}

export function flashSaleFields(initial?: FlashSaleRow): ResourceField[] {
  return [
    {
      name: "name",
      label: "Nombre",
      type: "text",
      required: true,
      defaultValue: initial?.name ?? "",
      placeholder: "Ej. Black Friday",
    },
    {
      name: "discount_percent",
      label: "Descuento (%)",
      type: "number",
      required: true,
      colSpan: 1,
      min: 0,
      max: 100,
      defaultValue: initial?.discount_percent ?? 0,
    },
    {
      name: "is_active",
      label: "Activa",
      type: "checkbox",
      colSpan: 1,
      defaultValue: initial?.is_active ?? true,
    },
    {
      name: "starts_at",
      label: "Inicio",
      type: "datetime",
      required: true,
      colSpan: 1,
      defaultValue: localDt(initial?.starts_at),
    },
    {
      name: "ends_at",
      label: "Fin",
      type: "datetime",
      required: true,
      colSpan: 1,
      defaultValue: localDt(initial?.ends_at),
    },
  ];
}

export function lineaFields(initial?: LineasAdminRow): ResourceField[] {
  return [
    {
      name: "name",
      label: "Nombre",
      type: "text",
      required: true,
      defaultValue: initial?.name ?? "",
      placeholder: "Ej. Colección Verano",
    },
    {
      name: "description",
      label: "Descripción",
      type: "textarea",
      defaultValue: initial?.description ?? "",
      placeholder: "Descripción breve de la línea",
    },
    {
      name: "cover_image_url",
      label: "Imagen de portada (URL)",
      type: "url",
      defaultValue: initial?.cover_image_url ?? "",
      placeholder: "https://…",
    },
    {
      name: "sort_order",
      label: "Orden",
      type: "number",
      colSpan: 1,
      defaultValue: initial?.sort_order ?? 0,
    },
    {
      name: "published",
      label: "Publicada",
      type: "checkbox",
      defaultValue: initial?.published ?? true,
    },
  ];
}
