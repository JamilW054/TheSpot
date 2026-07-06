import { NextResponse } from "next/server";
import { getOrderStatusById } from "@/database/repositories";

/**
 * CancelUrl de AZUL: el cliente cancela desde la página hospedada de AZUL
 * ANTES de que exista una transacción — no hay payload firmado que verificar
 * (a diferencia de ApprovedUrl/DeclinedUrl, que llegan vía POST a
 * `/api/pagos/azul/retorno`). AZUL redirige el navegador a esta URL exacta
 * (con `orderId` incluido porque lo agregamos nosotros al construirla), así
 * que solo registramos el evento y llevamos al cliente a la pantalla de
 * cancelación. El pedido no se toca: sigue "pending" y disponible para
 * reintentar el pago.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const orderId = searchParams.get("orderId")?.trim() ?? "";

  if (orderId) {
    const order = await getOrderStatusById(orderId);
    console.info("[AZUL] Pago cancelado por el cliente", {
      orderId,
      orderFound: Boolean(order),
    });
  } else {
    console.warn("[AZUL] Cancelación recibida sin orderId");
  }

  const destination = orderId
    ? `${origin}/pagos/cancelado?orderId=${encodeURIComponent(orderId)}`
    : `${origin}/pagos/cancelado`;

  return NextResponse.redirect(destination, { status: 303 });
}
