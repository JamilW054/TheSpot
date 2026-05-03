import { PageLayout } from "@/components/layout";
import { ProductForm } from "@/features/admin/product-form";
import { getBaseModelsForAdmin } from "@/lib/db";

export default async function AdminCatalogoNuevoPage() {
  const models = await getBaseModelsForAdmin();
  return (
    <PageLayout
      title="Nuevo artículo"
      description="Completa los datos y sube la imagen del producto (Cloudflare R2). El modelo 3D debe existir en base_models."
    >
      <ProductForm mode="create" models={models} />
    </PageLayout>
  );
}
