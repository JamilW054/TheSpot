"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { PageLayout } from "@/components/layout";
import { PedidosTable } from "@/features/admin";
import { adminDeleteOrder, adminSetOrdersStatus } from "@/lib/actions/orders-admin";
import type { Pedido } from "@/types";

export function PedidosAdminClient({ pedidos }: { pedidos: Pedido[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <PageLayout
      title="Todos los pedidos"
      description="Vista de pedidos con dirección y datos del cliente. Usa el filtro para ver por estado o el toggle para cambiar entre tarjetas y tabla."
    >
      {pending && (
        <p className="mb-3 text-xs text-muted-foreground">Actualizando…</p>
      )}
      <PedidosTable
        pedidos={pedidos}
        withFilters
        initialFilterEstado="abiertos"
        onMarkEnProceso={(ids) => {
          startTransition(async () => {
            await adminSetOrdersStatus(ids, "paid");
            router.refresh();
          });
        }}
        onMarkCompletado={(ids) => {
          startTransition(async () => {
            await adminSetOrdersStatus(ids, "shipped");
            router.refresh();
          });
        }}
        onDelete={async (id) => {
          await adminDeleteOrder(id);
          router.refresh();
        }}
      />
    </PageLayout>
  );
}
