import { PageLayout } from "@/components/layout";
import type { CustomerOption } from "@/features/admin/customer-picker";
import { PaymentLinkForm } from "@/features/admin/payment-link-form";
import { ROLE_DB } from "@/lib/auth/roles";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Estados de pago "activos" (en curso, no terminales). */
const ACTIVE_PAYMENT_STATUSES = ["pending", "link_sent", "in_process"];

/**
 * Clientes (profiles.role === ROLE_DB.CLIENT) para el selector del enlace de
 * pago, marcando quién tiene una solicitud de pago en curso.
 */
async function getCustomers(): Promise<CustomerOption[]> {
  const supabase = createServiceClient();

  const [{ data: profiles }, { data: active }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, full_name, phone, avatar_url, created_at, email")
      .eq("role", ROLE_DB.CLIENT)
      .is("deleted_at", null)
      .order("full_name", { ascending: true, nullsFirst: false }),
    supabase
      .from("payment_requests")
      .select("user_id")
      .in("status", ACTIVE_PAYMENT_STATUSES),
  ]);

  const activeUserIds = new Set(
    ((active ?? []) as { user_id: string }[]).map((r) => r.user_id),
  );

  return (profiles ?? []).map((p: Record<string, unknown>) => {
    const id = p.id as string;
    const fullName = (p.full_name as string | null) ?? null;
    const username = (p.username as string | null) ?? null;
    return {
      id,
      display: fullName ?? username ?? id,
      email: (p.email as string | null) ?? null,
      username,
      fullName,
      phone: (p.phone as string | null) ?? null,
      avatarUrl: (p.avatar_url as string | null) ?? null,
      createdAt: (p.created_at as string | null) ?? null,
      hasActivePayment: activeUserIds.has(id),
    };
  });
}

export default async function AdminNuevoPagoPage() {
  const users = await getCustomers();
  return (
    <PageLayout
      title="Enviar enlace de pago"
      description="Genera una solicitud de cobro y notifica al cliente por correo."
    >
      <PaymentLinkForm users={users} />
    </PageLayout>
  );
}
