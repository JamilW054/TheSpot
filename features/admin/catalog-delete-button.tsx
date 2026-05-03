"use client";

import { adminDeleteProduct } from "@/lib/actions/products-admin";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

const iconDanger =
  "inline-flex size-9 items-center justify-center rounded-md border-2 border-destructive/40 text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function CatalogDeleteButton({ productId }: { productId: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={iconDanger}
      aria-label="Eliminar artículo"
      onClick={async () => {
        if (!confirm("¿Eliminar este artículo del catálogo?")) return;
        try {
          await adminDeleteProduct(productId);
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
