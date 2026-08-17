import { getSetting } from "@/database/repositories/settings";
import {
  buildCustomerOrderMessage,
  buildWhatsAppLink,
  normalizeWhatsAppNumber,
  type OrderWhatsAppData,
  WHATSAPP_NUMBER_SETTING_KEY,
} from "./whatsapp";

/**
 * Variantes de `./whatsapp` que necesitan leer `app_settings` (Supabase) — solo
 * importable desde Server Components/Actions, nunca desde un Client Component.
 */

const DEFAULT_WHATSAPP_NUMBER = "18097612875";

/** Número de WhatsApp del negocio, configurable en /admin/config. */
export async function getStoreWhatsAppNumber(): Promise<string> {
  const value = await getSetting(WHATSAPP_NUMBER_SETTING_KEY);
  return normalizeWhatsAppNumber(value?.trim() || DEFAULT_WHATSAPP_NUMBER);
}

/** Enlace para que el cliente confirme su pedido por WhatsApp con la tienda. */
export async function buildCustomerOrderWhatsAppLink(
  data: OrderWhatsAppData,
): Promise<string> {
  const phone = await getStoreWhatsAppNumber();
  return buildWhatsAppLink(phone, buildCustomerOrderMessage(data));
}
