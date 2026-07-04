import { NextResponse } from "next/server";
import {
  sendBienvenidaEmail,
  sendCompraEmail,
  sendOtpEmail,
} from "@/lib/resend";

const TEST_TO = "lacretalasemilla@gmail.com";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Solo disponible en desarrollo." },
      { status: 403 },
    );
  }

  const results: Record<string, unknown> = {};

  // 1. OTP email
  try {
    const r = await sendOtpEmail(TEST_TO, {
      name: "Biandy",
      code: "847291",
      expiresInMinutes: 10,
    });
    results.otp = { ok: true, id: r.data?.id };
  } catch (e) {
    results.otp = { ok: false, error: String(e) };
  }

  // 2. Bienvenida email
  try {
    const r = await sendBienvenidaEmail(TEST_TO, {
      name: "Biandy",
      email: TEST_TO,
    });
    results.bienvenida = { ok: true, id: r.data?.id };
  } catch (e) {
    results.bienvenida = { ok: false, error: String(e) };
  }

  // 3. Compra email
  try {
    const r = await sendCompraEmail(TEST_TO, {
      name: "Biandy",
      orderId: "ord_01jwtest000000000",
      orderNumber: "BXP-2026-001",
      items: [
        {
          name: "Hoodie Buxxep Classic",
          quantity: 1,
          size: "L",
          unitPrice: 250000,
        },
        {
          name: "Camiseta Drop Signature",
          quantity: 2,
          size: "M",
          unitPrice: 120000,
        },
      ],
      subtotal: 490000,
      shipping: 0,
      tax: 0,
      total: 490000,
      currency: "DOP",
      purchaseDate: "01 de julio de 2026, 03:45 p. m.",
      paymentMethodLabel: "Pago con Azul",
      paymentStatusLabel: "Pagado",
    });
    results.compra = { ok: true, id: r.data?.id };
  } catch (e) {
    results.compra = { ok: false, error: String(e) };
  }

  return NextResponse.json({ to: TEST_TO, results });
}
