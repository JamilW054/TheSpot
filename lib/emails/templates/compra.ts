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
  const {
    name,
    orderId,
    orderNumber,
    items,
    subtotal,
    shipping,
    total,
    currency = "DOP",
  } = data;
  const fmt = (c: number) => formatPrice(c, currency);

  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #1a1a1d;vertical-align:top;">
            <div style="font-size:13px;font-weight:700;color:#f4f4f5;text-transform:uppercase;letter-spacing:0.5px;">${item.name}</div>
            ${item.size ? `<div style="margin-top:3px;font-size:11px;font-weight:600;color:#3cc8f7;letter-spacing:2px;text-transform:uppercase;">TALLA ${item.size}</div>` : ""}
          </td>
          <td style="padding:14px 8px;border-bottom:1px solid #1a1a1d;text-align:center;vertical-align:top;">
            <span style="display:inline-block;background:#1a1a1d;border-radius:6px;padding:3px 10px;font-size:12px;font-weight:700;color:#a1a1aa;">×${item.quantity}</span>
          </td>
          <td style="padding:14px 0;border-bottom:1px solid #1a1a1d;text-align:right;vertical-align:top;">
            <span style="font-size:14px;font-weight:700;color:#f4f4f5;">${fmt(item.unitPrice * item.quantity)}</span>
          </td>
        </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Pedido confirmado — Buxxep</title>
</head>
<body style="margin:0;padding:0;background:#080808;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

  <!-- Top cyan bar -->
  <div style="height:4px;background:linear-gradient(90deg,#3cc8f7 0%,#5dd4f9 50%,#0e7fa3 100%);"></div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:48px 16px 56px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">

        <!-- Logo -->
        <tr>
          <td align="center" style="padding-bottom:36px;">
            <a href="https://buxxep.vercel.app" style="text-decoration:none;display:inline-block;">
              <div style="font-size:11px;font-weight:700;letter-spacing:6px;text-transform:uppercase;color:#3cc8f7;margin-bottom:6px;text-align:center;">STREETWEAR</div>
              <div style="font-size:36px;font-weight:900;letter-spacing:-1px;color:#f4f4f5;line-height:1;text-transform:uppercase;">BUX<span style="color:#3cc8f7;">XEP</span></div>
            </a>
          </td>
        </tr>

        <!-- Card -->
        <tr>
          <td style="background:#111113;border:1px solid #1e1e22;border-radius:16px;overflow:hidden;">

            <!-- Hero banner -->
            <div style="background:linear-gradient(135deg,#0d2a1a 0%,#111113 55%,#0d0d0f 100%);padding:44px 40px 40px;text-align:center;">
              <div style="height:3px;background:linear-gradient(90deg,transparent,#3cc8f7,transparent);margin-bottom:32px;"></div>
              <div style="display:inline-block;width:60px;height:60px;background:#0a2016;border:1.5px solid #22c55e;border-radius:50%;text-align:center;line-height:60px;font-size:26px;margin-bottom:16px;">✓</div>
              <div style="font-size:11px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:#22c55e;margin-bottom:10px;">PAGO APROBADO</div>
              <h1 style="margin:0;font-size:30px;font-weight:900;color:#f4f4f5;line-height:1.1;letter-spacing:-0.5px;text-transform:uppercase;">
                Pedido<br/><span style="color:#3cc8f7;">confirmado</span>
              </h1>
            </div>

            <!-- Body -->
            <div style="padding:32px 40px 40px;">

              <!-- Order badge -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#0d0d0f;border:1px solid #1e1e22;border-radius:10px;padding:16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <div style="font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#52525b;margin-bottom:4px;">PEDIDO</div>
                          <div style="font-size:18px;font-weight:900;color:#3cc8f7;letter-spacing:1px;font-family:'Courier New',Courier,monospace;">#${orderNumber}</div>
                        </td>
                        <td style="text-align:right;">
                          <div style="font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#52525b;margin-bottom:4px;">CLIENTE</div>
                          <div style="font-size:14px;font-weight:700;color:#f4f4f5;">${name}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Greeting -->
              <p style="margin:0 0 28px;font-size:14px;color:#71717a;line-height:1.8;">
                Gracias por tu compra, <strong style="color:#a1a1aa;">${name}</strong>. Tu pedido está siendo procesado y lo tendrás listo pronto.
              </p>

              <!-- Items label -->
              <div style="font-size:10px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#3cc8f7;margin-bottom:4px;">PRODUCTOS</div>
              <div style="height:1px;background:#1e1e22;margin-bottom:0;"></div>

              <!-- Items -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                ${itemRows}
              </table>

              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0f;border:1px solid #1e1e22;border-radius:10px;padding:0;margin-bottom:32px;">
                <tr>
                  <td style="padding:12px 20px 8px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:13px;color:#71717a;padding-bottom:8px;">Subtotal</td>
                        <td style="font-size:13px;color:#a1a1aa;text-align:right;padding-bottom:8px;">${fmt(subtotal)}</td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;color:#71717a;padding-bottom:12px;">Envío</td>
                        <td style="font-size:13px;text-align:right;padding-bottom:12px;">${shipping === 0 ? '<span style="color:#22c55e;font-weight:700;">GRATIS</span>' : `<span style="color:#a1a1aa;">${fmt(shipping)}</span>`}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="border-top:1px solid #1e1e22;padding:14px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#71717a;">TOTAL</td>
                        <td style="text-align:right;">
                          <span style="font-size:22px;font-weight:900;color:#3cc8f7;">${fmt(total)}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="https://buxxep.vercel.app/mis-disenos" style="display:inline-block;background:#3cc8f7;color:#080808;font-size:13px;font-weight:800;text-decoration:none;padding:14px 40px;border-radius:8px;letter-spacing:2px;text-transform:uppercase;">
                      Ver mis pedidos →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Info -->
              <div style="background:#0d0d0f;border:1px solid #1e1e22;border-radius:10px;padding:16px 20px;">
                <div style="font-size:12px;font-weight:700;color:#f4f4f5;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px;">📦 ¿Qué sigue?</div>
                <p style="margin:0;font-size:12px;color:#52525b;line-height:1.7;">
                  Tu pedido entra en producción en las próximas horas. Recibirás actualizaciones de estado. ¿Dudas? Escríbenos en
                  <a href="https://instagram.com/buxxep" style="color:#3cc8f7;text-decoration:none;font-weight:700;">@buxxep</a>.
                </p>
              </div>

            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding-top:32px;">
            <p style="margin:0 0 8px;font-size:10px;color:#27272a;font-family:'Courier New',Courier,monospace;">ID: ${orderId}</p>
            <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#3cc8f7;">BUXXEP</p>
            <p style="margin:0 0 10px;font-size:12px;color:#3d3d42;">República Dominicana · ${new Date().getFullYear()}</p>
            <p style="margin:0;font-size:12px;">
              <a href="https://buxxep.vercel.app/privacidad" style="color:#52525b;text-decoration:none;margin:0 8px;">Privacidad</a>
              <span style="color:#27272a;">·</span>
              <a href="https://buxxep.vercel.app/terminos" style="color:#52525b;text-decoration:none;margin:0 8px;">Términos</a>
              <span style="color:#27272a;">·</span>
              <a href="https://buxxep.vercel.app/devoluciones" style="color:#52525b;text-decoration:none;margin:0 8px;">Devoluciones</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

  <!-- Bottom bar -->
  <div style="height:2px;background:linear-gradient(90deg,#3cc8f7 0%,#5dd4f9 50%,#0e7fa3 100%);"></div>

</body>
</html>`;
}

export function compraEmailText(data: CompraEmailData): string {
  const {
    name,
    orderNumber,
    items,
    subtotal,
    shipping,
    total,
    currency = "DOP",
  } = data;
  const fmt = (c: number) => formatPrice(c, currency);
  const lines = items
    .map(
      (i) =>
        `  - ${i.name}${i.size ? ` (${i.size})` : ""} x${i.quantity}: ${fmt(i.unitPrice * i.quantity)}`,
    )
    .join("\n");
  return `BUXXEP — Pedido confirmado #${orderNumber}\n\nHola ${name},\n\n${lines}\n\nSubtotal: ${fmt(subtotal)}\nEnvío: ${shipping === 0 ? "GRATIS" : fmt(shipping)}\nTOTAL: ${fmt(total)}\n\nhttps://buxxep.vercel.app/mis-disenos\n\n— BUXXEP`;
}
