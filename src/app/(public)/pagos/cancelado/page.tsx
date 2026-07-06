import { ShieldCheck, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { PaymentCatalogShowcase } from "@/components/payment/PaymentCatalogShowcase";
import { RetryAzulPaymentButton } from "@/components/payment/RetryAzulPaymentButton";

export const metadata = {
  title: "Pago cancelado | Buxxep",
  description: "Cancelaste el pago con AZUL antes de completarlo",
};

export default async function PagoCanceladoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const orderIdParam = params.orderId;
  const orderId = Array.isArray(orderIdParam) ? orderIdParam[0] : orderIdParam;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-primary/25 bg-card p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary">
          <ShoppingBag className="size-8" aria-hidden />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-foreground">
          Pago cancelado
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cancelaste el pago antes de completarlo — no se realizó ningún cargo.
        </p>
        <p className="mt-4 text-sm font-medium text-foreground">
          {orderId
            ? "Tu pedido está guardado. Complétalo cuando quieras, de forma segura con Pay with Azul."
            : "Puedes completar tu compra cuando quieras, de forma segura con Pay with Azul."}
        </p>

        {orderId ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Pedido: <span className="font-mono text-foreground">{orderId}</span>
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3">
          {orderId ? (
            <RetryAzulPaymentButton
              orderId={orderId}
              label="Completar mi compra con AZUL"
              className="py-3.5 text-base"
            />
          ) : (
            <Link
              href="/carrito/checkout"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3.5 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Ir al checkout
            </Link>
          )}
          <Link
            href="/carrito"
            className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground"
          >
            Volver al carrito
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5 text-primary" aria-hidden />
          Pago seguro procesado por AZUL (Banco Popular)
        </div>
      </div>

      <PaymentCatalogShowcase
        title="Sigue buscando en el catálogo"
        subtitle="Tómate tu tiempo — tus artículos te esperan, y siempre hay algo nuevo que descubrir."
      />
    </main>
  );
}
