import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { BRAND_NAME } from "@/config/brand";
import type { SalesReport } from "@/database/repositories/sales";
import { formatDOPFromCents } from "@/lib/format-currency";
import { formatRdDay } from "@/lib/sales-range";

const RED = "#DC2626";
const INK = "#0d1b2e";
const MUTED = "#6b7785";
const LINE = "#e4eaf2";

const s = StyleSheet.create({
  page: { padding: 32, fontSize: 9, fontFamily: "Helvetica", color: INK },
  bar: { height: 4, backgroundColor: RED, marginBottom: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  brand: { fontSize: 18, fontFamily: "Helvetica-Bold", color: RED },
  title: { fontSize: 13, fontFamily: "Helvetica-Bold", marginTop: 2 },
  muted: { color: MUTED },
  kpis: { flexDirection: "row", flexWrap: "wrap", marginBottom: 12 },
  kpi: {
    width: "25%",
    padding: 8,
    borderWidth: 1,
    borderColor: LINE,
    borderStyle: "solid",
  },
  kpiLabel: { fontSize: 7, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5 },
  kpiValue: { fontSize: 11, fontFamily: "Helvetica-Bold", marginTop: 3 },
  section: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: RED,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 6,
  },
  th: {
    flexDirection: "row",
    backgroundColor: "#f5f7fa",
    paddingVertical: 4,
    paddingHorizontal: 4,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: MUTED,
  },
  tr: {
    flexDirection: "row",
    paddingVertical: 3.5,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
    borderBottomStyle: "solid",
  },
  tfoot: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 4,
    fontFamily: "Helvetica-Bold",
    borderTopWidth: 1,
    borderTopColor: INK,
    borderTopStyle: "solid",
  },
  right: { textAlign: "right" },
  sumRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
    borderBottomStyle: "solid",
  },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: MUTED,
  },
});

const fmt = formatDOPFromCents;

function Cell({
  w,
  right,
  bold,
  children,
}: {
  w: string;
  right?: boolean;
  bold?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Text
      style={[
        { width: w },
        right ? s.right : {},
        bold ? { fontFamily: "Helvetica-Bold" } : {},
      ]}
    >
      {children}
    </Text>
  );
}

export function SalesReportDocument({
  report,
  generatedAt,
}: {
  report: SalesReport;
  generatedAt: string;
}) {
  const t = report.totals;
  const basis =
    report.basis === "pagadas"
      ? "Solo pedidos cobrados"
      : "Todos los pedidos no cancelados";
  return (
    <Document title={`Reporte de ventas ${report.from} a ${report.to} — ${BRAND_NAME}`}>
      <Page size="A4" style={s.page}>
        <View style={s.bar} />
        <View style={s.header}>
          <View>
            <Text style={s.brand}>{BRAND_NAME}</Text>
            <Text style={s.title}>Reporte de ventas</Text>
            <Text style={s.muted}>
              {formatRdDay(report.from)} — {formatRdDay(report.to)} · {basis}
            </Text>
          </View>
          <View>
            <Text style={[s.muted, s.right]}>Generado</Text>
            <Text style={s.right}>{generatedAt}</Text>
          </View>
        </View>

        <View style={s.kpis}>
          {(
            [
              ["Total vendido", fmt(t.totalCents)],
              ["Pedidos", String(t.orders)],
              ["Unidades", String(t.units)],
              ["Ticket promedio", fmt(t.avgOrderCents)],
              ["Ganancia bruta", fmt(t.profitCents)],
              ["Margen", `${t.marginPct.toFixed(1)}%`],
              ["Por cobrar", `${t.unpaidOrders} · ${fmt(t.unpaidCents)}`],
              ["Cancelados", String(t.cancelledOrders)],
            ] as const
          ).map(([label, value]) => (
            <View key={label} style={s.kpi}>
              <Text style={s.kpiLabel}>{label}</Text>
              <Text style={s.kpiValue}>{value}</Text>
            </View>
          ))}
        </View>

        <Text style={s.section}>Sumatoria</Text>
        {(
          [
            ["Subtotal de productos", fmt(t.subtotalCents)],
            ["Descuentos (cupones)", `-${fmt(t.discountCents)}`],
            ["Envíos cobrados", fmt(t.shippingCents)],
            ["Total vendido", fmt(t.totalCents)],
            ["Costo de la mercancía", `-${fmt(t.costCents)}`],
            ["Ganancia bruta (sin envío)", fmt(t.profitCents)],
          ] as const
        ).map(([label, value]) => (
          <View key={label} style={s.sumRow}>
            <Text>{label}</Text>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>{value}</Text>
          </View>
        ))}

        {report.byPaymentMethod.length > 0 ? (
          <>
            <Text style={s.section}>Por método de pago</Text>
            {report.byPaymentMethod.map((m) => (
              <View key={m.method} style={s.sumRow}>
                <Text>
                  {m.method} ({m.orders} pedidos)
                </Text>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>{fmt(m.totalCents)}</Text>
              </View>
            ))}
          </>
        ) : null}

        <Text style={s.section}>Detalle de lo vendido por producto</Text>
        <View style={s.th} fixed>
          <Cell w="38%">Producto</Cell>
          <Cell w="16%">Variante</Cell>
          <Cell w="9%" right>Uds.</Cell>
          <Cell w="13%" right>Ventas</Cell>
          <Cell w="12%" right>Costo</Cell>
          <Cell w="12%" right>Ganancia</Cell>
        </View>
        {report.byProduct.length === 0 ? (
          <Text style={[s.muted, { padding: 6 }]}>Sin ventas en el periodo.</Text>
        ) : (
          report.byProduct.map((p) => (
            <View key={p.key} style={s.tr} wrap={false}>
              <Cell w="38%">{p.productName}</Cell>
              <Cell w="16%">{p.variant}</Cell>
              <Cell w="9%" right>{p.units}</Cell>
              <Cell w="13%" right>{fmt(p.revenueCents)}</Cell>
              <Cell w="12%" right>{fmt(p.costCents)}</Cell>
              <Cell w="12%" right bold>{fmt(p.profitCents)}</Cell>
            </View>
          ))
        )}
        <View style={s.tfoot}>
          <Cell w="54%">Total</Cell>
          <Cell w="9%" right>{t.units}</Cell>
          <Cell w="13%" right>{fmt(t.subtotalCents)}</Cell>
          <Cell w="12%" right>{fmt(t.costCents)}</Cell>
          <Cell w="12%" right>{fmt(t.subtotalCents - t.costCents)}</Cell>
        </View>

        <Text style={s.section} break={report.orders.length > 12}>
          Pedidos del periodo ({report.orders.length})
        </Text>
        <View style={s.th} fixed>
          <Cell w="12%">Pedido</Cell>
          <Cell w="15%">Fecha</Cell>
          <Cell w="24%">Cliente</Cell>
          <Cell w="19%">Método</Cell>
          <Cell w="16%">Estado</Cell>
          <Cell w="14%" right>Total</Cell>
        </View>
        {report.orders.map((o) => (
          <View key={o.id} wrap={false}>
            <View style={s.tr}>
              <Cell w="12%" bold>#{o.number}</Cell>
              <Cell w="15%">
                {new Date(o.createdAt).toLocaleDateString("es-DO", {
                  timeZone: "America/Santo_Domingo",
                })}
              </Cell>
              <Cell w="24%">{o.customer}</Cell>
              <Cell w="19%">{o.paymentMethod}</Cell>
              <Cell w="16%">
                {o.statusLabel}
                {o.paid ? " · Pagado" : " · Por cobrar"}
              </Cell>
              <Cell w="14%" right bold>{fmt(o.totalCents)}</Cell>
            </View>
            {o.items.map((it, i) => (
              <View
                // biome-ignore lint/suspicious/noArrayIndexKey: líneas sin id
                key={i}
                style={{ flexDirection: "row", paddingHorizontal: 4, paddingVertical: 1.5 }}
              >
                <Text style={{ width: "12%" }} />
                <Text style={[s.muted, { width: "74%" }]}>
                  {it.quantity} × {it.name}
                  {it.variant ? ` (${it.variant})` : ""}
                </Text>
                <Text style={[s.muted, s.right, { width: "14%" }]}>
                  {fmt(it.unitPriceCents * it.quantity)}
                </Text>
              </View>
            ))}
          </View>
        ))}

        <View style={s.footer} fixed>
          <Text>
            {BRAND_NAME} · Reporte de ventas {report.from} a {report.to}
          </Text>
          <Text
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
