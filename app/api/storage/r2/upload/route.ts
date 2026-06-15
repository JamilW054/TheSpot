import { NextResponse } from "next/server";
import { resolveUserRole } from "@/lib/auth/roles";
import {
  assertAllowedImageMime,
  getR2Config,
  R2_MAX_IMAGE_BYTES,
  sanitizeUploadFilename,
  uploadImageToR2,
} from "@/lib/storage/r2";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function requireAdminUpload(): boolean {
  const v = process.env.R2_UPLOAD_REQUIRE_ADMIN?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

/**
 * POST multipart/form-data con campo `file` (imagen PNG/JPEG/WebP, máx 5 MB).
 * Requiere sesión Supabase. Opcional: R2_UPLOAD_REQUIRE_ADMIN=true.
 * Campo opcional `scope`: `catalog` → prefijo catalog/{userId}; `categories` → catalog/categories/{userId}; otro → uploads/{userId}.
 */
export async function POST(request: Request) {
  const cfg = getR2Config();
  if (!cfg) {
    return NextResponse.json(
      {
        error:
          "R2 no configurado. Define R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID y R2_SECRET_ACCESS_KEY.",
      },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const pmsg = profileErr?.message ?? "";
  const pr =
    profileErr?.code === "42703" ||
    pmsg.includes("'role' column") ||
    pmsg.includes("schema cache")
      ? undefined
      : profile?.role;
  const role = resolveUserRole(
    user.email,
    typeof pr === "string" || typeof pr === "number" ? pr : undefined,
  );

  if (requireAdminUpload() && role !== "admin") {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const ct = request.headers.get("content-type") ?? "";
  if (!ct.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Usa multipart/form-data con el campo file." },
      { status: 400 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Falta el campo file." },
      { status: 400 },
    );
  }

  let fallbackExt: string;
  try {
    fallbackExt = assertAllowedImageMime(
      file.type || "application/octet-stream",
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Tipo no permitido.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (file.size > R2_MAX_IMAGE_BYTES) {
    return NextResponse.json(
      {
        error: `Archivo demasiado grande (máx ${R2_MAX_IMAGE_BYTES / 1024 / 1024} MB).`,
      },
      { status: 400 },
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const safeName = sanitizeUploadFilename(file.name || "image", fallbackExt);
  const scope = formData.get("scope")?.toString().trim() ?? "";
  const prefix =
    scope === "catalog"
      ? `catalog/${user.id}`
      : scope === "categories"
        ? `catalog/categories/${user.id}`
        : `uploads/${user.id}`;
  const key = `${prefix}/${Date.now()}-${safeName}`;

  try {
    const { key: storedKey, url } = await uploadImageToR2({
      config: cfg,
      key,
      body: buf,
      contentType:
        file.type || `image/${fallbackExt === "jpg" ? "jpeg" : fallbackExt}`,
    });
    return NextResponse.json({
      ok: true as const,
      key: storedKey,
      url,
      hint:
        url == null
          ? "Configura R2_PUBLIC_BASE_URL (o NEXT_PUBLIC_R2_PUBLIC_BASE_URL) para obtener URL pública."
          : undefined,
    });
  } catch (e) {
    console.error("[R2 upload]", e);
    return NextResponse.json(
      { error: "No se pudo subir el archivo a R2." },
      { status: 502 },
    );
  }
}
