import { PageLayout } from "@/components/layout";
import { ProductForm } from "@/features/admin/product-form";
import { getCategoriesForAdmin } from "@/lib/db";
import { getSizePresetsForAdmin } from "@/lib/db/size-presets";

export default async function AdminCatalogoNuevoPage() {
  const [categories, sizePresets] = await Promise.all([
    getCategoriesForAdmin(),
    getSizePresetsForAdmin(),
  ]);
  return (
    <PageLayout
      title="Nuevo artículo"
      description="Completa los datos y sube la imagen del producto (Cloudflare R2)."
    >
      <ProductForm mode="create" categories={categories} sizePresets={sizePresets} />
    </PageLayout>
  );
}
