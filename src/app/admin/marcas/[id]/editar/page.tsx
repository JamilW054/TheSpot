import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout";
import { brandFields } from "@/features/admin/resource-fields";
import { ResourceForm } from "@/features/admin/resource-form";
import { adminUpdateBrand } from "@/lib/actions/admin-crud";
import { brandsRepo } from "@/database/repositories/repositories";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminMarcaEditarPage({ params }: PageProps) {
  const { id } = await params;
  const brand = await brandsRepo.findById(id);
  if (!brand) notFound();

  return (
    <PageLayout title={`Editar: ${brand.name}`}>
      <ResourceForm
        mode="edit"
        idFieldName="brand_id"
        idValue={brand.id}
        entityLabel="la marca"
        listHref="/admin/marcas"
        action={adminUpdateBrand}
        fields={brandFields(brand)}
      />
    </PageLayout>
  );
}
