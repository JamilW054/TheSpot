"use client";

import Link from "next/link";
import { AdminBadge } from "@/components/admin/ui";
import type { PartnerRow } from "@/database/repositories/partners";
import {
  adminCreatePartner,
  adminDeletePartner,
  adminUpdatePartner,
} from "@/lib/actions/partners-admin";
import { formatDOPFromCents } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";
import {
  describePartnerBilling,
  PARTNER_STATUS_LABEL,
  PARTNER_STATUS_TONE,
  type PartnerPaymentStatus,
} from "@/lib/partners";
import { partnerFields } from "./resource-fields";
import { ResourceManager } from "./resource-manager";

/** Socio + su liquidación del mes en curso (viene ya calculada de la vista). */
export interface PartnerListRow extends PartnerRow {
  dueCents: number;
  paidCents: number;
  balanceCents: number;
  lastPaymentDate: string | null;
  status: PartnerPaymentStatus;
}

export function SociosManager({
  initialRows,
  monthLabel,
}: {
  initialRows: PartnerListRow[];
  monthLabel: string;
}) {
  return (
    <ResourceManager
      initialRows={initialRows}
      getId={(r) => r.id}
      entityLabel="el socio"
      newLabel="Nuevo socio"
      emptyLabel="No hay socios registrados todavía."
      createTitle="Nuevo socio"
      createFields={partnerFields()}
      createAction={adminCreatePartner}
      editTitle="Editar socio"
      getEditFields={(r) => partnerFields(r)}
      editIdFieldName="partner_id"
      editAction={adminUpdatePartner}
      deleteAction={adminDeletePartner}
      deleteTitle="¿Dar de baja al socio?"
      deleteDescription="Dejará de aparecer en el dashboard. Su histórico de pagos se conserva."
      columns={[
        {
          header: "Socio",
          className: "font-medium",
          cell: (r) => (
            <Link
              href={`/admin/socios/${r.id}`}
              className="text-(--admin-brand-strong) hover:underline"
            >
              {r.name}
            </Link>
          ),
        },
        {
          header: "Cobra",
          cell: (r) =>
            describePartnerBilling({
              paymentType: r.payment_type,
              percentageRate: r.percentage_rate,
              percentageBase: r.percentage_base,
              fixedAmountCents: r.fixed_amount_cents,
            }),
        },
        {
          header: `Deuda · ${monthLabel}`,
          className: "tabular-nums",
          cell: (r) => formatDOPFromCents(r.dueCents),
        },
        {
          header: "Pagado",
          className: "tabular-nums",
          cell: (r) => formatDOPFromCents(r.paidCents),
        },
        {
          header: "Balance",
          className: "tabular-nums",
          cell: (r) => formatDOPFromCents(r.balanceCents),
        },
        {
          header: "Último pago",
          cell: (r) =>
            r.lastPaymentDate ? formatDate(r.lastPaymentDate) : "—",
        },
        {
          header: "Estado",
          cell: (r) => (
            <div className="flex items-center gap-1.5">
              <AdminBadge tone={PARTNER_STATUS_TONE[r.status]}>
                {PARTNER_STATUS_LABEL[r.status]}
              </AdminBadge>
              {!r.active && <AdminBadge tone="neutral">Inactivo</AdminBadge>}
            </div>
          ),
        },
      ]}
    />
  );
}
