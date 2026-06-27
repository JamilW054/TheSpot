# 02 — Lo que hace el usuario (cliente)

Documenta todo lo que puede hacer una persona que entra a la tienda: navegar, comprar y gestionar su cuenta. Las rutas viven en `app/(public)`.

> **Regla general de acceso:** ver productos y precios **no** requiere sesión. Comprar, tener carrito/wishlist y la cuenta **sí**. El guard está en [middleware.ts](../middleware.ts): los prefijos `/carrito`, `/favoritos`, `/cuenta` (vía rutas protegidas) redirigen a `/login?next=…` si no hay sesión.

---

## 1. Descubrir productos

### Landing (`/`)
Página de entrada: hero animado, catálogo destacado, buscador, formulario de newsletter e incrustaciones de Instagram. Componentes en `components/landing/*`.

### Catálogo (`/catalogo`)
Listado de productos activos con **filtros** (resueltos server-side en `getProducts`, `lib/db/index.ts`):

- **Categoría** — por `categorySlug`.
- **Precio** — bandas `economico` (< RD$24), `medio` (RD$24–27), `premium` (≥ RD$27). *(Los umbrales están en céntimos en el código: 2400 / 2700.)*
- **Etiqueta** — filtra por tag (join `product_tags`).
- **Búsqueda** — `ilike` sobre el nombre.
- **Orden** — recientes, precio menor, precio mayor, A-Z.

Solo se muestran productos con `is_active = true`. UI en `components/catalog/*`.

### Ficha de producto (`/catalogo/[slug]`)
Carga con `getProductBySlug`. Muestra:

- Galería de imágenes (portada primero).
- Precio actual y precio anterior tachado si hay oferta/flash sale.
- **Tallas** y **colores** disponibles (ejes independientes; modelo de variantes).
- Marca, etiquetas, descripción.
- **Reseñas**: promedio (`ratingAvg`), número de reseñas y listado (`ProductReview`).
- Acción **añadir al carrito** (con talla/color/cantidad y, opcionalmente, un `designId`).

El tipo de datos es `CatalogProduct` ([types/index.ts](../types/index.ts)).

---

## 2. Carrito (`/carrito`)

- **Requiere sesión.** El carrito es **persistente** en BD (`cart_items`), no solo en el navegador. Lógica en `lib/db/cart.ts` y acciones en `lib/actions/cart.ts`.
- Cada línea referencia una **variante** del producto (talla/color), cantidad, y opcionalmente un diseño. El precio unitario queda **congelado** en la línea del carrito.
- Soporta "guardar para más tarde" (`saved_for_later`): esas líneas no entran en el checkout.
- Migración de carrito anónimo → usuario al iniciar sesión (cuando aplica).

---

## 3. Checkout (`/carrito/checkout`)

Flujo en `lib/db/checkout.ts` (`checkoutFromCart`), expuesto por la Server Action `checkoutAction` ([lib/actions/checkout.ts](../lib/actions/checkout.ts)). Pasos:

1. **Subtotal** a partir de los precios congelados del carrito.
2. **Cupón** (opcional): valida con `validateCoupon` (vigencia, mínimos, usos). Descuenta.
3. **Envío** (opcional): valida el método elegido en `shipping_methods` y suma su precio.
4. **Impuestos**: 0 por defecto (los precios ya incluyen ITBIS).
5. Crea el **pedido** (`orders`) en estado `pending` / `payment_status = pending` con la dirección de envío como JSON.
6. Crea las **líneas** (`order_items`) con *snapshot* del producto (nombre, slug, imagen, talla, color) para que el pedido no cambie aunque el producto se edite después.
7. **Reserva inventario** (best-effort, primer almacén con stock), registra `order_status_history` e incrementa el uso del cupón.
8. **Vacía** el carrito activo.
9. Envía un **correo de aviso al admin** (best-effort; si falla no rompe el checkout).

El resultado (`CheckoutResult`) trae `orderId` y el desglose de totales para continuar al pago.

---

## 4. Pago (AZUL)

1. Tras el checkout, el cliente va a `/pago-azul`: un formulario que se **auto-envía** a la pasarela AZUL con el payload firmado (SHA-512) que construye `/api/pagos/azul/enviar` (`lib/payments/azul.ts`).
2. El cliente paga en la página de AZUL.
3. AZUL hace **POST de retorno** a `/api/pagos/azul/retorno`. El servidor:
   - **Valida la firma** (`verifyAzulResponseSignature`) y que el **monto coincida** con el pedido.
   - Actualiza `orders.payment_status` (`paid`/`failed`), pone `status = confirmed` si se aprobó, y registra la transacción en `payment_transactions` (`updateOrderPaymentStatusFromGateway`).
4. El cliente aterriza en `/pagos/exitoso` o `/pagos/rechazado`.

Detalles de la pasarela en **[04 — Sistemas en conjunto › Pagos](./04-sistemas-compartidos.md#pagos-azul)**.

---

## 5. Seguimiento de pedido

### Consulta pública (`/estado-pedido`)
**Sin login.** Introduciendo el **ID del pedido**, `getOrderStatusById` (service-role) devuelve estado, total, fecha, datos de envío, líneas y el estado de pago (proveedor, fecha de pago, códigos AZUL). Útil para invitados o para compartir.

### Desde la cuenta (`/cuenta/pedidos`, `/cuenta/pedidos/[id]`)
Listado y detalle del historial del propio cliente (vía RLS, `getOrders`). Estados normalizados con `statusMap` (`pendiente`, `confirmado`, `enviado`, etc.).

---

## 6. Cuenta del cliente (`/cuenta/*`)

Todas requieren sesión. Cada sub-página tiene su acción en `lib/actions/*`:

| Página | Qué hace | Lógica |
|--------|----------|--------|
| `/cuenta` | Resumen de la cuenta | `lib/actions/profile.ts` |
| `/cuenta/pedidos` | Historial y detalle de pedidos | `lib/db/orders.ts`, `getOrders` |
| `/cuenta/direcciones` | Libreta de direcciones (CRUD) | `lib/db/addresses.ts` + `/api/addresses` |
| `/cuenta/wishlist` | Lista de deseos (añadir/quitar productos) | `lib/actions/wishlist.ts`, `lib/db/wishlist.ts` |
| `/cuenta/cupones` | Cupones disponibles para el cliente | `lib/db/coupons.ts` |
| `/cuenta/resenas` | Reseñas escritas por el cliente | `lib/actions/reviews.ts`, `lib/db/reviews.ts` |
| `/cuenta/pagos` | Métodos / historial de pago | `lib/db/payments.ts` |
| `/cuenta/notificaciones` | Notificaciones recibidas | `lib/actions/notifications.ts`, `lib/db/notifications.ts` |
| `/cuenta/sorteo` | Estado del sorteo (giveaway) | `lib/db/giveaway-stats.ts` |

### Perfil y direcciones
- El perfil vive en `public.profiles` (nombre, avatar, teléfono, email). El rol **no** lo edita el cliente.
- Direcciones: CRUD vía `/api/addresses` y `/api/addresses/[id]`.

### Reseñas
El cliente puede dejar **rating (1-5)**, título y cuerpo en productos. Alimentan `ratingAvg`/`reviewCount` de la ficha.

---

## 7. Sorteo / Giveaway (`/sorteo` y `/cuenta/sorteo`)

Barra de progreso hacia una **meta de compras pagadas** (default 20.000, configurable por env). Se cuentan pedidos con `payment_status = paid` excluyendo cancelados (`getGiveawayPaidPurchaseCount`, cache 60s). Texto formateado en es-DO.

---

## 8. Cuenta: registro, login y verificación

- **Registro / login** con Supabase Auth (`/registro`, `/login`).
- **OTP por email**: códigos de 6 dígitos, 10 min de validez, un solo uso (`lib/otp.ts`). Se envían vía `/api/auth/otp/enviar` y se validan en `/api/auth/otp/verificar` (página `/verificar`).
- **Restablecer contraseña**: `/api/auth/reset-password/solicitar` → correo → `/nueva-contrasena`.
- Tras confirmar email, Supabase redirige a `/auth/callback`.

Detalle del modelo de auth y roles en **[04 — Sistemas en conjunto › Autenticación](./04-sistemas-compartidos.md#autenticación-y-roles)**.

---

## 9. Eliminar cuenta (`/eliminar-cuenta`)

- **Soft-delete**: marca `profiles.deleted_at` y deja un **periodo de gracia de 30 días** durante el cual el usuario puede recuperar la cuenta simplemente iniciando sesión.
- El guard de sesión en [middleware.ts](../middleware.ts) llama a `resolveAccountStatus` en cada request: si la cuenta está dentro de la gracia se **restaura**; si **venció**, se cierra la sesión de inmediato y se bloquea el acceso (`ACCOUNT_EXPIRED_MESSAGE`). Es una verificación **server-side**, no se confía en el cliente.
- La **purga definitiva** de datos no vive aquí, sino en el repositorio de la app móvil. Lógica en `lib/actions/account.ts` y `lib/auth/account-status.ts`.

---

## 10. Páginas legales e informativas

Sin sesión: `/terminos`, `/privacidad`, `/cookies`, `/devoluciones`, `/entrega`, `/seguridad`. Contenido estático servido desde `app/(public)/*`.
</content>
