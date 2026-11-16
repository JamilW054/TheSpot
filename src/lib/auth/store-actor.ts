import { redirect } from "next/navigation";
import { cache } from "react";
import { ROLE } from "@/lib/auth/roles";
import { getSessionUserWithRole } from "@/lib/auth/session-user";
import type { StoreStatus } from "@/lib/stores/status";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Quién hace una operación de panel: el admin de la plataforma o el dueño de
 * una tienda. Las acciones de servidor que comparten `/admin` y `/panel`
 * (pedidos, productos, inventario, pagos, envíos, cupones) usan esto en vez de
 * `requireAdmin()`:
 *
 * - **Crear** algo siempre lo crea en la tienda propia (`actor.store.id`). El
 *   admin es dueño de la tienda oficial, así que sus altas van ahí.
 * - **Leer/editar** un registro existente exige `assertStoreAccess`: el admin
 *   puede todo (soporte); el dueño solo lo de su tienda.
 *
 * Nunca se acepta un `store_id` enviado por el navegador.
 */

export interface ActorStore {
  id: string;
  slug: string;
  name: string;
  status: StoreStatus;
  isOfficial: boolean;
  trusted: boolean;
  logoUrl: string | null;
}

export interface StoreActor {
  userId: string;
  email: string;
  isAdmin: boolean;
  /** Tienda propia (null si no tiene). */
  store: ActorStore | null;
}

const STORE_COLUMNS = "id, slug, name, status, is_official, trusted, logo_url";

function mapStore(row: Record<string, unknown> | null): ActorStore | null {
  if (!row) return null;
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    status: row.status as StoreStatus,
    isOfficial: Boolean(row.is_official),
    trusted: Boolean(row.trusted),
    logoUrl: (row.logo_url as string | null) ?? null,
  };
}

/** Tienda cuyo dueño es `userId` (o null). */
export async function getStoreByOwner(
  userId: string,
): Promise<ActorStore | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("stores")
    .select(STORE_COLUMNS)
    .eq("owner_id", userId)
    .maybeSingle();
  return mapStore(data as Record<string, unknown> | null);
}

/** Actor de la petición actual (memoizado por request). Null si no hay sesión. */
export const getStoreActor = cache(async (): Promise<StoreActor | null> => {
  const session = await getSessionUserWithRole();
  if (!session) return null;
  const isAdmin = session.role === ROLE.ADMIN;
  if (!isAdmin && session.role !== ROLE.SELLER) return null;
  const store = await getStoreByOwner(session.user.id);
  return {
    userId: session.user.id,
    email: session.user.email ?? "",
    isAdmin,
    store,
  };
});

/**
 * Exige un actor capaz de operar: admin, o dueño de una tienda **aprobada**.
 * Lanza si no.
 */
export async function requireStoreActor(): Promise<StoreActor> {
  const actor = await getStoreActor();
  if (!actor) throw new Error("No autorizado.");
  if (actor.isAdmin) return actor;
  if (!actor.store) throw new Error("No tienes una tienda registrada.");
  if (actor.store.status !== "approved") {
    throw new Error("Tu tienda aún no está aprobada.");
  }
  return actor;
}

/** Igual que `requireStoreActor` pero además exige tienda propia (para crear). */
export async function requireOwnStore(): Promise<
  StoreActor & { store: ActorStore }
> {
  const actor = await requireStoreActor();
  if (!actor.store) {
    throw new Error("Esta cuenta no tiene una tienda propia para operar.");
  }
  if (actor.store.status !== "approved") {
    throw new Error("Tu tienda aún no está aprobada.");
  }
  return actor as StoreActor & { store: ActorStore };
}

/** Lanza si el actor no puede tocar un registro de `storeId`. */
export function assertStoreAccess(
  actor: StoreActor,
  storeId: string | null | undefined,
): void {
  if (actor.isAdmin) return;
  if (!storeId || !actor.store || actor.store.id !== storeId) {
    throw new Error("No autorizado.");
  }
}

/**
 * Filtro de listado para un panel:
 * - `/panel` → solo la tienda propia.
 * - `/admin` → todas (o la tienda elegida en el filtro).
 */
export type StoreScope =
  | { storeId: string }
  | { all: true; storeId?: string | null };

export function scopeStoreId(scope: StoreScope): string | null {
  if ("all" in scope) return scope.storeId ?? null;
  return scope.storeId;
}

/** Carga el `store_id` de una fila y verifica acceso. Devuelve el store_id. */
export async function assertRowAccess(
  actor: StoreActor,
  table:
    | "products"
    | "orders"
    | "bank_accounts"
    | "shipping_methods"
    | "coupons",
  id: string,
): Promise<string> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from(table)
    .select("store_id")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("No encontrado.");
  const storeId = (data as { store_id: string | null }).store_id;
  assertStoreAccess(actor, storeId);
  return storeId ?? "";
}

/**
 * Para Server Components de `/panel`: devuelve el actor con tienda aprobada o
 * redirige (login, registro o página de solicitud según el caso).
 */
export async function requirePanelStore(): Promise<
  StoreActor & { store: ActorStore }
> {
  const actor = await getStoreActor();
  if (!actor) redirect("/login?next=/panel");
  if (!actor.store) redirect(actor.isAdmin ? "/admin" : "/vender/registro");
  if (actor.store.status !== "approved") redirect("/panel/solicitud");
  return actor as StoreActor & { store: ActorStore };
}
