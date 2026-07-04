import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout";
import { FlashSaleProductPicker } from "@/features/admin/flash-sale-product-picker";
import { flashSaleFields } from "@/features/admin/resource-fields";
import { ResourceForm } from "@/features/admin/resource-form";
import { adminUpdateFlashSale } from "@/lib/actions/admin-crud";
import {
  flashSaleItemsRepo,
  flashSalesRepo,
  productOptionsRepo,
} from "@/database/repositories/repositories";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminFlashSaleEditarPage({ params }: PageProps) {
  const { id } = await params;
  const [sale, items, products] = await Promise.all([
    flashSalesRepo.findById(id),
    flashSaleItemsRepo.findMany({ filters: { flash_sale_id: id } }),
    productOptionsRepo.findMany(),
  ]);
  if (!sale) notFound();
  const selectedIds = items.map((i) => i.product_id);

  return (
    <PageLayout title={`Editar flash sale: ${sale.name}`}>
      <ResourceForm
        mode="edit"
        idFieldName="flash_sale_id"
        idValue={sale.id}
        entityLabel="la flash sale"
        listHref="/admin/flash-sales"
        action={adminUpdateFlashSale}
        fields={flashSaleFields(sale)}
      >
        <FlashSaleProductPicker products={products} selectedIds={selectedIds} />
      </ResourceForm>
    </PageLayout>
  );
}
