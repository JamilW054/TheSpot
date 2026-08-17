# Estado del proyecto JW

Documento vivo. Se actualiza para que cualquier sesión pueda retomar el trabajo sin perder contexto.

**Última actualización:** 2026-08-17 — tienda multi-categoría (belleza, relojes, perfumes, gorras, tenis), paleta blanco/rojo.

## Decisiones fijas (no se vuelven a preguntar)

- Checkout de invitado, sin cuenta de cliente obligatoria.
- Cuentas de cliente eliminadas por completo (login/registro/OTP/reset password/eliminar cuenta). Solo existe login de administrador.
- Pagos en línea eliminados por completo: AZUL y "Payment Link".
- WhatsApp vía enlaces `wa.me` (click-to-chat), no API de pago.
- Módulo de socios/comisiones eliminado.
- Una sola tienda/almacén (sin UI de "Almacenes").
- "Líneas" (colecciones de ropa) eliminadas; alcanza con Marca + Categoría.
- Se conservan: Marcas, Categorías (ahora con jerarquía vía "categoría padre" en vez de subcategorías separadas), Cupones.
- Se eliminan: Banners, Reportes (dashboard mínimo en su lugar), Flash sales, Notificaciones internas (dependían de cuentas de cliente).
- "Tallas" se reaprovecha para tamaños en mililitros (30ml/50ml/100ml) — ruta renombrada a `/admin/tamanos`.
- Supabase: proyecto nuevo, aún no creado por el usuario.
- Admin único. Login: `Jamil@gmail.com`.
- Correo de aviso de pedidos: `jamilwilliams054@gmail.com` (default en `src/database/repositories/settings.ts`, editable en `/admin/config`).
- WhatsApp del negocio: `8097612875` (RD) → normalizado a `18097612875` en los enlaces `wa.me` (default en `src/lib/whatsapp.ts`, editable en `/admin/config`).

## Checklist de fases

- [x] **Fase 0 — Andamiaje**: `docs/00-refactor-status.md`, `CLAUDE.md`, `.claude/skills/*`, `.env.example`.
- [x] **Fase 1 — Migraciones nuevas**: `supabase/migrations/00001_jw_parfum_schema.sql` + `00002_jw_parfum_rls.sql` + `00003_jw_parfum_grants.sql` + `supabase/seed.sql`. Es la única fuente de verdad del esquema.
- [x] **Fase 2 — Quitar pagos**: AZUL, Payment Link, `/admin/facturas`, comisiones AZUL/G3DEON, `payment_methods`/`payment_requests`.
- [x] **Fase 3 — Quitar cuentas de cliente**: login/registro/OTP/reset/eliminar-cuenta borrados. `proxy.ts` solo protege `/admin`. Carrito y wishlist 100% `localStorage` (`jwparfum-cart`, `jwparfum_wishlist`).
- [x] **Fase 4 — Checkout invitado + WhatsApp + correo**: `checkoutGuest` en `src/database/repositories/checkout.ts` (precio resuelto server-side contra `product_variants`, nunca confía en el precio del cliente). `src/lib/whatsapp.ts` (puro, cliente+servidor) + `src/lib/whatsapp-server.ts` (lee `app_settings`, solo servidor). Botón WhatsApp en la confirmación del cliente y en `/admin/pedidos` (tarjeta, tabla y modal de detalle). Campo "WhatsApp del negocio" en `/admin/config`.
  - **Limitación conocida**: el número de pedido mostrado al cliente es corto (8 caracteres del UUID) pero `/estado-pedido` busca por UUID completo — no se resolvió (requeriría una columna de número de pedido legible/secuencial).
- [x] **Fase 5 — Quitar módulos de ropa**: editor de diseño + `@dnd-kit`, líneas, socios, almacenes (UI), flash-sales, banners, reportes, subcategorías (fusionadas en categorías vía `parent_id`).
- [x] **Fase 6 — Rebrand**: `package.json` (`name: jw-parfum`), metadata/SEO (`src/app/layout.tsx`), plantillas de correo (`nuevo-pedido-admin.ts`, `compra.ts`), landing (`src/app/(public)/page.tsx`: ticker, "cómo funciona", sección de seguridad — ya no habla de tarjetas/Azul), `/seguridad` reescrita (ya no promete PCI-DSS/3D Secure que no existen), localStorage keys, README.md.
- [ ] **Fase 7 — Credenciales y despliegue** (pendiente del usuario): crear proyecto Supabase, completar `.env.local`, aplicar migraciones, correr `pnpm bootstrap-admin`, configurar dominio en Resend. Ver `.claude/skills/jw-parfum-setup/`.
- [x] **Fase 8 — Verificación**: `pnpm exec tsc --noEmit` limpio, `pnpm build` exitoso (con credenciales Supabase placeholder — no hay proyecto real todavía), `pnpm lint` sin errores nuevos introducidos por el refactor (el repo ya tenía ruido de formato CRLF preexistente, no relacionado). `pnpm test`: no hay tests — los dos únicos archivos de test del repo (`retorno/route.test.ts`, `partners.test.ts`) pertenecían a AZUL/socios y se borraron con esos módulos.

## Hallazgos fuera del plan original (encontrados durante la verificación, ya corregidos)

Varios módulos dependían de cuentas de cliente o de módulos retirados y se corrigieron:

- **Reseñas de producto** (`src/database/repositories/reviews.ts` y su UI): requerían `auth.getUser()` — eliminadas por completo junto con `rating_avg`/`review_count` en la UI del PDP (las columnas se conservan en la tabla `products` por compatibilidad de schema, siempre en 0/null).
- **Notificaciones internas** (`/admin/notificaciones`, `notificationsRepo`): el admin componía avisos para usuarios con `role=client`, que ya no existen — eliminado.
- **Sorteo/giveaway** (`/sorteo`, `giveaway-stats.ts`) — eliminado.
- **Bloque "Socios" en el dashboard admin** (`AdminDashboardClient.tsx`): importaba de `database/repositories/partners` (ya borrado) — eliminado, junto con accesos rápidos a rutas ya borradas (flash-sales, notificaciones, almacenes).
- **`src/lib/whatsapp.ts` inicial** mezclaba código de servidor (Supabase) con un componente cliente (`pedidos-table.tsx`) — se separó en `whatsapp.ts` (puro) y `whatsapp-server.ts` (solo Server Components/Actions).
- Limpieza de exports muertos en `src/database/repositories/repositories.ts` e `index.ts` (código legado de checkout con sesión obligatoria, nunca usado por el checkout de invitado).

## Notas para retomar el trabajo

- El código de la tienda está verificado. Para producción falta conectar un proyecto Supabase real — ver `.claude/skills/jw-parfum-setup/`.
- Antes de dar por buena cualquier área del código, preferir releer el archivo actual sobre confiar en este resumen — puede quedar desactualizado.
- No reintroducir pagos en línea, editor de diseño, módulo de socios, cuentas de cliente ni reseñas de producto sin que el usuario lo pida explícitamente — se eliminaron a propósito.
- Categorías de catálogo: Belleza, Relojes, Perfumes, Gorras, Tenis. Las variantes cubren talla, tamaño (ml) y color.
