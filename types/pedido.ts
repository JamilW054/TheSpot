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
}
