import { CalendarClock, HandCoins, Scale, Wallet } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AdminBadge,
  AdminCard,
  AdminCardContent,
  AdminCardHeader,
  AdminCardTitle,
  EmptyState,
  StatCard,
} from "@/components/admin/ui";
import { PageLayout } from "@/components/layout";
import {
  getPartnerMonthlyHistory,
  getPartnerPayments,
  getPartnerStatementForMonth,
  partnersRepo,
} from "@/database/repositories/partners";
import { PartnerPaymentForm } from "@/features/admin/partner-payment-form";
import { ResourceDeleteButton } from "@/features/admin/resource-delete-button";
import { adminVoidPartnerPayment } from "@/lib/actions/partners-admin";
import { formatDOPFromCents } from "@/lib/format-currency";
import { formatDate, formatDateTime } from "@/lib/format-date";
import {
  currentMonthStart,
  derivePartnerStatus,
  describePartnerBilling,
  PARTNER_STATUS_LABEL,
  PARTNER_STATUS_TONE,
} from "@/lib/partners";

const monthNameLabel = new Intl.DateTimeFormat("es-DO", {
  month: "long",
  year: "numeric",
  timeZone: "America/Santo_Domingo",
});

/** `YYYY-MM-01` → "julio de 2026". El mediodía UTC evita el salto de día por TZ. */
function formatMonth(month: string): string {
  return monthNameLabel.format(new Date(`${month}T12:00:00Z`));
}

export default async function AdminSocioDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const partner = await partnersRepo.findById(id);
  if (!partner) notFound();

  const [statement, history, payments] = await Promise.all([
    getPartnerStatementForMonth(partner.id),
    getPartnerMonthlyHistory(partner.id),
    getPartnerPayments(partner.id),
  ]);

  const currentMonth = currentMonthStart();
  const billing = describePartnerBilling({
    paymentType: partner.payment_type,
    percentageRate: partner.percentage_rate,
    percentageBase: partner.percentage_base,
    fixedAmountCents: partner.fixed_amount_cents,
  });

  // Sin fila en la vista (socio recién creado, aún sin mes devengado): todo a 0.
  const dueCents = statement?.dueCents ?? 0;
  const paidCents = statement?.paidCents ?? 0;
  const balanceCents = statement?.balanceCents ?? 0;
  const status = statement?.status ?? derivePartnerStatus(0, 0);

  // Acumulados de todo el histórico — el "cuánto le hemos debido y pagado nunca".
  const totals = history.reduce(
    (acc, m) => ({
      due: acc.due + m.dueCents,
      paid: acc.paid + m.paidCents,
    }),
    { due: 0, paid: 0 },
  );

  return (
    <PageLayout title={partner.name} description={billing}>
      <div className="space-y-8">
        {/* ── Cabecera: estado + acción ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <AdminBadge tone={PARTNER_STATUS_TONE[status]}>
              {PARTNER_STATUS_LABEL[status]} · {formatMonth(currentMonth)}
            </AdminBadge>
            {!partner.active && (
              <AdminBadge tone="neutral">Inactivo</AdminBadge>
            )}
            <Link
              href="/admin/socios"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              ← Volver a socios
            </Link>
          </div>
          <PartnerPaymentForm
            partnerId={partner.id}
            partnerName={partner.name}
            balanceCents={balanceCents}
          />
        </div>

        {/* ── Resumen del mes en curso ── */}
        <section
          aria-label="Resumen del mes en curso"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard
            label="Deuda del mes"
            value={formatDOPFromCents(dueCents)}
            sub={billing}
            icon={<HandCoins className="size-4" />}
          />
          <StatCard
            label="Pagado este mes"
            value={formatDOPFromCents(paidCents)}
            sub={`${statement?.paymentsCount ?? 0} pago${(statement?.paymentsCount ?? 0) !== 1 ? "s" : ""} registrado${(statement?.paymentsCount ?? 0) !== 1 ? "s" : ""}`}
            icon={<Wallet className="size-4" />}
          />
          <StatCard
            label="Balance pendiente"
            value={formatDOPFromCents(balanceCents)}
            sub={balanceCents > 0 ? "queda por pagar" : "sin saldo pendiente"}
            valueTone={balanceCents > 0 ? "danger" : "default"}
            accent={balanceCents <= 0}
            icon={<Scale className="size-4" />}
          />
          <StatCard
            label="Último pago"
            value={
              statement?.lastPaymentDate
                ? formatDate(statement.lastPaymentDate)
                : "—"
            }
            valueSize="sm"
            sub="dentro del mes en curso"
            icon={<CalendarClock className="size-4" />}
          />
        </section>

        {/* ── Información general ── */}
        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitle>Información general</AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent>
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Razón social" value={partner.legal_name ?? "—"} />
              <Field label="Forma de cobro" value={billing} />
              <Field label="Periodicidad" value="Mensual" />
              <Field
                label="Devenga desde"
                value={
                  partner.starts_on
                    ? formatDate(partner.starts_on)
                    : `${formatDate(partner.created_at)} (alta)`
                }
              />
              <Field
                label="Devenga hasta"
                value={
                  partner.ends_on ? formatDate(partner.ends_on) : "Indefinido"
                }
              />
              <Field label="Moneda" value={partner.currency} />
              <Field
                label="Total devengado (histórico)"
                value={formatDOPFromCents(totals.due)}
              />
              <Field
                label="Total pagado (histórico)"
                value={formatDOPFromCents(totals.paid)}
              />
              <Field
                label="Balance acumulado"
                value={formatDOPFromCents(totals.due - totals.paid)}
              />
              {partner.notes ? (
                <div className="sm:col-span-2 lg:col-span-3">
                  <Field label="Notas" value={partner.notes} />
                </div>
              ) : null}
            </dl>
          </AdminCardContent>
        </AdminCard>

        {/* ── Histórico mensual ── */}
        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitle>Historial mensual</AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent>
            {history.length === 0 ? (
              <EmptyState title="Todavía no hay meses devengados." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <Th>Mes</Th>
                      <Th className="text-right">Deuda</Th>
                      <Th className="text-right">Pagado</Th>
                      <Th className="text-right">Balance</Th>
                      <Th>Estado</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((m) => (
                      <tr
                        key={m.month}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-4 py-3 font-medium capitalize">
                          {formatMonth(m.month)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {formatDOPFromCents(m.dueCents)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {formatDOPFromCents(m.paidCents)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {formatDOPFromCents(m.balanceCents)}
                        </td>
                        <td className="px-4 py-3">
                          <AdminBadge tone={PARTNER_STATUS_TONE[m.status]}>
                            {PARTNER_STATUS_LABEL[m.status]}
                          </AdminBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AdminCardContent>
        </AdminCard>

        {/* ── Libro de pagos ── */}
        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitle>Pagos registrados</AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent>
            {payments.length === 0 ? (
              <EmptyState title="No se ha registrado ningún pago a este socio." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <Th>Fecha</Th>
                      <Th>Mes que liquida</Th>
                      <Th className="text-right">Importe</Th>
                      <Th>Referencia</Th>
                      <Th>Registrado por</Th>
                      <Th>Acciones</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-4 py-3 tabular-nums">
                          {formatDate(p.payment_date)}
                        </td>
                        <td className="px-4 py-3 capitalize">
                          {formatMonth(p.period_month)}
                        </td>
                        <td
                          className={`px-4 py-3 text-right tabular-nums ${
                            p.amount_cents < 0
                              ? "text-(--admin-danger)"
                              : "text-foreground"
                          }`}
                        >
                          {formatDOPFromCents(p.amount_cents)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {p.reference ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {p.authorName ?? "—"}
                          <span className="block text-[11px]">
                            {formatDateTime(p.created_at)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <ResourceDeleteButton
                            action={adminVoidPartnerPayment}
                            id={p.id}
                            title="¿Eliminar este pago?"
                            description="Dejará de contar como pagado y saldrá del historial. Queda constancia de quién lo eliminó por si hay que auditarlo."
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-4 text-xs text-muted-foreground">
                  Un pago no se edita: si te equivocaste, elimínalo y vuelve a
                  registrarlo.
                </p>
              </div>
            )}
          </AdminCardContent>
        </AdminCard>
      </div>
    </PageLayout>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={`px-4 py-3 text-[13px] font-medium text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}
