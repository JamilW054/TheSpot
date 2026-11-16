import { InventoryClient } from "@/app/admin/inventario/InventoryClient";
import { listInventoryAdmin } from "@/database/repositories/inventory-admin";
import { requirePanelStore } from "@/lib/auth/store-actor";

export const dynamic = "force-dynamic";

export default async function PanelInventarioPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string; q?: string }>;
}) {
  const { store } = await requirePanelStore();
  const [{ rows, summary }, params] = await Promise.all([
    listInventoryAdmin({ storeId: store.id }),
    searchParams,
  ]);
  return (
    <InventoryClient
      rows={rows}
      summary={summary}
      initialFilter={params.filtro ?? "todos"}
      initialQuery={params.q ?? ""}
    />
  );
}
