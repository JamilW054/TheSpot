"use client";

import { Badge } from "@/components/ui/badge";
import {
  adminCreateFlashSale,
  adminDeleteFlashSale,
  adminUpdateFlashSale,
} from "@/lib/actions/admin-crud";
import type { FlashSaleRow } from "@/lib/db/repositories";
import { FlashSaleProductPicker } from "./flash-sale-product-picker";
import { flashSaleFields } from "./resource-fields";
import { ResourceManager } from "./resource-manager";

interface ProductOption {
  id: string;
  name: string;
}

interface Props {
  initialRows: FlashSaleRow[];
  products: ProductOption[];
}

export function FlashSalesManager({ initialRows, products }: Props) {
  const now = Date.now();

  return (
    <ResourceManager
      initialRows={initialRows}
      getId={(r) => r.id}
      entityLabel="la flash sale"
      newLabel="Nueva flash sale"
      emptyLabel="No hay flash sales todavía."
      createTitle="Nueva flash sale"
      createFields={flashSaleFields()}
      createAction={adminCreateFlashSale}
      createFormChildren={<FlashSaleProductPicker products={products} />}
      editTitle="Editar flash sale"
      getEditFields={(r) => flashSaleFields(r)}
      editIdFieldName="flash_sale_id"
      editAction={adminUpdateFlashSale}
      getEditFormChildren={() => (
        <FlashSaleProductPicker products={products} />
      )}
      deleteAction={adminDeleteFlashSale}
      deleteTitle="¿Eliminar flash sale?"
      deleteDescription="Se eliminará la promoción y sus productos asociados."
      columns={[
        { header: "Nombre", cell: (r) => r.name, className: "font-medium" },
        {
          header: "Descuento",
          cell: (r) => `${r.discount_percent}%`,
          className: "tabular-nums",
        },
        {
          header: "Productos",
          cell: (r) => r.flash_sale_items?.length ?? 0,
          className: "tabular-nums",
        },
        {
          header: "Vigencia",
          cell: (r) => {
            const start = new Date(r.starts_at).getTime();
            const end = new Date(r.ends_at).getTime();
            if (!r.is_active) return <Badge variant="warning">Inactiva</Badge>;
            if (now < start) return <Badge variant="default">Programada</Badge>;
            if (now > end) return <Badge variant="warning">Finalizada</Badge>;
            return <Badge variant="success">En curso</Badge>;
          },
        },
      ]}
    />
  );
}
