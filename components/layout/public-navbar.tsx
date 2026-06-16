"use client";

import { CartNavLink } from "@/components/layout/CartNavLink";
import { UserNavLink } from "@/components/layout/UserNavLink";
import { WishlistNavLink } from "@/components/layout/WishlistNavLink";
import { NavbarSearch } from "@/components/layout/NavbarSearch";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import StaggeredMenu from "@/components/StaggeredMenu";
import { ORDER_STATUS_PAGE } from "@/config/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/components/theme-provider";
import type { CategoryRow } from "@/lib/db/categories";

const LOGO_SRC = "/resources/buxxep-transparent.png";
const PRIMARY = "#3CC8F7";

const BASE_ITEMS = [
  { label: "Inicio", ariaLabel: "Ir a inicio", link: "/" },
  { label: "Catálogo", ariaLabel: "Ver catálogo", link: "/catalogo" },
  {
    label: ORDER_STATUS_PAGE.label,
    ariaLabel: ORDER_STATUS_PAGE.ariaLabel,
    link: ORDER_STATUS_PAGE.href,
  },
];

const GUEST_ITEMS = [
  { label: "Entrar", ariaLabel: "Iniciar sesión", link: "/login" },
  { label: "Registrarse", ariaLabel: "Crear cuenta", link: "/registro" },
];

const USER_ITEMS = [
  { label: "Mi Cuenta", ariaLabel: "Ver mi cuenta", link: "/cuenta" },
  { label: "Mis Pedidos", ariaLabel: "Ver mis pedidos", link: "/cuenta/pedidos" },
];

const SOCIAL_ITEMS = [
  { label: "Instagram", link: "https://www.instagram.com/buxxep/" },
];

const DARK_COLORS = ["#0c0c0e", "#1a1a1f", "#2aa8d4", PRIMARY];
const LIGHT_COLORS = ["#ffffff", "#f4f4f5", "#2aa8d4", PRIMARY];

interface Props {
  categories?: CategoryRow[];
}

export function PublicNavbar({ categories }: Props) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const menuItems = [...BASE_ITEMS, ...(user ? USER_ITEMS : GUEST_ITEMS)];

  return (
    <StaggeredMenu
      position="right"
      items={menuItems}
      socialItems={SOCIAL_ITEMS}
      displaySocials
      displayItemNumbering
      menuButtonColor={isDark ? "#ffffff" : "#0c0c0e"}
      openMenuButtonColor={isDark ? "#ffffff" : PRIMARY}
      changeMenuColorOnOpen
      colors={isDark ? DARK_COLORS : LIGHT_COLORS}
      logoUrl={LOGO_SRC}
      logoAlt="Buxxep - Ir a inicio"
      accentColor={PRIMARY}
      isFixed
      closeOnClickAway
      menuLabel=""
      closeLabel="Cerrar"
      openAriaLabel="Abrir menú"
      closeAriaLabel="Cerrar menú"
      headerCenter={<NavbarSearch categories={categories} />}
      headerTrailing={
        <div className="flex items-center gap-0.5">
          <ThemeToggle
            className={
              isDark
                ? "text-white/90 hover:bg-white/15 hover:text-white"
                : "text-foreground/70 hover:bg-black/8 hover:text-foreground"
            }
          />
          <UserNavLink className="mr-1" />
          <WishlistNavLink className={isDark ? "text-white/90 hover:bg-white/15 hover:text-white focus-visible:ring-white/40 focus-visible:ring-offset-0" : "text-foreground/70 hover:bg-black/8 hover:text-foreground"} />
          <CartNavLink className={isDark ? "text-white/90 hover:bg-white/15 hover:text-white focus-visible:ring-white/40 focus-visible:ring-offset-0" : "text-foreground/70 hover:bg-black/8 hover:text-foreground"} />
        </div>
      }
    />
  );
}
