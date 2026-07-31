-- =============================================================================
-- Buxxep — Socios / Terceros (partners) y su libro de pagos
-- =============================================================================
-- Generaliza lo que hoy está cableado a G3DEON (12% en `app_settings`) a un
-- módulo capaz de manejar cualquier tercero que cobre de forma recurrente:
-- G3DEON, contabilidad externa, comisionistas, inversores, socios estratégicos.
--
-- Dos tablas:
--   partners          — configuración del tercero (qué se le debe y cómo).
--   partner_payments  — libro append-only de pagos hechos (histórico intocable).
--
-- Lo calculado (deuda del mes, pagado, balance, estado) NO se almacena: se
-- deriva en la vista `partner_monthly_statements` (migración 00031).
--
-- Extensibilidad sin migrar:
--   - nuevo socio           → INSERT en partners.
--   - nueva regla de cobro  → `payment_type` es texto con CHECK; añadir un valor
--                             al CHECK y una rama en la vista/estrategia TS.
--   - nueva base de cálculo → `percentage_base` (ingreso / bruto / neto).
--   - nueva frecuencia      → `frequency` (hoy solo 'monthly').
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Helper `updated_at` (normalmente ya existe desde 00001)
-- ---------------------------------------------------------------------------
-- Se redeclara igual que en 00008: en el proyecto remoto las primeras
-- migraciones están marcadas como aplicadas sin haberse ejecutado del todo, y
-- la función no está. `CREATE OR REPLACE` con el mismo cuerpo es inocuo si ya
-- existe, y evita que esta migración falle en un entorno "baseline".

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- partners
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.partners (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name               text NOT NULL,
  legal_name         text,

  -- Estrategia de cobro. Discriminador: cada valor exige sus propios campos
  -- (ver CHECK `partners_payment_type_fields_chk` más abajo).
  payment_type       text NOT NULL DEFAULT 'percentage'
                       CHECK (payment_type IN ('percentage', 'fixed')),

  -- Modo porcentaje.
  percentage_rate    numeric(6,3)
                       CHECK (percentage_rate IS NULL
                              OR (percentage_rate >= 0 AND percentage_rate <= 100)),
  -- Sobre qué magnitud del mes se aplica el porcentaje. Todas se miden ANTES
  -- de repartir a socios, así el cálculo nunca es circular (si un socio cobrara
  -- sobre "lo que queda tras pagar a los socios", su propia deuda entraría en
  -- su propia base).
  --   revenue      = importe procesado por la pasarela
  --   gross_profit = ingreso de líneas − coste de mercancía
  --   net_profit   = gross_profit − comisión de la pasarela AZUL
  percentage_base    text NOT NULL DEFAULT 'gross_profit'
                       CHECK (percentage_base IN ('revenue', 'gross_profit', 'net_profit')),

  -- Modo monto fijo (céntimos DOP, como el resto del esquema).
  fixed_amount_cents bigint CHECK (fixed_amount_cents IS NULL OR fixed_amount_cents >= 0),

  -- Periodicidad del devengo. Hoy solo mensual; el CHECK deja sitio a más.
  frequency          text NOT NULL DEFAULT 'monthly'
                       CHECK (frequency IN ('monthly')),
  currency           text NOT NULL DEFAULT 'DOP',

  -- Ventana de devengo. Fuera de ella el socio no genera deuda nueva, pero su
  -- histórico se conserva intacto. `active` es visibilidad/operativa (dashboard,
  -- selects); para dejar de devengar se pone `ends_on`.
  starts_on          date,
  ends_on            date,
  active             boolean NOT NULL DEFAULT true,

  notes              text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  deleted_at         timestamptz,

  CONSTRAINT partners_name_not_blank_chk CHECK (length(btrim(name)) > 0),
  CONSTRAINT partners_window_chk
    CHECK (starts_on IS NULL OR ends_on IS NULL OR ends_on >= starts_on),
  -- Cada estrategia obliga a rellenar su propio campo. Impide un socio
  -- "porcentaje" sin tasa (deuda silenciosa de 0) o "fijo" sin importe.
  CONSTRAINT partners_payment_type_fields_chk CHECK (
    (payment_type = 'percentage' AND percentage_rate IS NOT NULL)
    OR (payment_type = 'fixed' AND fixed_amount_cents IS NOT NULL)
  )
);

COMMENT ON TABLE public.partners IS
  'Terceros que cobran de forma recurrente (G3DEON, contabilidad, comisionistas, inversores). La deuda no se guarda: se deriva en partner_monthly_statements.';
COMMENT ON COLUMN public.partners.percentage_base IS
  'Magnitud mensual sobre la que se aplica percentage_rate. Siempre medida antes del reparto a socios para evitar circularidad.';
COMMENT ON COLUMN public.partners.ends_on IS
  'Último día en que el socio devenga. NULL = indefinido. Se usa para cortar el devengo sin perder el histórico (a diferencia de `active`, que solo oculta).';

-- Un solo socio activo por nombre (case-insensitive); los borrados no estorban.
CREATE UNIQUE INDEX IF NOT EXISTS partners_name_unique_idx
  ON public.partners (lower(btrim(name)))
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS partners_active_idx
  ON public.partners (active)
  WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS partners_set_updated_at ON public.partners;
CREATE TRIGGER partners_set_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------------
-- partner_payments — libro append-only
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.partner_payments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id   uuid NOT NULL REFERENCES public.partners(id) ON DELETE RESTRICT,

  -- Mes cuya deuda liquida este pago (día 1). Distinto de `payment_date`: en
  -- enero se puede pagar la deuda de diciembre, y ese pago debe imputarse a
  -- diciembre, no a enero. Es lo que hace que el histórico mensual cuadre.
  period_month date NOT NULL,

  -- Céntimos DOP. Se permite negativo a propósito: como la tabla es
  -- append-only, la única forma de corregir un pago mal registrado es un
  -- asiento compensatorio (reverso), igual que en contabilidad real. Cero no
  -- aporta nada y se rechaza.
  amount_cents bigint NOT NULL CHECK (amount_cents <> 0),

  payment_date date NOT NULL DEFAULT current_date,
  reference    text,
  notes        text,
  created_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT partner_payments_period_is_month_start_chk
    CHECK (period_month = date_trunc('month', period_month)::date)
);

COMMENT ON TABLE public.partner_payments IS
  'Libro append-only de pagos a socios. Nunca se actualiza ni se borra: para corregir se registra un asiento negativo (reverso).';
COMMENT ON COLUMN public.partner_payments.period_month IS
  'Mes al que se imputa el pago (día 1), no la fecha en que se pagó. Permite liquidar en febrero la deuda de enero sin descuadrar el histórico.';
COMMENT ON COLUMN public.partner_payments.amount_cents IS
  'Céntimos DOP. Negativo = reverso/ajuste de un pago anterior.';

-- Consulta caliente: "pagos del socio X imputados al mes M" (dashboard y detalle).
CREATE INDEX IF NOT EXISTS partner_payments_partner_period_idx
  ON public.partner_payments (partner_id, period_month DESC);
CREATE INDEX IF NOT EXISTS partner_payments_payment_date_idx
  ON public.partner_payments (payment_date DESC);

-- Inmutabilidad: el histórico no se pisa. Un UPDATE o DELETE sobre un pago
-- registrado falla siempre — incluso con service role — así que un bug en una
-- server action no puede reescribir la contabilidad. La corrección es un
-- asiento negativo, no una edición.
CREATE OR REPLACE FUNCTION public.partner_payments_append_only()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION
    'partner_payments es append-only: los pagos no se editan ni se borran. Registra un pago negativo (reverso) para corregir.'
    USING ERRCODE = 'restrict_violation';
END;
$$;

DROP TRIGGER IF EXISTS partner_payments_no_update ON public.partner_payments;
CREATE TRIGGER partner_payments_no_update
  BEFORE UPDATE OR DELETE ON public.partner_payments
  FOR EACH ROW EXECUTE PROCEDURE public.partner_payments_append_only();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
-- Mismo patrón que `app_settings` (migración 00020): RLS activa sin políticas.
-- Ni anon ni authenticated tocan estas tablas directamente; todo el acceso pasa
-- por las server actions del admin con service role.

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_payments ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Semilla: G3DEON
-- ---------------------------------------------------------------------------
-- Toma el porcentaje vigente de `app_settings.g3deon_commission_percent` (12%
-- por defecto) para no cambiar los números que ya muestra el dashboard.
--
-- OJO con `percentage_base = 'gross_profit'`: es lo que hoy calcula producción
-- (lib/pricing.ts y la vista admin_monthly_commissions cobran el 12% sobre la
-- ganancia bruta, precio − coste). Si el acuerdo real es "12% de la ganancia
-- NETA" (tras la comisión de AZUL), basta cambiar este socio a 'net_profit'
-- desde /admin/socios — sin migración y sin tocar código.

INSERT INTO public.partners (name, payment_type, percentage_rate, percentage_base, notes)
SELECT
  'G3DEON',
  'percentage',
  COALESCE(
    (SELECT value::numeric FROM public.app_settings
      WHERE key = 'g3deon_commission_percent'),
    12
  ),
  'gross_profit',
  'Socio tecnológico. Migrado desde app_settings.g3deon_commission_percent.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.partners
  WHERE lower(btrim(name)) = 'g3deon' AND deleted_at IS NULL
);

NOTIFY pgrst, 'reload schema';
