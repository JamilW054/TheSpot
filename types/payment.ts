/**
 * Datos mostrados tras un pago AZUL aprobado (pantalla de éxito).
 */
export interface PaymentResult {
  totalPaidLabel: string;
  statusLabel: string;
  paymentMethodLabel: string;
  cardType: string;
  processor: string;
  processedAt: string;
  transactionId: string;
  authorizationCode?: string;
  responseCode?: string;
  orderId: string;
  merchantName: string;
  merchantSubtitle: string;
  description: string;
}
