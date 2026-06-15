"use client";

import { Badge } from "@/components/ui/badge";
import {
  adminCreateSubcategory,
  adminDeleteSubcategory,
  adminUpdateSubcategory,
} from "@/lib/actions/admin-crud";
import type { SubcategoryRow } from "@/lib/db/repositories";
import type { ResourceFieldOption } from "./resource-form";
import { subcategoryFields } from "./resource-fields";
import { ResourceManager } from "./resource-manager";

interface Props {
  initialRows: SubcategoryRow[];
  categoryOptions: ResourceFieldOption[];
  sizePresetOptions: ResourceFieldOption[];
  catName: Map<string, string>;
}

export function SubcategoriasManager({
  initialRows,
  categoryOptions,
  sizePresetOptions,
  catName,
}: Props) {
  return (
    <ResourceManager
      initialRows={initialRows}
      getId={(r) => r.id}
      entityLabel="la subcategoría"
      newLabel="Nueva subcategoría"
      emptyLabel="No hay subcategorías todavía."
      createTitle="Nueva subcategoría"
      createFields={subcategoryFields(categoryOptions, sizePresetOptions)}
      createAction={adminCreateSubcategory}
      editTitle="Editar subcategoría"
      getEditFields={(r) =>
        subcategoryFields(categoryOptions, sizePresetOptions, r)
      }
      editIdFieldName="subcategory_id"
      editAction={adminUpdateSubcategory}
      deleteAction={adminDeleteSubcategory}
      deleteTitle="¿Eliminar subcategoría?"
      deleteDescription="Esta acción no se puede deshacer."
      columns={[
        { header: "Nombre", cell: (r) => r.name, className: "font-medium" },
        {
          header: "Categoría",
          cell: (r) => catName.get(r.category_id) ?? "—",
        },
        {
          header: "Orden",
          cell: (r) => r.sort_order,
          className: "tabular-nums",
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
