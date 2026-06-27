# 01 — Visión general

## 1. Qué es Buxxep

Buxxep es una **tienda de ropa en línea** para el mercado dominicano (moneda **DOP / RD$**, pasarela **AZUL**) construida sobre Next.js. Tiene dos caras:

- **Cara pública / cliente:** cualquiera navega el catálogo, ve fichas de producto y precios sin iniciar sesión. Para comprar, seguir pedidos y usar la cuenta se requiere sesión.
- **Cara interna / Buxxep:** un panel de administración (`/admin`) y un conjunto de herramientas de estudio (editor de diseños, líneas de ropa, guía, recursos, soporte) reservadas a usuarios con rol **admin**.

Solo Buxxep vende: no es un marketplace multivendedor. El editor tipo Canva (capas, texto, formas, imágenes, mockups) es hoy una **herramienta interna del equipo** para preparar diseños/contenido, no una función abierta al cliente.

## 2. Stack

| Capa | Tecnología |
|------|------------|
| Framework | **Next.js 16** (App Router, Server Components, Server Actions) |
| UI | **React 19**, **Tailwind CSS 4**, componentes propios en `components/ui` |
| Lenguaje | **TypeScript 5** |
| Base de datos / Auth | **Supabase** (PostgreSQL + Auth + RLS) vía `@supabase/ssr` y `@supabase/supabase-js` |
| Pagos | **AZUL** Payment Page (pasarela dominicana, firma SHA-512) |
| Correos | **Resend** (`@react-email/render` para plantillas) |
| Almacenamiento de archivos | **Cloudflare R2** (`@aws-sdk/client-s3`) y/o Supabase Storage |
| Editor | **@dnd-kit** (drag & drop), canvas 2D, render a textura |
| Animación | **GSAP** |
| Lint / formato | **Biome** |
| Tests | **Vitest** |

Gestor de paquetes recomendado: **pnpm**. Node 20+.

## 3. Arquitectura de carpetas

```
app/                       # Next.js App Router (rutas + UI)
  (public)/                # Zona pública/cliente (catálogo, carrito, cuenta, legales)
  (app)/(admin-tools)/     # Herramientas de estudio SOLO admin (editor, líneas, guía…)
  admin/                   # Panel de administración (/admin/*)
  api/                     # Route handlers (REST/webhooks: pagos, auth OTP, storage…)
  auth/callback/           # Callback de confirmación de email de Supabase
components/                # Componentes de presentación
  ui/ layout/ catalog/ editor/ landing/ admin/ auth/ order/ payment/ ...
config/                    # Configuración estática (navigation, editor-tools, mock-data…)
lib/                       # Lógica de negocio y acceso a datos
  actions/                 # Server Actions ("use server") por dominio
  db/                      # Capa de acceso a datos Supabase (queries)
  auth/                    # Roles, require-admin, estado de cuenta
  payments/                # AZUL (firma, env, status)
  emails/                  # Envío (Resend) + plantillas HTML/texto
  storage/                 # Cliente R2
  supabase/                # Clientes Supabase (browser, server, service-role)
types/                     # Tipos TypeScript compartidos
supabase/migrations/       # Esquema SQL versionado (00001…00020, otp)
docs/                      # Esta documentación
middleware.ts              # Guard de sesión + protección de rutas
```

### Separación clave de responsabilidades

- **`lib/db/*`** — lee/escribe en Supabase. No asume contexto de request más allá del cliente Supabase. Reutilizable.
- **`lib/actions/*`** — Server Actions (`"use server"`) que invocan `lib/db` y hacen `revalidatePath`. Es lo que llaman los formularios.
- **`app/**/page.tsx`** — Server Components que cargan datos con `lib/db` y renderizan; los formularios delegan en `lib/actions`.
- **`components/*`** — presentación; los `*Form.tsx` y `*Client.tsx` son Client Components.

## 4. Mapa de rutas

### Público / cliente (`app/(public)`)

| Ruta | Función | ¿Sesión? |
|------|---------|----------|
| `/` | Landing (hero, catálogo destacado, newsletter, Instagram) | No |
| `/catalogo` | Listado con filtros (categoría, precio, etiqueta, orden, búsqueda) | No |
| `/catalogo/[slug]` | Ficha de producto (galería, tallas, colores, reseñas, añadir al carrito) | No |
| `/login`, `/registro` | Acceso y alta (Supabase Auth + OTP) | No |
| `/verificar` | Verificación de código OTP | No |
| `/nueva-contrasena` | Restablecer contraseña | No |
| `/carrito` | Carrito persistente | **Sí** |
| `/carrito/checkout` | Datos de envío, cupón, método de envío | **Sí** |
| `/pago-azul` | Redirección/formulario auto-submit a AZUL | Sí |
| `/pagos/exitoso`, `/pagos/rechazado` | Resultado del pago | Sí |
| `/estado-pedido` | Consulta pública de un pedido por su ID (sin login) | No |
| `/cuenta` | Resumen de la cuenta | **Sí** |
| `/cuenta/pedidos`, `/cuenta/pedidos/[id]` | Historial y detalle de pedidos | **Sí** |
| `/cuenta/direcciones` | Libreta de direcciones | **Sí** |
| `/cuenta/wishlist` (y `/wishlist`, `/favoritos`) | Lista de deseos | **Sí** |
| `/cuenta/cupones` | Cupones disponibles para el cliente | **Sí** |
| `/cuenta/resenas` | Reseñas escritas por el cliente | **Sí** |
| `/cuenta/pagos` | Métodos/historial de pago del cliente | **Sí** |
| `/cuenta/notificaciones` | Notificaciones del cliente | **Sí** |
| `/cuenta/sorteo` | Estado del sorteo (giveaway) | **Sí** |
| `/eliminar-cuenta` | Solicitud de baja (soft-delete con gracia 30 días) | **Sí** |
| `/sorteo` | Página pública del sorteo | No |
| `/terminos`, `/privacidad`, `/cookies`, `/devoluciones`, `/entrega`, `/seguridad` | Páginas legales/informativas | No |

### Herramientas de estudio — solo admin (`app/(app)/(admin-tools)`)

Protegidas por `RequireAuth requireAdmin`.

| Ruta | Función |
|------|---------|
| `/editor` | Editor de diseños tipo Canva (canvas, capas, texto/forma/imagen, mockups, export) |
| `/lineas`, `/lineas/nueva`, `/lineas/[slug]` | Gestión de líneas de ropa (colecciones) |
| `/guia`, `/recursos`, `/soporte` | Contenido interno de apoyo |

### Panel de administración (`app/admin`)

Agrupado por secciones (ver `config/navigation.ts` → `ADMIN_NAV`):

| Sección | Rutas |
|---------|-------|
| **Resumen** | `/admin` (dashboard) |
| **Ventas** | `/admin/pedidos`, `/admin/facturas`, `/admin/pagos` (+ `/admin/pagos/nuevo`) |
| **Catálogo** | `/admin/catalogo`, `/admin/categorias`, `/admin/subcategorias`, `/admin/marcas`, `/admin/tallas`, `/admin/lineas` (todos con `nuevo` y `[id]/editar`) |
| **Marketing** | `/admin/banners`, `/admin/cupones`, `/admin/flash-sales`, `/admin/notificaciones` |
| **Logística** | `/admin/envios`, `/admin/almacenes` |
| **Sistema** | `/admin/reportes`, `/admin/config` |

### API (`app/api`)

| Ruta | Método | Función |
|------|--------|---------|
| `/api/auth/otp/enviar` | POST | Genera y envía un código OTP por email |
| `/api/auth/otp/verificar` | POST | Verifica el código OTP |
| `/api/auth/reset-password/solicitar` | POST | Inicia el flujo de restablecer contraseña |
| `/api/pagos/azul/enviar` | POST | Construye el payload firmado para AZUL Payment Page |
| `/api/pagos/azul/retorno` | POST | Webhook de retorno de AZUL (valida firma y actualiza pedido) |
| `/api/addresses`, `/api/addresses/[id]` | GET/POST/PUT/DELETE | CRUD de direcciones del cliente |
| `/api/wishlist-products` | GET | Productos de la wishlist |
| `/api/storage/r2/upload` | POST | Subida de archivos a Cloudflare R2 |
| `/api/texture` | — | Generación/proxy de textura del editor |
| `/api/dev/test-emails` | — | Utilidad de desarrollo para previsualizar correos |

`app/robots.ts` y `app/sitemap.ts` generan `robots.txt` y `sitemap.xml`.

## 5. Variables de entorno

| Variable | Uso |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase (cliente y servidor) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service-role (solo servidor; bypassa RLS) |
| `RESEND_API_KEY` | Clave de Resend para enviar correos |
| `RESEND_FROM` | Remitente (por defecto `Buxxep <onboarding@resend.dev>`) |
| AZUL (`lib/payments/azul-env.ts`) | MerchantId, MerchantName, MerchantType, AuthKey/SecretKey, URLs de retorno |
| R2 (`lib/storage/r2.ts`) | Credenciales y bucket de Cloudflare R2 |
| `GIVEAWAY_GOAL_PURCHASES` / `NEXT_PUBLIC_GIVEAWAY_GOAL_PURCHASES` | Meta del sorteo (default 20.000) |

> Consulta los ficheros `lib/payments/azul-env.ts` y `lib/storage/r2.ts` para los nombres exactos de las variables de AZUL y R2.

## 6. Puesta en marcha

```bash
pnpm install          # instalar dependencias
pnpm dev              # servidor de desarrollo en http://localhost:3000
pnpm build && pnpm start   # producción
pnpm lint             # Biome check
pnpm format           # Biome format --write
pnpm test             # Vitest
pnpm bootstrap-admin  # promover un usuario a admin (script)
```

### Base de datos

Las migraciones SQL viven en `supabase/migrations/` (numeradas `00001`…`00020` + `otp_codes`). Aplícalas con `supabase db push` o pegándolas en el SQL Editor de Supabase en orden. Hay seeds de demo (`supabase/seed_*.sql`).

## 7. Convenciones importantes

- **Precios en céntimos** (`*_cents`, enteros) en BD y cálculos; se formatean a `RD$` con `lib/format-currency.ts` solo al mostrar.
- **Roles** centralizados en `lib/auth/roles.ts` (`ROLE.ADMIN`/`ROLE.CLIENT`, persistidos como `smallint`: 0=admin, 1=client). Nunca strings sueltos.
- **Navegación** centralizada en `config/navigation.ts` (única fuente de verdad de rutas/etiquetas).
- **Tolerancia a fallos de red:** las lecturas en `lib/db` usan `withNetworkFallback` para devolver datos vacíos en vez de romper el render.
</content>
