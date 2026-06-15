"use client";

import { Badge } from "@/components/ui/badge";
import {
  adminCreateShippingMethod,
  adminDeleteShippingMethod,
  adminUpdateShippingMethod,
} from "@/lib/actions/admin-crud";
import type { ShippingMethodRow } from "@/lib/db/repositories";
import { formatDOPFromCents } from "@/lib/format-currency";
import { shippingFields } from "./resource-fields";
import { ResourceManager } from "./resource-manager";

export function EnviosManager({
  initialRows,
}: {
  initialRows: ShippingMethodRow[];
}) {
  return (
    <ResourceManager
      initialRows={initialRows}
      getId={(r) => r.id}
      entityLabel="el método de envío"
      newLabel="Nuevo método"
      emptyLabel="No hay métodos de envío todavía."
      createTitle="Nuevo método de envío"
      createFields={shippingFields()}
      createAction={adminCreateShippingMethod}
      editTitle="Editar método de envío"
      getEditFields={(r) => shippingFields(r)}
      editIdFieldName="shipping_method_id"
      editAction={adminUpdateShippingMethod}
      deleteAction={adminDeleteShippingMethod}
      deleteTitle="¿Eliminar método de envío?"
      deleteDescription="Dejará de ofrecerse en el checkout."
      columns={[
        { header: "Nombre", cell: (r) => r.name, className: "font-medium" },
        {
          header: "Precio",
          cell: (r) => formatDOPFromCents(r.price_cents),
          className: "tabular-nums",
        },
        {
          header: "Tiempo",
          cell: (r) =>
            r.min_days != null || r.max_days != null
              ? `${r.min_days ?? "?"}–${r.max_days ?? "?"} días`
              : "—",
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
