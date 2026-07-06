# Buxxep Web 6/7 v1

Plataforma de diseño y tienda de ropa: landing pública, zona de usuario con editor de diseños (canvas con arrastrar y soltar) y panel de admin.


## Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **@dnd-kit** (drag and drop en el editor)
- **Biome** (lint y formato)

## Requisitos

- Node.js 20+
- pnpm (recomendado)

## Instalación

```bash
pnpm install
```

## Scripts

| Comando               | Descripción                                        |
|-----------------------|----------------------------------------------------|
| `pnpm dev`            | Servidor de desarrollo                             |
| `pnpm build`          | Build de producción                                |
| `pnpm start`          | Servidor de producción                             |
| `pnpm test`           | Tests (Vitest)                                     |
| `pnpm lint`           | Biome check                                        |
| `pnpm format`         | Biome format --write                               |
| `pnpm db:start`       | Stack local de Supabase (requiere Docker)          |
| `pnpm db:new <n>`     | Nueva migración en `supabase/migrations`           |
| `pnpm db:push`        | Aplica migraciones al proyecto vinculado           |
| `pnpm db:reset`       | Recrea la base local con todas las migraciones     |
| `pnpm db:types`       | Genera tipos TS de la base (`src/database/types`)  |

## Estructura del proyecto

Todo el código de la aplicación vive en `src/`. El alias `@/` apunta a `src/`
(`@/components`, `@/database`, `@/lib`, …); no usar imports relativos profundos.

```
├── src/
│   ├── app/               # App Router: rutas, layouts y API routes (controladores finos)
│   │   ├── (public)/      # Landing, catálogo, carrito, checkout, cuenta, legal
│   │   ├── (app)/         # Zona autenticada: editor, líneas, guía, recursos, soporte
│   │   ├── admin/         # Panel admin: dashboard, pedidos, catálogo, configuración
│   │   └── api/           # Rutas API: validan input y delegan en servicios
│   ├── features/          # Módulos por funcionalidad (admin, payments, designs, lineas)
│   │   └── payments/services/  # Lógica de negocio de pagos (AZUL checkout/retorno)
│   ├── components/        # UI reutilizable (ui/, layout/, catalog/, editor/, …)
│   ├── contexts/          # React contexts (cart, wishlist, admin feedback)
│   ├── database/          # Capa de datos: repositories/ + tipos generados (ver su README)
│   ├── lib/               # Integraciones y utilidades:
│   │   ├── supabase/      #   clientes browser/server/service-role (único punto de init)
│   │   ├── resend/        #   emails transaccionales + PDF de recibos (único punto de init)
│   │   ├── payments/      #   protocolo AZUL (firmas, montos)
│   │   ├── storage/       #   Cloudflare R2
│   │   ├── auth/          #   roles, sesión, guards (requireAdmin)
│   │   └── actions/       #   Server Actions (casos de uso de negocio)
│   ├── config/            # Navegación, herramientas del editor, mock data
│   ├── hooks/             # Hooks compartidos
│   ├── types/             # Tipos y DTOs compartidos
│   └── proxy.ts       # Guard de sesión/rutas protegidas (antes middleware.ts)
├── supabase/              # CLI de Supabase: config.toml + migrations/ (no mover a src/)
├── public/                # Assets estáticos
└── scripts/               # Scripts de mantenimiento (bootstrap admin, OG image, Resend)
```

## Rutas

| Zona    | Rutas principales |
|--------|--------------------|
| Público | `/`, `/login`, `/registro` |
| App    | `/mis-disenos`, `/editor`, `/lineas`, `/guia`, `/recursos`, `/soporte` |
| Admin  | `/admin`, `/admin/pedidos`, `/admin/config` |

**Autenticación (Supabase Auth):** Login y registro usan Supabase. Variables de entorno: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Si en el Dashboard de Supabase (Authentication → Providers → Email) tienes **Confirm email** activado, tras registrarse el usuario debe confirmar el correo; el enlace de confirmación redirige a `/auth/callback` y luego puede iniciar sesión. Para desarrollo sin confirmación, desactiva **Confirm email** y el registro dejará sesión iniciada al instante. El rol admin se asigna si el email contiene `admin` (ej. `admin@tuemail.com`); entonces se redirige a `/admin`.

## Editor de diseños

- **Layout:** tres columnas: sidebar de herramientas | canvas | panel de propiedades y capas
- **Drag and drop:** desde el sidebar se arrastran herramientas al canvas (Texto, Imagen, Forma).
- **Elementos:** `CanvasElement` con tipos `text`, `image`, `shape`; posición y tamaño; texto con `content`; formas con variante rect/circle y estilos del design system.

## Desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Licencia

Ver [licencia](./LICENSE).
