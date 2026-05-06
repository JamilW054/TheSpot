"use client";

import { adminDeleteCategory } from "@/lib/actions/categories-admin";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

const iconDanger =
  "inline-flex size-9 items-center justify-center rounded-md border-2 border-destructive/40 text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

interface CategoryDeleteButtonProps {
  categoryId: string;
  /** Tras borrar (p. ej. en la página de edición). */
  redirectTo?: string;
}

export function CategoryDeleteButton({
  categoryId,
  redirectTo,
}: CategoryDeleteButtonProps) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={iconDanger}
      aria-label="Eliminar categoría"
      onClick={async () => {
        if (
          !confirm(
            "¿Eliminar esta categoría? Los productos que la usen pueden quedar con referencia rota o impedir el borrado si hay restricción en la base de datos.",
          )
        )
          return;
        try {
          await adminDeleteCategory(categoryId);
          if (redirectTo) router.replace(redirectTo);
          router.refresh();
        } catch (e) {
          alert(e instanceof Error ? e.message : "No se pudo eliminar.");
        }
      }}
    >
      <Trash2 className="size-4" aria-hidden />
    </button>
  );
}
