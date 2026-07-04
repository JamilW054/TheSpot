import { PageLayout } from "@/components/layout";
import { FlashSaleProductPicker } from "@/features/admin/flash-sale-product-picker";
import { flashSaleFields } from "@/features/admin/resource-fields";
import { ResourceForm } from "@/features/admin/resource-form";
import { adminCreateFlashSale } from "@/lib/actions/admin-crud";
import { productOptionsRepo } from "@/database/repositories/repositories";

export default async function AdminFlashSaleNuevaPage() {
  const products = await productOptionsRepo.findMany();

  return (
    <PageLayout title="Nueva flash sale">
      <ResourceForm
        mode="create"
        entityLabel="la flash sale"
        listHref="/admin/flash-sales"
        action={adminCreateFlashSale}
        fields={flashSaleFields()}
      >
        <FlashSaleProductPicker products={products} />
      </ResourceForm>
    </PageLayout>
  );
}
