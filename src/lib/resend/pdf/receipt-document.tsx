import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { CompraEmailData } from "../templates/compra";
import { formatPrice } from "../templates/compra";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#0d1b2e",
  },
  headerBar: { height: 4, backgroundColor: "#1e90ff", marginBottom: 24 },
  brand: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#1e90ff",
    marginBottom: 2,
  },
  brandSub: {
    fontSize: 8,
    color: "#7a8899",
    letterSpacing: 2,
    marginBottom: 20,
  },
  title: { fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#7a8899", marginBottom: 20 },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e4eaf2",
    borderBottomStyle: "dashed",
  },
  metaBlock: { flexDirection: "column", flexGrow: 1, marginBottom: 8 },
  metaLabel: {
    fontSize: 8,
    color: "#7a8899",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  metaValue: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#0d1b2e" },
  sectionLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 16,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#1e90ff",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  itemCount: { fontSize: 8, color: "#7a8899" },
  columnHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 6,
  },
  columnHeaderName: {
    flexGrow: 1,
    flexBasis: 0,
    marginLeft: 50,
    fontSize: 8,
    color: "#b0bbc8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  columnHeaderQty: {
    width: 46,
    textAlign: "center",
    fontSize: 8,
    color: "#b0bbc8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  columnHeaderPrice: {
    width: 80,
    textAlign: "right",
    fontSize: 8,
    color: "#b0bbc8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  table: { borderTopWidth: 1, borderTopColor: "#e4eaf2" },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#edf1f7",
    borderBottomStyle: "dashed",
    paddingVertical: 10,
  },
  thumbWrap: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#f7f9fc",
    borderWidth: 1,
    borderColor: "#e4eaf2",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbImg: { width: 40, height: 40, objectFit: "cover" },
  thumbInitial: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#c3ccd6",
  },
  colName: { flexGrow: 1, flexBasis: 0, paddingRight: 8 },
  colQty: { width: 46, alignItems: "center" },
  colPrice: { width: 80 },
  itemName: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  itemMeta: { fontSize: 8, color: "#1e90ff", marginTop: 2 },
  itemUnitPrice: { fontSize: 8, color: "#9aaabb", marginTop: 2 },
  qtyBadge: {
    backgroundColor: "#f7f9fc",
    borderWidth: 1,
    borderColor: "#e4eaf2",
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  qtyBadgeText: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#7a8899" },
  linePrice: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0d1b2e",
    textAlign: "right",
  },
  totalsBox: {
    marginTop: 16,
    backgroundColor: "#f7f9fc",
    borderRadius: 6,
    padding: 16,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  totalsLabel: { fontSize: 9, color: "#7a8899" },
  totalsValue: { fontSize: 9, color: "#0d1b2e" },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e4eaf2",
    marginTop: 8,
    paddingTop: 8,
  },
  grandTotalLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: "#7a8899",
  },
  grandTotalValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#1e90ff",
  },
  thanks: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#7a8899",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#b0bbc8",
  },
});

/** Iniciales de fallback cuando un producto no tiene foto (evita URLs vacías/rotas en el PDF). */
function ItemThumb({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl?: string | null;
}) {
  if (imageUrl) {
    return (
      <View style={styles.thumbWrap}>
        <Image style={styles.thumbImg} src={imageUrl} />
      </View>
    );
  }
  return (
    <View style={styles.thumbWrap}>
      <Text style={styles.thumbInitial}>{name.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

/** Recibo de compra en PDF: mismo contenido del correo (compra.ts), sin validez fiscal (sin NCF/RNC). */
export function ReceiptDocument(data: CompraEmailData) {
  const currency = data.currency ?? "DOP";
  const fmt = (c: number) => formatPrice(c, currency);
  const tax = data.tax ?? 0;
  const itemCount = data.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Document title={`Recibo ${data.orderNumber} — Buxxep`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar} />
        <Text style={styles.brand}>BUXXEP</Text>
        <Text style={styles.brandSub}>RECIBO DE COMPRA</Text>

        <Text style={styles.title}>Pedido #{data.orderNumber}</Text>
        <Text style={styles.subtitle}>Gracias por tu compra, {data.name}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Cliente</Text>
            <Text style={styles.metaValue}>{data.name}</Text>
          </View>
          {data.purchaseDate ? (
            <View style={styles.metaBlock}>
              <Text style={styles.metaLabel}>Fecha</Text>
              <Text style={styles.metaValue}>{data.purchaseDate}</Text>
            </View>
          ) : null}
          {data.paymentMethodLabel ? (
            <View style={styles.metaBlock}>
              <Text style={styles.metaLabel}>Método de pago</Text>
              <Text style={styles.metaValue}>{data.paymentMethodLabel}</Text>
            </View>
          ) : null}
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Estado</Text>
            <Text style={styles.metaValue}>
              {data.paymentStatusLabel ?? "Pagado"}
            </Text>
          </View>
        </View>

        <View style={styles.sectionLabelRow}>
          <Text style={styles.sectionLabel}>Productos</Text>
          <Text style={styles.itemCount}>
            {itemCount} {itemCount === 1 ? "artículo" : "artículos"}
          </Text>
        </View>

        <View style={styles.columnHeaderRow}>
          <Text style={styles.columnHeaderName}>Producto</Text>
          <Text style={styles.columnHeaderQty}>Cant.</Text>
          <Text style={styles.columnHeaderPrice}>Importe</Text>
        </View>

        <View style={styles.table}>
          {data.items.map((item, i) => {
            const metaParts = [
              item.size ? `Talla ${item.size}` : null,
              item.color ? `Color ${item.color}` : null,
            ].filter((v): v is string => Boolean(v));
            return (
              <View style={styles.tableRow} key={`${item.name}-${i}`}>
                <ItemThumb name={item.name} imageUrl={item.imageUrl} />
                <View style={styles.colName}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {metaParts.length > 0 ? (
                    <Text style={styles.itemMeta}>{metaParts.join(" · ")}</Text>
                  ) : null}
                  <Text style={styles.itemUnitPrice}>
                    {fmt(item.unitPrice)} c/u
                  </Text>
                </View>
                <View style={styles.colQty}>
                  <View style={styles.qtyBadge}>
                    <Text style={styles.qtyBadgeText}>×{item.quantity}</Text>
                  </View>
                </View>
                <Text style={[styles.colPrice, styles.linePrice]}>
                  {fmt(item.unitPrice * item.quantity)}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.totalsBox}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{fmt(data.subtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Envío</Text>
            <Text style={styles.totalsValue}>
              {data.shipping === 0 ? "GRATIS" : fmt(data.shipping)}
            </Text>
          </View>
          {tax > 0 ? (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Impuestos</Text>
              <Text style={styles.totalsValue}>{fmt(tax)}</Text>
            </View>
          ) : null}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{fmt(data.total)}</Text>
          </View>
        </View>

        <Text style={styles.thanks}>Gracias por tu compra</Text>

        <Text style={styles.footer}>
          {`BUXXEP · República Dominicana · ID ${data.orderId}\nEste recibo es un comprobante de compra sin validez fiscal.`}
        </Text>
      </Page>
    </Document>
  );
}
