import {
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Wallet,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { PaymentCatalogShowcase } from "@/components/payment/PaymentCatalogShowcase";
import { RetryAzulPaymentButton } from "@/components/payment/RetryAzulPaymentButton";
import { getOrderStatusById } from "@/database/repositories";
import { getAzulDeclineReason } from "@/lib/payments/azul";

export const metadata = {
  title: "Pago rechazado | Buxxep",
  description: "Resultado de pago rechazado en AZUL",
};

const COMMON_REASONS = [
  "Fondos insuficientes en la tarjeta.",
  "El banco rechazó la transacción.",
  "Validación de seguridad fallida (CVV o 3D Secure).",
  "Datos de la tarjeta incorrectos o vencida.",
];

export default async function PagoRechazadoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  // Página puramente de presentación: el registro del rechazo ocurre en el
  // route handler /api/pagos/azul/retorno (ver /pagos/exitoso para el detalle).
  const orderIdParam = params.orderId;
  const responseCodeParam = params.responseCode;
  const orderId = Array.isArray(orderIdParam) ? orderIdParam[0] : orderIdParam;
  const responseCode = Array.isArray(responseCodeParam)
    ? responseCodeParam[0]
    : responseCodeParam;

  const order = orderId ? await getOrderStatusById(orderId) : null;
  const effectiveResponseCode = order?.azulResponseCode ?? responseCode ?? null;
  const specificReason = effectiveResponseCode
    ? getAzulDeclineReason(effectiveResponseCode)
    : null;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-destructive/30 bg-card p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <XCircle className="size-9" aria-hidden />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-foreground">
          Pago rechazado
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          AZUL no pudo completar tu pago. Tu pedido sigue guardado — no se
          realizó ningún cargo.
        </p>

        {specificReason ? (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-left">
            <ShieldAlert
              className="mt-0.5 size-4 shrink-0 text-destructive"
              aria-hidden
            />
            <p className="text-sm text-foreground">{specificReason}</p>
          </div>
        ) : null}

        <div className="mt-5 rounded-xl bg-muted/40 p-4 text-left">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <AlertTriangle className="size-3.5" aria-hidden />
            Razones comunes de rechazo
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {COMMON_REASONS.map((reason) => (
              <li key={reason} className="flex items-start gap-2">
                <span
                  className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/60"
                  aria-hidden
                />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        <dl className="mt-5 space-y-1.5 text-left text-xs text-muted-foreground">
          {orderId ? (
            <div className="flex justify-between gap-4">
              <dt>ID de orden</dt>
              <dd className="font-mono text-foreground">{orderId}</dd>
            </div>
          ) : null}
          {effectiveResponseCode ? (
            <div className="flex justify-between gap-4">
              <dt>Código de respuesta</dt>
              <dd className="font-mono text-foreground">
                {effectiveResponseCode}
              </dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-8 flex flex-col gap-3">
          {orderId ? (
            <RetryAzulPaymentButton
              orderId={orderId}
              label="Intentar de nuevo con AZUL"
            />
          ) : (
            <Link
              href="/carrito/checkout"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Volver al checkout <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/cuenta/pedidos"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground"
            >
              <Wallet className="size-4" aria-hidden />
              Ver mis pedidos
            </Link>
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>

      <PaymentCatalogShowcase
        title="No hay por qué dejar de mirar"
        subtitle="Tu pedido sigue guardado — mientras lo resuelves, mira lo nuevo del catálogo."
      />
    </main>
  );
}
