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
  - **Número de pedido**: columna generada `orders.order_number` (migración `00004_order_number.sql`, 8 primeros caracteres del UUID en mayúsculas). `/estado-pedido` acepta ese número corto (con o sin `#`) o el UUID completo, y `?pedido=XXXX` lo precarga.
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

## Sesión 2026-11-08 — entorno local y arreglos

- Supabase local (Docker) en marcha con `pnpm db:start`; migraciones 00001–00004 aplicadas. Studio: http://127.0.0.1:54323.
- `pnpm bootstrap-admin` ya existe (`scripts/bootstrap-admin.mts`, corre con Node y lee `.env.local`).
- **Tamaño/talla opcional** al agregar al carrito: si el cliente no elige, se usa el primero con stock; el checkout del servidor también tolera líneas sin tamaño (toma la primera variante del color). El color sigue siendo obligatorio.
- La confirmación del checkout ahora muestra el botón "Confirmar pedido por WhatsApp" (el enlace se generaba pero no se mostraba).
- Cancelar o borrar un pedido libera `inventory.reserved`; reactivar uno cancelado la vuelve a tomar.
- Títulos de página sin "| The Spot" duplicado; etiqueta "Tamaño" vs "Talla" según el valor.
- Eliminados restos huérfanos de funciones retiradas: `src/lib/otp.ts`, `src/features/admin/customer-picker.tsx`.
- Tests mínimos en `src/lib/__tests__/core.test.ts` (`pnpm test`).
- Componentes visuales sin uso (no borrados, por si se quieren usar): `MagicBento`, `CatalogCatalogSubnav`, `CatalogProductViewer`, `LandingProductCard`, `CatalogSearchBar`, `HeroLightRaysBackground`, `LandingHeroCard`, `ui/select.tsx`.
- **Login de admin con usuario**: `/login` acepta "Usuario o correo"; un usuario sin `@` se traduce a `<usuario>@jwparfum.local` en Supabase Auth. Admin local: usuario `admin` (ver `ADMIN_*` en `.env.local`).
- **Arreglo crítico de acceso a /admin**: faltaba `grant select on profiles to authenticated` (migración `00005_profiles_select_grant.sql`); sin él nadie con sesión se reconocía como admin y `/admin` redirigía a la portada.
- **Dashboard**: fallaba entero (mostraba todo en 0) porque consultaba `profiles.deleted_at`, que no existe. La tarjeta "Clientes registrados" (no hay cuentas de cliente) pasó a "Pedidos · 30 días".

## Sesión 2026-11-08 (2) — tienda completa

Migraciones nuevas: `00006_payments_inventory_sales.sql` (cuentas bancarias, método de pago en pedidos, costo por línea, `categories.coming_soon`, ajustes, bucket `product-images`), `00007_email_logs_columns.sql` (el recibo al cliente nunca se enviaba por columnas faltantes), `00008_service_role_grants.sql` (permisos por defecto para tablas nuevas).

- **Pagos**: contra entrega y transferencia en el checkout; al elegir transferencia el cliente escoge banco y ve número, titular, cédula/RNC y monto (copiar al portapapeles). Se ve también en la confirmación, en /estado-pedido, en el correo al admin y en el WhatsApp. Administrable en `/admin/pagos` (activar métodos, textos, agregar/editar/ocultar/eliminar cuentas). Banreservas y Popular vienen precargadas **inactivas**: hay que poner número y titular y activarlas.
- **Pedidos**: `/admin/pedidos/[id]` con flujo de 5 pasos clickeable (Pendiente → Confirmado → Preparando → Enviado → Entregado), cancelar/reactivar/devolución, confirmar o revertir pago, notas internas, historial, cliente (tel/mail/mapa), WhatsApp y comprobante PDF. La lista enlaza cada pedido al detalle.
- **Ventas**: `/admin/ventas` por periodo (hoy, ayer, 7/30 días, mes, mes anterior, año o rango), base "cobradas" o "todas", sumatorias (subtotal, descuentos, envíos, total, costo, ganancia, margen, ticket promedio, por cobrar), por método de pago, por día, detalle por producto y pedidos con sus líneas. Exporta PDF y CSV.
- **Inventario**: `/admin/inventario` con existencias, reservado y disponible por variante, edición en línea (− / + / número), filtros (bajo, agotado, con reservas, sin inventario), búsqueda, valor a costo y a precio de venta, CSV.
- **Productos**: subir varias fotos a la vez, arrastrar y soltar, pegar URL, reordenar y elegir portada.
- **Configurable sin código**: envío gratis (`/admin/config`), métodos y cuentas (`/admin/pagos`), categorías "Próximamente" (casilla en la categoría; también ajusta el texto de portada y la franja).
- **Arreglos**: el carrito/checkout usaban el precio base aunque el tamaño costara distinto (el servidor cobraba otro monto); `paid_at` nunca se guardaba; marcar pagado forzaba "confirmado" aunque estuviera enviado; dashboard clickeable.

### Pendiente para salir a producción (requiere al usuario)

1. Crear proyecto Supabase en la nube, `pnpm supabase link --project-ref …` y `pnpm db:push` (aplica 00001–00008). Copiar URL/anon/service_role a las variables del hosting.
2. Correr `pnpm bootstrap-admin` contra ese proyecto con una contraseña **fuerte** (la local `admin1234` es solo para desarrollo).
3. Resend: API key + dominio verificado para que lleguen los avisos y recibos.
4. En `/admin/pagos` poner las cuentas reales de Banreservas/Popular y activarlas; revisar WhatsApp y correo en `/admin/config`.
5. Cargar costo de cada producto (para que la ganancia del reporte sea real) y revisar existencias en Inventario.
6. Desplegar (Vercel u otro) con `NEXT_PUBLIC_SITE_URL` del dominio final.
