"use server";

import { revalidatePath } from "next/cache";
import {
  ORDER_NOTIFICATION_EMAIL_KEY,
  type StoreConfig,
  setSetting,
  setStoreConfig,
} from "@/database/repositories/settings";
import { requireAdmin } from "@/lib/auth/require-admin";
import { WHATSAPP_NUMBER_SETTING_KEY } from "@/lib/whatsapp";

export type SettingsActionState = { ok?: true; error?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Guarda el correo que recibe el aviso de cada nuevo pedido. Solo admin.
 */
export async function updateOrderNotificationEmail(
  _prev: SettingsActionState | undefined,
  fd: FormData,
): Promise<SettingsActionState> {
  try {
    await requireAdmin();
    const email = fd.get("order_notification_email")?.toString().trim() ?? "";
    if (!EMAIL_RE.test(email)) {
      throw new Error("Introduce un correo válido.");
    }
    await setSetting(ORDER_NOTIFICATION_EMAIL_KEY, email);
    revalidatePath("/admin/config");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado." };
  }
}

/**
 * Guarda el número de WhatsApp del negocio (usado en los enlaces wa.me de
 * pedidos). Solo admin.
 */
export async function updateWhatsAppNumber(
  _prev: SettingsActionState | undefined,
  fd: FormData,
): Promise<SettingsActionState> {
  try {
    await requireAdmin();
    const raw = fd.get("whatsapp_number")?.toString().trim() ?? "";
    const digits = raw.replace(/\D/g, "");
    if (digits.length < 10) {
      throw new Error("Introduce un número de WhatsApp válido.");
    }
    await setSetting(WHATSAPP_NUMBER_SETTING_KEY, digits);
    revalidatePath("/admin/config");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado." };
  }
}

/**
 * Guarda los datos generales de tienda, producción y logística. Solo admin.
 */
export async function updateStoreConfig(
  _prev: SettingsActionState | undefined,
  fd: FormData,
): Promise<SettingsActionState> {
  try {
    await requireAdmin();
    const str = (key: string) => fd.get(key)?.toString().trim() ?? "";
    const plazoDiasRaw = Number.parseInt(str("plazo_dias"), 10);

    const config: StoreConfig = {
      nombre: str("nombre"),
      direccion: str("direccion"),
      contacto: str("contacto"),
      telefono: str("telefono"),
      plazoDias:
        Number.isFinite(plazoDiasRaw) && plazoDiasRaw > 0 ? plazoDiasRaw : 5,
      tiposProducto: str("tipos_producto"),
      envioActivo: fd.get("envio_activo") === "on",
      zonas: str("zonas"),
    };

    if (config.contacto && !EMAIL_RE.test(config.contacto)) {
      throw new Error("El correo de contacto no es válido.");
    }

    await setStoreConfig(config);
    revalidatePath("/admin/config");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado." };
  }
}
