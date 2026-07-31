-- =============================================================================
-- Buxxep — Módulo de gestión de pagos (Payment Management)
-- =============================================================================
-- Introduce un segundo método de cobro: "Payment Links" (enlaces de pago).
-- Azul Payments queda visible pero deshabilitado (aprobación de proveedor
-- pendiente). El administrador genera solicitudes de pago, las envía por correo
-- (Resend) y notifica al cliente; cada cambio de estado queda auditado.
--
-- Tablas:
--   payment_methods        catálogo de métodos (Azul deshabilitado, Links activo)
--   payment_requests       solicitudes de pago por cliente
--   payment_status_history auditoría de cambios de estado
--   email_logs             registro de entregas de correo (Resend)
--
-- `notifications` / `notification_reads` ya existen (feed in-app) y se reutilizan.
-- Las escrituras del panel admin usan la service role (bypass RLS); las RLS de
-- abajo protegen la lectura del cliente sobre sus propias filas.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Enum de estados de pago
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_request_status') THEN
    CREATE TYPE public.payment_request_status AS ENUM (
      'pending',    -- creada, aún sin enviar
      'link_sent',  -- enlace enviado al cliente
      'in_process', -- cliente revisando / pago en curso
      'paid',       -- pago confirmado
      'expired',    -- enlace vencido
      'cancelled'   -- cancelada por el administrador
    );
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 1. payment_methods — catálogo de métodos de cobro
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text NOT NULL UNIQUE,           -- 'azul' | 'payment_link'
  name        text NOT NULL,
  description text,
  is_active   boolean NOT NULL DEFAULT true,  -- seleccionable por el admin
  is_disabled boolean NOT NULL DEFAULT false, -- visible pero no seleccionable
  badge_label text,                           -- p.ej. "Próximamente"
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.payment_methods IS 'Métodos de cobro disponibles en la plataforma.';
COMMENT ON COLUMN public.payment_methods.is_disabled IS 'Visible en la UI pero no seleccionable (p.ej. aprobación de proveedor pendiente).';

-- Semilla: Azul deshabilitado (pendiente de aprobación), Payment Links activo.
INSERT INTO public.payment_methods (code, name, description, is_active, is_disabled, badge_label, sort_order)
VALUES
  ('payment_link', 'Payment Links', 'Enlace de pago seguro enviado al cliente por correo.', true, false, NULL, 1),
  ('azul', 'Azul Payments', 'Pasarela de tarjetas Azul (Banco Popular).', false, true, 'Próximamente', 2)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      is_active = EXCLUDED.is_active,
      is_disabled = EXCLUDED.is_disabled,
      badge_label = EXCLUDED.badge_label,
      sort_order = EXCLUDED.sort_order,
      updated_at = now();

-- -----------------------------------------------------------------------------
-- 2. Secuencia + función para el número de referencia legible
-- -----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.payment_reference_seq;

CREATE OR REPLACE FUNCTION public.generate_payment_reference()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'PAY-' || to_char(now(), 'YYYY') || '-' ||
         lpad(nextval('public.payment_reference_seq')::text, 6, '0');
END;
$$;

-- -----------------------------------------------------------------------------
-- 3. payment_requests — solicitudes de pago
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_requests (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference_number  text NOT NULL UNIQUE DEFAULT public.generate_payment_reference(),
  amount_cents      integer NOT NULL CHECK (amount_cents >= 0),
  currency          text NOT NULL DEFAULT 'DOP',
  description       text,
  payment_method_id uuid NOT NULL REFERENCES public.payment_methods(id),
  payment_url       text,
  status            public.payment_request_status NOT NULL DEFAULT 'pending',
  expires_at        timestamptz,
  sent_at           timestamptz,
  paid_at           timestamptz,
  created_by        uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.payment_requests IS 'Solicitudes de cobro enviadas a clientes (enlaces de pago).';

CREATE INDEX IF NOT EXISTS idx_payment_requests_user_id ON public.payment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON public.payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_created_at ON public.payment_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_requests_method ON public.payment_requests(payment_method_id);

-- -----------------------------------------------------------------------------
-- 4. payment_status_history — auditoría de cambios de estado
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_status_history (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_request_id uuid NOT NULL REFERENCES public.payment_requests(id) ON DELETE CASCADE,
  previous_status    public.payment_request_status,
  new_status         public.payment_request_status NOT NULL,
  note               text,
  changed_by         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at         timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.payment_status_history IS 'Registro de auditoría de cambios de estado de cada solicitud de pago.';

CREATE INDEX IF NOT EXISTS idx_payment_status_history_request
  ON public.payment_status_history(payment_request_id, created_at);

-- -----------------------------------------------------------------------------
-- 5. email_logs — registro de entregas de correo (Resend)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_logs (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_request_id uuid REFERENCES public.payment_requests(id) ON DELETE CASCADE,
  recipient_email    text NOT NULL,
  email_type         text NOT NULL,            -- 'payment_link', ...
  delivery_status    text NOT NULL DEFAULT 'sent', -- 'sent' | 'failed'
  provider_response  jsonb,
  sent_at            timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.email_logs IS 'Auditoría de correos transaccionales (Resend), incluido el envío de enlaces de pago.';

CREATE INDEX IF NOT EXISTS idx_email_logs_request ON public.email_logs(payment_request_id);

-- -----------------------------------------------------------------------------
-- 6. updated_at
-- -----------------------------------------------------------------------------
-- Sin triggers: la lógica de negocio vive en el backend (server actions). El
-- código fija `updated_at = now()` explícitamente en cada UPDATE. En el INSERT
-- lo cubre el DEFAULT now() de la columna.

-- -----------------------------------------------------------------------------
-- 7. RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- payment_methods: lectura pública (selector de método de pago).
DROP POLICY IF EXISTS "payment_methods_select" ON public.payment_methods;
CREATE POLICY "payment_methods_select" ON public.payment_methods
  FOR SELECT USING (true);

-- payment_requests: el cliente solo ve las suyas. (El admin escribe vía service role.)
DROP POLICY IF EXISTS "payment_requests_select_own" ON public.payment_requests;
CREATE POLICY "payment_requests_select_own" ON public.payment_requests
  FOR SELECT USING (auth.uid() = user_id);

-- payment_status_history: lectura vía propiedad de la solicitud.
DROP POLICY IF EXISTS "payment_status_history_select_own" ON public.payment_status_history;
CREATE POLICY "payment_status_history_select_own" ON public.payment_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.payment_requests pr
      WHERE pr.id = payment_status_history.payment_request_id
        AND pr.user_id = auth.uid()
    )
  );

-- email_logs: sin acceso de cliente (solo service role / admin).

-- -----------------------------------------------------------------------------
-- 8. GRANTS
-- -----------------------------------------------------------------------------
GRANT SELECT ON public.payment_methods TO anon, authenticated;
GRANT SELECT ON public.payment_requests TO authenticated;
GRANT SELECT ON public.payment_status_history TO authenticated;
