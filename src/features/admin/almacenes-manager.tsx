"use client";

import { Badge } from "@/components/ui/badge";
import {
  adminCreateWarehouse,
  adminDeleteWarehouse,
  adminUpdateWarehouse,
} from "@/lib/actions/admin-crud";
import type { WarehouseRow } from "@/database/repositories/repositories";
import type { WarehouseStats } from "@/app/admin/almacenes/page";
import { warehouseFields } from "./resource-fields";
import { ResourceManager } from "./resource-manager";

interface Props {
  initialRows: WarehouseRow[];
  stats?: Map<string, WarehouseStats>;
}

export function AlmacenesManager({ initialRows, stats }: Props) {
  return (
    <ResourceManager
      initialRows={initialRows}
      getId={(r) => r.id}
      entityLabel="el almacén"
      newLabel="Nuevo almacén"
      emptyLabel="No hay almacenes todavía."
      createTitle="Nuevo almacén"
      createFields={warehouseFields()}
      createAction={adminCreateWarehouse}
      editTitle="Editar almacén"
      getEditFields={(r) => warehouseFields(r)}
      editIdFieldName="warehouse_id"
      editAction={adminUpdateWarehouse}
      deleteAction={adminDeleteWarehouse}
      deleteTitle="¿Eliminar almacén?"
      deleteDescription="El inventario asociado quedará huérfano."
      columns={[
        { header: "Nombre", cell: (r) => r.name, className: "font-medium" },
        { header: "Ciudad", cell: (r) => r.city ?? "—" },
        { header: "País", cell: (r) => r.country_code },
        {
          header: "Productos",
          cell: (r) => {
            const s = stats?.get(r.id);
            return s ? (
              <span className="tabular-nums text-foreground">
                {s.productCount}
              </span>
            ) : (
              <span className="text-muted-foreground">0</span>
            );
          },
        },
        {
          header: "Stock total",
          cell: (r) => {
            const s = stats?.get(r.id);
            return s ? (
              <span className="tabular-nums text-foreground">
                {s.totalStock.toLocaleString()}
              </span>
            ) : (
              <span className="text-muted-foreground">0</span>
            );
          },
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
