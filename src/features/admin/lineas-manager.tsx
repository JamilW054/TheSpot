"use client";

import { Badge } from "@/components/ui/badge";
import {
  adminCreateLinea,
  adminDeleteLinea,
  adminUpdateLinea,
} from "@/lib/actions/admin-crud";
import type { LineasAdminRow } from "@/database/repositories/repositories";
import { lineaFields } from "./resource-fields";
import { ResourceManager } from "./resource-manager";

export function LineasManager({
  initialRows,
}: {
  initialRows: LineasAdminRow[];
}) {
  return (
    <ResourceManager
      initialRows={initialRows}
      getId={(r) => r.id}
      entityLabel="la línea"
      newLabel="Nueva línea"
      emptyLabel="No hay líneas de ropa todavía."
      createTitle="Nueva línea de ropa"
      createFields={lineaFields()}
      createAction={adminCreateLinea}
      editTitle="Editar línea"
      getEditFields={(r) => lineaFields(r)}
      editIdFieldName="linea_id"
      editAction={adminUpdateLinea}
      deleteAction={adminDeleteLinea}
      deleteTitle="¿Eliminar línea?"
      deleteDescription="Se eliminará la línea de ropa. Los productos asociados quedarán sin línea."
      columns={[
        { header: "Nombre", cell: (r) => r.name, className: "font-medium" },
        {
          header: "Descripción",
          cell: (r) =>
            r.description ? (
              <span className="line-clamp-1 text-muted-foreground">
                {r.description}
              </span>
            ) : (
              <span className="text-border">—</span>
            ),
        },
        { header: "Orden", cell: (r) => r.sort_order, className: "tabular-nums" },
        {
          header: "Estado",
          cell: (r) =>
            r.published ? (
              <Badge variant="success">Publicada</Badge>
            ) : (
              <Badge variant="warning">Borrador</Badge>
            ),
        },
      ]}
    />
  );
}
