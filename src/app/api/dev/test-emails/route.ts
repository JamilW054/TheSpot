import { NextResponse } from "next/server";
import { sendCompraEmail, sendNewOrderAdminEmail } from "@/lib/resend";

const TEST_TO = "lacretalasemilla@gmail.com";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Solo disponible en desarrollo." },
      { status: 403 },
    );
  }

  const results: Record<string, unknown> = {};

  // 1. Aviso de pedido nuevo al admin
  try {
    const r = await sendNewOrderAdminEmail(TEST_TO, {
      orderNumber: "TEST0001",
      orderId: "ord_01jwtest000000000",
      customerName: "Cliente de prueba",
      customerEmail: TEST_TO,
      customerPhone: "+1 (809) 000-0000",
      shippingAddress: "Calle Falsa 123, Santo Domingo",
      items: [
        { name: "Noir Intense", quantity: 1, size: "50ml", unitPrice: 285000 },
        { name: "Fleur Blanche", quantity: 1, size: "100ml", unitPrice: 355000 },
      ],
      subtotal: 640000,
      shipping: 25000,
      discount: 0,
      total: 665000,
      currency: "DOP",
    });
    results.nuevoPedidoAdmin = { ok: true, id: r.data?.id };
  } catch (e) {
    results.nuevoPedidoAdmin = { ok: false, error: String(e) };
  }

  // 2. Recibo de compra al cliente
  try {
    const r = await sendCompraEmail(TEST_TO, {
      name: "Cliente de prueba",
      orderId: "ord_01jwtest000000000",
      orderNumber: "TEST0001",
      items: [
        { name: "Noir Intense", quantity: 1, size: "50ml", unitPrice: 285000 },
        { name: "Fleur Blanche", quantity: 1, size: "100ml", unitPrice: 355000 },
      ],
      subtotal: 640000,
      shipping: 25000,
      tax: 0,
      total: 665000,
      currency: "DOP",
      purchaseDate: "01 de julio de 2026, 03:45 p. m.",
      paymentMethodLabel: "Pago confirmado por el negocio",
      paymentStatusLabel: "Pagado",
    });
    results.compra = { ok: true, id: r.data?.id };
  } catch (e) {
    results.compra = { ok: false, error: String(e) };
  }

  return NextResponse.json({ to: TEST_TO, results });
}
