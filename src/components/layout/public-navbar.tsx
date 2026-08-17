"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { CartNavLink } from "@/components/layout/CartNavLink";
import { NavbarSearch } from "@/components/layout/NavbarSearch";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserNavLink } from "@/components/layout/UserNavLink";
import { WishlistNavLink } from "@/components/layout/WishlistNavLink";
import StaggeredMenu from "@/components/StaggeredMenu";
import { useTheme } from "@/components/theme-provider";
import { ORDER_STATUS_PAGE } from "@/config/navigation";
import type { CategoryRow } from "@/database/repositories/categories";
import {
  CATALOG_CHROME_HIDE_DELTA,
  CATALOG_CHROME_HIDE_OFFSET,
  useHideOnScroll,
} from "@/hooks/use-hide-on-scroll";

const LOGO_SRC = "/resources/jwparfum-logo.svg";
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

const SOCIAL_ITEMS: { label: string; link: string }[] = [];

const DARK_COLORS = ["#0c0c0e", "#1a1a1f", "#2aa8d4", PRIMARY];
const LIGHT_COLORS = ["#ffffff", "#f4f4f5", "#2aa8d4", PRIMARY];

interface Props {
  categories?: CategoryRow[];
}

export function PublicNavbar({ categories }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const pathname = usePathname();
  const isCatalog = pathname === "/catalogo";
  const [menuOpen, setMenuOpen] = useState(false);

  // Solo en /catalogo: el navbar global se oculta en sincronía con
  // CatalogCategoryNav (mismo umbral) para que ambos se muevan como un solo
  // bloque. En el resto del sitio no se activa el listener de scroll ni cambia
  // el comportamiento — nunca se oculta, y tampoco mientras el menú móvil
  // está abierto (no tiene sentido esconder el navbar bajo el usuario).
  const scrollVisible = useHideOnScroll(
    CATALOG_CHROME_HIDE_OFFSET,
    CATALOG_CHROME_HIDE_DELTA,
    isCatalog,
  );
  const hidden = isCatalog && !scrollVisible && !menuOpen;

  return (
    <StaggeredMenu
      className={`transition-transform duration-300 ease-in-out ${hidden ? "-translate-y-30" : "translate-y-0"}`}
      position="right"
      items={BASE_ITEMS}
      socialItems={SOCIAL_ITEMS}
      displaySocials
      displayItemNumbering
      menuButtonColor={isDark ? "#ffffff" : "#0c0c0e"}
      openMenuButtonColor={isDark ? "#ffffff" : PRIMARY}
      changeMenuColorOnOpen
      colors={isDark ? DARK_COLORS : LIGHT_COLORS}
      logoUrl={LOGO_SRC}
      logoAlt="JW PARFUM - Ir a inicio"
      accentColor={PRIMARY}
      isFixed
      closeOnClickAway
      onMenuOpen={() => setMenuOpen(true)}
      onMenuClose={() => setMenuOpen(false)}
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
          <WishlistNavLink
            className={
              isDark
                ? "text-white/90 hover:bg-white/15 hover:text-white focus-visible:ring-white/40 focus-visible:ring-offset-0"
                : "text-foreground/70 hover:bg-black/8 hover:text-foreground"
            }
          />
          <CartNavLink
            className={
              isDark
                ? "text-white/90 hover:bg-white/15 hover:text-white focus-visible:ring-white/40 focus-visible:ring-offset-0"
                : "text-foreground/70 hover:bg-black/8 hover:text-foreground"
            }
          />
        </div>
      }
    />
  );
}
