import { renderToBuffer } from "@react-pdf/renderer";
import type { CompraEmailData } from "../templates/compra";
import { ReceiptDocument } from "./receipt-document";

/** Genera el PDF del recibo de compra (adjunto del correo de pedido confirmado). */
export function renderReceiptPdf(data: CompraEmailData): Promise<Buffer> {
  return renderToBuffer(<ReceiptDocument {...data} />);
}
