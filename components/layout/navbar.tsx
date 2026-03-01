"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui";

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
  user: userProp,
  onLogout: onLogoutProp,
  onMenuClick,
}: NavbarProps) {
  const router = useRouter();
  const auth = useAuth();
  const user = userProp ?? auth.user;
  const onLogout =
    onLogoutProp ??
    (() => {
      auth.logout();
      router.push("/login");
    });

  const displayName = user?.name ?? user?.email ?? null;

  return (
    <header
      className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 supports-backdrop-filter:bg-background/60 sm:px-6"
      role="banner"
    >
      <div className="flex items-center gap-2">
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
          className="font-semibold text-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
        >
          {homeLabel}
        </Link>
      </div>
      <div className="flex items-center gap-3 min-w-0">
        {user ? (
          <>
            {displayName ? (
              <span className="hidden text-sm text-muted-foreground truncate sm:inline max-w-[200px]" title={displayName}>
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
              Cerrar sesión
            </Button>
          </>
        ) : (
          <Link href="/login">
            <Button type="button" variant="outline" size="sm">
              Iniciar sesión
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
