"use client";

import StaggeredMenu from "@/components/StaggeredMenu";

const LOGO_SRC = "/resources/buxxep-transparent.png";
const PRIMARY = "#3CC8F7";

const MENU_ITEMS = [
  { label: "Inicio", ariaLabel: "Ir a inicio", link: "/" },
  { label: "Catálogo", ariaLabel: "Ver catálogo", link: "/catalogo" },
  { label: "Editor", ariaLabel: "Abrir editor", link: "/editor" },
  { label: "Carrito", ariaLabel: "Ver carrito", link: "/carrito" },
  { label: "Entrar", ariaLabel: "Iniciar sesión", link: "/login" },
  { label: "Registrarse", ariaLabel: "Crear cuenta", link: "/registro" },
];

const SOCIAL_ITEMS = [
  { label: "Instagram", link: "https://www.instagram.com/buxxep/" },
];

export function PublicNavbar() {
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
      menuLabel="Menú"
      closeLabel="Cerrar"
      openAriaLabel="Abrir menú"
      closeAriaLabel="Cerrar menú"
    />
  );
}
