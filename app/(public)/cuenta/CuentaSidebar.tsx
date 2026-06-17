"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Package,
  Heart,
  MapPin,
  Tag,
  Bell,
  LogOut,
  Trophy,
  Star,
  Store,
  ArrowLeft,
  ShoppingCart,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";

interface SidebarUser {
  name: string;
  email: string;
}

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function CuentaSidebar({ sidebarUser }: { sidebarUser: SidebarUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const { itemCount } = useCart();

  const initials =
    sidebarUser.name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0] ?? "")
      .join("")
      .toUpperCase() || "U";

  const sections: NavSection[] = [
    {
      title: "Tu Cuenta",
      items: [
        {
          href: "/carrito",
          icon: ShoppingCart,
          label: "Carrito",
          badge: itemCount || undefined,
        },
        { href: "/cuenta/pedidos", icon: Package, label: "Mis pedidos" },
        {
          href: "/cuenta/wishlist",
          icon: Heart,
          label: "Lista de deseos",
          badge: wishlistCount || undefined,
        },
        { href: "/cuenta/direcciones", icon: MapPin, label: "Direcciones" },
        { href: "/cuenta/cupones", icon: Tag, label: "Cupones" },
        { href: "/cuenta/resenas", icon: Star, label: "Reseñas" },
      ],
    },
    {
      title: "Preferencias",
      items: [
        { href: "/cuenta/notificaciones", icon: Bell, label: "Notificaciones" },
        { href: "/cuenta/sorteo", icon: Trophy, label: "Sorteo Buxxep" },
      ],
    },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* ── DESKTOP SIDEBAR ──────────────────────────── */}
      <aside className="hidden lg:flex lg:w-60 lg:shrink-0 lg:flex-col border-r border-border bg-card animate-slide-up">

        {/* Logo + back to store */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
          <Link href="/" className="flex items-center">
            <Image
              src="/resources/buxxep-transparent.png"
              alt="Buxxep"
              width={88}
              height={28}
              className="h-7 w-auto object-contain"
            />
          </Link>
          <Link
            href="/catalogo"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
          >
            <Store className="size-3.5" aria-hidden />
            Tienda
          </Link>
        </div>

        {/* User info */}
        <div className="border-b border-border px-4 py-4">
          <Link
            href="/cuenta"
            className="group flex items-center gap-3 rounded-[10px] p-2 -m-2 transition-colors hover:bg-muted/40"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary ring-2 ring-primary/20 transition-shadow group-hover:ring-primary/40">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {sidebarUser.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {sidebarUser.email}
              </p>
            </div>
          </Link>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto py-3" aria-label="Cuenta">
          {sections.map((section) => (
            <div key={section.title} className="mb-1">
              <p className="mb-1 px-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {section.title}
              </p>
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative mx-2 flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm transition-all duration-150 ${
                      active
                        ? "bg-primary/8 text-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
                    )}
                    <item.icon
                      className={`size-4 shrink-0 transition-colors ${active ? "text-primary" : "text-muted-foreground/60 group-hover:text-muted-foreground"}`}
                      aria-hidden
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge ? (
                      <span className="rounded-full bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
              <div className="mx-4 my-2 h-px bg-border" />
            </div>
          ))}

        </nav>

        {/* Logout */}
        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-4 shrink-0" aria-hidden />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── MOBILE HEADER ────────────────────────────── */}
      <div className="lg:hidden border-b border-border bg-card">

        {/* Top bar: logo + back + user + logout */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/60">
          <Link href="/catalogo" className="flex items-center gap-1 rounded-md p-1.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" aria-hidden />
          </Link>
          <Link href="/" className="flex items-center">
            <Image
              src="/resources/buxxep-transparent.png"
              alt="Buxxep"
              width={72}
              height={22}
              className="h-5.5 w-auto object-contain"
            />
          </Link>
          <div className="flex flex-1 items-center justify-end gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
              {initials}
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="size-3.5" aria-hidden />
              Salir
            </button>
          </div>
        </div>

        {/* Scrollable nav tabs */}
        <nav
          className="flex gap-1 overflow-x-auto scrollbar-hide px-3 py-2"
          aria-label="Cuenta"
        >
          {sections.flatMap((s) => s.items).map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 whitespace-nowrap ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
              >
                <item.icon className="size-3.5 shrink-0" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
