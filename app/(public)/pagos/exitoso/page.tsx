import { redirect } from "next/navigation";
import { PaymentSuccessScreen } from "@/components/payment/PaymentSuccessScreen";
import { getOrderStatusById } from "@/lib/db";
import type { PaymentResult } from "@/types";

export const metadata = {
  title: "Pago exitoso | Buxxep",
  description: "Confirmación del pago procesado por AZUL",
};

export default async function PagoExitosoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const orderIdParam = params.orderId;
  const orderId = Array.isArray(orderIdParam) ? orderIdParam[0] : orderIdParam;
  if (!orderId) {
    redirect("/carrito/checkout");
  }

  const order = await getOrderStatusById(orderId);
  if (!order) {
    redirect("/carrito/checkout");
  }

  if (order.paymentStatus !== "paid") {
    redirect(
      `/pagos/rechazado?orderId=${encodeURIComponent(order.id)}&responseCode=${encodeURIComponent(order.azulResponseCode ?? "N/A")}`,
    );
  }

  const paidDate = order.paidAt ? new Date(order.paidAt) : new Date();
  const paymentResult: PaymentResult = {
    totalPaidLabel: new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
      minimumFractionDigits: 2,
    }).format(order.totalCents / 100),
    statusLabel: "APROBADO",
    paymentMethodLabel: "AZUL",
    cardType: "Crédito/Débito",
    processor: order.paymentProvider ?? "AZUL",
    processedAt: Number.isNaN(paidDate.getTime())
      ? order.createdAt
      : paidDate.toLocaleString("es-DO", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
    transactionId:
      order.azulTransactionId ??
      `AZUL-BUXXEP-${order.id.slice(0, 8).toUpperCase()}`,
    authorizationCode: order.azulAuthorizationCode ?? undefined,
    responseCode: order.azulResponseCode ?? undefined,
    orderId: order.id,
    merchantName: "BUXXEP STORE",
    merchantSubtitle: "Moda • Estilo • Calidad",
    description: "Compra de productos",
  };

  return <PaymentSuccessScreen paymentResult={paymentResult} />;
}
