import { SalesReportClient } from "@/app/admin/ventas/SalesReportClient";
import { getSalesReport } from "@/database/repositories/sales";
import { requirePanelStore } from "@/lib/auth/store-actor";
import { parseSalesBasis, resolveSalesRange } from "@/lib/sales-range";

export const dynamic = "force-dynamic";

export default async function PanelVentasPage({
  searchParams,
}: {
  searchParams: Promise<{
    desde?: string;
    hasta?: string;
    periodo?: string;
    base?: string;
  }>;
}) {
  const { store } = await requirePanelStore();
  const params = await searchParams;
  const range = resolveSalesRange(params);
  const basis = parseSalesBasis(params.base);
  const report = await getSalesReport({
    from: range.from,
    to: range.to,
    basis,
    storeId: store.id,
  });
  return <SalesReportClient report={report} preset={range.preset} />;
}
