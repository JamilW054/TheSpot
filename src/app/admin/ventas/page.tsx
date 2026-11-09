import { getSalesReport } from "@/database/repositories/sales";
import { parseSalesBasis, resolveSalesRange } from "@/lib/sales-range";
import { SalesReportClient } from "./SalesReportClient";

export const dynamic = "force-dynamic";

export default async function AdminVentasPage({
  searchParams,
}: {
  searchParams: Promise<{
    desde?: string;
    hasta?: string;
    periodo?: string;
    base?: string;
  }>;
}) {
  const params = await searchParams;
  const range = resolveSalesRange(params);
  const basis = parseSalesBasis(params.base);
  const report = await getSalesReport({ from: range.from, to: range.to, basis });
  return <SalesReportClient report={report} preset={range.preset} />;
}
