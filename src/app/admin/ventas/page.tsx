import { StoreFilter } from "@/components/admin/StoreFilter";
import { getSalesReport } from "@/database/repositories/sales";
import { listStoreOptions } from "@/database/repositories/stores";
import { parseSalesBasis, resolveSalesRange } from "@/lib/sales-range";
import { SalesReportClient } from "./SalesReportClient";

export const dynamic = "force-dynamic";

export default async function AdminVentasPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string; periodo?: string; base?: string; tienda?: string }>;
}) {
  const params = await searchParams;
  const range = resolveSalesRange(params);
  const basis = parseSalesBasis(params.base);
  const tienda = params.tienda || null;
  const [report, stores] = await Promise.all([
    getSalesReport({ from: range.from, to: range.to, basis, storeId: tienda }),
    listStoreOptions(),
  ]);
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <StoreFilter stores={stores} value={tienda} />
      </div>
      <SalesReportClient report={report} preset={range.preset} />
    </div>
  );
}
