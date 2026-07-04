import { SITE_URL as SITE } from "../site";

export interface BienvenidaEmailData {
  name: string;
  email: string;
}

export function bienvenidaEmailHtml({
  name,
  email,
}: BienvenidaEmailData): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Bienvenido a Buxxep</title>
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
            <a href="${SITE}" style="text-decoration:none;display:inline-block;">
              <div style="font-size:11px;font-weight:700;letter-spacing:6px;text-transform:uppercase;color:#3cc8f7;margin-bottom:6px;text-align:center;">STREETWEAR</div>
              <div style="font-size:36px;font-weight:900;letter-spacing:-1px;color:#f4f4f5;line-height:1;text-transform:uppercase;">BUX<span style="color:#3cc8f7;">XEP</span></div>
            </a>
          </td>
        </tr>

        <!-- Hero card -->
        <tr>
          <td style="background:#111113;border:1px solid #1e1e22;border-radius:16px;overflow:hidden;">

            <!-- Hero banner -->
            <div style="background:linear-gradient(135deg,#0d2533 0%,#111113 55%,#0d0d0f 100%);padding:48px 40px 44px;text-align:center;position:relative;">
              <div style="height:3px;background:linear-gradient(90deg,transparent,#3cc8f7,transparent);margin-bottom:36px;"></div>
              <div style="font-size:11px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:#3cc8f7;margin-bottom:14px;">BIENVENIDO AL CREW</div>
              <h1 style="margin:0 0 14px;font-size:32px;font-weight:900;color:#f4f4f5;line-height:1.1;letter-spacing:-0.5px;text-transform:uppercase;">
                Diseña tu estilo.<br/>
                <span style="color:#3cc8f7;">Hazlo tuyo.</span>
              </h1>
              <p style="margin:0;font-size:13px;color:#71717a;letter-spacing:2px;text-transform:uppercase;font-weight:600;">
                Moda atemporal · Alma moderna
              </p>
            </div>

            <!-- Body -->
            <div style="padding:36px 40px 40px;">

              <!-- Greeting -->
              <p style="margin:0 0 8px;font-size:18px;font-weight:800;color:#f4f4f5;letter-spacing:-0.3px;">
                Hey ${name} 👋
              </p>
              <p style="margin:0 0 28px;font-size:14px;color:#71717a;line-height:1.8;">
                Tu cuenta fue creada con <strong style="color:#a1a1aa;">${email}</strong>. Ya eres parte de Buxxep — la plataforma donde diseñas y compras ropa streetwear personalizada desde República Dominicana.
              </p>

              <!-- Divider -->
              <div style="height:1px;background:linear-gradient(90deg,transparent,#27272a,transparent);margin-bottom:28px;"></div>

              <!-- Features -->
              <div style="font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#3cc8f7;margin-bottom:18px;">LO QUE PUEDES HACER</div>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding:0 8px 12px 0;width:50%;vertical-align:top;">
                    <div style="background:#0d0d0f;border:1px solid #1e1e22;border-radius:10px;padding:18px 16px;">
                      <div style="font-size:22px;margin-bottom:8px;">🎨</div>
                      <div style="font-size:12px;font-weight:800;color:#f4f4f5;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Editor</div>
                      <div style="font-size:12px;color:#52525b;line-height:1.5;">Crea diseños únicos con nuestras herramientas.</div>
                    </div>
                  </td>
                  <td style="padding:0 0 12px 8px;width:50%;vertical-align:top;">
                    <div style="background:#0d0d0f;border:1px solid #1e1e22;border-radius:10px;padding:18px 16px;">
                      <div style="font-size:22px;margin-bottom:8px;">👕</div>
                      <div style="font-size:12px;font-weight:800;color:#f4f4f5;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Catálogo</div>
                      <div style="font-size:12px;color:#52525b;line-height:1.5;">Camisetas, hoodies y más streetwear.</div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 8px 0 0;width:50%;vertical-align:top;">
                    <div style="background:#0d0d0f;border:1px solid #1e1e22;border-radius:10px;padding:18px 16px;">
                      <div style="font-size:22px;margin-bottom:8px;">🚀</div>
                      <div style="font-size:12px;font-weight:800;color:#f4f4f5;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Entrega</div>
                      <div style="font-size:12px;color:#52525b;line-height:1.5;">Llevamos tu pedido a todo RD.</div>
                    </div>
                  </td>
                  <td style="padding:0 0 0 8px;width:50%;vertical-align:top;">
                    <div style="background:#0d0d0f;border:1px solid #1e1e22;border-radius:10px;padding:18px 16px;">
                      <div style="font-size:22px;margin-bottom:8px;">🔒</div>
                      <div style="font-size:12px;font-weight:800;color:#f4f4f5;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Seguro</div>
                      <div style="font-size:12px;color:#52525b;line-height:1.5;">Pagos procesados por Azul.</div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${SITE}/catalogo" style="display:inline-block;background:#3cc8f7;color:#080808;font-size:14px;font-weight:800;text-decoration:none;padding:15px 44px;border-radius:8px;letter-spacing:2px;text-transform:uppercase;">
                      Explorar catálogo →
                    </a>
                  </td>
                </tr>
              </table>

            </div>
          </td>
        </tr>

        <!-- Social -->
        <tr>
          <td align="center" style="padding-top:28px;">
            <a href="https://instagram.com/buxxep" style="display:inline-block;background:#111113;border:1px solid #1e1e22;border-radius:8px;padding:10px 20px;text-decoration:none;">
              <span style="font-size:12px;color:#71717a;">Síguenos en Instagram </span>
              <span style="font-size:12px;color:#3cc8f7;font-weight:700;">@buxxep</span>
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding-top:28px;">
            <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#3cc8f7;">BUXXEP</p>
            <p style="margin:0 0 10px;font-size:12px;color:#3d3d42;">República Dominicana · ${new Date().getFullYear()}</p>
            <p style="margin:0;font-size:12px;">
              <a href="${SITE}/privacidad" style="color:#52525b;text-decoration:none;margin:0 8px;">Privacidad</a>
              <span style="color:#27272a;">·</span>
              <a href="${SITE}/terminos" style="color:#52525b;text-decoration:none;margin:0 8px;">Términos</a>
              <span style="color:#27272a;">·</span>
              <a href="${SITE}/devoluciones" style="color:#52525b;text-decoration:none;margin:0 8px;">Devoluciones</a>
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

export function bienvenidaEmailText({
  name,
  email,
}: BienvenidaEmailData): string {
  return `BUXXEP — Bienvenido al crew\n\nHey ${name},\n\nTu cuenta fue creada con: ${email}\n\nExplora el catálogo: ${SITE}/catalogo\n\n— BUXXEP · República Dominicana`;
}
