"use client";

import { Badge } from "@/components/ui/badge";
import {
  adminCreateCoupon,
  adminDeleteCoupon,
  adminUpdateCoupon,
} from "@/lib/actions/admin-crud";
import type { CouponRow } from "@/database/repositories/repositories";
import { couponFields } from "./resource-fields";
import { ResourceManager } from "./resource-manager";

export function CuponesManager({ initialRows }: { initialRows: CouponRow[] }) {
  return (
    <ResourceManager
      initialRows={initialRows}
      getId={(r) => r.id}
      entityLabel="el cupón"
      newLabel="Nuevo cupón"
      emptyLabel="No hay cupones todavía."
      createTitle="Nuevo cupón"
      createFields={couponFields()}
      createAction={adminCreateCoupon}
      editTitle="Editar cupón"
      getEditFields={(r) => couponFields(r)}
      editIdFieldName="coupon_id"
      editAction={adminUpdateCoupon}
      deleteAction={adminDeleteCoupon}
      deleteTitle="¿Eliminar cupón?"
      deleteDescription="El cupón dejará de poder usarse."
      columns={[
        {
          header: "Código",
          cell: (r) => <span className="font-mono">{r.code}</span>,
          className: "font-medium",
        },
        {
          header: "Descuento",
          cell: (r) =>
            r.discount_type === "percent"
              ? `${r.discount_value}%`
              : `RD$ ${(r.discount_value / 100).toFixed(2)}`,
        },
        {
          header: "Usos",
          cell: (r) =>
            `${r.uses_count}${r.max_uses ? ` / ${r.max_uses}` : ""}`,
        },
        {
          header: "Estado",
          cell: (r) =>
            r.is_active ? (
              <Badge variant="success">Activo</Badge>
            ) : (
              <Badge variant="warning">Inactivo</Badge>
            ),
        },
      ]}
    />
  );
}
