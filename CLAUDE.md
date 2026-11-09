# JW

Tienda en línea de belleza, relojes, perfumes, gorras y tenis (una sola bodega). Catálogo administrable, pedidos de invitado sin cuenta, sin pasarela de pago: el cliente elige **pago contra entrega** o **transferencia bancaria** (cuentas administrables en `/admin/pagos`, p. ej. Banreservas y Popular). El aviso de cada pedido llega por correo y se coordina por WhatsApp (enlace `wa.me`).

## Qué NO existe a propósito (no reintroducir sin que el usuario lo pida)

- **Pasarelas de pago en línea** (tarjeta, Apple/Google Pay, etc.). Solo existen contra entrega y transferencia; el admin confirma el cobro a mano en el detalle del pedido.
- **Cuentas de cliente** (login/registro/recuperar contraseña/OTP). Solo el admin inicia sesión. El cliente hace checkout de invitado y consulta su pedido por número.
- **Editor de diseño / personalización** (canvas, `@dnd-kit`, texturas 3D).
- **Socios / reparto de comisiones**.
- **Multi-almacén**: una sola ubicación fija en la base de datos, sin UI de "Almacenes".
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
| Público | `/`, `/catalogo`, `/carrito`, `/carrito/checkout`, `/estado-pedido` |
| Admin | `/login` (admin), `/admin`, `/admin/pedidos`, `/admin/pedidos/[id]`, `/admin/ventas` (reporte + PDF/CSV), `/admin/pagos` (métodos y cuentas), `/admin/inventario`, `/admin/catalogo`, `/admin/marcas`, `/admin/categorias`, `/admin/cupones`, `/admin/envios`, `/admin/tamanos`, `/admin/config` |

**Auth:** Solo administradores (`profiles.role = 0`). Credenciales: `pnpm bootstrap-admin` (lee `ADMIN_*` de `.env.local`). El login acepta usuario sin `@` → `<usuario>@jwparfum.local`.

**Inventario:** pedido abierto = reserva stock; `delivered` = descuenta existencia; `cancelled`/`refunded` = libera/repone (`src/lib/orders/labels.ts` → `inventoryEffect`). Contra entrega se marca pagado al entregar.

**Imágenes:** R2 si está configurado; si no, Supabase Storage (bucket `product-images`).

## Catálogo

Categorías de la tienda: **Belleza, Relojes, Perfumes, Gorras, Tenis**. Las variantes cubren talla (tenis, gorras), tamaño en ml (perfumes/belleza) y color. Ver `.claude/skills/jw-parfum-catalogo/`.
