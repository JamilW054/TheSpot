import { SITE_URL as SITE } from "../site";

export interface OrderItem {
  name: string;
  quantity: number;
  size?: string;
  color?: string;
  unitPrice: number;
  imageUrl?: string | null;
}

export interface CompraEmailData {
  name: string;
  orderId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  /** Impuestos en centavos. Se omite la fila si es 0/undefined. */
  tax?: number;
  total: number;
  currency?: string;
  /** Fecha de compra ya formateada (es-DO). */
  purchaseDate?: string;
  /** Cómo se confirmó el cobro (p.ej. "Pago confirmado por el negocio"). */
  paymentMethodLabel?: string;
  /** Etiqueta del estado del pago (p.ej. "Pagado"). */
  paymentStatusLabel?: string;
}

export function formatPrice(cents: number, currency = "DOP"): string {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/** Fila de detalle (etiqueta a la izquierda, valor a la derecha). Mismo patrón que payment-link.ts / payment-confirmed.ts. */
function detailRow(label: string, value: string, accent = false): string {
  return `<tr>
    <td style="padding:11px 0;border-bottom:1px solid #edf1f7;font-size:13px;color:#7a8899;">${label}</td>
    <td style="padding:11px 0;border-bottom:1px solid #edf1f7;text-align:right;font-size:13px;font-weight:600;color:${accent ? "#1e90ff" : "#0d1b2e"};">${value}</td>
  </tr>`;
}

export function compraEmailHtml(data: CompraEmailData): string {
  const {
    name,
    orderId,
    orderNumber,
    items,
    subtotal,
    shipping,
    tax = 0,
    total,
    currency = "DOP",
    purchaseDate,
    paymentMethodLabel,
    paymentStatusLabel,
  } = data;
  const fmt = (c: number) => formatPrice(c, currency);

  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #edf1f7;vertical-align:top;width:56px;">
            ${
              item.imageUrl
                ? `<img src="${item.imageUrl}" alt="" width="56" height="56" style="display:block;width:56px;height:56px;border-radius:10px;object-fit:cover;border:1px solid #e4eaf2;" />`
                : `<div style="width:56px;height:56px;border-radius:10px;background:#f7f9fc;border:1px solid #e4eaf2;"></div>`
            }
          </td>
          <td style="padding:16px 0 16px 14px;border-bottom:1px solid #edf1f7;vertical-align:top;">
            <div style="font-size:13px;font-weight:700;color:#0d1b2e;">${item.name}</div>
            ${item.size ? `<div style="margin-top:3px;font-size:11px;font-weight:600;color:#1e90ff;letter-spacing:0.5px;text-transform:uppercase;">Tamaño ${item.size}</div>` : ""}
            ${item.color ? `<div style="margin-top:3px;font-size:11px;font-weight:600;color:#1e90ff;letter-spacing:0.5px;text-transform:uppercase;">Color ${item.color}</div>` : ""}
          </td>
          <td style="padding:16px 0;border-bottom:1px solid #edf1f7;text-align:center;vertical-align:top;white-space:nowrap;">
            <span style="display:inline-block;background:#f7f9fc;border:1px solid #e4eaf2;border-radius:6px;padding:3px 10px;font-size:12px;font-weight:700;color:#7a8899;">×${item.quantity}</span>
          </td>
          <td style="padding:16px 0;border-bottom:1px solid #edf1f7;text-align:right;vertical-align:top;white-space:nowrap;">
            <span style="font-size:14px;font-weight:700;color:#0d1b2e;">${fmt(item.unitPrice * item.quantity)}</span>
          </td>
        </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>Pedido confirmado — JW PARFUM</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

    :root { color-scheme: light only; supported-color-schemes: light only; }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background-color: #e8edf5;
      color-scheme: light only;
      font-family: 'Outfit', 'Segoe UI', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    .email-wrapper { width: 100%; background-color: #e8edf5; padding: 40px 16px; }

    .email-container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 8px 40px rgba(0, 100, 220, 0.10);
    }

    .email-header {
      background: linear-gradient(145deg, #1565c0 0%, #1e90ff 60%, #42a8ff 100%);
      padding: 40px 32px 36px;
      text-align: center;
    }

    .email-header .logo {
      display: inline-block;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: #ffffff;
      text-shadow: 0 3px 14px rgba(0,0,0,0.30);
    }

    .email-body { padding: 48px 44px 40px; text-align: center; }

    .email-body h1 {
      color: #0d1b2e;
      font-size: 26px;
      font-weight: 700;
      margin: 0 0 10px;
      letter-spacing: -0.3px;
      line-height: 1.2;
    }

    .email-body .subtitle {
      color: #7a8899;
      font-size: 14px;
      margin: 0 0 32px;
      line-height: 1.6;
    }

    .message-box {
      background-color: #f7f9fc;
      border-radius: 14px;
      padding: 24px 28px;
      margin-bottom: 24px;
      text-align: left;
      border: 1px solid #e4eaf2;
    }

    .message-box .greeting { color: #0d1b2e; font-size: 15px; font-weight: 600; margin-bottom: 10px; }
    .message-box .message-text { color: #5a6a7d; font-size: 14px; line-height: 1.75; }
    .message-box .message-text strong { color: #1e90ff; font-weight: 600; }

    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }

    .section-label {
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #1e90ff;
      margin-bottom: 12px;
    }

    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; text-align: left; }

    .totals-box {
      background-color: #f7f9fc;
      border: 1px solid #e4eaf2;
      border-radius: 14px;
      margin-bottom: 28px;
      text-align: left;
    }

    .cta-button {
      display: inline-block;
      background-color: #1e90ff;
      color: #ffffff !important;
      text-decoration: none;
      padding: 15px 44px;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.01em;
      font-family: 'Outfit', 'Segoe UI', Arial, sans-serif;
    }

    .expire-note { color: #b0bbc8; font-size: 12px; margin: 20px 0 0; line-height: 1.6; }

    .email-footer {
      border-top: 1px solid #edf1f7;
      padding: 24px 32px;
      text-align: center;
      background-color: #fafbfd;
    }

    .social-links { margin-bottom: 14px; text-align: center; }

    .social-icon {
      display: inline-block;
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background-color: #ffffff;
      border: 1px solid #e4eaf2;
      text-align: center;
      text-decoration: none;
      vertical-align: middle;
      margin: 0 5px;
    }

    .footer-copy { color: #b0bbc8; font-size: 11px; margin-top: 6px; }
    .footer-copy a { color: #9aaabb; text-decoration: none; }

    @media only screen and (max-width: 480px) {
      .email-body { padding: 36px 24px 28px; }
      .email-body h1 { font-size: 22px; }
      .message-box { padding: 18px 20px; }
      .cta-button { padding: 14px 32px; font-size: 14px; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">

      <!-- HEADER -->
      <div class="email-header">
        <span class="logo">JW PARFUM</span>
      </div>

      <!-- CUERPO -->
      <div class="email-body">

        <!-- Ícono confirmado -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 28px;">
          <tr>
            <td align="center" valign="middle"
              style="width:72px;height:72px;background-color:#e8f9ef;border-radius:50%;">
              <img src="https://img.icons8.com/ios/32/16a34a/checkmark--v1.png"
                alt="" width="32" height="32" style="display:block;margin:0 auto;" />
            </td>
          </tr>
        </table>

        <h1>¡Pedido confirmado!</h1>
        <p class="subtitle">Gracias por tu compra, ${name}</p>

        <!-- Mensaje -->
        <div class="message-box">
          <p class="greeting">Hola, ${name}</p>
          <p class="message-text">
            Recibimos tu pago y tu pedido <strong>#${orderNumber}</strong> ya está
            confirmado en <strong>JW PARFUM</strong>. Lo estamos preparando para
            envío y te avisaremos con cada actualización de estado.
          </p>
        </div>

        <!-- Detalles del pedido -->
        <table class="details-table" role="presentation" cellpadding="0" cellspacing="0" border="0">
          ${detailRow("Pedido", `#${orderNumber}`, true)}
          ${purchaseDate ? detailRow("Fecha", purchaseDate) : ""}
          ${paymentMethodLabel ? detailRow("Método de pago", paymentMethodLabel) : ""}
          ${detailRow("Estado", paymentStatusLabel ?? "Pagado")}
        </table>

        <!-- Resumen del pedido -->
        <div class="section-label">Resumen del pedido</div>
        <table class="items-table" role="presentation" cellpadding="0" cellspacing="0" border="0">
          ${itemRows}
        </table>

        <!-- Totales -->
        <table class="totals-box" role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:20px 24px 4px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="font-size:13px;color:#7a8899;padding-bottom:10px;">Subtotal</td>
                  <td style="font-size:13px;color:#0d1b2e;text-align:right;padding-bottom:10px;">${fmt(subtotal)}</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#7a8899;padding-bottom:10px;">Envío</td>
                  <td style="font-size:13px;text-align:right;padding-bottom:10px;">${shipping === 0 ? '<span style="color:#16a34a;font-weight:700;">GRATIS</span>' : `<span style="color:#0d1b2e;">${fmt(shipping)}</span>`}</td>
                </tr>
                ${
                  tax > 0
                    ? `<tr>
                  <td style="font-size:13px;color:#7a8899;padding-bottom:10px;">Impuestos</td>
                  <td style="font-size:13px;color:#0d1b2e;text-align:right;padding-bottom:10px;">${fmt(tax)}</td>
                </tr>`
                    : ""
                }
              </table>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #e4eaf2;padding:16px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#7a8899;">Total</td>
                  <td style="text-align:right;">
                    <span style="font-size:24px;font-weight:700;color:#1e90ff;">${fmt(total)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <a href="${SITE}/estado-pedido" class="cta-button">
          Ver estado del pedido &rarr;
        </a>

        <p class="expire-note">
          ¿Preguntas sobre tu pedido? Escríbenos a
          <a href="mailto:jamilwilliams054@gmail.com" style="color:#1e90ff;text-decoration:none;font-weight:600;">jamilwilliams054@gmail.com</a>.
        </p>

      </div>

      <!-- FOOTER -->
      <div class="email-footer">

        <div class="social-links">
          <a href="${SITE}" class="social-icon" title="jwparfum.com" target="_blank">
            <img src="https://img.icons8.com/ios/18/555e6d/globe--v1.png"
              alt="jwparfum.com" width="18" height="18" style="display:block;margin:10px auto 0;" />
          </a>
        </div>

        <p class="footer-copy">
          ID: ${orderId}<br />
          © ${new Date().getFullYear()} JW PARFUM · República Dominicana
        </p>
        <p class="footer-copy">
          <a href="${SITE}/privacidad">Privacidad</a> ·
          <a href="${SITE}/terminos">Términos</a> ·
          <a href="${SITE}/devoluciones">Devoluciones</a>
        </p>

      </div>

    </div>
  </div>
</body>
</html>`;
}

export function compraEmailText(data: CompraEmailData): string {
  const {
    name,
    orderId,
    orderNumber,
    items,
    subtotal,
    shipping,
    tax = 0,
    total,
    currency = "DOP",
    purchaseDate,
    paymentMethodLabel,
    paymentStatusLabel,
  } = data;
  const fmt = (c: number) => formatPrice(c, currency);
  const lines = items
    .map(
      (i) =>
        `  - ${i.name}${[i.size, i.color].filter(Boolean).length ? ` (${[i.size, i.color].filter(Boolean).join(", ")})` : ""} x${i.quantity}: ${fmt(i.unitPrice * i.quantity)}`,
    )
    .join("\n");
  const metaLines = [
    `ID: ${orderId}`,
    purchaseDate ? `Fecha: ${purchaseDate}` : null,
    paymentMethodLabel ? `Método de pago: ${paymentMethodLabel}` : null,
    `Estado: ${paymentStatusLabel ?? "Pagado"}`,
  ]
    .filter(Boolean)
    .join("\n");
  return `JW PARFUM — Pedido confirmado #${orderNumber}\n\nHola ${name},\n\n${metaLines}\n\n${lines}\n\nSubtotal: ${fmt(subtotal)}\nEnvío: ${shipping === 0 ? "GRATIS" : fmt(shipping)}${tax > 0 ? `\nImpuestos: ${fmt(tax)}` : ""}\nTOTAL: ${fmt(total)}\n\n${SITE}/estado-pedido\n\n— JW PARFUM`;
}
