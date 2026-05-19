"use client";

import { adminDeleteProduct } from "@/lib/actions/products-admin";
import { ConfirmDeleteButton } from "./confirm-delete-button";

export function CatalogDeleteButton({ productId }: { productId: string }) {
  return (
    <ConfirmDeleteButton
      title="¿Eliminar artículo?"
      description="Esta acción no se puede deshacer. El artículo será eliminado permanentemente del catálogo."
      triggerLabel="Eliminar artículo"
      onConfirm={() => adminDeleteProduct(productId)}
    />
  );
}
