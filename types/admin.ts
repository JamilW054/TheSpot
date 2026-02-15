/**
 * Admin domain types.
 * Pedidos table, filters, and related UI contracts.
 */

import type { Pedido, PedidoEstado } from "./pedido";

/** Estado filter for pedidos table: "todos" or a specific PedidoEstado. */
export type FilterEstado = "todos" | PedidoEstado;

/** Props for the PedidosTable component. */
export interface PedidosTableProps {
  pedidos: Pedido[];
  /** Si true, muestra barra de búsqueda y filtro por estado (requiere client). */
  withFilters?: boolean;
  /** Llamado al ejecutar "Marcar en proceso" en lote; recibe los ids seleccionados. */
  onMarkEnProceso?: (ids: string[]) => void;
  /** Llamado al ejecutar "Marcar completado" en lote; recibe los ids seleccionados. */
  onMarkCompletado?: (ids: string[]) => void;
}

/** Props for the internal PedidosTableBody component. */
export interface PedidosTableBodyProps {
  pedidos: Pedido[];
  selectedIds: Set<string>;
  onToggleRow: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
}
