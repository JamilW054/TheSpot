"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  MODERATION_STATUSES,
  type ModerationStatus,
  REPORT_REASONS,
  type ReportReason,
} from "@/lib/stores/status";
import { createServiceClient } from "@/lib/supabase/server";

export type ModerationResult = { ok: true } | { ok: false; error: string };

function fail(e: unknown): ModerationResult {
  return {
    ok: false,
    error: e instanceof Error ? e.message : "Error inesperado.",
  };
}

function revalidateModeration(slug?: string | null) {
  revalidatePath("/admin/moderacion");
  revalidatePath("/admin/catalogo");
  revalidatePath("/panel/catalogo");
  revalidatePath("/admin");
  revalidatePath("/catalogo");
  revalidatePath("/tiendas", "layout");
  if (slug) revalidatePath(`/catalogo/${slug}`);
}

/** Aprueba, rechaza o bloquea un producto (el motivo lo ve la tienda). */
export async function adminModerateProduct(
  productId: string,
  status: ModerationStatus,
  note?: string | null,
): Promise<ModerationResult> {
  try {
    await requireAdmin();
    if (!(MODERATION_STATUSES as readonly string[]).includes(status))
      throw new Error("Estado no válido.");
    const why = (note ?? "").trim().slice(0, 500) || null;
    if ((status === "rejected" || status === "blocked") && !why) {
      throw new Error(
        "Escribe el motivo para que la tienda sepa qué corregir.",
      );
    }
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("products")
      .update({
        moderation_status: status,
        moderation_note: why,
        moderated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .select("slug")
      .maybeSingle();
    if (error) throw new Error(error.message);
    // Al resolver un producto se cierran sus denuncias abiertas.
    if (status !== "pending") {
      const { userId } = await requireAdmin();
      await supabase
        .from("product_reports")
        .update({
          status: status === "approved" ? "dismissed" : "resolved",
          resolved_by: userId,
          resolved_at: new Date().toISOString(),
        })
        .eq("product_id", productId)
        .eq("status", "open");
    }
    revalidateModeration((data as { slug?: string } | null)?.slug);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Descarta una denuncia sin tocar el producto. */
export async function adminDismissReport(
  reportId: string,
): Promise<ModerationResult> {
  try {
    const { userId } = await requireAdmin();
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("product_reports")
      .update({
        status: "dismissed",
        resolved_by: userId,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", reportId);
    if (error) throw new Error(error.message);
    revalidateModeration();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ---------------------------------------------------------------------------
// Denuncia pública (sin sesión)
// ---------------------------------------------------------------------------

const recentReports = new Map<string, number[]>();

export async function reportProductAction(input: {
  productId: string;
  reason: ReportReason;
  details?: string;
  email?: string;
}): Promise<ModerationResult> {
  try {
    if (!(REPORT_REASONS as readonly string[]).includes(input.reason))
      throw new Error("Elige un motivo.");
    const h = await headers();
    const ip = (
      h.get("cf-connecting-ip") ??
      h.get("x-forwarded-for") ??
      "local"
    )
      .split(",")[0]
      .trim();
    const now = Date.now();
    const list = (recentReports.get(ip) ?? []).filter(
      (t) => now - t < 60 * 60 * 1000,
    );
    if (list.length >= 10)
      throw new Error("Demasiadas denuncias. Inténtalo más tarde.");
    list.push(now);
    recentReports.set(ip, list);

    const supabase = createServiceClient();
    const { data: product } = await supabase
      .from("products")
      .select("id, store_id")
      .eq("id", input.productId)
      .maybeSingle();
    if (!product) throw new Error("Producto no encontrado.");
    const email = (input.email ?? "").trim().slice(0, 160);
    const { error } = await supabase.from("product_reports").insert({
      product_id: (product as { id: string }).id,
      store_id: (product as { store_id: string }).store_id,
      reason: input.reason,
      details: (input.details ?? "").trim().slice(0, 1000) || null,
      reporter_email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null,
      reporter_ip: ip,
    });
    if (error) throw new Error(error.message);
    revalidatePath("/admin/moderacion");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
