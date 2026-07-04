"use server";

import {
  ACCOUNT_EXPIRED_MESSAGE,
  type AccountStatus,
  markAccountDeleted,
  resolveAccountStatus,
} from "@/lib/auth/account-status";
import { createClient } from "@/lib/supabase/server";

export type DeleteAccountState = { ok?: true; error?: string };

/**
 * Elimina la cuenta del usuario autenticado: marca `deleted_at = now()` (vía
 * service role) e invalida su sesión. Inicia el período de gracia de 30 días.
 */
export async function deleteAccountAction(): Promise<DeleteAccountState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  try {
    await markAccountDeleted(user.id);
  } catch {
    return { error: "No se pudo eliminar la cuenta. Inténtalo de nuevo." };
  }

  // Cierra la sesión del lado del servidor (invalida las cookies).
  await supabase.auth.signOut();
  return { ok: true };
}

/**
 * Verifica el estado de la cuenta tras un inicio de sesión válido. Si está
 * dentro del período de gracia, la restaura; si venció, cierra la sesión y
 * devuelve el mensaje de bloqueo. La llama el login del cliente.
 */
export async function checkAccountStatusOnLogin(): Promise<{
  status: AccountStatus;
  message?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "active" };

  const status = await resolveAccountStatus(user.id);
  if (status === "expired") {
    await supabase.auth.signOut();
    return { status, message: ACCOUNT_EXPIRED_MESSAGE };
  }
  return { status };
}
