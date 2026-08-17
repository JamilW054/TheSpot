/**
 * Enlaces `wa.me` (click-to-chat) para el flujo de pedidos. No hay integración
 * con la API de WhatsApp Business: solo se generan enlaces que abren WhatsApp
 * con un mensaje prellenado — el envío final siempre lo hace una persona.
 *
 * Módulo seguro para cliente y servidor (sin imports de Supabase/next/headers).
 * La variante que lee el número de la tienda desde `app_settings` vive en
 * `./whatsapp-server` porque solo puede usarse en Server Components/Actions.
 */

export const WHATSAPP_NUMBER_SETTING_KEY = "whatsapp_number";

/** Normaliza a formato internacional sin `+` (ej. `8097612875` → `18097612875`). */
export function normalizeWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `1${digits}`;
  return digits;
}

export interface WhatsAppOrderItem {
  name: string;
  quantity: number;
  size?: string | null;
}

export interface OrderWhatsAppData {
  orderNumber: string;
  customerName: string;
  items: WhatsAppOrderItem[];
  totalCents: number;
  currency?: string;
}

function formatCents(cents: number, currency = "DOP"): string {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

function itemLines(items: WhatsAppOrderItem[]): string {
  return items
    .map((i) => `- ${i.name}${i.size ? ` (${i.size})` : ""} x${i.quantity}`)
    .join("\n");
}

/** Mensaje que el CLIENTE envía a la tienda para confirmar su pedido recién hecho. */
export function buildCustomerOrderMessage(data: OrderWhatsAppData): string {
  return [
    `Hola, soy ${data.customerName}.`,
    `Quiero confirmar mi pedido #${data.orderNumber} en JW PARFUM:`,
    itemLines(data.items),
    `Total: ${formatCents(data.totalCents, data.currency)}`,
  ].join("\n");
}

/** Mensaje que el ADMIN envía al cliente para dar seguimiento a un pedido. */
export function buildAdminOrderMessage(data: OrderWhatsAppData): string {
  return [
    `Hola ${data.customerName}, te escribimos de JW PARFUM sobre tu pedido #${data.orderNumber}:`,
    itemLines(data.items),
    `Total: ${formatCents(data.totalCents, data.currency)}`,
  ].join("\n");
}

/** Enlace `wa.me` listo para abrir (WhatsApp Web o app) con el mensaje ya cargado. */
export function buildWhatsAppLink(phoneNumber: string, message: string): string {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

/** Enlace para que el admin le escriba al cliente sobre un pedido puntual. */
export function buildAdminOrderWhatsAppLink(
  customerPhone: string,
  data: OrderWhatsAppData,
): string {
  return buildWhatsAppLink(
    normalizeWhatsAppNumber(customerPhone),
    buildAdminOrderMessage(data),
  );
}
