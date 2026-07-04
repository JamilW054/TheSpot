import { getMyPaymentRequests } from "@/database/repositories/payments";
import { PagosContent } from "./PagosContent";

export const metadata = {
  title: "Centro de pagos | Buxxep",
  description: "Tus solicitudes de pago, estados y enlaces.",
};

export const dynamic = "force-dynamic";

export default async function CuentaPagosPage() {
  const requests = await getMyPaymentRequests();

  return (
    <article className="w-full max-w-2xl px-4 sm:px-6 pb-20 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Centro de pagos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Consulta tus solicitudes de pago, su estado y completa tus cobros.
        </p>
      </header>

      <PagosContent requests={requests} />
    </article>
  );
}
