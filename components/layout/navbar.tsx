"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CartNavLink } from "@/components/layout/CartNavLink";
import { Button } from "@/components/ui";
import { ROLE } from "@/lib/auth/roles";
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

  const initials = displayName
    ? displayName
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("")
    : "?";

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/95 px-3 backdrop-blur-sm sm:gap-4 sm:px-5">
      <div className="flex min-w-0 items-center gap-2">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            className="md:hidden -ml-1 rounded-[10px] p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Abrir menú"
          >
            <MenuIcon />
          </button>
        ) : null}
        <Link
          href={homeHref}
          className="min-w-0 truncate rounded-[10px] text-[15px] font-semibold tracking-tight text-primary hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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

      <div className="flex min-w-0 items-center gap-2">
        {!hideCart ? <CartNavLink /> : null}
        {sessionRole === ROLE.ADMIN && !hideCart ? (
          <Link
            href="/admin"
            className="hidden text-sm font-medium text-primary underline-offset-4 hover:underline sm:inline shrink-0"
          >
            Admin
          </Link>
        ) : null}
        {user ? (
          <div className="flex items-center gap-2">
            {displayName ? (
              <span
                className="hidden max-w-40 truncate text-sm text-muted-foreground sm:inline"
                title={displayName}
              >
                {displayName}
              </span>
            ) : null}
            <button
              type="button"
              onClick={onLogout}
              title="Cerrar sesión"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[12px] font-semibold text-primary transition-colors hover:bg-primary/25"
            >
              {initials}
            </button>
          </div>
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
