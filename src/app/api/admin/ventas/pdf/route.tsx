import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { getSalesReport } from "@/database/repositories/sales";
import { ROLE } from "@/lib/auth/roles";
import { getSessionUserWithRole } from "@/lib/auth/session-user";
import { SalesReportDocument } from "@/lib/pdf/sales-report-document";
import { parseSalesBasis, resolveSalesRange } from "@/lib/sales-range";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/ventas/pdf?periodo=30d | ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD [&base=todas] */
export async function GET(request: Request) {
  const session = await getSessionUserWithRole();
  if (!session || session.role !== ROLE.ADMIN) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const sp = new URL(request.url).searchParams;
  const range = resolveSalesRange({
    desde: sp.get("desde") ?? undefined,
    hasta: sp.get("hasta") ?? undefined,
    periodo: sp.get("periodo") ?? undefined,
  });
  const basis = parseSalesBasis(sp.get("base") ?? undefined);
  const report = await getSalesReport({ from: range.from, to: range.to, basis });
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
