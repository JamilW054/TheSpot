# JW PARFUM

Tienda en línea de perfumes (una sola tienda física/bodega). Catálogo administrable, pedidos de invitado sin cuenta, sin pagos en línea: el aviso de cada pedido llega por correo a Gmail y el admin/cliente lo confirma por WhatsApp (enlace `wa.me`).

Este proyecto es un refactor de un fork previo ("Buxxep", una tienda de ropa por encargo con editor de diseño y pasarela de pago AZUL). El estado de esa migración y las decisiones de alcance están en [docs/00-refactor-status.md](docs/00-refactor-status.md) — léelo antes de asumir que un módulo de ropa/pagos sigue existiendo.

## Qué NO existe a propósito (no reintroducir sin que el usuario lo pida)

- **Pagos en línea de cualquier tipo** (AZUL, payment links, pasarelas). El pedido queda `pending` y el cobro se coordina fuera del sistema por WhatsApp.
- **Cuentas de cliente** (login/registro/recuperar contraseña/OTP). Solo el admin inicia sesión. El cliente hace checkout de invitado y consulta su pedido por número.
- **Editor de diseño / personalización** (canvas, `@dnd-kit`, texturas 3D). No aplica a perfumes.
- **Socios / reparto de comisiones** con inversionistas o revendedores.
- **Multi-almacén**: una sola ubicación fija en la base de datos, sin UI de "Almacenes".
- **Líneas/colecciones**, **banners**, **reportes avanzados**, **flash sales**: se eliminaron por simplicidad; alcanza con Marca + Categoría + Cupones.

## Stack

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- Supabase (Postgres + Auth + RLS) — único proyecto, sin doble esquema
- Resend (correo transaccional) — aviso de pedido nuevo al Gmail del negocio
- Cloudflare R2 (imágenes de producto)
- Biome (lint/format), Vitest (tests)

## Estructura

El alias `@/` apunta a `src/`. No usar imports relativos profundos.

```
src/
├── app/
│   ├── (public)/     # Landing, catálogo, carrito, checkout invitado, estado de pedido, legales
│   ├── admin/         # Panel admin: dashboard, pedidos, catálogo, marcas, categorías, cupones, envíos, config
│   └── api/           # Rutas API delgadas
├── components/         # UI por dominio (catalog/, admin/, cart/, order/, layout/, ui/)
├── database/repositories/  # Capa de datos (Supabase)
├── lib/
│   ├── supabase/       # Clientes browser/server/service-role
│   ├── resend/         # Emails transaccionales
│   ├── storage/         # Cloudflare R2
│   ├── auth/            # roles, requireAdmin
│   └── whatsapp.ts       # Generación de enlaces wa.me para pedidos
├── config/               # Navegación y config general
└── proxy.ts              # Guard de sesión (protege solo /admin)
supabase/migrations/        # Único origen de verdad del esquema (ver docs/00-refactor-status.md)
```

## Rutas principales

| Zona | Rutas |
|---|---|
| Público | `/`, `/catalogo`, `/carrito`, `/carrito/checkout`, `/estado-pedido` |
| Admin | `/login` (admin), `/admin`, `/admin/pedidos`, `/admin/catalogo`, `/admin/marcas`, `/admin/categorias`, `/admin/cupones`, `/admin/envios`, `/admin/config` |

**Auth:** Solo administradores inician sesión (`profiles.role = 0`). No hay registro público. Las credenciales se crean/actualizan con `pnpm bootstrap-admin` (ver `.claude/skills/jw-parfum-setup/`).

## Comandos

| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm test` | Tests (Vitest) |
| `pnpm lint` | Biome check |
| `pnpm db:push` | Aplica migraciones al proyecto Supabase vinculado |
| `pnpm db:types:linked` | Genera tipos TS desde el proyecto Supabase vinculado |
| `pnpm bootstrap-admin` | Crea/actualiza el usuario administrador |

## Skills relacionadas

- `.claude/skills/jw-parfum-setup/` — conectar Supabase, aplicar migraciones, generar credenciales de admin.
- `.claude/skills/jw-parfum-catalogo/` — dar de alta un perfume (marca, categoría, precio, tamaños ml, stock, imágenes).
- `.claude/skills/jw-parfum-pedidos/` — flujo pedido → correo → WhatsApp, y cómo probarlo.
