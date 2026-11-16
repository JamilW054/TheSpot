import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout";
import {
  getCategoriesForAdmin,
  getProductAdminBySlug,
} from "@/database/repositories";
import { brandOptionsRepo } from "@/database/repositories/repositories";
import { getSizePresetsForAdmin } from "@/database/repositories/size-presets";
import { ProductForm } from "@/features/admin/product-form";
import { requirePanelStore } from "@/lib/auth/store-actor";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PanelCatalogoEditarPage({ params }: PageProps) {
  const { store } = await requirePanelStore();
  const { slug } = await params;
  const [product, categories, sizePresets, brands] = await Promise.all([
    getProductAdminBySlug(slug),
    getCategoriesForAdmin(),
    getSizePresetsForAdmin(),
    brandOptionsRepo.findMany(),
  ]);
  if (!product || product.store_id !== store.id) notFound();

  return (
    <PageLayout
      title={`Editar: ${product.name}`}
      description="Actualiza datos, imágenes, marca y variantes."
    >
      <ProductForm
        mode="edit"
        categories={categories}
        sizePresets={sizePresets}
        brands={brands}
        initial={product}
      />
    </PageLayout>
  );
}
