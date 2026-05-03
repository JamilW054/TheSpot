"use client";

import { PageLayout } from "@/components/layout";
import { PedidosTable } from "@/features/admin";
import { adminSetOrdersStatus } from "@/lib/actions/orders-admin";
import type { Pedido } from "@/types";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function PedidosAdminClient({ pedidos }: { pedidos: Pedido[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <PageLayout
      title="Todos los pedidos"
      description="Por defecto se muestran pedidos abiertos (pendiente y en proceso). Usa el filtro para ver completados o todo el histórico."
    >
      {pending ? (
        <p className="mb-3 text-xs text-muted-foreground">Actualizando…</p>
      ) : null}
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
      />
    </PageLayout>
  );
}
