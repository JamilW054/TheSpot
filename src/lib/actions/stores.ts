"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getOrderNotificationEmail } from "@/database/repositories/settings";
import { getStoreById } from "@/database/repositories/stores";
import { requireAdmin } from "@/lib/auth/require-admin";
import { ROLE_DB } from "@/lib/auth/roles";
import { getStoreActor } from "@/lib/auth/store-actor";
import { sendSimpleEmail } from "@/lib/resend";
import {
  storeApplicationAdminEmail,
  storeApplicationReceivedEmail,
  storeApprovedEmail,
  storeRejectedEmail,
  storeSuspendedEmail,
} from "@/lib/resend/templates/tiendas";
import {
  isStoreStatus,
  STORE_BUSINESS_CATEGORIES,
  type StoreStatus,
  slugifyStoreName,
} from "@/lib/stores/status";
import { createServiceClient } from "@/lib/supabase/server";

export type StoreActionResult = { ok: true } | { ok: false; error: string };

function fail(e: unknown): StoreActionResult {
  return {
    ok: false,
    error: e instanceof Error ? e.message : "Error inesperado.",
  };
}

// ---------------------------------------------------------------------------
// Validación de datos de tienda (registro, reenvío y perfil)
// ---------------------------------------------------------------------------

export interface StoreProfileInput {
  name: string;
  tagline?: string | null;
  description?: string | null;
  businessType: "person" | "company";
  legalName?: string | null;
  taxId?: string | null;
  contactName: string;
  phone: string;
  whatsapp?: string | null;
  email: string;
  notificationEmail?: string | null;
  province: string;
  city?: string | null;
  address?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  website?: string | null;
  sellsCategories: string[];
  applicationNote?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(v: string | null | undefined, max = 300): string | null {
  const t = (v ?? "").trim();
  return t ? t.slice(0, max) : null;
}

function digits(v: string | null | undefined): string | null {
  const d = (v ?? "").replace(/\D/g, "");
  return d ? d.slice(0, 15) : null;
}

function safeUrl(v: string | null | undefined): string | null {
  const t = clean(v, 500);
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  return null;
}

/** Normaliza y valida; devuelve las columnas listas para `stores`. */
function validateStoreProfile(
  input: StoreProfileInput,
): Record<string, unknown> {
  const name = clean(input.name, 80);
  if (!name || name.length < 3)
    throw new Error("El nombre de la tienda debe tener al menos 3 caracteres.");
  const contactName = clean(input.contactName, 120);
  if (!contactName)
    throw new Error("Indica el nombre de la persona de contacto.");
  const phone = digits(input.phone);
  if (!phone || phone.length < 10)
    throw new Error("Indica un teléfono válido (10 dígitos).");
  const email = clean(input.email, 160)?.toLowerCase() ?? null;
  if (!email || !EMAIL_RE.test(email))
    throw new Error("Indica un correo válido.");
  const notificationEmail =
    clean(input.notificationEmail, 160)?.toLowerCase() ?? null;
  if (notificationEmail && !EMAIL_RE.test(notificationEmail)) {
    throw new Error("El correo de avisos no es válido.");
  }
  const province = clean(input.province, 80);
  if (!province) throw new Error("Indica la provincia.");
  const allowed = new Set<string>(STORE_BUSINESS_CATEGORIES);
  const sellsCategories = [
    ...new Set((input.sellsCategories ?? []).filter((c) => allowed.has(c))),
  ];
  if (sellsCategories.length === 0)
    throw new Error("Elige al menos una categoría de lo que vendes.");
  const businessType = input.businessType === "company" ? "company" : "person";
  const taxId = digits(input.taxId);
  if (businessType === "company" && !taxId)
    throw new Error("Indica el RNC de la empresa.");

  return {
    name,
    tagline: clean(input.tagline, 120),
    description: clean(input.description, 2000),
    business_type: businessType,
    legal_name: clean(input.legalName, 160),
    tax_id: taxId,
    contact_name: contactName,
    phone,
    whatsapp: digits(input.whatsapp) ?? phone,
    email,
    notification_email: notificationEmail ?? email,
    province,
    city: clean(input.city, 80),
    address: clean(input.address, 300),
    instagram: clean(input.instagram, 120),
    facebook: clean(input.facebook, 160),
    website: safeUrl(input.website),
    sells_categories: sellsCategories,
    application_note: clean(input.applicationNote, 1500),
  };
}

async function uniqueSlug(name: string, excludeId?: string): Promise<string> {
  const supabase = createServiceClient();
  const base = slugifyStoreName(name) || "tienda";
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    let q = supabase.from("stores").select("id").eq("slug", candidate);
    if (excludeId) q = q.neq("id", excludeId);
    const { data } = await q.maybeSingle();
    if (!data) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

// ---------------------------------------------------------------------------
// Registro público de tiendas
// ---------------------------------------------------------------------------

/** Límite simple por IP (por instancia). Complementa el honeypot. */
const recentAttempts = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const list = (recentAttempts.get(ip) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  recentAttempts.set(ip, list);
  return list.length > 5;
}

export interface RegisterStoreInput extends StoreProfileInput {
  password: string;
  acceptPolicies: boolean;
  /** Honeypot: debe venir vacío. */
  website2?: string;
}

/**
 * Crea la cuenta del dueño (Supabase Auth, vía service role: el registro
 * público de Supabase puede seguir desactivado), su perfil `seller` y la
 * tienda en estado `pending`. El navegador inicia sesión después con el
 * correo y la contraseña.
 */
export async function registerStoreAction(
  input: RegisterStoreInput,
): Promise<StoreActionResult> {
  try {
    if (input.website2) return { ok: true }; // bot: fingir éxito
    const h = await headers();
    const ip = (
      h.get("cf-connecting-ip") ??
      h.get("x-forwarded-for") ??
      "local"
    )
      .split(",")[0]
      .trim();
    if (rateLimited(ip))
      throw new Error(
        "Demasiados intentos. Espera un rato e inténtalo de nuevo.",
      );
    if (!input.acceptPolicies)
      throw new Error("Debes aceptar las políticas de vendedores.");
    const password = input.password ?? "";
    if (password.length < 8)
      throw new Error("La contraseña debe tener al menos 8 caracteres.");

    const columns = validateStoreProfile(input);
    const supabase = createServiceClient();

    const { data: created, error: createErr } =
      await supabase.auth.admin.createUser({
        email: columns.email as string,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: columns.contact_name,
          name: columns.contact_name,
        },
      });
    if (createErr || !created.user) {
      const msg = createErr?.message?.toLowerCase() ?? "";
      if (msg.includes("already") || createErr?.status === 422) {
        throw new Error(
          "Ya existe una cuenta con ese correo. Inicia sesión para ver tu tienda.",
        );
      }
      throw new Error(createErr?.message ?? "No se pudo crear la cuenta.");
    }
    const userId = created.user.id;

    try {
      const { error: profErr } = await supabase.from("profiles").upsert(
        {
          id: userId,
          username: (columns.email as string).split("@")[0],
          full_name: columns.contact_name,
          role: ROLE_DB.SELLER,
        },
        { onConflict: "id" },
      );
      if (profErr) throw new Error(profErr.message);

      const slug = await uniqueSlug(columns.name as string);
      const { data: store, error: storeErr } = await supabase
        .from("stores")
        .insert({
          ...columns,
          slug,
          owner_id: userId,
          status: "pending",
          accepted_policies_at: new Date().toISOString(),
        })
        .select("id, name")
        .single();
      if (storeErr || !store)
        throw new Error(storeErr?.message ?? "No se pudo registrar la tienda.");

      await supabase
        .from("warehouses")
        .insert({ name: store.name, store_id: store.id });
      await supabase.from("store_status_history").insert({
        store_id: store.id,
        status: "pending",
        reason: "Solicitud enviada",
        changed_by: userId,
      });

      await sendSimpleEmail(
        columns.email as string,
        storeApplicationReceivedEmail(store.name),
      );
      const adminEmail = await getOrderNotificationEmail().catch(() => null);
      await sendSimpleEmail(
        adminEmail,
        storeApplicationAdminEmail(
          store.name,
          store.id,
          `${columns.contact_name} · ${columns.phone} · ${columns.email}`,
        ),
      );
    } catch (inner) {
      // Sin tienda la cuenta no sirve: se deshace para que pueda reintentar.
      await supabase.auth.admin.deleteUser(userId).catch(() => undefined);
      throw inner;
    }

    revalidatePath("/admin/tiendas");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** El dueño corrige su solicitud rechazada y la reenvía (vuelve a `pending`). */
export async function resubmitStoreApplication(
  input: StoreProfileInput,
): Promise<StoreActionResult> {
  try {
    const actor = await getStoreActor();
    if (!actor?.store) throw new Error("No autorizado.");
    if (actor.store.status !== "rejected" && actor.store.status !== "pending") {
      throw new Error("Esta solicitud ya no se puede editar.");
    }
    const columns = validateStoreProfile(input);
    const supabase = createServiceClient();
    const slug = await uniqueSlug(columns.name as string, actor.store.id);
    const { error } = await supabase
      .from("stores")
      .update({
        ...columns,
        slug,
        status: "pending",
        status_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", actor.store.id);
    if (error) throw new Error(error.message);
    if (actor.store.status === "rejected") {
      await supabase.from("store_status_history").insert({
        store_id: actor.store.id,
        status: "pending",
        reason: "Solicitud corregida y reenviada",
        changed_by: actor.userId,
      });
      const adminEmail = await getOrderNotificationEmail().catch(() => null);
      await sendSimpleEmail(
        adminEmail,
        storeApplicationAdminEmail(
          columns.name as string,
          actor.store.id,
          `${columns.contact_name} · ${columns.phone}`,
        ),
      );
    }
    revalidatePath("/panel", "layout");
    revalidatePath("/admin/tiendas");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Perfil público y contacto de la tienda (dueño con tienda aprobada o suspendida). */
export async function updateMyStoreProfile(
  input: StoreProfileInput & { freeShippingMinCents?: number | null },
): Promise<StoreActionResult> {
  try {
    const actor = await getStoreActor();
    if (!actor?.store) throw new Error("No autorizado.");
    if (
      actor.store.status !== "approved" &&
      actor.store.status !== "suspended"
    ) {
      throw new Error("Tu tienda aún no está aprobada.");
    }
    const columns = validateStoreProfile(input);
    // El nombre (y su slug) solo cambia con revisión del admin: se conserva.
    delete columns.name;
    delete columns.application_note;
    const free =
      input.freeShippingMinCents == null ||
      Number.isNaN(input.freeShippingMinCents)
        ? null
        : Math.max(0, Math.round(input.freeShippingMinCents));
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("stores")
      .update({
        ...columns,
        logo_url: safeUrl(input.logoUrl),
        banner_url: safeUrl(input.bannerUrl),
        free_shipping_min_cents: free,
        updated_at: new Date().toISOString(),
      })
      .eq("id", actor.store.id);
    if (error) throw new Error(error.message);
    revalidatePath("/panel", "layout");
    revalidatePath(`/tiendas/${actor.store.slug}`);
    revalidatePath("/tiendas");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ---------------------------------------------------------------------------
// Admin de plataforma
// ---------------------------------------------------------------------------

/** Aprueba, rechaza, suspende o reactiva una tienda (con motivo). */
export async function adminSetStoreStatus(
  storeId: string,
  status: StoreStatus,
  reason?: string | null,
): Promise<StoreActionResult> {
  try {
    const { userId } = await requireAdmin();
    if (!isStoreStatus(status)) throw new Error("Estado no válido.");
    const store = await getStoreById(storeId);
    if (!store) throw new Error("Tienda no encontrada.");
    if (store.isOfficial && status !== "approved") {
      throw new Error("La tienda oficial no se puede rechazar ni suspender.");
    }
    const why = clean(reason, 1000);
    if ((status === "rejected" || status === "suspended") && !why) {
      throw new Error(
        "Escribe el motivo para que la tienda sepa qué corregir.",
      );
    }
    const supabase = createServiceClient();
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("stores")
      .update({
        status,
        status_reason: why,
        reviewed_by: userId,
        reviewed_at: now,
        updated_at: now,
      })
      .eq("id", storeId);
    if (error) throw new Error(error.message);

    // Asegura el rol seller del dueño (por si la cuenta se creó a mano).
    if (status === "approved" && store.ownerId) {
      await supabase
        .from("profiles")
        .update({ role: ROLE_DB.SELLER })
        .eq("id", store.ownerId)
        .neq("role", ROLE_DB.ADMIN);
    }

    await supabase.from("store_status_history").insert({
      store_id: storeId,
      status,
      reason: why,
      changed_by: userId,
    });

    const to = store.notificationEmail ?? store.email;
    if (status === "approved" && store.status !== "approved") {
      await sendSimpleEmail(to, storeApprovedEmail(store.name));
    } else if (status === "rejected") {
      await sendSimpleEmail(to, storeRejectedEmail(store.name, why));
    } else if (status === "suspended") {
      await sendSimpleEmail(to, storeSuspendedEmail(store.name, why));
    }

    revalidatePath("/admin/tiendas");
    revalidatePath(`/admin/tiendas/${storeId}`);
    revalidatePath("/admin");
    revalidatePath("/tiendas");
    revalidatePath(`/tiendas/${store.slug}`);
    revalidatePath("/catalogo");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Marca una tienda como confiable (sus productos no pasan por revisión) o destacada. */
export async function adminSetStoreFlags(
  storeId: string,
  flags: { trusted?: boolean; isFeatured?: boolean },
): Promise<StoreActionResult> {
  try {
    await requireAdmin();
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (typeof flags.trusted === "boolean") patch.trusted = flags.trusted;
    if (typeof flags.isFeatured === "boolean")
      patch.is_featured = flags.isFeatured;
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("stores")
      .update(patch)
      .eq("id", storeId);
    if (error) throw new Error(error.message);
    revalidatePath(`/admin/tiendas/${storeId}`);
    revalidatePath("/admin/tiendas");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Lista de palabras que mandan un producto a revisión. */
export async function adminSaveBlockedWords(
  words: string,
): Promise<StoreActionResult> {
  try {
    await requireAdmin();
    const normalized = words
      .split(/[,\n]/)
      .map((w) => w.trim())
      .filter(Boolean)
      .join(",");
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("app_settings")
      .upsert(
        {
          key: "marketplace_blocked_words",
          value: normalized,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      );
    if (error) throw new Error(error.message);
    revalidatePath("/admin/config");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
