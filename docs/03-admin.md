# 03 — Lo que hace el admin

El panel de administración vive en `app/admin` y las herramientas de estudio en `app/(app)/(admin-tools)`. Todo está reservado a usuarios con **rol admin**.

## Acceso y seguridad

Hay **dos capas** de protección, ambas obligatorias:

1. **Ruta / UI:** los layouts envuelven el contenido en `RequireAuth requireAdmin` (p. ej. [app/(app)/(admin-tools)/layout.tsx](../app/(app)/(admin-tools)/layout.tsx)). El middleware ([middleware.ts](../middleware.ts)) ya bloquea `/admin` sin sesión.
2. **Servidor (la que cuenta):** **cada Server Action de admin** llama a `requireAdmin()` ([lib/auth/require-admin.ts](../lib/auth/require-admin.ts)), que verifica sesión + `profiles.role === admin` antes de tocar datos. Sin esto, esconder un botón no protegería nada.

Las operaciones admin usan el **cliente service-role** (`createServiceClient`), que **bypassa RLS**, por eso es crítico que `requireAdmin()` se ejecute primero. Tras escribir, hacen `revalidatePath` de las rutas afectadas.

La navegación del panel (secciones y etiquetas) es única y vive en `config/navigation.ts` → `ADMIN_NAV`.

> **Patrón CRUD repetido:** casi todas las secciones de catálogo/marketing/logística siguen el mismo esquema de rutas: `página` (listado) + `nuevo` (crear) + `[id]/editar` (editar). La lógica genérica está en `lib/actions/admin-crud.ts` y las acciones específicas por dominio en `lib/actions/*-admin.ts`.

---

## Sección: Resumen

### Dashboard (`/admin`)
Vista de inicio del panel con métricas y accesos rápidos. Datos agregados desde la capa `lib/db` (pedidos, ventas).

---

## Sección: Ventas

### Pedidos (`/admin/pedidos`)
- Listado de **todos** los pedidos (`getOrdersAdmin`, service-role, ignora RLS).
- **Acciones en lote** sobre el estado de fulfillment (`adminSetOrdersStatus`, [lib/actions/orders-admin.ts](../lib/actions/orders-admin.ts)):
  - `pending` → pedido pendiente.
  - `paid` → marca `payment_status = paid` y `status = confirmed`.
  - `shipped` → enviado.
  - `cancelled` → cancelado.
  - Cada cambio queda registrado en `order_status_history` (quién y cuándo).
- **Eliminar** pedido (`adminDeleteOrder`).
- Tipos de tabla/filtros en `types/admin.ts` (`FilterEstado`, `PedidosTableProps`).

### Facturas / cobros (`/admin/facturas`)
Listado tipo factura de los **pedidos con cobro confirmado** (`payment_status = paid`), con cliente, total y fecha de pago (`getFacturasPedidosPagadosAdmin`, derivado de `payment_transactions`).

### Gestión de pagos (`/admin/pagos`, `/admin/pagos/nuevo`)
- Visión de las transacciones de pago.
- **Crear un enlace/solicitud de pago** (`/admin/pagos/nuevo`): genera un cobro y puede **enviar al cliente un correo con el enlace de pago** (plantilla `payment-link`, ver `lib/actions/payments-admin.ts` y `lib/emails/templates/payment-link.ts`). Útil para pagos manuales o "pago con link".

---

## Sección: Catálogo

Todas siguen el patrón listado + `nuevo` + `[id]/editar`. Acciones en `lib/actions/products-admin.ts`, `categories-admin.ts`, `size-presets-admin.ts`, `admin-crud.ts`.

| Sección | Ruta | Qué gestiona |
|---------|------|--------------|
| **Catálogo** | `/admin/catalogo` | Productos: nombre, slug, precio, imágenes, descripción, marca, categoría, etiquetas, tallas, colores, variantes, activo/inactivo. `getProductsAdmin` muestra también los no publicados. |
| **Categorías** | `/admin/categorias` | Categorías del catálogo (con imagen de portada). |
| **Subcategorías** | `/admin/subcategorias` | Subcategorías. |
| **Marcas** | `/admin/marcas` | Marcas asociables a productos. |
| **Tipos de talla** | `/admin/tallas` | Presets de tallas reutilizables (`size_presets`). |
| **Líneas de ropa** | `/admin/lineas` | Colecciones/líneas (también gestionables desde el estudio `/lineas`). |

**Modelo de producto / variantes:** un producto tiene ejes independientes de **talla** y **color**; las combinaciones se materializan como `product_variants` (cada una con su precio e inventario). El catálogo público usa el tipo `CatalogProduct`.

---

## Sección: Marketing

| Sección | Ruta | Qué gestiona |
|---------|------|--------------|
| **Banners** | `/admin/banners` | Banners de la home/landing (`getActiveBanners` los expone al público). |
| **Cupones** | `/admin/cupones` | Cupones de descuento: código, tipo/valor, vigencia, mínimos, límite de usos. Validados en checkout (`validateCoupon`) y consumidos con `incrementCouponUsage`. Acciones en `lib/actions/coupons.ts`. |
| **Flash sales** | `/admin/flash-sales` | Ofertas por tiempo limitado que aplican precio rebajado (alimentan `originalPrice`/`originalPriceCents` en la ficha). |
| **Notificaciones** | `/admin/notificaciones`, `/admin/notificaciones/nuevo` | Envío de notificaciones a los clientes (`lib/actions/notifications.ts`, `lib/db/notifications.ts`). Las recibe el cliente en `/cuenta/notificaciones`. |

---

## Sección: Logística

| Sección | Ruta | Qué gestiona |
|---------|------|--------------|
| **Métodos de envío** | `/admin/envios` | `shipping_methods`: nombre, descripción, precio, rango de días (`getShippingMethods`). Elegibles en el checkout. |
| **Almacenes** | `/admin/almacenes` | Almacenes y su inventario; el checkout **reserva stock** del primer almacén con disponibilidad (`reserveInventory`). Datos en `lib/db/inventory.ts`. |

---

## Sección: Sistema

### Reportes (`/admin/reportes`)
Informes/estadísticas de ventas y operación.

### Configuración (`/admin/config`)
Ajustes globales de la tienda guardados como **clave/valor** en `app_settings` (migración `00020`). Hoy incluye:

- **Correo de notificación de pedidos** (`order_notification_email`): a dónde llega el aviso de cada nuevo pedido (formulario `OrderNotificationForm.tsx`, acción `lib/actions/settings-admin.ts`, lectura `getOrderNotificationEmail`).
- **Configuración de mocks** (`MockConfigForm.tsx`).

`app_settings` tiene RLS activa **sin políticas**: nadie accede directamente; solo las server actions del admin (service-role) leen/escriben.

---

## Herramientas de estudio (solo admin)

Bajo `app/(app)/(admin-tools)`, protegidas por `RequireAuth requireAdmin`.

### Editor de diseños (`/editor`)
Editor tipo **Canva** para preparar diseños/contenido del equipo. Ver detalle en **[04 — Sistemas en conjunto › Editor](./04-sistemas-compartidos.md#editor-de-diseños)**. En resumen:

- Layout de tres columnas: herramientas | canvas | propiedades + capas.
- Elementos `CanvasElement`: **texto**, **imagen**, **forma** (rect/círculo/triángulo/estrella/polígono) y **trazo de pincel** (`path`), con visibilidad, bloqueo, agrupación, opacidad, etc.
- Color de prenda, textura base y **mockups** (2D/3D).
- **Exportación**: JSON del diseño y/o textura renderizada (imagen 1024×1024) para producción.

### Líneas de ropa (`/lineas`, `/lineas/nueva`, `/lineas/[slug]`)
Creación y edición de líneas/colecciones (portada, galería, descripción, publicación, orden). Lo que se publica aparece en el catálogo público.

### Guía, Recursos, Soporte (`/guia`, `/recursos`, `/soporte`)
Contenido interno de apoyo para el equipo.

---

## Resumen de acciones admin por archivo

| Archivo | Dominio |
|---------|---------|
| `lib/actions/orders-admin.ts` | Estado/eliminación de pedidos |
| `lib/actions/payments-admin.ts` | Transacciones y enlaces de pago |
| `lib/actions/products-admin.ts` | Productos y variantes |
| `lib/actions/categories-admin.ts` | Categorías / subcategorías |
| `lib/actions/size-presets-admin.ts` | Presets de tallas |
| `lib/actions/coupons.ts` | Cupones |
| `lib/actions/notifications.ts` | Notificaciones |
| `lib/actions/settings-admin.ts` | Configuración (`app_settings`) |
| `lib/actions/admin-crud.ts` | CRUD genérico (banners, marcas, envíos, almacenes, flash sales…) |

Todas verifican permisos con `requireAdmin()` y revalidan rutas tras escribir.
</content>
