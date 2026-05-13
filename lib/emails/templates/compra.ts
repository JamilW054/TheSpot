export interface OrderItem {
  name: string;
  quantity: number;
  size?: string;
  unitPrice: number;
}

export interface CompraEmailData {
  name: string;
  orderId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currency?: string;
}

function formatPrice(cents: number, currency = "DOP"): string {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function compraEmailHtml(data: CompraEmailData): string {
  const { name, orderId, orderNumber, items, subtotal, shipping, total, currency = "DOP" } = data;
  const fmt = (c: number) => formatPrice(c, currency);

  const itemsRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #27272a;">
          <p style="margin:0;font-size:14px;font-weight:600;color:#f4f4f5;">${item.name}</p>
          ${item.size ? `<p style="margin:2px 0 0;font-size:12px;color:#71717a;">Talla: ${item.size}</p>` : ""}
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #27272a;text-align:center;">
          <span style="font-size:14px;color:#a1a1aa;">×${item.quantity}</span>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #27272a;text-align:right;">
          <span style="font-size:14px;color:#f4f4f5;">${fmt(item.unitPrice * item.quantity)}</span>
        </td>
      </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmación de compra — Buxxep</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <a href="https://buxxep.vercel.app" style="text-decoration:none;">
                <span style="font-size:26px;font-weight:700;letter-spacing:-0.5px;color:#f4f4f5;">bux<span style="color:#3cc8f7;">xep</span></span>
              </a>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="background:linear-gradient(135deg,#0a2a1a 0%,#18181b 70%);border-radius:12px 12px 0 0;padding:32px 36px 24px;text-align:center;">
              <div style="display:inline-block;background-color:#052012;border-radius:50%;width:52px;height:52px;line-height:52px;text-align:center;font-size:24px;margin-bottom:16px;">✅</div>
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#f4f4f5;">¡Pedido confirmado!</h1>
              <p style="margin:0;font-size:14px;color:#a1a1aa;">Tu pago fue procesado exitosamente.</p>
            </td>
          </tr>

          <!-- Card Body -->
          <tr>
            <td style="background-color:#18181b;border:1px solid #27272a;border-top:none;border-radius:0 0 12px 12px;padding:28px 36px 36px;">

              <!-- Order meta -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0c0c0e;border:1px solid #27272a;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:12px 16px;border-right:1px solid #27272a;width:50%;">
                    <p style="margin:0 0 2px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#71717a;">Pedido</p>
                    <p style="margin:0;font-size:14px;font-weight:700;color:#3cc8f7;">#${orderNumber}</p>
                  </td>
                  <td style="padding:12px 16px;width:50%;">
                    <p style="margin:0 0 2px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#71717a;">Cliente</p>
                    <p style="margin:0;font-size:14px;font-weight:600;color:#f4f4f5;">${name}</p>
                  </td>
                </tr>
              </table>

              <!-- Greeting -->
              <p style="margin:0 0 20px;font-size:14px;color:#a1a1aa;line-height:1.7;">
                Hola <strong style="color:#f4f4f5;">${name}</strong>, gracias por tu compra. Aquí está el resumen de tu pedido:
              </p>

              <!-- Items table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <thead>
                  <tr>
                    <th style="padding:0 0 10px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#71717a;text-align:left;border-bottom:1px solid #27272a;">Producto</th>
                    <th style="padding:0 0 10px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#71717a;text-align:center;border-bottom:1px solid #27272a;">Cant.</th>
                    <th style="padding:0 0 10px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#71717a;text-align:right;border-bottom:1px solid #27272a;">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>

              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#a1a1aa;">Subtotal</td>
                  <td style="padding:6px 0;font-size:14px;color:#f4f4f5;text-align:right;">${fmt(subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#a1a1aa;">Envío</td>
                  <td style="padding:6px 0;font-size:14px;color:#f4f4f5;text-align:right;">${shipping === 0 ? '<span style="color:#22c55e;">Gratis</span>' : fmt(shipping)}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0 0;border-top:1px solid #27272a;font-size:16px;font-weight:700;color:#f4f4f5;">Total</td>
                  <td style="padding:10px 0 0;border-top:1px solid #27272a;font-size:16px;font-weight:700;color:#3cc8f7;text-align:right;">${fmt(total)}</td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="https://buxxep.vercel.app/mis-disenos" style="display:inline-block;background-color:#3cc8f7;color:#0a0a0a;font-size:14px;font-weight:700;text-decoration:none;padding:13px 36px;border-radius:8px;">
                      Ver mis pedidos →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Info box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0c0c0e;border:1px solid #27272a;border-radius:8px;">
                <tr>
                  <td style="padding:14px 16px;">
                    <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#f4f4f5;">📦 ¿Qué sigue?</p>
                    <p style="margin:0;font-size:13px;color:#71717a;line-height:1.6;">
                      Tu pedido está siendo procesado. Te notificaremos cuando esté en camino. Si tienes dudas, contáctanos en
                      <a href="https://instagram.com/buxxep" style="color:#3cc8f7;text-decoration:none;">@buxxep</a>.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0 0 8px;font-size:12px;color:#52525b;">
                ID de pedido: <code style="color:#52525b;">${orderId}</code>
              </p>
              <p style="margin:0 0 8px;font-size:12px;color:#52525b;">
                © ${new Date().getFullYear()} Buxxep · República Dominicana
              </p>
              <p style="margin:0;font-size:12px;">
                <a href="https://buxxep.vercel.app/privacidad" style="color:#3cc8f7;text-decoration:none;">Privacidad</a>
                &nbsp;·&nbsp;
                <a href="https://buxxep.vercel.app/terminos" style="color:#3cc8f7;text-decoration:none;">Términos</a>
                &nbsp;·&nbsp;
                <a href="https://buxxep.vercel.app/devoluciones" style="color:#3cc8f7;text-decoration:none;">Devoluciones</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function compraEmailText(data: CompraEmailData): string {
  const { name, orderNumber, items, subtotal, shipping, total, currency = "DOP" } = data;
  const fmt = (c: number) => formatPrice(c, currency);

  const itemLines = items
    .map((i) => `  - ${i.name}${i.size ? ` (${i.size})` : ""} x${i.quantity}: ${fmt(i.unitPrice * i.quantity)}`)
    .join("\n");

  return `¡Pedido confirmado! — Buxxep

Hola ${name},

Tu pedido #${orderNumber} fue procesado exitosamente.

Productos:
${itemLines}

Subtotal: ${fmt(subtotal)}
Envío:    ${shipping === 0 ? "Gratis" : fmt(shipping)}
Total:    ${fmt(total)}

Ver tus pedidos: https://buxxep.vercel.app/mis-disenos

— Buxxep · República Dominicana`;
}
