/**
 * Admin domain types.
 * Pedidos table, filters, and related UI contracts.
 */

import type { OrderStatusFilter } from "@/lib/orders/status";
import type { Pedido } from "./pedido";

/** Props for the PedidosTable component. */
export interface PedidosTableProps {
  pedidos: Pedido[];
  /** Si true, muestra barra de búsqueda y filtro por estado (requiere client). */
  withFilters?: boolean;
  /**
   * Estado activo del filtro. El filtrado por estado ocurre en la consulta del
   * servidor: la tabla solo pinta el estado activo y notifica el cambio.
   */
  statusFilter?: OrderStatusFilter;
  /** Cambio de estado; quien lo recibe rehace la consulta (y reinicia la paginación). */
  onStatusFilterChange?: (status: OrderStatusFilter) => void;
  /** True mientras se recarga la lista tras cambiar de estado. */
  isRefreshing?: boolean;
  /** Llamado al ejecutar "Marcar en proceso" en lote; recibe los ids seleccionados. */
  onMarkEnProceso?: (ids: string[]) => void;
  /** Llamado al ejecutar "Marcar completado" en lote; recibe los ids seleccionados. */
  onMarkCompletado?: (ids: string[]) => void;
  /** Elimina un pedido no pagado por su id. */
  onDelete?: (id: string) => Promise<void>;
}

/** Props for the internal PedidosTableBody component. */
export interface PedidosTableBodyProps {
  pedidos: Pedido[];
  selectedIds: Set<string>;
  onToggleRow: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
}
