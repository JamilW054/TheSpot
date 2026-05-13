export interface BienvenidaEmailData {
  name: string;
  email: string;
}

export function bienvenidaEmailHtml({ name, email }: BienvenidaEmailData): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bienvenido a Buxxep</title>
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

          <!-- Hero Banner -->
          <tr>
            <td style="background:linear-gradient(135deg,#0e3a4a 0%,#18181b 60%,#0a0a0a 100%);border-radius:12px 12px 0 0;padding:40px 36px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#3cc8f7;">Bienvenido</p>
              <h1 style="margin:0 0 12px;font-size:28px;font-weight:800;color:#f4f4f5;line-height:1.2;">
                Diseña tu estilo,<br/>
                <span style="color:#3cc8f7;">hazlo tuyo.</span>
              </h1>
              <p style="margin:0;font-size:14px;color:#a1a1aa;line-height:1.6;">
                Streetwear personalizado · República Dominicana
              </p>
            </td>
          </tr>

          <!-- Card Body -->
          <tr>
            <td style="background-color:#18181b;border:1px solid #27272a;border-top:none;border-radius:0 0 12px 12px;padding:32px 36px 36px;">

              <p style="margin:0 0 20px;font-size:15px;color:#f4f4f5;line-height:1.7;">
                Hola <strong>${name}</strong> 👋
              </p>
              <p style="margin:0 0 20px;font-size:14px;color:#a1a1aa;line-height:1.7;">
                Tu cuenta en Buxxep ha sido creada exitosamente con el correo <strong style="color:#f4f4f5;">${email}</strong>. Ahora puedes explorar el catálogo, usar el editor de diseño y hacer pedidos personalizados.
              </p>

              <!-- Features grid -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="width:50%;padding:0 6px 12px 0;vertical-align:top;">
                    <div style="background-color:#0c0c0e;border:1px solid #27272a;border-radius:8px;padding:16px;">
                      <p style="margin:0 0 6px;font-size:18px;">🎨</p>
                      <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#f4f4f5;">Editor de diseño</p>
                      <p style="margin:0;font-size:12px;color:#71717a;line-height:1.5;">Crea diseños únicos con nuestras herramientas.</p>
                    </div>
                  </td>
                  <td style="width:50%;padding:0 0 12px 6px;vertical-align:top;">
                    <div style="background-color:#0c0c0e;border:1px solid #27272a;border-radius:8px;padding:16px;">
                      <p style="margin:0 0 6px;font-size:18px;">👕</p>
                      <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#f4f4f5;">Catálogo completo</p>
                      <p style="margin:0;font-size:12px;color:#71717a;line-height:1.5;">Camisetas, hoodies, y más streetwear.</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="width:50%;padding:0 6px 0 0;vertical-align:top;">
                    <div style="background-color:#0c0c0e;border:1px solid #27272a;border-radius:8px;padding:16px;">
                      <p style="margin:0 0 6px;font-size:18px;">🚀</p>
                      <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#f4f4f5;">Entrega rápida</p>
                      <p style="margin:0;font-size:12px;color:#71717a;line-height:1.5;">Llevamos tu pedido donde estés en RD.</p>
                    </div>
                  </td>
                  <td style="width:50%;padding:0 0 0 6px;vertical-align:top;">
                    <div style="background-color:#0c0c0e;border:1px solid #27272a;border-radius:8px;padding:16px;">
                      <p style="margin:0 0 6px;font-size:18px;">🔒</p>
                      <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#f4f4f5;">Pago seguro</p>
                      <p style="margin:0;font-size:12px;color:#71717a;line-height:1.5;">Procesado por Azul con cifrado total.</p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:20px;">
                    <a href="https://buxxep.vercel.app/catalogo" style="display:inline-block;background-color:#3cc8f7;color:#0a0a0a;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:8px;letter-spacing:0.3px;">
                      Explorar catálogo →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#52525b;text-align:center;line-height:1.6;">
                ¿Tienes preguntas? Escríbenos en Instagram
                <a href="https://instagram.com/buxxep" style="color:#3cc8f7;text-decoration:none;">@buxxep</a>
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

export function bienvenidaEmailText({ name, email }: BienvenidaEmailData): string {
  return `¡Bienvenido a Buxxep, ${name}!

Tu cuenta ha sido creada con el correo: ${email}

Ahora puedes:
- Explorar el catálogo de streetwear
- Crear diseños con nuestro editor
- Hacer pedidos personalizados

Visita: https://buxxep.vercel.app/catalogo

— Buxxep · República Dominicana`;
}
