import { PageLayout } from "@/components/layout";
import { ProductForm } from "@/features/admin/product-form";
import { getProductAdminBySlug } from "@/lib/db";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminCatalogoEditarPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductAdminBySlug(slug);
  if (!product) notFound();

  return (
    <PageLayout
      title={`Editar: ${product.name}`}
      description="Actualiza los datos del artículo."
    >
      <ProductForm mode="edit" initial={product} />
    </PageLayout>
  );
}
