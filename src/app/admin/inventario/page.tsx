import { listInventoryAdmin } from "@/database/repositories/inventory-admin";
import { InventoryClient } from "./InventoryClient";

export const dynamic = "force-dynamic";

export default async function AdminInventarioPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string; q?: string }>;
}) {
  const [{ rows, summary }, params] = await Promise.all([
    listInventoryAdmin(),
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
