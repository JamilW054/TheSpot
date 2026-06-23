import { SITE_URL as SITE } from "../site";

export interface ResetPasswordEmailData {
  name: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

export function resetPasswordEmailHtml({
  name,
  resetUrl,
  expiresInMinutes = 60,
}: ResetPasswordEmailData): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Restablecer contraseña — Buxxep</title>
</head>
<body style="margin:0;padding:0;background:#080808;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

  <!-- Top cyan bar -->
  <div style="height:4px;background:linear-gradient(90deg,#3cc8f7 0%,#5dd4f9 50%,#0e7fa3 100%);"></div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:48px 16px 56px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;">

        <!-- Logo -->
        <tr>
          <td align="center" style="padding-bottom:40px;">
            <a href="${SITE}" style="text-decoration:none;display:inline-block;">
              <div style="font-size:11px;font-weight:700;letter-spacing:6px;text-transform:uppercase;color:#3cc8f7;margin-bottom:6px;text-align:center;">STREETWEAR</div>
              <div style="font-size:36px;font-weight:900;letter-spacing:-1px;color:#f4f4f5;line-height:1;text-transform:uppercase;">BUX<span style="color:#3cc8f7;">XEP</span></div>
            </a>
          </td>
        </tr>

        <!-- Card -->
        <tr>
          <td style="background:#111113;border:1px solid #1e1e22;border-radius:16px;overflow:hidden;">

            <!-- Card top stripe -->
            <div style="height:3px;background:linear-gradient(90deg,transparent,#3cc8f7,transparent);"></div>

            <div style="padding:44px 40px 40px;">

              <!-- Icon + label -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <div style="display:inline-block;width:64px;height:64px;background:#1a1005;border:1.5px solid #f59e0b;border-radius:16px;text-align:center;line-height:64px;font-size:28px;">🔑</div>
                    <div style="margin-top:12px;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#f59e0b;">RESET DE CONTRASEÑA</div>
                  </td>
                </tr>
              </table>

              <!-- Headline -->
              <h1 style="margin:0 0 10px;font-size:26px;font-weight:900;color:#f4f4f5;text-align:center;letter-spacing:-0.5px;text-transform:uppercase;">
                Nueva contraseña
              </h1>
              <p style="margin:0 0 32px;font-size:14px;color:#71717a;text-align:center;line-height:1.7;">
                Hola <strong style="color:#a1a1aa;">${name}</strong> — recibimos una solicitud para restablecer la contraseña de tu cuenta.
              </p>

              <!-- CTA button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display:inline-block;background:#3cc8f7;color:#080808;font-size:13px;font-weight:800;text-decoration:none;padding:16px 44px;border-radius:8px;letter-spacing:2px;text-transform:uppercase;">
                      Restablecer contraseña →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Timer info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#1a1005;border:1px solid #2d1f00;border-radius:10px;padding:14px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:13px;color:#a1a1aa;">
                          ⏱ Link válido por <strong style="color:#f59e0b;">${expiresInMinutes} minutos</strong>
                        </td>
                        <td style="text-align:right;font-size:11px;color:#52525b;font-weight:600;letter-spacing:1px;text-transform:uppercase;">
                          Uso único
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Fallback URL -->
              <div style="background:#0d0d0f;border:1px solid #1e1e22;border-radius:10px;padding:14px 20px;margin-bottom:28px;">
                <div style="font-size:11px;font-weight:600;color:#52525b;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px;">¿No funciona el botón? Copia este enlace:</div>
                <div style="font-size:11px;color:#3cc8f7;word-break:break-all;font-family:'Courier New',Courier,monospace;">${resetUrl}</div>
              </div>

              <!-- Divider -->
              <div style="height:1px;background:linear-gradient(90deg,transparent,#27272a,transparent);margin-bottom:24px;"></div>

              <p style="margin:0;font-size:12px;color:#52525b;text-align:center;line-height:1.7;">
                Si no solicitaste esto, ignora este mensaje.<br/>
                Tu contraseña no cambiará a menos que uses el link.
              </p>

            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding-top:36px;">
            <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#3cc8f7;">BUXXEP</p>
            <p style="margin:0 0 10px;font-size:12px;color:#3d3d42;">República Dominicana · ${new Date().getFullYear()}</p>
            <p style="margin:0;font-size:12px;">
              <a href="${SITE}/privacidad" style="color:#52525b;text-decoration:none;margin:0 8px;">Privacidad</a>
              <span style="color:#27272a;">·</span>
              <a href="${SITE}/terminos" style="color:#52525b;text-decoration:none;margin:0 8px;">Términos</a>
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

export function resetPasswordEmailText({
  name,
  resetUrl,
  expiresInMinutes = 60,
}: ResetPasswordEmailData): string {
  return `BUXXEP — Restablecer contraseña\n\nHola ${name},\n\nUsa este link para crear una nueva contraseña (válido por ${expiresInMinutes} minutos):\n\n${resetUrl}\n\nSi no solicitaste esto, ignora este mensaje.\n\n— BUXXEP`;
}
