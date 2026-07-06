"use server";

import { revalidatePath } from "next/cache";
import {
  AZUL_COMMISSION_PERCENT_KEY,
  G3DEON_COMMISSION_PERCENT_KEY,
  ORDER_NOTIFICATION_EMAIL_KEY,
  type StoreConfig,
  setSetting,
  setStoreConfig,
} from "@/database/repositories/settings";
import { requireAdmin } from "@/lib/auth/require-admin";

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

/** Valida y normaliza un porcentaje 0–99 desde el formulario. */
function parsePercentField(fd: FormData, field: string, label: string): string {
  const raw = fd.get(field)?.toString().trim() ?? "";
  const n = Number.parseFloat(raw.replace(",", "."));
  if (!Number.isFinite(n) || n < 0 || n >= 100) {
    throw new Error(`${label}: introduce un porcentaje entre 0 y 99.`);
  }
  return n.toFixed(2);
}

/**
 * Guarda los % de comisión (AZUL y G3DEON) usados para beneficio neto y
 * margen por producto. Solo admin.
 */
export async function updateCommissionPercents(
  _prev: SettingsActionState | undefined,
  fd: FormData,
): Promise<SettingsActionState> {
  try {
    await requireAdmin();
    const azul = parsePercentField(
      fd,
      "azul_commission_percent",
      "Comisión AZUL",
    );
    const g3deon = parsePercentField(
      fd,
      "g3deon_commission_percent",
      "Comisión G3DEON",
    );
    await Promise.all([
      setSetting(AZUL_COMMISSION_PERCENT_KEY, azul),
      setSetting(G3DEON_COMMISSION_PERCENT_KEY, g3deon),
    ]);
    revalidatePath("/admin/config");
    revalidatePath("/admin/catalogo");
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
