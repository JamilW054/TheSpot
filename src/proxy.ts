import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import {
  ACCOUNT_EXPIRED_MESSAGE,
  resolveAccountStatus,
} from "@/lib/auth/account-status";

const PROTECTED_PREFIXES = [
  "/admin",
  "/editor",
  "/guia",
  "/lineas",
  "/recursos",
  "/soporte",
  // Compra y lista de deseos: requieren sesión (los productos se ven sin login).
  "/carrito",
  "/favoritos",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresca el token si está por vencer. No remover — crítico para SSR y Server Actions.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Guard de sesión del servidor: con una sesión válida, resuelve el estado de
  // eliminación de la cuenta. Restaura si está dentro de los 30 días; si venció,
  // cierra la sesión de inmediato y bloquea el acceso. Esta verificación DEBE ser
  // server-side (no confiar en el cliente). resolveAccountStatus es fail-open.
  if (user) {
    const status = await resolveAccountStatus(user.id);
    if (status === "expired") {
      await supabase.auth.signOut();
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", ACCOUNT_EXPIRED_MESSAGE);
      const redirect = NextResponse.redirect(loginUrl);
      // Copia las cookies de cierre de sesión que setAll dejó en supabaseResponse.
      for (const cookie of supabaseResponse.cookies.getAll()) {
        redirect.cookies.set(cookie);
      }
      return redirect;
    }
  }

  // Redirige al login si la ruta requiere auth y no hay sesión válida.
  if (!user && isProtectedPath(request.nextUrl.pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    const redirect = NextResponse.redirect(loginUrl);
    // Conserva las cookies que Supabase pudo refrescar en este request: si se
    // crea una respuesta nueva sin copiarlas, se pierde la sesión y el usuario
    // entra en bucles de logout. (Requisito documentado de @supabase/ssr.)
    for (const cookie of supabaseResponse.cookies.getAll()) {
      redirect.cookies.set(cookie);
    }
    return redirect;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
