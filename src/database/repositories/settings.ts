import { createServiceClient } from "@/lib/supabase/server";

/**
 * Ajustes globales de la tienda (tabla `app_settings`, clave/valor). El acceso es
 * siempre por service role: la tabla tiene RLS activa sin políticas, así que solo
 * estas funciones (servidor) leen y escriben. Ver migración 00020.
 */

export const ORDER_NOTIFICATION_EMAIL_KEY = "order_notification_email";

/** Correo por defecto si el ajuste aún no existe en la BD. */
export const DEFAULT_ORDER_NOTIFICATION_EMAIL = "Biandyprenda@gmail.com";

/** Lee un ajuste por clave. Devuelve `null` si no existe. */
export async function getSetting(key: string): Promise<string | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  const value = (data as { value?: string } | null)?.value;
  return value?.trim() ? value : null;
}

/** Crea o actualiza un ajuste. */
export async function setSetting(key: string, value: string): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("app_settings")
    .upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
  if (error) throw new Error(error.message);
}

/**
 * Correo que recibe el aviso de cada nuevo pedido. Configurable en /admin/config;
 * cae al valor por defecto (Biandyprenda@gmail.com) si aún no se ha guardado.
 */
export async function getOrderNotificationEmail(): Promise<string> {
  const value = await getSetting(ORDER_NOTIFICATION_EMAIL_KEY);
  return value?.trim() || DEFAULT_ORDER_NOTIFICATION_EMAIL;
}

export const AZUL_COMMISSION_PERCENT_KEY = "azul_commission_percent";
export const G3DEON_COMMISSION_PERCENT_KEY = "g3deon_commission_percent";

/** Comisión AZUL por defecto (%) si el ajuste no existe o es inválido. */
export const DEFAULT_AZUL_COMMISSION_PERCENT = 5;
/** Comisión G3DEON por defecto (%) si el ajuste no existe o es inválido. */
export const DEFAULT_G3DEON_COMMISSION_PERCENT = 12;

/** Lee un ajuste porcentual (0–99); cae al valor por defecto si falta o es inválido. */
async function getPercentSetting(
  key: string,
  fallback: number,
): Promise<number> {
  const value = await getSetting(key);
  const n = value ? Number.parseFloat(value.replace(",", ".")) : Number.NaN;
  return Number.isFinite(n) && n >= 0 && n < 100 ? n : fallback;
}

/**
 * Porcentaje de comisión de la pasarela AZUL usado para calcular beneficio
 * neto y margen por producto en el admin. Ver migración 00023.
 */
export async function getAzulCommissionPercent(): Promise<number> {
  return getPercentSetting(
    AZUL_COMMISSION_PERCENT_KEY,
    DEFAULT_AZUL_COMMISSION_PERCENT,
  );
}

/**
 * Porcentaje que retiene G3DEON por cada venta (además de la comisión AZUL).
 * Ver migración 00024.
 */
export async function getG3deonCommissionPercent(): Promise<number> {
  return getPercentSetting(
    G3DEON_COMMISSION_PERCENT_KEY,
    DEFAULT_G3DEON_COMMISSION_PERCENT,
  );
}

/** Ambas comisiones en una sola llamada (para el módulo de productos). */
export async function getCommissionRates(): Promise<{
  azulPct: number;
  g3deonPct: number;
}> {
  const [azulPct, g3deonPct] = await Promise.all([
    getAzulCommissionPercent(),
    getG3deonCommissionPercent(),
  ]);
  return { azulPct, g3deonPct };
}
