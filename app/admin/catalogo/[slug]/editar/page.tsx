import { ProductForm } from "@/features/admin/product-form";
import { getProductAdminBySlug } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminCatalogoEditarPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductAdminBySlug(slug);
  if (!product) notFound();

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
          {product.name}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Edita los datos del artículo. La URL pública no cambia al editar.
        </p>
      </div>

      <ProductForm mode="edit" initial={product} />
    </div>
  );
}
