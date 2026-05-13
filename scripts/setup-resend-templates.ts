/**
 * Run once to create & publish all Buxxep email templates in Resend.
 * Usage: bun scripts/setup-resend-templates.ts
 *
 * Prints the template IDs — copy them to your .env as RESEND_TPL_*
 */
import { Resend } from "resend";

const key = process.env.RESEND_API_KEY;
if (!key) {
  console.error("❌  RESEND_API_KEY not set");
  process.exit(1);
}

const resend = new Resend(key);
const YEAR = new Date().getFullYear();

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const TOP_BAR =
  `<div style="height:4px;background:linear-gradient(90deg,#3cc8f7 0%,#5dd4f9 50%,#0e7fa3 100%);"></div>`;
const BOT_BAR =
  `<div style="height:2px;background:linear-gradient(90deg,#3cc8f7 0%,#5dd4f9 50%,#0e7fa3 100%);"></div>`;

const LOGO = `
  <tr>
    <td align="center" style="padding-bottom:40px;">
      <a href="https://buxxep.vercel.app" style="text-decoration:none;display:inline-block;">
        <div style="font-size:11px;font-weight:700;letter-spacing:6px;text-transform:uppercase;color:#3cc8f7;margin-bottom:6px;text-align:center;">STREETWEAR</div>
        <div style="font-size:36px;font-weight:900;letter-spacing:-1px;color:#f4f4f5;line-height:1;text-transform:uppercase;">BUX<span style="color:#3cc8f7;">XEP</span></div>
      </a>
    </td>
  </tr>`;

const FOOTER = `
  <tr>
    <td align="center" style="padding-top:36px;">
      <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#3cc8f7;">BUXXEP</p>
      <p style="margin:0 0 10px;font-size:12px;color:#3d3d42;">República Dominicana · ${YEAR}</p>
      <p style="margin:0;font-size:12px;">
        <a href="https://buxxep.vercel.app/privacidad" style="color:#52525b;text-decoration:none;margin:0 8px;">Privacidad</a>
        <span style="color:#27272a;">·</span>
        <a href="https://buxxep.vercel.app/terminos" style="color:#52525b;text-decoration:none;margin:0 8px;">Términos</a>
      </p>
    </td>
  </tr>`;

function wrap(inner: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#080808;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
${TOP_BAR}
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:48px 16px 56px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;">
      ${LOGO}
      ${inner}
      ${FOOTER}
    </table>
  </td></tr>
</table>
${BOT_BAR}
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Template HTMLs — use {{variable}} syntax for Resend
// ─────────────────────────────────────────────────────────────────────────────

const otpHtml = wrap(`
  <tr>
    <td style="background:#111113;border:1px solid #1e1e22;border-radius:16px;overflow:hidden;">
      <div style="height:3px;background:linear-gradient(90deg,transparent,#3cc8f7,transparent);"></div>
      <div style="padding:44px 40px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <div style="display:inline-block;width:64px;height:64px;background:#0d1f26;border:1.5px solid #3cc8f7;border-radius:16px;text-align:center;line-height:64px;font-size:28px;">🔐</div>
              <div style="margin-top:12px;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#3cc8f7;">VERIFICACIÓN</div>
            </td>
          </tr>
        </table>
        <h1 style="margin:0 0 10px;font-size:26px;font-weight:900;color:#f4f4f5;text-align:center;letter-spacing:-0.5px;text-transform:uppercase;">Tu código secreto</h1>
        <p style="margin:0 0 32px;font-size:14px;color:#71717a;text-align:center;line-height:1.7;">
          Hola <strong style="color:#a1a1aa;">{{name}}</strong> — ingresa este código para continuar.
        </p>
        <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
          <tr>
            <td>
              <div style="background:#0d0d0f;border:2px solid #3cc8f7;border-radius:12px;padding:20px 48px;text-align:center;">
                <span style="font-size:42px;font-weight:900;color:#3cc8f7;font-family:'Courier New',Courier,monospace;letter-spacing:12px;">{{code}}</span>
              </div>
            </td>
          </tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr>
            <td style="background:#0d1f26;border:1px solid #1a3d4a;border-radius:10px;padding:14px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:13px;color:#a1a1aa;">⏱ Expira en <strong style="color:#3cc8f7;">{{expires_in_minutes}} minutos</strong></td>
                  <td style="text-align:right;font-size:11px;color:#52525b;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Uso único</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <div style="height:1px;background:linear-gradient(90deg,transparent,#27272a,transparent);margin-bottom:24px;"></div>
        <p style="margin:0;font-size:12px;color:#52525b;text-align:center;line-height:1.7;">
          Si no solicitaste este código, ignora este mensaje.<br/>Nunca compartiremos tu código con nadie.
        </p>
      </div>
    </td>
  </tr>`);

const bienvenidaHtml = wrap(`
  <tr>
    <td style="background:#111113;border:1px solid #1e1e22;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#0d2533 0%,#111113 55%,#0d0d0f 100%);padding:48px 40px 44px;text-align:center;">
        <div style="height:3px;background:linear-gradient(90deg,transparent,#3cc8f7,transparent);margin-bottom:36px;"></div>
        <div style="font-size:11px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:#3cc8f7;margin-bottom:14px;">BIENVENIDO AL CREW</div>
        <h1 style="margin:0 0 14px;font-size:32px;font-weight:900;color:#f4f4f5;line-height:1.1;letter-spacing:-0.5px;text-transform:uppercase;">
          Diseña tu estilo.<br/><span style="color:#3cc8f7;">Hazlo tuyo.</span>
        </h1>
        <p style="margin:0;font-size:13px;color:#71717a;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Moda atemporal · Alma moderna</p>
      </div>
      <div style="padding:36px 40px 40px;">
        <p style="margin:0 0 8px;font-size:18px;font-weight:800;color:#f4f4f5;letter-spacing:-0.3px;">Hey {{name}} 👋</p>
        <p style="margin:0 0 28px;font-size:14px;color:#71717a;line-height:1.8;">
          Tu cuenta fue creada con <strong style="color:#a1a1aa;">{{email}}</strong>. Ya eres parte de Buxxep — diseña y compra ropa streetwear personalizada desde República Dominicana.
        </p>
        <div style="height:1px;background:linear-gradient(90deg,transparent,#27272a,transparent);margin-bottom:28px;"></div>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
          <tr>
            <td style="padding:0 8px 12px 0;width:50%;vertical-align:top;">
              <div style="background:#0d0d0f;border:1px solid #1e1e22;border-radius:10px;padding:18px 16px;">
                <div style="font-size:22px;margin-bottom:8px;">🎨</div>
                <div style="font-size:12px;font-weight:800;color:#f4f4f5;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Editor</div>
                <div style="font-size:12px;color:#52525b;line-height:1.5;">Crea diseños únicos.</div>
              </div>
            </td>
            <td style="padding:0 0 12px 8px;width:50%;vertical-align:top;">
              <div style="background:#0d0d0f;border:1px solid #1e1e22;border-radius:10px;padding:18px 16px;">
                <div style="font-size:22px;margin-bottom:8px;">👕</div>
                <div style="font-size:12px;font-weight:800;color:#f4f4f5;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Catálogo</div>
                <div style="font-size:12px;color:#52525b;line-height:1.5;">Camisetas, hoodies y más.</div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 8px 0 0;width:50%;vertical-align:top;">
              <div style="background:#0d0d0f;border:1px solid #1e1e22;border-radius:10px;padding:18px 16px;">
                <div style="font-size:22px;margin-bottom:8px;">🚀</div>
                <div style="font-size:12px;font-weight:800;color:#f4f4f5;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Entrega</div>
                <div style="font-size:12px;color:#52525b;line-height:1.5;">A todo RD.</div>
              </div>
            </td>
            <td style="padding:0 0 0 8px;width:50%;vertical-align:top;">
              <div style="background:#0d0d0f;border:1px solid #1e1e22;border-radius:10px;padding:18px 16px;">
                <div style="font-size:22px;margin-bottom:8px;">🔒</div>
                <div style="font-size:12px;font-weight:800;color:#f4f4f5;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Seguro</div>
                <div style="font-size:12px;color:#52525b;line-height:1.5;">Pagos por Azul.</div>
              </div>
            </td>
          </tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center">
              <a href="https://buxxep.vercel.app/catalogo" style="display:inline-block;background:#3cc8f7;color:#080808;font-size:14px;font-weight:800;text-decoration:none;padding:15px 44px;border-radius:8px;letter-spacing:2px;text-transform:uppercase;">
                Explorar catálogo →
              </a>
            </td>
          </tr>
        </table>
      </div>
    </td>
  </tr>`);

const resetPasswordHtml = wrap(`
  <tr>
    <td style="background:#111113;border:1px solid #1e1e22;border-radius:16px;overflow:hidden;">
      <div style="height:3px;background:linear-gradient(90deg,transparent,#3cc8f7,transparent);"></div>
      <div style="padding:44px 40px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <div style="display:inline-block;width:64px;height:64px;background:#1a1005;border:1.5px solid #f59e0b;border-radius:16px;text-align:center;line-height:64px;font-size:28px;">🔑</div>
              <div style="margin-top:12px;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#f59e0b;">RESET DE CONTRASEÑA</div>
            </td>
          </tr>
        </table>
        <h1 style="margin:0 0 10px;font-size:26px;font-weight:900;color:#f4f4f5;text-align:center;letter-spacing:-0.5px;text-transform:uppercase;">Nueva contraseña</h1>
        <p style="margin:0 0 32px;font-size:14px;color:#71717a;text-align:center;line-height:1.7;">
          Hola <strong style="color:#a1a1aa;">{{name}}</strong> — recibimos una solicitud para restablecer tu contraseña.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr>
            <td align="center">
              <a href="{{reset_url}}" style="display:inline-block;background:#3cc8f7;color:#080808;font-size:13px;font-weight:800;text-decoration:none;padding:16px 44px;border-radius:8px;letter-spacing:2px;text-transform:uppercase;">
                Restablecer contraseña →
              </a>
            </td>
          </tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr>
            <td style="background:#1a1005;border:1px solid #2d1f00;border-radius:10px;padding:14px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:13px;color:#a1a1aa;">⏱ Link válido por <strong style="color:#f59e0b;">{{expires_in_minutes}} minutos</strong></td>
                  <td style="text-align:right;font-size:11px;color:#52525b;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Uso único</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <div style="background:#0d0d0f;border:1px solid #1e1e22;border-radius:10px;padding:14px 20px;margin-bottom:28px;">
          <div style="font-size:11px;font-weight:600;color:#52525b;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px;">¿No funciona el botón? Copia este enlace:</div>
          <div style="font-size:11px;color:#3cc8f7;word-break:break-all;font-family:'Courier New',Courier,monospace;">{{reset_url}}</div>
        </div>
        <div style="height:1px;background:linear-gradient(90deg,transparent,#27272a,transparent);margin-bottom:24px;"></div>
        <p style="margin:0;font-size:12px;color:#52525b;text-align:center;line-height:1.7;">
          Si no solicitaste esto, ignora este mensaje.<br/>Tu contraseña no cambiará a menos que uses el link.
        </p>
      </div>
    </td>
  </tr>`);

// ─────────────────────────────────────────────────────────────────────────────
// Create & publish
// ─────────────────────────────────────────────────────────────────────────────

async function createAndPublish(
  name: string,
  subject: string,
  html: string,
  variables: { key: string; type: "string" | "number"; fallbackValue?: string | number | null }[],
) {
  console.log(`\n→ Creating "${name}"…`);
  const created = await resend.templates.create({
    name,
    subject,
    html,
    variables: variables.map((v) =>
      v.type === "number"
        ? { key: v.key, type: "number" as const, fallbackValue: (v.fallbackValue as number | null | undefined) }
        : { key: v.key, type: "string" as const, fallbackValue: (v.fallbackValue as string | null | undefined) },
    ),
  });

  if (created.error || !created.data?.id) {
    console.error(`  ❌  ${created.error?.message ?? "Unknown error"}`);
    return null;
  }

  const id = created.data.id;
  const published = await resend.templates.publish(id);
  if (published.error) {
    console.warn(`  ⚠️  Created (${id}) but publish failed: ${published.error.message}`);
  } else {
    console.log(`  ✅  ID: ${id}`);
  }
  return id;
}

const ids: Record<string, string | null> = {};

ids.otp = await createAndPublish(
  "Buxxep — OTP Verificación",
  "{{code}} — Tu código de verificación Buxxep",
  otpHtml,
  [
    { key: "name", type: "string", fallbackValue: "Usuario" },
    { key: "code", type: "string", fallbackValue: "------" },
    { key: "expires_in_minutes", type: "number", fallbackValue: 10 },
  ],
);

ids.bienvenida = await createAndPublish(
  "Buxxep — Bienvenida",
  "¡Bienvenido a Buxxep! 🎨",
  bienvenidaHtml,
  [
    { key: "name", type: "string", fallbackValue: "Usuario" },
    { key: "email", type: "string", fallbackValue: "" },
  ],
);

ids.resetPassword = await createAndPublish(
  "Buxxep — Reset Password",
  "Restablece tu contraseña — Buxxep",
  resetPasswordHtml,
  [
    { key: "name", type: "string", fallbackValue: "Usuario" },
    { key: "reset_url", type: "string", fallbackValue: "https://buxxep.vercel.app" },
    { key: "expires_in_minutes", type: "number", fallbackValue: 60 },
  ],
);

console.log("\n─────────────────────────────────────────");
console.log("Add these to your .env:\n");
if (ids.otp) console.log(`RESEND_TPL_OTP=${ids.otp}`);
if (ids.bienvenida) console.log(`RESEND_TPL_BIENVENIDA=${ids.bienvenida}`);
if (ids.resetPassword) console.log(`RESEND_TPL_RESET_PASSWORD=${ids.resetPassword}`);
console.log("─────────────────────────────────────────\n");
