import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout";
import { ProductForm } from "@/features/admin/product-form";
import { getCategoriesForAdmin, getProductAdminBySlug } from "@/lib/db";
import { brandOptionsRepo, lineaOptionsRepo } from "@/lib/db/repositories";
import { getSizePresetsForAdmin } from "@/lib/db/size-presets";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminCatalogoEditarPage({ params }: PageProps) {
  const { slug } = await params;
  const [product, categories, sizePresets, brands, lineas] = await Promise.all([
    getProductAdminBySlug(slug),
    getCategoriesForAdmin(),
    getSizePresetsForAdmin(),
    brandOptionsRepo.findMany(),
    lineaOptionsRepo.findMany(),
  ]);
  if (!product) notFound();

  return (
    <PageLayout
      title={`Editar: ${product.name}`}
      description="Actualiza datos, imágenes, marca, línea y variantes."
    >
      <ProductForm
        mode="edit"
        categories={categories}
        sizePresets={sizePresets}
        brands={brands}
        lineas={lineas}
        initial={product}
      />
    </PageLayout>
  );
}
