import { NextResponse } from "next/server";
import { ROLE } from "@/lib/auth/roles";
import { getSessionUserWithRole } from "@/lib/auth/session-user";
import { getR2Config } from "@/lib/storage/r2";
import { uploadUserImage } from "@/lib/storage/upload-image-service";

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
  if (!getR2Config()) {
    return NextResponse.json(
      {
        error:
          "R2 no configurado. Define R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID y R2_SECRET_ACCESS_KEY.",
      },
      { status: 503 },
    );
  }

  const session = await getSessionUserWithRole();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (requireAdminUpload() && session.role !== ROLE.ADMIN) {
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

  const scope = formData.get("scope")?.toString().trim() ?? "";
  const result = await uploadUserImage({
    userId: session.user.id,
    file,
    scope,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }
  return NextResponse.json({
    ok: true as const,
    key: result.key,
    url: result.url,
    hint: result.hint,
  });
}
