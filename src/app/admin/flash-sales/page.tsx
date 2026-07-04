import { PageLayout } from "@/components/layout";
import { FlashSalesManager } from "@/features/admin/flash-sales-manager";
import { flashSalesRepo, productOptionsRepo } from "@/database/repositories/repositories";

export default async function AdminFlashSalesPage() {
  const [rows, products] = await Promise.all([
    flashSalesRepo.findMany(),
    productOptionsRepo.findMany(),
  ]);
  return (
    <PageLayout
      title="Flash sales"
      description="Promociones por tiempo limitado sobre un conjunto de productos."
    >
      <FlashSalesManager initialRows={rows} products={products} />
    </PageLayout>
  );
}
