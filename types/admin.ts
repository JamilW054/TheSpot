/**
 * Admin domain types.
 * Pedidos table, filters, and related UI contracts.
 */

import type { Pedido, PedidoEstado } from "./pedido";

/** Estado filter for pedidos table; "abiertos" = pendiente + en proceso (no completados). */
export type FilterEstado = "todos" | "abiertos" | PedidoEstado;

/** Props for the PedidosTable component. */
export interface PedidosTableProps {
  pedidos: Pedido[];
  /** Si true, muestra barra de búsqueda y filtro por estado (requiere client). */
  withFilters?: boolean;
  /** Estado inicial del filtro (solo con `withFilters`). */
  initialFilterEstado?: FilterEstado;
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
