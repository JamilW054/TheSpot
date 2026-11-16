import { SITE_URL as SITE } from "../site";

export interface AdminOrderItem {
  name: string;
  quantity: number;
  size?: string | null;
  color?: string | null;
  unitPrice: number;
}

export interface NuevoPedidoAdminEmailData {
  /** Referencia corta legible del pedido (p.ej. los primeros caracteres del id). */
  orderNumber: string;
  /** UUID completo del pedido. */
  orderId: string;
  /** Panel donde se gestiona el pedido (`/panel` para tiendas). */
  panelBase?: "/admin" | "/panel";
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  shippingAddress?: string | null;
  items: AdminOrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  currency?: string;
  /** Método de pago legible (p. ej. "Transferencia bancaria"). */
  paymentMethod?: string | null;
  /** Cuenta elegida para transferir, ya formateada. */
  bankAccount?: string | null;
  /** Nota del cliente en el checkout. */
  notes?: string | null;
}

function formatPrice(cents: number, currency = "DOP"): string {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function nuevoPedidoAdminEmailHtml(
  data: NuevoPedidoAdminEmailData,
): string {
  const {
    orderNumber,
    orderId,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    items,
    subtotal,
    shipping,
    discount,
    total,
    currency = "DOP",
    paymentMethod,
    bankAccount,
    notes,
  } = data;
  const fmt = (c: number) => formatPrice(c, currency);
  const orderUrl = `${SITE}${data.panelBase ?? "/admin"}/pedidos/${orderId}`;
  const year = new Date().getFullYear();

  const itemRows = items
    .map(
      (item) => `
            <tr>
              <td style="padding:14px 0;border-bottom:1px solid #edf1f7;vertical-align:top;">
                <div style="font-size:14px;font-weight:600;color:#0d1b2e;">${item.name}</div>
                ${item.size ? `<div style="margin-top:3px;font-size:12px;font-weight:600;color:#DC2626;">Tamaño ${item.size}</div>` : ""}
                ${item.color ? `<div style="margin-top:3px;font-size:12px;font-weight:600;color:#DC2626;">Color ${item.color}</div>` : ""}
              </td>
              <td style="padding:14px 8px;border-bottom:1px solid #edf1f7;text-align:center;vertical-align:top;">
                <span style="display:inline-block;background:#f7f9fc;border:1px solid #e4eaf2;border-radius:6px;padding:3px 10px;font-size:12px;font-weight:600;color:#5a6a7d;">×${item.quantity}</span>
              </td>
              <td style="padding:14px 0;border-bottom:1px solid #edf1f7;text-align:right;vertical-align:top;">
                <span style="font-size:14px;font-weight:700;color:#0d1b2e;">${fmt(item.unitPrice * item.quantity)}</span>
              </td>
            </tr>`,
    )
    .join("");

  const discountRow =
    discount > 0
      ? `<tr>
                <td style="font-size:13px;color:#7a8899;padding-bottom:8px;">Descuento</td>
                <td style="font-size:13px;color:#16a34a;text-align:right;padding-bottom:8px;font-weight:600;">-${fmt(discount)}</td>
              </tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Nuevo pedido — The Spot</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background-color: #e8edf5; font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    @media only screen and (max-width: 480px) {
      .email-body { padding: 32px 22px 26px !important; }
      .email-body h1 { font-size: 22px !important; }
      .pad { padding: 18px 20px !important; }
      .cta-button { padding: 14px 32px !important; font-size: 14px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#e8edf5;font-family:'Outfit','Segoe UI',Arial,sans-serif;">
  <div style="width:100%;background-color:#e8edf5;padding:40px 16px;">
    <div style="max-width:580px;margin:0 auto;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,100,220,0.10);">

      <!-- HEADER -->
      <div style="background:linear-gradient(145deg,#991B1B 0%,#DC2626 60%,#EF4444 100%);padding:40px 32px 36px;text-align:center;">
        <span style="display:inline-block;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:700;letter-spacing:1.5px;color:#ffffff;text-shadow:0 3px 14px rgba(0,0,0,0.30);">The Spot</span>
      </div>

      <!-- CUERPO -->
      <div class="email-body" style="padding:44px 44px 36px;text-align:center;">

        <!-- Ícono carrito -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 26px;">
          <tr>
            <td align="center" valign="middle" style="width:72px;height:72px;background-color:#e8f3ff;border-radius:50%;">
              <img src="https://img.icons8.com/ios/32/1e90ff/shopping-cart--v1.png" alt="" width="32" height="32" style="display:block;margin:0 auto;" />
            </td>
          </tr>
        </table>

        <h1 style="color:#0d1b2e;font-size:26px;font-weight:700;margin:0 0 10px;letter-spacing:-0.3px;line-height:1.2;">Nuevo pedido recibido</h1>
        <p style="color:#7a8899;font-size:14px;margin:0 0 32px;line-height:1.6;">Se registró un nuevo pedido en la tienda</p>

        <!-- Pedido + cliente -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f9fc;border:1px solid #e4eaf2;border-radius:14px;margin-bottom:20px;">
          <tr>
            <td class="pad" style="padding:20px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:left;">
                    <div style="font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#9aaabb;margin-bottom:4px;">Pedido</div>
                    <div style="font-size:18px;font-weight:700;color:#DC2626;font-family:'Courier New',Courier,monospace;">#${orderNumber}</div>
                  </td>
                  <td style="text-align:right;">
                    <div style="font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#9aaabb;margin-bottom:4px;">Cliente</div>
                    <div style="font-size:15px;font-weight:600;color:#0d1b2e;">${customerName}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Contacto y envío -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f9fc;border:1px solid #e4eaf2;border-radius:14px;margin-bottom:20px;">
          <tr>
            <td class="pad" style="padding:20px 24px;text-align:left;">
              <div style="font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#9aaabb;margin-bottom:10px;">Contacto y envío</div>
              <p style="margin:0;font-size:14px;color:#5a6a7d;line-height:1.8;">
                <strong style="color:#0d1b2e;font-weight:600;">Correo:</strong> ${customerEmail}<br/>
                ${customerPhone ? `<strong style="color:#0d1b2e;font-weight:600;">Teléfono:</strong> ${customerPhone}<br/>` : ""}
                ${shippingAddress ? `<strong style="color:#0d1b2e;font-weight:600;">Dirección:</strong> ${shippingAddress}<br/>` : ""}
                ${paymentMethod ? `<strong style="color:#0d1b2e;font-weight:600;">Pago:</strong> ${paymentMethod}${bankAccount ? ` — ${bankAccount}` : ""}<br/>` : ""}
                ${notes ? `<strong style="color:#0d1b2e;font-weight:600;">Nota del cliente:</strong> ${notes.replace(/</g, "&lt;")}` : ""}
              </p>
            </td>
          </tr>
        </table>

        <!-- Productos -->
        <div style="font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#DC2626;margin-bottom:4px;text-align:left;">Productos</div>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
          ${itemRows}
        </table>

        <!-- Totales -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f9fc;border:1px solid #e4eaf2;border-radius:14px;margin-bottom:32px;">
          <tr>
            <td style="padding:16px 24px 8px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:13px;color:#7a8899;padding-bottom:8px;text-align:left;">Subtotal</td>
                  <td style="font-size:13px;color:#5a6a7d;text-align:right;padding-bottom:8px;">${fmt(subtotal)}</td>
                </tr>
                ${discountRow}
                <tr>
                  <td style="font-size:13px;color:#7a8899;padding-bottom:12px;text-align:left;">Envío</td>
                  <td style="font-size:13px;text-align:right;padding-bottom:12px;">${shipping === 0 ? '<span style="color:#16a34a;font-weight:700;">GRATIS</span>' : `<span style="color:#5a6a7d;">${fmt(shipping)}</span>`}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #e4eaf2;padding:14px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#7a8899;text-align:left;">Total</td>
                  <td style="text-align:right;"><span style="font-size:22px;font-weight:700;color:#DC2626;">${fmt(total)}</span></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- CTA -->
        <a href="${orderUrl}" class="cta-button" style="display:inline-block;background-color:#DC2626;color:#ffffff;text-decoration:none;padding:15px 44px;border-radius:10px;font-size:15px;font-weight:600;letter-spacing:0.01em;font-family:'Outfit','Segoe UI',Arial,sans-serif;">
          Ver pedido en el panel &rarr;
        </a>

        <p style="color:#b0bbc8;font-size:12px;margin:20px 0 0;line-height:1.6;">Aviso interno · ID: ${orderId}</p>

      </div>

      <!-- FOOTER -->
      <div style="border-top:1px solid #edf1f7;padding:24px 32px;text-align:center;background-color:#fafbfd;">
        <div style="margin-bottom:14px;text-align:center;">
          <a href="${SITE}/" title="The Spot" target="_blank" style="display:inline-block;width:38px;height:38px;border-radius:10px;background-color:#ffffff;border:1px solid #e4eaf2;text-align:center;text-decoration:none;vertical-align:middle;margin:0 5px;">
            <img src="https://img.icons8.com/ios/18/555e6d/globe--v1.png" alt="The Spot" width="18" height="18" style="display:block;margin:10px auto 0;" />
          </a>
        </div>
        <p style="color:#b0bbc8;font-size:11px;margin-top:6px;">© ${year} The Spot</p>
      </div>

    </div>
  </div>
</body>
</html>`;
}

export function nuevoPedidoAdminEmailText(
  data: NuevoPedidoAdminEmailData,
): string {
  const {
    orderNumber,
    orderId,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    items,
    subtotal,
    shipping,
    discount,
    total,
    currency = "DOP",
    paymentMethod,
    bankAccount,
    notes,
  } = data;
  const fmt = (c: number) => formatPrice(c, currency);
  const lines = items
    .map(
      (i) =>
        `  - ${i.name}${[i.size, i.color].filter(Boolean).length ? ` (${[i.size, i.color].filter(Boolean).join(", ")})` : ""} x${i.quantity}: ${fmt(i.unitPrice * i.quantity)}`,
    )
    .join("\n");
  const discountLine = discount > 0 ? `\nDescuento: -${fmt(discount)}` : "";
  return `The Spot — Nuevo pedido #${orderNumber}

Cliente: ${customerName}
Correo: ${customerEmail}${customerPhone ? `\nTeléfono: ${customerPhone}` : ""}${shippingAddress ? `\nDirección: ${shippingAddress}` : ""}${paymentMethod ? `\nPago: ${paymentMethod}${bankAccount ? ` — ${bankAccount}` : ""}` : ""}${notes ? `\nNota: ${notes}` : ""}

Productos:
${lines}

Subtotal: ${fmt(subtotal)}${discountLine}
Envío: ${shipping === 0 ? "GRATIS" : fmt(shipping)}
TOTAL: ${fmt(total)}

Ver en el panel: ${SITE}${data.panelBase ?? "/admin"}/pedidos/${orderId}
ID: ${orderId}

— The Spot`;
}
