import { PageLayout } from "@/components/layout";
import { ProductForm } from "@/features/admin/product-form";

export default function AdminCatalogoNuevoPage() {
  return (
    <PageLayout
      title="Nuevo artículo"
      description="Completa los datos y sube la imagen del producto."
    >
      <ProductForm mode="create" />
    </PageLayout>
  );
}
