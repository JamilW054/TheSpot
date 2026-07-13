import { randomInt } from "node:crypto";

/**
 * Referencia de un pago a socio.
 *
 * Si el admin no aporta la suya (transferencia, cheque…), el backend genera una:
 * así todo pago queda localizable en la BD por un identificador corto y legible,
 * sin obligar a inventarse uno a mano. El índice único de la migración 00032
 * garantiza que no se repita — dos pagos nunca comparten comprobante.
 *
 * Formato: `PGO-202607-A7F3K9`
 *   PGO      → pago a socio
 *   202607   → mes que liquida (así la referencia dice a qué periodo pertenece)
 *   A7F3K9   → 6 caracteres aleatorios
 *
 * El alfabeto excluye I, L, O, U, 0 y 1: son los caracteres que se confunden al
 * dictar o teclear una referencia desde un comprobante en papel.
 */

const ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789";
const SUFFIX_LENGTH = 6;

/** Sufijo aleatorio con entropía criptográfica (no `Math.random`). */
function randomSuffix(): string {
  let out = "";
  for (let i = 0; i < SUFFIX_LENGTH; i++) {
    out += ALPHABET[randomInt(ALPHABET.length)];
  }
  return out;
}

/**
 * Genera una referencia para un pago imputado a `periodMonth` (`YYYY-MM-01`).
 * El espacio es de 30^6 ≈ 729 millones por mes: una colisión es improbable, y
 * si ocurre el índice único la rechaza y el llamador reintenta.
 */
export function generatePaymentReference(periodMonth: string): string {
  const compactMonth = periodMonth.slice(0, 7).replace("-", "");
  return `PGO-${compactMonth}-${randomSuffix()}`;
}
