"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CartNavLink } from "@/components/layout/CartNavLink";
import { Button } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <title>Menú</title>
      <path d="M4 5h16" />
      <path d="M4 12h16" />
      <path d="M4 19h16" />
    </svg>
  );
}

export interface NavbarUser {
  name?: string;
  email?: string;
}

export interface NavbarProps {
  /** Enlace principal (logo) */
  homeHref: string;
  /** Texto del logo/título */
  homeLabel: string;
  /** Título corto en móvil (breakpoint sm y superior usa homeLabel) */
  homeLabelShort?: string;
  /** Ocultar enlace al carrito (p. ej. en área admin) */
  hideCart?: boolean;
  /** Usuario (opcional; si no se pasa, se usa AuthContext) */
  user?: NavbarUser | null;
  /** Callback cerrar sesión (opcional; si no se pasa, se usa AuthContext.logout + redirect) */
  onLogout?: () => void;
  /** Si está definido, se muestra el botón de menú (móvil) */
  onMenuClick?: () => void;
}

export function Navbar({
  homeHref,
  homeLabel,
  homeLabelShort,
  hideCart = false,
  user: userProp,
  onLogout: onLogoutProp,
  onMenuClick,
}: NavbarProps) {
  const router = useRouter();
  const auth = useAuth();
  const user = userProp ?? auth.user;
  const sessionRole = auth.user?.role;
  const onLogout =
    onLogoutProp ??
    (() => {
      auth.logout();
      router.push("/login");
    });

  const displayName = user?.name ?? user?.email ?? null;

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/95 px-3 supports-backdrop-filter:bg-background/60 sm:gap-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Abrir menú"
          >
            <MenuIcon />
          </button>
        ) : null}
        <Link
          href={homeHref}
          className="min-w-0 truncate rounded-md font-semibold text-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {homeLabelShort ? (
            <>
              <span className="sm:hidden">{homeLabelShort}</span>
              <span className="hidden sm:inline">{homeLabel}</span>
            </>
          ) : (
            homeLabel
          )}
        </Link>
      </div>
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
        {!hideCart ? <CartNavLink /> : null}
        {sessionRole === "admin" ? (
          <Link
            href="/admin"
            className="hidden text-sm font-medium text-primary underline-offset-4 hover:underline sm:inline shrink-0"
          >
            Admin
          </Link>
        ) : null}
        {user ? (
          <>
            {displayName ? (
              <span
                className="hidden text-sm text-muted-foreground truncate sm:inline max-w-[200px]"
                title={displayName}
              >
                Hola, {displayName}
              </span>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="shrink-0"
            >
              <span className="sm:hidden">Salir</span>
              <span className="hidden sm:inline">Cerrar sesión</span>
            </Button>
          </>
        ) : (
          <Link href="/login">
            <Button type="button" variant="outline" size="sm">
              <span className="sm:hidden">Entrar</span>
              <span className="hidden sm:inline">Iniciar sesión</span>
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
