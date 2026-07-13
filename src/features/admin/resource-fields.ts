import type { PartnerRow } from "@/database/repositories/partners";
import type {
  BannerRow,
  BrandRow,
  CouponRow,
  FlashSaleRow,
  LineasAdminRow,
  ShippingMethodRow,
  SubcategoryRow,
  WarehouseRow,
} from "@/database/repositories/repositories";
import { formatDOPFromCents } from "@/lib/format-currency";
import { currentMonthStart } from "@/lib/partners";
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
      label: "Imagen desktop",
      type: "image",
      colSpan: 1,
      defaultValue: initial?.image_url ?? "",
      help: "Recomendado: 1440 × 480 px · ratio 3:1 · PNG/JPEG/WebP · máx 5 MB",
    },
    {
      name: "image_url_mobile",
      label: "Imagen mobile",
      type: "image",
      colSpan: 1,
      defaultValue: initial?.image_url_mobile ?? "",
      help: "Recomendado: 750 × 400 px · ratio ~2:1 · Si no se sube, usa la imagen desktop",
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

/**
 * Configuración de un socio / tercero. Los campos de las dos estrategias
 * (porcentaje y monto fijo) se muestran a la vez: la validación del dominio
 * (`validatePartnerInput`) exige el que corresponde al tipo elegido y limpia el
 * otro, así que rellenar de más es inocuo.
 */
export function partnerFields(initial?: PartnerRow): ResourceField[] {
  return [
    {
      name: "name",
      label: "Nombre",
      type: "text",
      required: true,
      colSpan: 1,
      defaultValue: initial?.name ?? "",
      placeholder: "Ej. G3DEON",
    },
    {
      name: "legal_name",
      label: "Razón social (opcional)",
      type: "text",
      colSpan: 1,
      defaultValue: initial?.legal_name ?? "",
    },
    {
      name: "payment_type",
      label: "Tipo de pago",
      type: "select",
      required: true,
      colSpan: 1,
      defaultValue: initial?.payment_type ?? "percentage",
      options: [
        { value: "percentage", label: "Porcentaje" },
        { value: "fixed", label: "Monto fijo" },
      ],
    },
    {
      name: "percentage_base",
      label: "Base del porcentaje",
      type: "select",
      required: true,
      colSpan: 1,
      defaultValue: initial?.percentage_base ?? "gross_profit",
      options: [
        { value: "gross_profit", label: "Ganancia bruta (ingreso − coste)" },
        { value: "net_profit", label: "Ganancia neta (tras comisión AZUL)" },
        { value: "revenue", label: "Ingreso procesado" },
      ],
      help: "Solo aplica si el tipo de pago es Porcentaje.",
    },
    {
      name: "percentage_rate",
      label: "Porcentaje (%)",
      type: "number",
      colSpan: 1,
      min: 0,
      max: 100,
      step: 0.001,
      defaultValue: initial?.percentage_rate ?? "",
      help: "Obligatorio si el tipo de pago es Porcentaje.",
    },
    {
      name: "fixed_amount_dop",
      label: "Monto fijo mensual (DOP)",
      type: "money",
      colSpan: 1,
      defaultValue: dop(initial?.fixed_amount_cents),
      help: "Obligatorio si el tipo de pago es Monto fijo.",
    },
    {
      name: "starts_on",
      label: "Devenga desde",
      type: "date",
      colSpan: 1,
      defaultValue: initial?.starts_on ?? "",
      help: "Vacío = desde el alta del socio.",
    },
    {
      name: "ends_on",
      label: "Devenga hasta",
      type: "date",
      colSpan: 1,
      defaultValue: initial?.ends_on ?? "",
      help: "Vacío = indefinido. Corta el devengo sin borrar el histórico.",
    },
    {
      name: "notes",
      label: "Notas",
      type: "textarea",
      defaultValue: initial?.notes ?? "",
    },
    {
      name: "active",
      label: "Activo",
      type: "checkbox",
      defaultValue: initial?.active ?? true,
      help: "Los socios inactivos no aparecen en el dashboard.",
    },
  ];
}

/**
 * Alta de un pago a un socio. El socio va fijo (viene de su ficha).
 *
 * La referencia no está aquí: la genera el backend salvo que el admin active la
 * suya, y eso es un campo condicional que el formulario genérico no cubre — vive
 * en `PartnerPaymentForm` (ver `PaymentReferenceField`).
 *
 * `balanceCents` solo alimenta la ayuda del importe. El tope real lo impone el
 * servidor contra las cifras del momento (`assertPaymentWithinBalance`): lo que
 * el formulario muestre puede estar rancio.
 */
export function partnerPaymentFields(
  partnerId: string,
  balanceCents: number,
): ResourceField[] {
  const today = new Date().toISOString().slice(0, 10);
  const pending = formatDOPFromCents(Math.max(0, balanceCents));
  return [
    {
      name: "partner_id",
      label: "Socio",
      type: "select",
      required: true,
      defaultValue: partnerId,
      options: [{ value: partnerId, label: "Socio actual" }],
      colSpan: 1,
    },
    {
      name: "amount_dop",
      label: "Importe (DOP)",
      type: "money",
      required: true,
      colSpan: 1,
      defaultValue: "",
      help:
        balanceCents > 0
          ? `Máximo ${pending} (lo que queda por pagar este mes). Un importe negativo revierte un pago anterior.`
          : "Este mes no tiene saldo pendiente. Solo se admite un importe negativo (reverso de un pago anterior).",
    },
    {
      name: "payment_date",
      label: "Fecha del pago",
      type: "date",
      required: true,
      colSpan: 1,
      defaultValue: today,
    },
    {
      name: "period_month",
      label: "Mes que liquida",
      type: "month",
      required: true,
      colSpan: 1,
      defaultValue: currentMonthStart().slice(0, 7),
      help: "El mes cuya deuda salda este pago, no la fecha en que se pagó.",
    },
    {
      name: "notes",
      label: "Notas",
      type: "textarea",
      defaultValue: "",
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
