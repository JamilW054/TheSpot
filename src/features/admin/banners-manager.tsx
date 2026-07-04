"use client";

import { Badge } from "@/components/ui/badge";
import {
  adminCreateBanner,
  adminDeleteBanner,
  adminUpdateBanner,
} from "@/lib/actions/admin-crud";
import type { BannerRow } from "@/database/repositories/repositories";
import { bannerFields } from "./resource-fields";
import { ResourceManager } from "./resource-manager";

export function BannersManager({ initialRows }: { initialRows: BannerRow[] }) {
  return (
    <ResourceManager
      initialRows={initialRows}
      getId={(r) => r.id}
      entityLabel="el banner"
      newLabel="Nuevo banner"
      emptyLabel="No hay banners todavía."
      createTitle="Nuevo banner"
      createFields={bannerFields()}
      createAction={adminCreateBanner}
      editTitle="Editar banner"
      getEditFields={(r) => bannerFields(r)}
      editIdFieldName="banner_id"
      editAction={adminUpdateBanner}
      deleteAction={adminDeleteBanner}
      deleteTitle="¿Eliminar banner?"
      deleteDescription="Dejará de mostrarse en la tienda."
      columns={[
        { header: "Título", cell: (r) => r.title, className: "font-medium" },
        { header: "Enlace", cell: (r) => r.link_path ?? "—" },
        {
          header: "Orden",
          cell: (r) => r.sort_order,
          className: "tabular-nums",
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
