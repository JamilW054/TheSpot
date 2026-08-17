import { ORDER_STATUS_PAGE } from "@/config/navigation";
import { OrderStatusContent } from "./OrderStatusContent";
import Link from "next/link";

export const metadata = {
  title: `${ORDER_STATUS_PAGE.label} | The Spot`,
  description: "Consulta el estado de tu pedido con el número de pedido.",
};

export default function EstadoPedidoPage() {
  return (
    <article className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-16 sm:pb-20">
      <nav className="mb-4 sm:mb-5" aria-label="Navegación">
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            className="size-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Catálogo
        </Link>
      </nav>

      <header className="mb-6 sm:mb-8" aria-labelledby="order-status-title">
        <h1
          id="order-status-title"
          className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl"
        >
          {ORDER_STATUS_PAGE.label}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg">
          Introduce el número de pedido que recibiste al finalizar la compra
          para ver el estado y el detalle.
        </p>
      </header>

      <OrderStatusContent />
    </article>
  );
}
