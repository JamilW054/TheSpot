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
