/**
 * Pedido (order) domain types.
 * Core entity and estado enum for orders.
 */

export type PedidoEstado = "pendiente" | "en_proceso" | "completado";

export interface Pedido {
  id: string;
  cliente: string;
  items: number;
  total: string;
  estado: PedidoEstado;
  /** Fecha de creación para listados (ej. "22/02/24") */
  createdAt?: string;
}
