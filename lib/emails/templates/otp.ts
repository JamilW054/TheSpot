export interface OtpEmailData {
  name: string;
  code: string;
  expiresInMinutes: number;
}

export function otpEmailHtml({ name, code, expiresInMinutes }: OtpEmailData): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Código de verificación — Buxxep</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo / Header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <a href="https://buxxep.vercel.app" style="text-decoration:none;">
                <span style="font-size:26px;font-weight:700;letter-spacing:-0.5px;color:#f4f4f5;">bux<span style="color:#3cc8f7;">xep</span></span>
              </a>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#18181b;border:1px solid #27272a;border-radius:12px;padding:40px 36px;">

              <!-- Icon -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <div style="display:inline-block;background-color:#0e3a4a;border-radius:50%;width:56px;height:56px;line-height:56px;text-align:center;font-size:26px;">🔐</div>
                  </td>
                </tr>
              </table>

              <!-- Title -->
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f4f4f5;text-align:center;">
                Código de verificación
              </h1>
              <p style="margin:0 0 28px;font-size:14px;color:#a1a1aa;text-align:center;line-height:1.6;">
                Hola <strong style="color:#f4f4f5;">${name}</strong>, usa el código de abajo para verificar tu identidad.
              </p>

              <!-- OTP Code Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background-color:#0e3a4a;border:2px solid #3cc8f7;border-radius:10px;padding:18px 40px;">
                      <span style="font-size:38px;font-weight:800;letter-spacing:10px;color:#3cc8f7;font-family:'Courier New',Courier,monospace;">${code}</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1c1420;border:1px solid #3d1f4a;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:14px 16px;">
                    <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.5;">
                      ⏱️ &nbsp;Este código expira en <strong style="color:#f4f4f5;">${expiresInMinutes} minutos</strong>. No lo compartas con nadie.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#71717a;text-align:center;line-height:1.6;">
                Si no solicitaste este código, puedes ignorar este mensaje.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0 0 8px;font-size:12px;color:#52525b;">
                © ${new Date().getFullYear()} Buxxep · República Dominicana
              </p>
              <p style="margin:0;font-size:12px;">
                <a href="https://buxxep.vercel.app/privacidad" style="color:#3cc8f7;text-decoration:none;">Privacidad</a>
                &nbsp;·&nbsp;
                <a href="https://buxxep.vercel.app/terminos" style="color:#3cc8f7;text-decoration:none;">Términos</a>
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

export function otpEmailText({ name, code, expiresInMinutes }: OtpEmailData): string {
  return `Hola ${name},

Tu código de verificación de Buxxep es: ${code}

Este código expira en ${expiresInMinutes} minutos. No lo compartas con nadie.

Si no solicitaste este código, puedes ignorar este mensaje.

— Buxxep`;
}
