"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { CartNavLink } from "@/components/layout/CartNavLink";
import { NavbarSearch } from "@/components/layout/NavbarSearch";
import { UserNavLink } from "@/components/layout/UserNavLink";
import { WishlistNavLink } from "@/components/layout/WishlistNavLink";
import StaggeredMenu from "@/components/StaggeredMenu";
import { BRAND_NAME, BRAND_PRIMARY } from "@/config/brand";
import { ORDER_STATUS_PAGE } from "@/config/navigation";
import type { CategoryRow } from "@/database/repositories/categories";
import {
  CATALOG_CHROME_HIDE_DELTA,
  CATALOG_CHROME_HIDE_OFFSET,
  useHideOnScroll,
} from "@/hooks/use-hide-on-scroll";

const LOGO_SRC = "/resources/the-spot-logo.svg";
const PRIMARY = BRAND_PRIMARY;

const BASE_ITEMS = [
  { label: "Inicio", ariaLabel: "Ir a inicio", link: "/" },
  { label: "Catálogo", ariaLabel: "Ver catálogo", link: "/catalogo" },
  { label: "Tiendas", ariaLabel: "Ver tiendas del marketplace", link: "/tiendas" },
  { label: "Vender", ariaLabel: "Vende en The Spot", link: "/vender" },
  {
    label: ORDER_STATUS_PAGE.label,
    ariaLabel: ORDER_STATUS_PAGE.ariaLabel,
    link: ORDER_STATUS_PAGE.href,
  },
];

const SOCIAL_ITEMS: { label: string; link: string }[] = [];

const LIGHT_COLORS = ["#ffffff", "#fff1f2", "#fecdd3", PRIMARY];

interface Props {
  categories?: CategoryRow[];
}

export function PublicNavbar({ categories }: Props) {
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
      menuButtonColor={PRIMARY}
      openMenuButtonColor={PRIMARY}
      changeMenuColorOnOpen
      colors={LIGHT_COLORS}
      logoUrl={LOGO_SRC}
      logoAlt={`${BRAND_NAME} — Ir a inicio`}
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
          <UserNavLink className="mr-1" />
          <WishlistNavLink className="text-foreground/70 hover:bg-rose-50 hover:text-primary focus-visible:ring-primary/40" />
          <CartNavLink className="text-foreground/70 hover:bg-rose-50 hover:text-primary focus-visible:ring-primary/40" />
        </div>
      }
    />
  );
}
