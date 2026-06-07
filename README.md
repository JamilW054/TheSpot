# Buxxep Web

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

| Comando        | Descripción                    |
|----------------|--------------------------------|
| `pnpm dev`     | Servidor de desarrollo         |
| `pnpm build`   | Build de producción            |
| `pnpm start`   | Servidor de producción         |
| `pnpm lint`    | Biome check                    |
| `pnpm format`  | Biome format --write           |

## Estructura del proyecto

```
├── app/
│   ├── (public)/          # Landing, login, registro
│   ├── (app)/             # Zona autenticada: mis diseños, editor, líneas, guía, recursos, soporte
│   └── admin/             # Panel admin: dashboard, pedidos, configuración
├── components/
│   ├── auth/              # RequireAuth, protección de rutas
│   ├── editor/            # Canvas, drop zone, sidebar herramientas, panel derecho
│   ├── layout/            # AppShell, Navbar, Sidebar, PageLayout
│   └── ui/                # Button, Card, Input, Badge, etc.
├── config/                # Navegación, herramientas del editor, mock data
├── lib/                   # AuthContext (mock), design tokens
├── types/                 # Design, Linea, Pedido, CanvasElement, Mockup
└── hooks/
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
