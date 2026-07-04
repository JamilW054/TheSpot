import { revalidateTag, unstable_cache } from "next/cache";
import { SUCCESSFUL_PAYMENT_STATUSES } from "@/lib/payments/status";
import { createServiceClient } from "@/lib/supabase/server";

const DEFAULT_GOAL = 20000;
const GIVEAWAY_STATS_CACHE_TAG = "giveaway-stats";

/** Meta del sorteo (compras pagadas). Env opcional: `GIVEAWAY_GOAL_PURCHASES` o `NEXT_PUBLIC_GIVEAWAY_GOAL_PURCHASES`. */
export function getGiveawayGoalPurchases(): number {
  const raw =
    process.env.GIVEAWAY_GOAL_PURCHASES ??
    process.env.NEXT_PUBLIC_GIVEAWAY_GOAL_PURCHASES;
  if (raw == null || String(raw).trim() === "") return DEFAULT_GOAL;
  const n = Number.parseInt(
    String(raw).replace(/\./g, "").replace(/,/g, ""),
    10,
  );
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_GOAL;
}

async function fetchPaidPurchaseCountUncached(): Promise<number> {
  const supabase = createServiceClient();

  const paidRes = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .in("payment_status", SUCCESSFUL_PAYMENT_STATUSES)
    .neq("status", "cancelled");

  if (!paidRes.error && typeof paidRes.count === "number") {
    return paidRes.count;
  }

  const legacyRes = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .in("status", ["paid", "shipped"]);

  return legacyRes.count ?? 0;
}

/** Pedidos contados como compra realizada: `payment_status = paid` (excl. cancelados); si falla, legacy `status` pagado/enviado. Cache 60s. */
export async function getGiveawayPaidPurchaseCount(): Promise<number> {
  try {
    return await unstable_cache(
      fetchPaidPurchaseCountUncached,
      ["giveaway-paid-purchase-count"],
      { revalidate: 60, tags: [GIVEAWAY_STATS_CACHE_TAG] },
    )();
  } catch {
    return 0;
  }
}

/**
 * Invalida el caché de 60s del contador del sorteo para que la siguiente
 * carga refleje al instante una compra recién confirmada (Azul o Payment
 * Link). Llamar únicamente desde un Server Action o Route Handler.
 */
export function refreshGiveawayStats(): void {
  revalidateTag(GIVEAWAY_STATS_CACHE_TAG, { expire: 0 });
}

/** Enteros para copy RD (p. ej. 20.000). */
export function formatGiveawayNumber(n: number): string {
  return new Intl.NumberFormat("es-DO", {
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.floor(n)));
}
