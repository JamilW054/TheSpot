import { ProductForm } from "@/features/admin/product-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminCatalogoNuevoPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <Link
          href="/admin/catalogo"
          className="mb-3 inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Volver al catálogo
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 md:text-3xl">
          Nuevo artículo
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Completa los datos y sube la imagen del producto.
        </p>
      </div>

      <ProductForm mode="create" />
    </div>
  );
}
