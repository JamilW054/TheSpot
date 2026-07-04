import { SITE_URL as SITE } from "../site";

export interface PaymentConfirmedEmailData {
  /** Nombre del cliente. */
  name: string;
  /** Número de referencia legible (PAY-AAAA-NNNNNN). */
  referenceNumber: string;
  /** Monto en centavos (minor units). */
  amountCents: number;
  currency?: string;
  description?: string | null;
  /** Nombre del método de pago. */
  methodLabel: string;
  /** Fecha de confirmación ya formateada (es-DO), opcional. */
  paidAtLabel?: string | null;
}

function formatPrice(cents: number, currency = "DOP"): string {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/** Fila de detalle (etiqueta a la izquierda, valor a la derecha). */
function detailRow(label: string, value: string, accent = false): string {
  return `<tr>
    <td style="padding:11px 0;border-bottom:1px solid #edf1f7;font-size:13px;color:#7a8899;">${label}</td>
    <td style="padding:11px 0;border-bottom:1px solid #edf1f7;text-align:right;font-size:13px;font-weight:600;color:${accent ? "#1e90ff" : "#0d1b2e"};">${value}</td>
  </tr>`;
}

export function paymentConfirmedEmailHtml(
  data: PaymentConfirmedEmailData,
): string {
  const {
    name,
    referenceNumber,
    amountCents,
    currency = "DOP",
    description,
    methodLabel,
    paidAtLabel,
  } = data;
  const amount = formatPrice(amountCents, currency);
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>Pago confirmado — Buxxep</title>
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

    .email-header img.logo {
      height: 54px;
      width: auto;
      display: inline-block;
      filter: drop-shadow(0 3px 14px rgba(0,0,0,0.30));
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

    .amount-box {
      background-color: #f0fbf5;
      border: 1px solid #cdecd9;
      border-radius: 14px;
      padding: 24px;
      margin-bottom: 24px;
      text-align: center;
    }

    .amount-box .amount-label {
      color: #4caf7d;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .amount-box .amount-value {
      color: #16a34a;
      font-size: 34px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .message-box {
      background-color: #f7f9fc;
      border: 1px solid #e4eaf2;
      border-radius: 14px;
      padding: 22px 26px;
      margin-bottom: 24px;
      text-align: left;
    }

    .message-box .greeting { color: #0d1b2e; font-size: 15px; font-weight: 600; margin-bottom: 8px; }
    .message-box .message-text { color: #5a6a7d; font-size: 14px; line-height: 1.75; }
    .message-box .message-text strong { color: #1e90ff; font-weight: 600; }

    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }

    .cta-button {
      display: inline-block;
      background-color: #1e90ff;
      color: #ffffff !important;
      text-decoration: none;
      padding: 15px 44px;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      font-family: 'Outfit', 'Segoe UI', Arial, sans-serif;
    }

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
      .amount-box .amount-value { font-size: 28px; }
      .cta-button { padding: 14px 32px; font-size: 14px; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">

      <!-- HEADER -->
      <div class="email-header">
        <img class="logo"
          src="https://res.cloudinary.com/dluvlekdz/image/upload/v1779596794/buxxep-transparent_rjze1q.png"
          alt="Buxxep" />
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

        <h1>¡Pago confirmado!</h1>
        <p class="subtitle">Gracias por tu pago, ya quedó registrado</p>

        <!-- Monto -->
        <div class="amount-box">
          <div class="amount-label">Monto pagado</div>
          <div class="amount-value">${amount}</div>
        </div>

        <!-- Mensaje -->
        <div class="message-box">
          <p class="greeting">Hola, ${name}</p>
          <p class="message-text">
            Confirmamos la recepción de tu pago en <strong>Buxxep</strong>.
            Gracias por tu confianza.
          </p>
        </div>

        <!-- Detalles -->
        <table class="details-table" role="presentation" cellpadding="0" cellspacing="0" border="0">
          ${detailRow("Referencia", referenceNumber, true)}
          ${detailRow("Método de pago", methodLabel)}
          ${paidAtLabel ? detailRow("Fecha", paidAtLabel) : ""}
          ${description ? detailRow("Descripción", description) : ""}
          ${detailRow("Estado", "Pagado")}
        </table>

        <a href="${SITE}/cuenta/pagos" class="cta-button">
          Ver mis pagos &rarr;
        </a>

      </div>

      <!-- FOOTER -->
      <div class="email-footer">

        <div class="social-links">
          <a href="https://www.instagram.com/buxxep/" class="social-icon" title="Instagram" target="_blank">
            <img src="https://img.icons8.com/ios/18/555e6d/instagram-new--v1.png"
              alt="Instagram" width="18" height="18" style="display:block;margin:10px auto 0;" />
          </a>
          <a href="${SITE}" class="social-icon" title="buxxep.com" target="_blank">
            <img src="https://img.icons8.com/ios/18/555e6d/globe--v1.png"
              alt="buxxep.com" width="18" height="18" style="display:block;margin:10px auto 0;" />
          </a>
        </div>

        <p class="footer-copy">
          REF: ${referenceNumber}<br />
          © ${year} Buxxep · República Dominicana
        </p>

      </div>

    </div>
  </div>
</body>
</html>`;
}

export function paymentConfirmedEmailText(
  data: PaymentConfirmedEmailData,
): string {
  const {
    name,
    referenceNumber,
    amountCents,
    currency = "DOP",
    description,
    methodLabel,
    paidAtLabel,
  } = data;
  const amount = formatPrice(amountCents, currency);
  const lines = [
    `BUXXEP — Pago confirmado`,
    ``,
    `Hola ${name},`,
    ``,
    `Confirmamos la recepción de tu pago.`,
    `Referencia: ${referenceNumber}`,
    `Monto: ${amount}`,
    `Método: ${methodLabel}`,
    paidAtLabel ? `Fecha: ${paidAtLabel}` : null,
    description ? `Descripción: ${description}` : null,
    `Estado: Pagado`,
    ``,
    `Ver mis pagos: ${SITE}/cuenta/pagos`,
    ``,
    `— BUXXEP`,
  ].filter(Boolean);
  return lines.join("\n");
}
