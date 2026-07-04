"use client";

import { Badge } from "@/components/ui/badge";
import {
  adminCreateBrand,
  adminDeleteBrand,
  adminUpdateBrand,
} from "@/lib/actions/admin-crud";
import type { BrandRow } from "@/database/repositories/repositories";
import { brandFields } from "./resource-fields";
import { ResourceManager } from "./resource-manager";

export function MarcasManager({ initialRows }: { initialRows: BrandRow[] }) {
  return (
    <ResourceManager
      initialRows={initialRows}
      getId={(r) => r.id}
      entityLabel="la marca"
      newLabel="Nueva marca"
      emptyLabel="No hay marcas todavía."
      createTitle="Nueva marca"
      createFields={brandFields()}
      createAction={adminCreateBrand}
      editTitle="Editar marca"
      getEditFields={(r) => brandFields(r)}
      editIdFieldName="brand_id"
      editAction={adminUpdateBrand}
      deleteAction={adminDeleteBrand}
      deleteTitle="¿Eliminar marca?"
      deleteDescription="Los productos asociados quedarán sin marca."
      columns={[
        { header: "Nombre", cell: (r) => r.name, className: "font-medium" },
        {
          header: "Slug",
          cell: (r) => (
            <span className="font-mono text-xs text-muted-foreground">
              {r.slug}
            </span>
          ),
        },
        {
          header: "Estado",
          cell: (r) =>
            r.is_active ? (
              <Badge variant="success">Activa</Badge>
            ) : (
              <Badge variant="warning">Inactiva</Badge>
            ),
        },
      ]}
    />
  );
}
