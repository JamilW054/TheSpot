# 04 — Sistemas en conjunto (transversal)

Lo que comparten cliente y admin: autenticación, base de datos, pagos, correos, almacenamiento, la capa de datos y el editor.

---

## Autenticación y roles

### Proveedor
**Supabase Auth**. Tres clientes en `lib/supabase/`:

- `client.ts` — cliente de navegador (Client Components).
- `server.ts` → `createClient()` — cliente SSR ligado a cookies (Server Components / Server Actions). Respeta **RLS**.
- `server.ts` → `createServiceClient()` — **service-role**, solo servidor, **bypassa RLS**. Para admin y trabajos de fondo.

> Las variables aceptan tanto el prefijo `NEXT_PUBLIC_*` como `EXPO_PUBLIC_*` (la base de datos se comparte con una app móvil Expo/React Native).

### Sesión y guard de rutas
[middleware.ts](../middleware.ts) corre en cada request:

1. Refresca el token de Supabase (crítico para SSR; **no** quitar).
2. Si hay usuario, evalúa el **estado de la cuenta** (`resolveAccountStatus`): restaura si está en gracia, **expulsa** si la baja venció.
3. Si la ruta es protegida (`/admin`, `/editor`, `/guia`, `/lineas`, `/recursos`, `/soporte`, `/carrito`, `/favoritos`) y no hay sesión, redirige a `/login?next=…` preservando las cookies refrescadas.

### Roles
Centralizados en [lib/auth/roles.ts](../lib/auth/roles.ts):

- `ROLE.ADMIN` (`"admin"`) / `ROLE.CLIENT` (`"client"`).
- Se persisten en `profiles.role` como **smallint**: `0 = admin`, `1 = client` (`ROLE_DB`).
- `resolveUserRole(email, profileRole)` acepta el smallint nuevo y los strings antiguos por compatibilidad; ante la duda, devuelve `client`.
- **No hay heurística por email**: ser admin depende **solo** de `profiles.role`.

### Protección server-side de admin
`requireAdmin()` ([lib/auth/require-admin.ts](../lib/auth/require-admin.ts)) valida sesión + rol antes de cualquier mutación admin. Es la barrera real; la UI solo oculta.

### OTP y reset de contraseña
- **OTP** ([lib/otp.ts](../lib/otp.ts)): código de 6 dígitos, validez 10 min, un solo uso, guardado en `otp_codes` (purpose por flujo). Endpoints `/api/auth/otp/{enviar,verificar}`.
- **Reset**: `/api/auth/reset-password/solicitar` → correo (plantilla `reset-password`) → `/nueva-contrasena`.

---

## Base de datos (Supabase / PostgreSQL)

### Migraciones
Esquema versionado en `supabase/migrations/`:

| Migración | Contenido |
|-----------|-----------|
| `00001` | Esquema base completo |
| `00002` | Buckets de storage y políticas |
| `00003` | Tablas, relaciones y columnas extra |
| `00004` | Campos de pago AZUL en `orders` |
| `00005`–`00006` | Rol admin en `profiles` + promoción |
| `00007`–`00009` | Tags, imagen de categorías, categorías demo |
| `00010` | Reseñas de producto |
| `00011`–`00013` | Tallas en productos / presets / talla en order_items |
| `00014` | Columnas de direcciones |
| `00015` | **Variantes de color** |
| `00016` | **Módulo de pagos** (`payment_transactions`, etc.) |
| `00017` | Tipo de pago en pedidos |
| `00018`–`00019` | Email y `deleted_at` en `profiles` (soft-delete) |
| `00020` | `app_settings` (config clave/valor) |
| `20260513_otp_codes` | Tabla de códigos OTP |

### Entidades principales

| Tabla | Rol |
|-------|-----|
| `auth.users` + `public.profiles` | Login (Supabase) + perfil de app (nombre, rol, email, `deleted_at`) |
| `products`, `product_variants`, `product_tags`, `tags` | Catálogo y variantes (talla/color) |
| `categories`, `subcategories`, `brands`, `size_presets` | Taxonomía del catálogo |
| `lineas` | Líneas/colecciones |
| `designs` | Diseños del editor (canvas como JSON, color, textura) |
| `base_models` | Lista blanca de modelos 3D / mockups |
| `textures` | Texturas base (Buxxep vs usuario) |
| `cart_items` | Carrito persistente (con `saved_for_later`) |
| `orders`, `order_items`, `order_status_history` | Pedidos, líneas con snapshot e historial de estados |
| `payment_transactions` | Transacciones de pago (AZUL u otros) |
| `coupons` | Cupones de descuento |
| `shipping_methods` | Métodos de envío |
| `inventory` (almacenes) | Stock por variante/almacén (con `reserved`) |
| `product_reviews` | Reseñas |
| `addresses` | Direcciones del cliente |
| `banners`, flash sales, notificaciones | Marketing |
| `otp_codes` | Códigos OTP |
| `app_settings` | Configuración clave/valor (solo service-role) |

Documentos conceptuales más extensos: [database-design.md](./database-design.md) y [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md).

### RLS
Las lecturas/escrituras del cliente pasan por **RLS** (cliente `createClient`). Las operaciones admin y de sistema usan **service-role** (`createServiceClient`), que ignora RLS — siempre detrás de `requireAdmin()`. Tablas sensibles como `app_settings` tienen RLS activa **sin políticas** (acceso exclusivo de service-role).

---

## Capa de datos (`lib/db`) y Server Actions (`lib/actions`)

- **`lib/db/*`**: queries Supabase por dominio (`products`, `orders`, `cart`, `coupons`, `checkout`, `reviews`, `wishlist`, `addresses`, `notifications`, `payments`, `inventory`, `settings`, `giveaway-stats`, `lineas`, `designs`, `categories`, `banners`, `base-models`, `profiles`, `size-presets`). El barril `lib/db/index.ts` reexporta lo común y centraliza utilidades:
  - `toError` — normaliza errores PostgREST a `Error` legible.
  - `isNetworkError` + `withNetworkFallback` — ante fallo de red devuelven un fallback (lista vacía / null) para que la app **siga renderizando** en vez de romper.
- **`lib/actions/*`**: Server Actions (`"use server"`) que envuelven `lib/db`, aplican permisos (`requireAdmin` donde toca) y hacen `revalidatePath`. Es lo que invocan los formularios.

### Formato y utilidades compartidas
- `lib/format-currency.ts` — `RD$` desde céntimos (`formatDOPFromCents`).
- `lib/format-date.ts` — fechas/horas en `es-DO`.
- `lib/slug.ts`, `lib/color-utils.ts`, `lib/variants.ts`, `lib/catalog-query.ts` — helpers de catálogo/variantes.

---

## Pagos (AZUL)

Pasarela dominicana mediante **AZUL Payment Page** (redirección con formulario firmado).

### Flujo
1. **Construcción del payload** — `/api/pagos/azul/enviar` usa `buildAzulPaymentPayload` ([lib/payments/azul.ts](../lib/payments/azul.ts)): convierte montos a formato AZUL (`toAzulAmount`, céntimos como string), arma campos (Merchant*, OrderNumber, Amount, ITBIS, URLs de aprobado/declinado/cancelado, CustomField1=orderId) y calcula el **AuthHash SHA-512** (`buildAzulRequestAuthHash`).
2. **Redirección** — el cliente llega a `/pago-azul`, un formulario que se auto-envía a AZUL.
3. **Retorno (webhook)** — AZUL hace POST a `/api/pagos/azul/retorno`. El servidor:
   - Verifica la **firma** de respuesta (`verifyAzulResponseSignature`, SHA-512 con `timingSafeEqual`).
   - Verifica que el **monto** coincida con el pedido (`azulReturnedAmountMatchesOrder`).
   - Persiste el resultado con `updateOrderPaymentStatusFromGateway`: actualiza `orders` (`payment_status`, `status = confirmed` si aprobado) y registra `payment_transactions` (proveedor, códigos, RRN, fecha de pago/fallo).
4. **Resultado** — `/pagos/exitoso` o `/pagos/rechazado`.

### Detalles
- Configuración/credenciales en `lib/payments/azul-env.ts`; estados en `lib/payments/status.ts`.
- Moneda **DOP**. Proveedores normalizados a un enum (`azul`, `stripe`, `paypal`, `cash_on_delivery`, `bank_transfer`); el actual es **azul**.
- Tests del webhook: `app/api/pagos/azul/retorno/route.test.ts`.
- También existe "**pago con link**": el admin genera un enlace de cobro y lo envía por correo (ver doc admin).
- Guía del módulo equivalente en la app móvil: [PROMPT_REACT_NATIVE_PAGOS.md](./PROMPT_REACT_NATIVE_PAGOS.md).

---

## Correos (Resend)

Envío centralizado en [lib/emails/index.ts](../lib/emails/index.ts) con **Resend**. Remitente por `RESEND_FROM`. Plantillas (HTML + texto) en `lib/emails/templates/`:

| Función | Plantilla | Cuándo |
|---------|-----------|--------|
| `sendOtpEmail` | `otp` | Código de verificación |
| `sendBienvenidaEmail` | `bienvenida` | Alta de usuario |
| `sendCompraEmail` | `compra` | Pedido confirmado (cliente) |
| `sendNewOrderAdminEmail` | `nuevo-pedido-admin` | Aviso de nuevo pedido (al `order_notification_email`) |
| `sendPaymentLinkEmail` | `payment-link` | Enlace de cobro manual |
| `sendResetPasswordEmail` | `reset-password` | Restablecer contraseña |

Los envíos en flujos críticos (p. ej. aviso de pedido en el checkout) son **best-effort**: si fallan, no revierten la operación. Previsualización en desarrollo: `/api/dev/test-emails`.

---

## Almacenamiento de archivos

- **Cloudflare R2** (`lib/storage/r2.ts`, vía `@aws-sdk/client-s3`) para subir assets; endpoint `/api/storage/r2/upload`.
- **Supabase Storage** con buckets y políticas creados en la migración `00002` (imágenes de productos, texturas, etc.).
- Texturas del editor: `lib/texture-storage.ts` y el endpoint `/api/texture`.

---

## Editor de diseños

Herramienta interna (admin) tipo **Canva**. UI en `components/editor/*`, configuración de herramientas en `config/editor-tools.ts`.

### Modelo de datos
Un diseño es un `CanvasElement[]` ([types/index.ts](../types/index.ts)). Cada elemento tiene `id`, `type`, posición y tamaño, y según el tipo:

- **`text`** — `content`, `fontSize`, `fontFamily`, `textColor`, `letterSpacing`, `lineHeight`, `textAlign`.
- **`shape`** — `shapeKind` (rect/circle/triangle/star/polygon), `fillColor`, borde, `borderRadius`, `boxShadow`, `opacity`.
- **`image`** — `content` (URL).
- **`path`** (pincel) — `pathData`, `strokeColor`, `strokeWidth`, `brushStyle`, `brushTexture`.

Atributos comunes: `visible`, `locked`, `groupId` (agrupación), `opacity`.

### Composición
- Color base de prenda + **textura base** (`textures`, clasificadas Buxxep/usuario) bajo los elementos.
- **Mockups** 2D/3D (`base_models`, lista blanca de rutas) para previsualizar.

### Exportación
- **JSON** del diseño (compatible con `designs.canvas_elements`).
- **Textura renderizada** (imagen 1024×1024) generada en cliente (`lib/render-design-to-texture.ts`, `lib/design-export.ts`) para producción; persistible en Storage y referenciable desde `order_items.texture_url`.
- Borradores locales: `lib/editor-drafts.ts`.

Análisis del modelo de texturas/catálogo: [analisis-modelo-texturas-y-catalogo.md](./analisis-modelo-texturas-y-catalogo.md).

---

## Mapa rápido "función → archivos"

| Necesito tocar… | Mira en… |
|-----------------|----------|
| Una ruta nueva en el menú | `config/navigation.ts` |
| Permisos de admin | `lib/auth/require-admin.ts`, `lib/auth/roles.ts` |
| Una query a la BD | `lib/db/<dominio>.ts` |
| Una mutación desde formulario | `lib/actions/<dominio>.ts` |
| El flujo de compra | `lib/db/checkout.ts`, `lib/actions/checkout.ts` |
| La pasarela de pago | `lib/payments/*`, `app/api/pagos/azul/*` |
| Un correo | `lib/emails/index.ts` + `lib/emails/templates/*` |
| El esquema de BD | `supabase/migrations/*` |
| El editor | `components/editor/*`, `config/editor-tools.ts`, `lib/render-design-to-texture.ts` |
</content>
