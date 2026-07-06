"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createServiceClient } from "@/lib/supabase/server";

export type PaymentMethodActionState = { ok?: true; error?: string };

const DEFAULT_UNAVAILABLE_BADGE = "Próximamente";

/**
 * Actualiza un método de pago (nombre, descripción y disponibilidad).
 *
 * "Disponible" es un único interruptor de cara al admin, pero controla dos
 * columnas a la vez (`is_active` + `is_disabled`) porque el selector del
 * checkout exige ambas para dejarlo seleccionable — ver
 * `PaymentMethodSelector` (`!isDisabled && isActive`). Mantenerlas en el
 * mismo valor evita que un método quede en un estado ambiguo (activo pero
 * deshabilitado, o inactivo pero no marcado deshabilitado).
 */
export async function updatePaymentMethod(
  _prev: PaymentMethodActionState | undefined,
  fd: FormData,
): Promise<PaymentMethodActionState> {
  try {
    await requireAdmin();

    const id = fd.get("id")?.toString().trim();
    if (!id) throw new Error("Método de pago no válido.");

    const name = fd.get("name")?.toString().trim();
    if (!name) throw new Error("El nombre es obligatorio.");

    const description = fd.get("description")?.toString().trim() || null;
    const available = fd.get("available") === "on";
    const badgeLabelInput = fd.get("badge_label")?.toString().trim();
    const badgeLabel = available
      ? null
      : badgeLabelInput || DEFAULT_UNAVAILABLE_BADGE;

    const supabase = createServiceClient();
    const { error } = await supabase
      .from("payment_methods")
      .update({
        name,
        description,
        is_active: available,
        is_disabled: !available,
        badge_label: badgeLabel,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/metodos-pago");
    revalidatePath("/carrito/checkout");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado." };
  }
}
