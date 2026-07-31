"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { PageLayout } from "@/components/layout";
import { PedidosTable } from "@/features/admin";
import { adminDeleteOrder, adminSetOrdersStatus } from "@/lib/actions/orders-admin";
import {
  DEFAULT_ORDER_STATUS_FILTER,
  ORDER_STATUS_PARAM,
  type OrderStatusFilter,
} from "@/lib/orders/status";
import type { Pedido } from "@/types";

export function PedidosAdminClient({
  pedidos,
  statusFilter,
}: {
  pedidos: Pedido[];
  statusFilter: OrderStatusFilter;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  /**
   * El estado vive en la URL: así se compone con el resto de parámetros
   * (paginación, orden, filtros) sin duplicar estado en el cliente y la
   * consulta del servidor se rehace con el nuevo filtro.
   */
  const handleStatusChange = (next: OrderStatusFilter) => {
    if (next === statusFilter) return;
    const params = new URLSearchParams(searchParams.toString());
    if (next === DEFAULT_ORDER_STATUS_FILTER) params.delete(ORDER_STATUS_PARAM);
    else params.set(ORDER_STATUS_PARAM, next);
    // Cambiar de estado reinicia la paginación.
    params.delete("page");
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  };

  return (
    <PageLayout
      title="Todos los pedidos"
      description="Vista de pedidos con dirección y datos del cliente. Filtra por estado o usa el toggle para cambiar entre tarjetas y tabla."
    >
      {pending && (
        <p className="mb-3 text-xs text-muted-foreground">Actualizando…</p>
      )}
      <PedidosTable
        pedidos={pedidos}
        withFilters
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusChange}
        isRefreshing={pending}
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
