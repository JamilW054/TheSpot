import { PageLayout } from "@/components/layout";
import { AlmacenesManager } from "@/features/admin/almacenes-manager";
import { createServiceClient } from "@/lib/supabase/server";
import { warehousesRepo } from "@/database/repositories/repositories";

export interface WarehouseStats {
  productCount: number;
  totalStock: number;
}

export default async function AdminAlmacenesPage() {
  const supabase = createServiceClient();

  const [rows, invResult] = await Promise.all([
    warehousesRepo.findMany(),
    supabase
      .from("inventory")
      .select("warehouse_id, quantity, product_variants!inner(product_id)")
      .gt("quantity", 0),
  ]);

  const statsMap = new Map<string, WarehouseStats>();
  for (const row of invResult.data ?? []) {
    const wid = row.warehouse_id as string;
    if (!statsMap.has(wid)) {
      statsMap.set(wid, { productCount: 0, totalStock: 0 });
    }
    const entry = statsMap.get(wid)!;
    entry.totalStock += Number(row.quantity) || 0;
    const pv = row.product_variants as { product_id: string } | null;
    if (pv?.product_id) entry.productCount += 1;
  }

  return (
    <PageLayout
      title="Almacenes"
      description="Almacenes para gestionar el inventario de variantes."
    >
      <AlmacenesManager initialRows={rows} stats={statsMap} />
    </PageLayout>
  );
}
