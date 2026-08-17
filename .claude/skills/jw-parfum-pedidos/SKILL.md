---
name: jw-parfum-pedidos
description: Explicar o depurar el flujo de pedidos de JW (checkout de invitado, correo de aviso a Gmail, enlace de WhatsApp, cambio de estado en admin). Usar cuando el usuario pregunte "por qué no me llegó el correo del pedido", "cómo mando el WhatsApp del pedido", "cómo pruebo un pedido" o "cómo cambio el estado de un pedido".
---

# Flujo de pedidos de JW

No hay pago en línea. El objetivo del checkout es capturar el pedido y avisar al dueño por dos canales (correo + WhatsApp) para que coordine el cobro y la entrega manualmente.

## Flujo completo

1. Cliente arma el carrito (guardado en `localStorage`, sin cuenta) y llena el formulario de checkout en `/carrito/checkout`: nombre, teléfono, dirección, notas.
2. Al confirmar, se ejecuta el checkout de invitado (`src/database/repositories/checkout.ts`): crea `orders` (`user_id = NULL`) + `order_items`, reserva inventario best-effort.
3. En paralelo, best-effort (si algo falla aquí, el pedido igual queda creado):
   - Se envía un correo a **jamilwilliams054@gmail.com** (configurable en `/admin/config`, clave `order_notification_email`) vía Resend con el detalle del pedido (`src/lib/resend/templates/nuevo-pedido-admin.ts`).
   - Se genera un enlace `wa.me` (`src/lib/whatsapp.ts`) con el mensaje del pedido prellenado, listo para abrir y enviar al número del negocio o al del cliente.
4. El cliente ve una pantalla de confirmación con su número de pedido y puede consultarlo luego sin login en `/estado-pedido`.
5. El admin gestiona el pedido en `/admin/pedidos`: cambia el estado (pendiente → en proceso → completado), y tiene un botón para reabrir el enlace de WhatsApp de ese pedido específico.

## Cómo probarlo en local

1. Tener `.env.local` con `RESEND_API_KEY` válido (en modo sandbox de Resend solo llegan correos a la cuenta dueña del API key — normal en desarrollo).
2. `pnpm dev`, agregar un perfume al carrito desde `/catalogo`, completar `/carrito/checkout` con datos de prueba.
3. Confirmar en la terminal/logs que no hubo error silencioso en el envío de correo (el checkout nunca falla por esto, así que revisar logs si el correo no llega).
4. En `/admin/pedidos` verificar que el pedido aparece y que el botón de WhatsApp abre `https://wa.me/<número>?text=...` con los datos correctos.

## Si el correo no llega

- Revisar `order_notification_email` en `/admin/config` — si está vacío cae al valor por defecto del código.
- Si `RESEND_API_KEY` no está seteado, `getResend()` lanza error — se captura silenciosamente en el checkout (por diseño, para no bloquear al cliente), así que hay que revisar logs del servidor, no la UI del cliente.
- En producción, sin un dominio verificado en Resend, los correos a `jamilwilliams054@gmail.com` pueden no entregarse — verificar dominio propio (ver skill `jw-parfum-setup`).

## Número de WhatsApp

Configurable en `/admin/config` (clave `whatsapp_number`, formato internacional sin `+`, ej. `18097612875` para RD). `src/lib/whatsapp.ts` normaliza y arma el enlace — si se cambia el número ahí, no hace falta tocar código.
