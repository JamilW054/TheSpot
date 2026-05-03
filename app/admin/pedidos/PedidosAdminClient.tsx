"use client";

import { PageLayout } from "@/components/layout";
import { PedidosTable } from "@/features/admin";
import type { Pedido } from "@/types";

export function PedidosAdminClient({ pedidos }: { pedidos: Pedido[] }) {
  return (
    <PageLayout
      title="Todos los pedidos"
      description="Por defecto se muestran pedidos abiertos (pendiente y en proceso). Usa el filtro para ver completados o todo el histórico."
    >
      <PedidosTable
        pedidos={pedidos}
        withFilters
        initialFilterEstado="abiertos"
      />
    </PageLayout>
  );
}
