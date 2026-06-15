export interface OtpEmailData {
  name: string;
  code: string;
  expiresInMinutes: number;
}

export function otpEmailHtml({
  name,
  code,
  expiresInMinutes,
}: OtpEmailData): string {
  const digits = code.split("");
  const digitBoxes = digits
    .map(
      (d) =>
        `<td style="padding:0 5px;"><div style="width:48px;height:64px;background:#0d0d0f;border:1.5px solid #3cc8f7;border-radius:8px;display:inline-block;text-align:center;line-height:64px;font-size:30px;font-weight:900;color:#3cc8f7;font-family:'Courier New',Courier,monospace;letter-spacing:0;">${d}</div></td>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Código de verificación — Buxxep</title>
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
            <a href="https://buxxep.vercel.app" style="text-decoration:none;display:inline-block;">
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
                    <div style="display:inline-block;width:64px;height:64px;background:#0d1f26;border:1.5px solid #3cc8f7;border-radius:16px;text-align:center;line-height:64px;font-size:28px;">🔐</div>
                    <div style="margin-top:12px;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#3cc8f7;">VERIFICACIÓN</div>
                  </td>
                </tr>
              </table>

              <!-- Headline -->
              <h1 style="margin:0 0 10px;font-size:26px;font-weight:900;color:#f4f4f5;text-align:center;letter-spacing:-0.5px;text-transform:uppercase;">
                Tu código secreto
              </h1>
              <p style="margin:0 0 36px;font-size:14px;color:#71717a;text-align:center;line-height:1.7;">
                Hola <strong style="color:#a1a1aa;">${name}</strong> — ingresa este código para continuar.
              </p>

              <!-- Code digits -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 36px;">
                <tr>${digitBoxes}</tr>
              </table>

              <!-- Timer bar -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="background:#0d1f26;border:1px solid #1a3d4a;border-radius:10px;padding:14px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:13px;color:#a1a1aa;">
                          ⏱ Expira en <strong style="color:#3cc8f7;">${expiresInMinutes} minutos</strong>
                        </td>
                        <td style="text-align:right;font-size:11px;color:#52525b;font-weight:600;letter-spacing:1px;text-transform:uppercase;">
                          Uso único
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <div style="height:1px;background:linear-gradient(90deg,transparent,#27272a,transparent);margin-bottom:24px;"></div>

              <p style="margin:0;font-size:12px;color:#52525b;text-align:center;line-height:1.7;">
                Si no solicitaste este código, ignora este mensaje.<br/>
                Nunca compartiremos tu código con nadie.
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
              <a href="https://buxxep.vercel.app/privacidad" style="color:#52525b;text-decoration:none;margin:0 8px;">Privacidad</a>
              <span style="color:#27272a;">·</span>
              <a href="https://buxxep.vercel.app/terminos" style="color:#52525b;text-decoration:none;margin:0 8px;">Términos</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

  <!-- Bottom cyan bar -->
  <div style="height:2px;background:linear-gradient(90deg,#3cc8f7 0%,#5dd4f9 50%,#0e7fa3 100%);"></div>

</body>
</html>`;
}

export function otpEmailText({
  name,
  code,
  expiresInMinutes,
}: OtpEmailData): string {
  return `BUXXEP — Código de verificación\n\nHola ${name},\n\nTu código es: ${code}\n\nExpira en ${expiresInMinutes} minutos. No lo compartas con nadie.\n\n— BUXXEP`;
}
