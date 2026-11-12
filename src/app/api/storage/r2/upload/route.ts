import { NextResponse } from "next/server";
import { ROLE } from "@/lib/auth/roles";
import { getSessionUserWithRole } from "@/lib/auth/session-user";
import { getStoreByOwner } from "@/lib/auth/store-actor";
import { uploadUserImage } from "@/lib/storage/upload-image-service";

export const runtime = "nodejs";

/**
 * POST multipart/form-data con campo `file` (imagen PNG/JPEG/WebP, máx 5 MB).
 * Requiere sesión Supabase. Opcional: R2_UPLOAD_REQUIRE_ADMIN=true.
 * Campo opcional `scope`: `catalog` → prefijo catalog/{userId}; `categories` → catalog/categories/{userId}; otro → uploads/{userId}.
 */
export async function POST(request: Request) {
  // Suben imágenes el admin y las tiendas aprobadas (no hay cuentas de cliente).
  const session = await getSessionUserWithRole();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (session.role !== ROLE.ADMIN) {
    // Dueños de tienda: solo con la tienda aprobada (o suspendida, para su perfil).
    const store =
      session.role === ROLE.SELLER ? await getStoreByOwner(session.user.id) : null;
    if (!store || (store.status !== "approved" && store.status !== "suspended")) {
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    }
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
