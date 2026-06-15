"use client";

import { CartNavLink } from "@/components/layout/CartNavLink";
import { WishlistNavLink } from "@/components/layout/WishlistNavLink";
import { NavbarSearch } from "@/components/layout/NavbarSearch";
import StaggeredMenu from "@/components/StaggeredMenu";
import { ORDER_STATUS_PAGE } from "@/config/navigation";
import type { CategoryRow } from "@/lib/db/categories";

const LOGO_SRC = "/resources/buxxep-transparent.png";
const PRIMARY = "#3CC8F7";

const MENU_ITEMS = [
  { label: "Inicio", ariaLabel: "Ir a inicio", link: "/" },
  { label: "Catálogo", ariaLabel: "Ver catálogo", link: "/catalogo" },
  {
    label: ORDER_STATUS_PAGE.label,
    ariaLabel: ORDER_STATUS_PAGE.ariaLabel,
    link: ORDER_STATUS_PAGE.href,
  },
  { label: "Entrar", ariaLabel: "Iniciar sesión", link: "/login" },
  { label: "Registrarse", ariaLabel: "Crear cuenta", link: "/registro" },
];

const SOCIAL_ITEMS = [
  { label: "Instagram", link: "https://www.instagram.com/buxxep/" },
];

interface Props {
  categories?: CategoryRow[];
}

export function PublicNavbar({ categories }: Props) {
  return (
    <StaggeredMenu
      position="right"
      items={MENU_ITEMS}
      socialItems={SOCIAL_ITEMS}
      displaySocials
      displayItemNumbering
      menuButtonColor="#ffffff"
      openMenuButtonColor="#ffffff"
      changeMenuColorOnOpen
      colors={["#0c0c0e", "#1a1a1f", "#2aa8d4", PRIMARY]}
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
          <WishlistNavLink className="text-white/90 hover:bg-white/15 hover:text-white focus-visible:ring-white/40 focus-visible:ring-offset-0" />
          <CartNavLink className="text-white/90 hover:bg-white/15 hover:text-white focus-visible:ring-white/40 focus-visible:ring-offset-0" />
        </div>
      }
    />
  );
}
