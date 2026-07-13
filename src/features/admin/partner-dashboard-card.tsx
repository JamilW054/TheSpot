"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  AdminBadge,
  AdminCard,
  AdminCardContent,
  AdminCardHeader,
  AdminCardTitle,
} from "@/components/admin/ui";
import type { PartnerMonthlyStatement } from "@/database/repositories/partners";
import { formatDOPFromCents } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";
import {
  describePartnerBilling,
  PARTNER_STATUS_LABEL,
  PARTNER_STATUS_TONE,
} from "@/lib/partners";

/**
 * Tarjeta de un socio en el dashboard: deuda del mes en curso, pagado, balance,
 * último pago y estado.
 *
 * Todos los valores llegan ya calculados de `partner_monthly_statements`, que se
 * evalúa en cada request. Por eso la tarjeta se actualiza sola cuando se
 * registra un pago, cambia la ganancia del mes o se reconfigura al socio: no
 * hay nada persistido que pueda quedar obsoleto.
 */
export function PartnerDashboardCard({
  statement,
}: {
  statement: PartnerMonthlyStatement;
}) {
  const billing = describePartnerBilling({
    paymentType: statement.paymentType,
    percentageRate: statement.percentageRate,
    percentageBase: statement.percentageBase,
    fixedAmountCents: statement.fixedAmountCents,
  });

  return (
    <AdminCard>
      <AdminCardHeader>
        <div className="flex w-full items-start justify-between gap-3">
          <div>
            <AdminCardTitle>{statement.partnerName}</AdminCardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">{billing}</p>
          </div>
          <AdminBadge tone={PARTNER_STATUS_TONE[statement.status]}>
            {PARTNER_STATUS_LABEL[statement.status]}
          </AdminBadge>
        </div>
      </AdminCardHeader>

      <AdminCardContent>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Metric
            label="Deuda del mes"
            value={formatDOPFromCents(statement.dueCents)}
          />
          <Metric
            label="Pagado este mes"
            value={formatDOPFromCents(statement.paidCents)}
          />
          <Metric
            label="Balance pendiente"
            value={formatDOPFromCents(statement.balanceCents)}
            tone={statement.balanceCents > 0 ? "danger" : "default"}
          />
          <Metric
            label="Último pago"
            value={
              statement.lastPaymentDate
                ? formatDate(statement.lastPaymentDate)
                : "—"
            }
          />
        </dl>

        <Link
          href={`/admin/socios/${statement.partnerId}`}
          className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-(--admin-brand-strong) hover:opacity-80"
        >
          Ver ficha y registrar pago
          <ArrowRight className="size-3" aria-hidden />
        </Link>
      </AdminCardContent>
    </AdminCard>
  );
}

function Metric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "danger";
}) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd
        className={`mt-1 text-lg font-semibold tabular-nums tracking-tight ${
          tone === "danger" ? "text-(--admin-danger)" : "text-foreground"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
