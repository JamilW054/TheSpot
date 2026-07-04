import Link from "next/link";
import { getOrderStatusById } from "@/database/repositories";

export const metadata = {
  title: "Pago rechazado | Buxxep",
  description: "Resultado de pago rechazado en AZUL",
};

export default async function PagoRechazadoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const orderIdParam = params.orderId;
  const responseCodeParam = params.responseCode;
  const orderId = Array.isArray(orderIdParam) ? orderIdParam[0] : orderIdParam;
  const responseCode = Array.isArray(responseCodeParam)
    ? responseCodeParam[0]
    : responseCodeParam;

  const order = orderId ? await getOrderStatusById(orderId) : null;
  const effectiveResponseCode = order?.azulResponseCode ?? responseCode;

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-destructive/30 bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <svg
            className="size-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-label="Error de pago"
          >
            <title>Error de pago</title>
            <path
              d="m15 9-6 6M9 9l6 6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
        <h1 className="mt-5 text-2xl font-bold text-foreground">
          Pago rechazado
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          AZUL no aprobó la transacción. Puedes intentar de nuevo con otro
          método o revisar tus datos.
        </p>
        {orderId ? (
          <p className="mt-3 text-sm text-muted-foreground">
            ID de orden:{" "}
            <span className="font-mono text-foreground">{orderId}</span>
          </p>
        ) : null}
        {effectiveResponseCode ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Código de respuesta:{" "}
            <span className="font-mono text-foreground">
              {effectiveResponseCode}
            </span>
          </p>
        ) : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/carrito/checkout"
            className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            Intentar nuevamente
          </Link>
          <Link
            href="/carrito"
            className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground"
          >
            Volver al carrito
          </Link>
        </div>
      </div>
    </main>
  );
}
