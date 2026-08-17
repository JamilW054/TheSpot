import { createServiceClient } from "@/lib/supabase/server";

/**
 * Ajustes globales de la tienda (tabla `app_settings`, clave/valor). El acceso es
 * siempre por service role: la tabla tiene RLS activa sin políticas, así que solo
 * estas funciones (servidor) leen y escriben. Ver migración 00020.
 */

export const ORDER_NOTIFICATION_EMAIL_KEY = "order_notification_email";

/** Correo por defecto si el ajuste aún no existe en la BD. */
export const DEFAULT_ORDER_NOTIFICATION_EMAIL = "jamilwilliams054@gmail.com";

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

export const STORE_CONFIG_KEY = "store_config";

/** Datos generales de la tienda, producción y logística (/admin/config). */
export interface StoreConfig {
  nombre: string;
  direccion: string;
  contacto: string;
  telefono: string;
  plazoDias: number;
  tiposProducto: string;
  envioActivo: boolean;
  zonas: string;
}

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  nombre: "",
  direccion: "",
  contacto: "",
  telefono: "",
  plazoDias: 5,
  tiposProducto: "",
  envioActivo: true,
  zonas: "",
};

/** Lee la configuración de tienda; cae a los valores por defecto si no existe o está corrupta. */
export async function getStoreConfig(): Promise<StoreConfig> {
  const raw = await getSetting(STORE_CONFIG_KEY);
  if (!raw) return DEFAULT_STORE_CONFIG;
  try {
    const parsed = JSON.parse(raw) as Partial<StoreConfig>;
    return { ...DEFAULT_STORE_CONFIG, ...parsed };
  } catch {
    return DEFAULT_STORE_CONFIG;
  }
}

/** Guarda la configuración de tienda como un único valor JSON. */
export async function setStoreConfig(config: StoreConfig): Promise<void> {
  await setSetting(STORE_CONFIG_KEY, JSON.stringify(config));
}
