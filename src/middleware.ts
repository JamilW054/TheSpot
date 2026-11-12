// Runtime edge (formato `middleware.ts`): es el que OpenNext soporta oficialmente
// en Cloudflare Workers. Solo refresca la sesión de Supabase y protege /admin y /panel.
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/admin", "/panel"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export async function middleware(request: NextRequest) {
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

  // Guard de sesión del servidor: solo /admin requiere sesión (único login del
  // sitio). El catálogo, el carrito y el checkout de invitado no requieren auth.
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

  // Rol en el servidor, antes de renderizar: los Server Components de /admin
  // cargan datos de toda la plataforma, así que solo el admin (role 0) puede
  // llegar a renderizarlos. /panel admite tiendas (2) y admin; cada página de
  // /panel además exige tienda aprobada (`requirePanelStore`).
  const path = request.nextUrl.pathname;
  const onAdmin = path === "/admin" || path.startsWith("/admin/");
  const onPanel = path === "/panel" || path.startsWith("/panel/");
  if (user && (onAdmin || onPanel)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    const role = Number((profile as { role?: number | string } | null)?.role);
    const allowed = onAdmin ? role === 0 : role === 0 || role === 2;
    if (!allowed) {
      const target = new URL(role === 2 ? "/panel" : "/", request.url);
      const redirect = NextResponse.redirect(target);
      for (const cookie of supabaseResponse.cookies.getAll()) {
        redirect.cookies.set(cookie);
      }
      return redirect;
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
