"use client";

import { adminDeleteCategory } from "@/lib/actions/categories-admin";
import { useRouter } from "next/navigation";
import { ConfirmDeleteButton } from "./confirm-delete-button";

interface CategoryDeleteButtonProps {
  categoryId: string;
  /** Si se pasa, redirige aquí tras borrar exitosamente. */
  redirectTo?: string;
}

export function CategoryDeleteButton({
  categoryId,
  redirectTo,
}: CategoryDeleteButtonProps) {
  const router = useRouter();

  return (
    <ConfirmDeleteButton
      title="¿Eliminar categoría?"
      description="Los productos asignados a esta categoría quedarán sin categoría. Esta acción no se puede deshacer."
      triggerLabel="Eliminar categoría"
      onConfirm={() => adminDeleteCategory(categoryId)}
      onSuccess={() => {
        if (redirectTo) router.replace(redirectTo);
        router.refresh();
      }}
    />
  );
}
