import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { getSalesReport } from "@/database/repositories/sales";
import { getStoreActor } from "@/lib/auth/store-actor";
import { SalesReportDocument } from "@/lib/pdf/sales-report-document";
import { parseSalesBasis, resolveSalesRange } from "@/lib/sales-range";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/ventas/pdf?periodo=30d | ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD [&base=todas] [&scope=panel | &tienda=<id>] */
export async function GET(request: Request) {
  const actor = await getStoreActor();
  const sp = new URL(request.url).searchParams;
  // `scope=panel` (o cualquier tienda que no sea admin) → solo su tienda.
  const panelScope = sp.get("scope") === "panel" || !actor?.isAdmin;
  if (!actor || (panelScope && actor.store?.status !== "approved")) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const storeId = panelScope ? (actor.store?.id ?? null) : sp.get("tienda") || null;
  const range = resolveSalesRange({
    desde: sp.get("desde") ?? undefined,
    hasta: sp.get("hasta") ?? undefined,
    periodo: sp.get("periodo") ?? undefined,
  });
  const basis = parseSalesBasis(sp.get("base") ?? undefined);
  const report = await getSalesReport({ from: range.from, to: range.to, basis, storeId });
  const generatedAt = new Date().toLocaleString("es-DO", {
    timeZone: "America/Santo_Domingo",
    dateStyle: "medium",
    timeStyle: "short",
  });
  const pdf = await renderToBuffer(
    <SalesReportDocument report={report} generatedAt={generatedAt} />,
  );
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="ventas-${range.from}_${range.to}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
