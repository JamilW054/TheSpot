-- =============================================================================
-- Buxxep — Comisión G3DEON por venta
-- =============================================================================
-- G3DEON retiene un porcentaje de cada venta (12% por defecto), igual que la
-- pasarela AZUL. Se guarda en app_settings para poder cambiarlo desde
-- /admin/config sin migración:
--
--   beneficio neto = precio − coste − (precio × %AZUL) − (precio × %G3DEON)
-- =============================================================================

INSERT INTO public.app_settings (key, value)
VALUES ('g3deon_commission_percent', '12.00')
ON CONFLICT (key) DO NOTHING;
