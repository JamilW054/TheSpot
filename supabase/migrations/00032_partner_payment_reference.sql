-- =============================================================================
-- Buxxep — Referencia de pago a socios: única y buscable
-- =============================================================================
-- La referencia deja de ser un texto libre opcional: el backend genera una
-- (`PGO-YYYYMM-XXXXXX`) cuando el admin no aporta la suya. Sirve para localizar
-- un pago concreto en la BD y para cruzarlo con el comprobante bancario.
--
-- Unicidad case-insensitive: "pgo-202607-a1b2c3" y "PGO-202607-A1B2C3" son la
-- misma referencia. Si alguien intenta reutilizarla, el INSERT falla (23505) —
-- que es justo lo que queremos en un libro contable: dos pagos no comparten
-- comprobante. El índice sirve además de índice de búsqueda.
-- =============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS partner_payments_reference_unique_idx
  ON public.partner_payments (upper(btrim(reference)))
  WHERE reference IS NOT NULL;

COMMENT ON COLUMN public.partner_payments.reference IS
  'Referencia del pago, única (case-insensitive). La genera el backend si el admin no indica una propia.';

NOTIFY pgrst, 'reload schema';
