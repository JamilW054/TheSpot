import {
  assertAllowedImageMime,
  getR2Config,
  R2_MAX_IMAGE_BYTES,
  sanitizeUploadFilename,
  uploadImageToR2,
} from "@/lib/storage/r2";

export type UploadImageResult =
  | { ok: true; key: string; url: string | null; hint?: string }
  | { ok: false; status: number; error: string };

function keyPrefixForScope(scope: string, userId: string): string {
  if (scope === "catalog") return `catalog/${userId}`;
  if (scope === "categories") return `catalog/categories/${userId}`;
  return `uploads/${userId}`;
}

/**
 * Valida una imagen (MIME permitido, tamaño máximo) y la sube a R2 bajo un
 * prefijo derivado del `scope` y el usuario. Devuelve la key y la URL pública
 * si `R2_PUBLIC_BASE_URL` está configurada.
 */
export async function uploadUserImage(params: {
  userId: string;
  file: File;
  scope: string;
}): Promise<UploadImageResult> {
  const { userId, file, scope } = params;

  const cfg = getR2Config();
  if (!cfg) {
    return {
      ok: false,
      status: 503,
      error:
        "R2 no configurado. Define R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID y R2_SECRET_ACCESS_KEY.",
    };
  }

  let fallbackExt: string;
  try {
    fallbackExt = assertAllowedImageMime(
      file.type || "application/octet-stream",
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Tipo no permitido.";
    return { ok: false, status: 400, error: msg };
  }

  if (file.size > R2_MAX_IMAGE_BYTES) {
    return {
      ok: false,
      status: 400,
      error: `Archivo demasiado grande (máx ${R2_MAX_IMAGE_BYTES / 1024 / 1024} MB).`,
    };
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const safeName = sanitizeUploadFilename(file.name || "image", fallbackExt);
  const key = `${keyPrefixForScope(scope, userId)}/${Date.now()}-${safeName}`;

  try {
    const { key: storedKey, url } = await uploadImageToR2({
      config: cfg,
      key,
      body: buf,
      contentType:
        file.type || `image/${fallbackExt === "jpg" ? "jpeg" : fallbackExt}`,
    });
    return {
      ok: true,
      key: storedKey,
      url,
      hint:
        url == null
          ? "Configura R2_PUBLIC_BASE_URL (o NEXT_PUBLIC_R2_PUBLIC_BASE_URL) para obtener URL pública."
          : undefined,
    };
  } catch (e) {
    console.error("[R2 upload]", e);
    return {
      ok: false,
      status: 502,
      error: "No se pudo subir el archivo a R2.",
    };
  }
}
