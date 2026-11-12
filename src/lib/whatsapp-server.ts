import { getSetting } from "@/database/repositories/settings";
import { normalizeWhatsAppNumber, WHATSAPP_NUMBER_SETTING_KEY } from "./whatsapp";

/**
 * Variantes de `./whatsapp` que necesitan leer `app_settings` (Supabase) — solo
 * importable desde Server Components/Actions, nunca desde un Client Component.
 */

const DEFAULT_WHATSAPP_NUMBER = "18097612875";

/** WhatsApp de soporte de la plataforma, configurable en /admin/config. */
export async function getStoreWhatsAppNumber(): Promise<string> {
  const value = await getSetting(WHATSAPP_NUMBER_SETTING_KEY);
  return normalizeWhatsAppNumber(value?.trim() || DEFAULT_WHATSAPP_NUMBER);
}
