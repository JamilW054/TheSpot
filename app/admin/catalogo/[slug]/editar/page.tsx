import { PageLayout } from "@/components/layout";
import { ProductForm } from "@/features/admin/product-form";
import { getBaseModelsForAdmin, getProductAdminBySlug } from "@/lib/db";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminCatalogoEditarPage({ params }: PageProps) {
  const { slug } = await params;
  const [product, models] = await Promise.all([
    getProductAdminBySlug(slug),
    getBaseModelsForAdmin(),
  ]);
  if (!product) notFound();

  return (
    <PageLayout
      title={`Editar: ${product.name}`}
      description="Actualiza datos e imagen; la foto se sube a R2 y se enlaza como portada y textura base."
    >
      <ProductForm mode="edit" models={models} initial={product} />
    </PageLayout>
  );
}
