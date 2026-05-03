/**
 * Cloudflare R2 via API compatible con S3.
 *
 * Variables de entorno:
 * - R2_ACCOUNT_ID — ID de cuenta (ej. desde el dashboard R2).
 * - R2_BUCKET — nombre del bucket (ej. buxxep).
 * - R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY — token API R2 (permisos de escritura en el bucket).
 * - R2_ENDPOINT — opcional; por defecto `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
 *   (sin `/bucket` al final; el bucket va aparte en cada operación).
 * - R2_PUBLIC_BASE_URL o NEXT_PUBLIC_R2_PUBLIC_BASE_URL — URL pública del bucket (dominio r2.dev o custom),
 *   sin barra final; si falta, la API devuelve `url: null` y solo `key`.
 * - R2_UPLOAD_REQUIRE_ADMIN=true — solo usuarios con profiles.role = admin.
 */

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export interface R2Config {
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  /** Base para enlaces públicos de lectura (si el bucket/expuesto lo permite). */
  publicBaseUrl: string | null;
}

const IMAGE_TYPES = new Map<string, string>([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/jpg", "jpg"],
  ["image/webp", "webp"],
]);

export const R2_MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function getR2Config(): R2Config | null {
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim() ?? "";
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim() ?? "";
  const bucket = process.env.R2_BUCKET?.trim() || "buxxep";
  let endpoint = process.env.R2_ENDPOINT?.trim().replace(/\/$/, "") ?? "";
  if (!endpoint) {
    const accountId = process.env.R2_ACCOUNT_ID?.trim() ?? "";
    if (!accountId) return null;
    endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  }
  if (!accessKeyId || !secretAccessKey) return null;

  const pub =
    process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, "") ||
    "";
  return {
    endpoint,
    bucket,
    accessKeyId,
    secretAccessKey,
    publicBaseUrl: pub || null,
  };
}

export function createR2S3Client(cfg: R2Config): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: cfg.endpoint,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });
}

/** URL pública si configuraste dominio/r2.dev; si no, null. */
export function publicUrlForR2Key(cfg: R2Config, key: string): string | null {
  if (!cfg.publicBaseUrl) return null;
  const k = key.replace(/^\/+/, "");
  return `${cfg.publicBaseUrl}/${encodeURI(k)}`;
}

export function assertAllowedImageMime(contentType: string): string {
  const mime = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  const ext = IMAGE_TYPES.get(mime);
  if (!ext) {
    throw new Error(
      `Tipo no permitido (${mime || "vacío"}). Usa PNG, JPEG o WebP.`,
    );
  }
  return ext;
}

export function sanitizeUploadFilename(
  name: string,
  fallbackExt: string,
): string {
  const base = name
    .replace(/^.*[/\\]/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 120);
  if (!base || base === "_" || base === ".") return `upload.${fallbackExt}`;
  const hasExt = /\.[a-zA-Z0-9]{2,8}$/.test(base);
  return hasExt ? base : `${base}.${fallbackExt}`;
}

export async function uploadImageToR2(params: {
  config: R2Config;
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<{ key: string; url: string | null }> {
  const client = createR2S3Client(params.config);
  await client.send(
    new PutObjectCommand({
      Bucket: params.config.bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType.split(";")[0]?.trim(),
    }),
  );
  return {
    key: params.key,
    url: publicUrlForR2Key(params.config, params.key),
  };
}
