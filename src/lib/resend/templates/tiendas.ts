import { SITE_URL as SITE } from "../site";

/** Correos del ciclo de vida de una tienda del marketplace. */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function layout(
  title: string,
  bodyHtml: string,
  cta?: { label: string; href: string },
): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="padding:32px 16px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(145deg,#991B1B 0%,#DC2626 60%,#EF4444 100%);padding:28px;text-align:center;">
        <span style="font-family:Georgia,serif;font-size:24px;font-weight:700;color:#fff;letter-spacing:1px;">The Spot</span>
      </div>
      <div style="padding:32px 28px;color:#18181b;font-size:15px;line-height:1.6;">
        <h1 style="margin:0 0 16px;font-size:22px;">${escapeHtml(title)}</h1>
        ${bodyHtml}
        ${
          cta
            ? `<div style="text-align:center;margin-top:28px;"><a href="${cta.href}" style="display:inline-block;background:#DC2626;color:#fff;text-decoration:none;font-weight:700;padding:14px 32px;border-radius:999px;">${escapeHtml(cta.label)}</a></div>`
            : ""
        }
      </div>
      <div style="padding:16px;text-align:center;font-size:12px;color:#71717a;border-top:1px solid #f4f4f5;">© ${year} The Spot</div>
    </div>
  </div>
</body>
</html>`;
}

export interface StoreEmail {
  subject: string;
  html: string;
  text: string;
}

export function storeApplicationReceivedEmail(storeName: string): StoreEmail {
  const title = "Recibimos tu solicitud";
  return {
    subject: `Recibimos la solicitud de ${storeName} — The Spot`,
    html: layout(
      title,
      `<p>Gracias por registrar <strong>${escapeHtml(storeName)}</strong> en The Spot.</p>
       <p>Nuestro equipo revisará tu solicitud y te avisaremos por este correo cuando sea aprobada. Mientras tanto puedes entrar a tu panel para ver el estado.</p>`,
      { label: "Ver mi solicitud", href: `${SITE}/panel` },
    ),
    text: `Gracias por registrar ${storeName} en The Spot. Revisaremos tu solicitud y te avisaremos por correo. Estado: ${SITE}/panel`,
  };
}

export function storeApplicationAdminEmail(
  storeName: string,
  storeId: string,
  contact: string,
): StoreEmail {
  const title = "Nueva tienda por aprobar";
  return {
    subject: `🏪 Nueva solicitud de tienda: ${storeName}`,
    html: layout(
      title,
      `<p><strong>${escapeHtml(storeName)}</strong> solicitó vender en The Spot.</p>
       <p>Contacto: ${escapeHtml(contact)}</p>`,
      { label: "Revisar solicitud", href: `${SITE}/admin/tiendas/${storeId}` },
    ),
    text: `${storeName} solicitó vender en The Spot. Contacto: ${contact}. Revisar: ${SITE}/admin/tiendas/${storeId}`,
  };
}

export function storeApprovedEmail(storeName: string): StoreEmail {
  const title = "¡Tu tienda fue aprobada!";
  return {
    subject: `${storeName} ya está aprobada en The Spot`,
    html: layout(
      title,
      `<p><strong>${escapeHtml(storeName)}</strong> ya puede vender en The Spot.</p>
       <p>Entra a tu panel para agregar tus productos, tus cuentas bancarias y tus métodos de envío.</p>`,
      { label: "Ir a mi panel", href: `${SITE}/panel` },
    ),
    text: `${storeName} fue aprobada. Entra a tu panel: ${SITE}/panel`,
  };
}

export function storeRejectedEmail(
  storeName: string,
  reason: string | null,
): StoreEmail {
  const title = "Tu solicitud necesita cambios";
  return {
    subject: `Solicitud de ${storeName} — The Spot`,
    html: layout(
      title,
      `<p>Revisamos la solicitud de <strong>${escapeHtml(storeName)}</strong> y por ahora no fue aprobada.</p>
       ${reason ? `<p><strong>Motivo:</strong> ${escapeHtml(reason)}</p>` : ""}
       <p>Puedes corregir los datos desde tu panel y enviarla de nuevo.</p>`,
      { label: "Corregir solicitud", href: `${SITE}/panel/solicitud` },
    ),
    text: `La solicitud de ${storeName} no fue aprobada.${reason ? ` Motivo: ${reason}.` : ""} Corrígela en ${SITE}/panel/solicitud`,
  };
}

export function storeSuspendedEmail(
  storeName: string,
  reason: string | null,
): StoreEmail {
  const title = "Tu tienda fue suspendida";
  return {
    subject: `${storeName} fue suspendida — The Spot`,
    html: layout(
      title,
      `<p><strong>${escapeHtml(storeName)}</strong> fue suspendida y sus productos dejaron de mostrarse.</p>
       ${reason ? `<p><strong>Motivo:</strong> ${escapeHtml(reason)}</p>` : ""}
       <p>Si crees que es un error, contáctanos respondiendo este correo.</p>`,
    ),
    text: `${storeName} fue suspendida.${reason ? ` Motivo: ${reason}.` : ""}`,
  };
}
