# JW

Tienda en línea de belleza, relojes, perfumes, gorras y tenis (una sola tienda física). Catálogo administrable, checkout de invitado (sin cuentas de cliente) y sin pagos en línea: cada pedido nuevo llega por correo al Gmail del negocio y el cliente confirma por WhatsApp.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4**
- **Supabase** (Postgres + Auth + RLS)
- **Resend** (correo transaccional: aviso de pedido nuevo, recibo de compra)
- **Cloudflare R2** (imágenes de producto)
- **Biome** (lint y formato)
- **Vitest** (tests)

## Requisitos

- Node.js 20+
- pnpm (recomendado)
- Un proyecto Supabase (ver `.claude/skills/jw-parfum-setup/` para la guía paso a paso)

## Instalación

```bash
pnpm install
cp .env.example .env.local   # completa las variables (ver skill de setup)
```

## Scripts

| Comando                | Descripción                                          |
|-------------------------|-------------------------------------------------------|
| `pnpm dev`              | Servidor de desarrollo                                |
| `pnpm build`            | Build de producción                                   |
| `pnpm start`            | Servidor de producción                                |
| `pnpm test`             | Tests (Vitest)                                        |
| `pnpm lint`             | Biome check                                           |
| `pnpm format`           | Biome format --write                                  |
| `pnpm db:start`         | Stack local de Supabase (requiere Docker)             |
| `pnpm db:new <n>`       | Nueva migración en `supabase/migrations`              |
| `pnpm db:push`          | Aplica migraciones al proyecto Supabase vinculado     |
| `pnpm db:reset`         | Recrea la base local con todas las migraciones + seed |
| `pnpm db:types:linked`  | Genera tipos TS desde el proyecto vinculado           |
| `pnpm bootstrap-admin`  | Crea/actualiza el usuario administrador               |

## Estructura del proyecto

Todo el código vive en `src/`. El alias `@/` apunta a `src/` (`@/components`, `@/database`, `@/lib`, …); no usar imports relativos profundos.

```
├── src/
│   ├── app/
│   │   ├── (public)/      # Landing, catálogo, carrito, checkout invitado, estado de pedido, legales
│   │   ├── admin/         # Panel admin: dashboard, pedidos, catálogo, marcas, categorías, cupones, envíos, config
│   │   └── api/           # Rutas API delgadas
│   ├── features/admin/    # Formularios y managers del panel admin
│   ├── components/        # UI reutilizable (ui/, layout/, catalog/, cart/, order/, admin/)
│   ├── contexts/          # React contexts (carrito y favoritos, 100% localStorage — sin cuentas de cliente)
│   ├── database/          # Capa de datos: repositories/ + tipos generados
│   ├── lib/
│   │   ├── supabase/      #   clientes browser/server/service-role (único punto de init)
│   │   ├── resend/        #   emails transaccionales + PDF de recibos
│   │   ├── storage/       #   Cloudflare R2 (imágenes de producto)
│   │   ├── auth/          #   roles, requireAdmin (único login: el admin)
│   │   ├── actions/       #   Server Actions (casos de uso de negocio)
│   │   └── whatsapp.ts    #   enlaces wa.me para pedidos (cliente↔tienda y admin↔cliente)
│   ├── config/            # Navegación y configuración general
│   ├── types/             # Tipos y DTOs compartidos
│   └── proxy.ts           # Guard de sesión — protege únicamente /admin
├── supabase/               # CLI de Supabase: config.toml + migrations/ (fuente única del esquema) + seed.sql
├── public/                 # Assets estáticos
└── scripts/                 # bootstrap-admin, generación de imagen OG
```

## Rutas

| Zona | Rutas |
|---|---|
| Público | `/`, `/catalogo`, `/carrito`, `/carrito/checkout`, `/estado-pedido`, `/wishlist` |
| Admin | `/login` (único login del sitio), `/admin`, `/admin/pedidos`, `/admin/catalogo`, `/admin/marcas`, `/admin/categorias`, `/admin/cupones`, `/admin/envios`, `/admin/tamanos`, `/admin/config` |

**Autenticación:** solo hay login de administrador (`profiles.role = 0`, vía Supabase Auth). No hay registro público ni cuentas de cliente — el checkout es de invitado y el pedido se consulta luego por su número en `/estado-pedido`. Las credenciales de admin se crean con `pnpm bootstrap-admin`.

## Flujo de pedido

Sin pagos en línea: el cliente arma el carrito (guardado en `localStorage`), completa el checkout con sus datos de contacto y confirma. El pedido queda `pending`; en paralelo se envía un correo al Gmail del negocio (Resend) y se genera un enlace de WhatsApp para que el cliente confirme directamente con la tienda. El admin gestiona el estado del pedido y el cobro manualmente desde `/admin/pedidos`. Ver `.claude/skills/jw-parfum-pedidos/` para el detalle completo.

## Skills de Claude Code

Este repo incluye skills para tareas operativas recurrentes (ver `.claude/skills/`):

- **jw-parfum-setup** — conectar Supabase, aplicar migraciones, generar credenciales de admin.
- **jw-parfum-catalogo** — dar de alta un producto (marca, categoría, precio, talla/tamaño, stock, imágenes).
- **jw-parfum-pedidos** — flujo pedido → correo → WhatsApp, y cómo probarlo.

## Desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Licencia

Ver [licencia](./LICENSE).
