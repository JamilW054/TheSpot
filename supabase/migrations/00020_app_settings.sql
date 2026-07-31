-- =============================================================================
-- Buxxep — Ajustes de la aplicación (clave/valor)
-- =============================================================================
-- Run after 00019 en Supabase SQL Editor o: supabase db push
--
-- Almacén simple de configuración editable desde el panel de administración.
-- Hoy guarda el correo que recibe el aviso de cada nuevo pedido
-- (`order_notification_email`). Las escrituras llegan por server action con la
-- service role (bypass RLS); no se expone lectura/escritura al cliente.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.app_settings (
  key        text PRIMARY KEY,
  value      text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.app_settings IS
  'Configuración global de la tienda (clave/valor). Editable solo por admin vía service role.';

-- Semilla: correo de notificación de pedidos (el admin lo cambia en /admin/config).
INSERT INTO public.app_settings (key, value)
VALUES ('order_notification_email', 'Biandyprenda@gmail.com')
ON CONFLICT (key) DO NOTHING;

-- RLS activa sin políticas: nadie (anon/authenticated) accede directamente; solo
-- la service role (que ignora RLS) lee/escribe desde las server actions del admin.
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
