# JW

**Marketplace multi-tienda** (estilo Shein/Amazon) de República Dominicana. Los negocios crean su cuenta en `/vender/registro`, el admin de la plataforma **aprueba** cada tienda (nada sexual, prohibido ni falsificado) y cada tienda gestiona en `/panel` sus productos, inventario, pedidos, ventas, cuentas bancarias, envíos y cupones. El admin ve todo en `/admin`. La tienda oficial "The Spot" es una tienda más (dueño = admin).

Pedidos de invitado sin cuenta, sin pasarela de pago: **cada tienda cobra** (contra entrega o transferencia a sus cuentas). Un carrito con productos de varias tiendas crea una compra (`checkouts`) y **un pedido por tienda** (`orders.store_id`), cada uno con su envío, cupón y pago. Aviso por correo a cada tienda y WhatsApp (`wa.me`) al número de la tienda. Sin comisiones por ahora.

## Qué NO existe a propósito (no reintroducir sin que el usuario lo pida)

- **Pasarelas de pago en línea** (tarjeta, Apple/Google Pay, etc.). Solo existen contra entrega y transferencia; el admin confirma el cobro a mano en el detalle del pedido.
- **Cuentas de cliente** (login/registro/recuperar contraseña/OTP). Solo el admin inicia sesión. El cliente hace checkout de invitado y consulta su pedido por número.
- **Editor de diseño / personalización** (canvas, `@dnd-kit`, texturas 3D).
- **Comisiones / liquidaciones a tiendas** (la plataforma no maneja dinero de las tiendas).
- **Multi-almacén por tienda**: una bodega por tienda, creada automáticamente, sin UI de "Almacenes".
- **Varios usuarios por tienda**: una cuenta = una tienda (`stores.owner_id`).
- **Líneas/colecciones**, **banners**, **reportes avanzados**, **flash sales**: alcanza con Marca + Categoría + Cupones.

## Stack

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- Supabase (Postgres + Auth + RLS)
- Resend (correo transaccional)
- Cloudflare R2 (imágenes de producto)
- Biome (lint/format), Vitest (tests)

## Estructura

El alias `@/` apunta a `src/`. No usar imports relativos profundos.

```
src/
├── app/
│   ├── (public)/     # Landing, catálogo, carrito, checkout invitado, estado de pedido, legales
│   ├── admin/         # Panel admin
│   └── api/
├── components/
├── database/repositories/
├── lib/
└── config/            # brand.ts, navigation, shipping
supabase/migrations/
```

## Rutas principales

| Zona | Rutas |
|---|---|
| Público | `/`, `/catalogo`, `/tiendas`, `/tiendas/[slug]`, `/carrito`, `/carrito/checkout`, `/estado-pedido` (número de pedido o de compra), `/vender`, `/vender/registro`, `/vender/politicas` |
| Tienda | `/panel` (dashboard), `/panel/pedidos`, `/panel/pedidos/[id]`, `/panel/ventas`, `/panel/pagos`, `/panel/catalogo`, `/panel/inventario`, `/panel/cupones`, `/panel/envios`, `/panel/tienda`, `/panel/solicitud` |
| Admin plataforma | `/admin` (panel general), `/admin/tiendas`, `/admin/tiendas/[id]`, `/admin/moderacion`, `/admin/pedidos` y `/admin/ventas` y `/admin/catalogo` (todas las tiendas, filtro `?tienda=`), `/admin/categorias`, `/admin/marcas`, `/admin/tamanos`, `/admin/config` |

**Auth:** `profiles.role`: 0 = admin de plataforma, 2 = dueño de tienda (seller). Login compartido `/login` (admin → `/admin`, tienda → `/panel`). Admin: `pnpm bootstrap-admin`. Las tiendas se crean con `registerStoreAction` (service role; el signup público de Supabase puede seguir desactivado).

**Aislamiento por tienda:** todo pasa por service role + guardas en código (`src/lib/auth/store-actor.ts`): `requirePanelStore()` en páginas de `/panel`, `requireStoreActor()` + `assertRowAccess()` para editar, `requireOwnStore()` para crear (siempre en la tienda propia; nunca aceptar `store_id` del navegador). Los componentes compartidos `/admin` ↔ `/panel` arman enlaces con `usePanelBase()`.

**Moderación:** `products.moderation_status` (`pending|approved|rejected|blocked`). Tiendas no confiables y textos con palabras prohibidas (`app_settings.marketplace_blocked_words`) → `pending`. El catálogo público (RLS) solo muestra productos aprobados de tiendas aprobadas. Denuncias en `product_reports`.

**Inventario:** bodega propia por tienda. Pedido abierto = reserva stock; `delivered` = descuenta existencia; `cancelled`/`refunded` = libera/repone (`src/lib/orders/labels.ts` → `inventoryEffect`). Contra entrega se marca pagado al entregar.

**Imágenes:** R2 si está configurado; si no, Supabase Storage (bucket `product-images`).

## Catálogo

Categorías de la tienda: **Belleza, Relojes, Perfumes, Gorras, Tenis**. Las variantes cubren talla (tenis, gorras), tamaño en ml (perfumes/belleza) y color. Ver `.claude/skills/jw-parfum-catalogo/`.
