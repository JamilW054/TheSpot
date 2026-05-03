import type { ReactNode } from "react";

export interface StaggeredMenuItem {
  label: string;
  ariaLabel?: string;
  link: string;
}

export interface StaggeredMenuSocialItem {
  label: string;
  link: string;
}

export interface StaggeredMenuProps {
  position?: "left" | "right";
  colors?: string[];
  items?: StaggeredMenuItem[];
  socialItems?: StaggeredMenuSocialItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  className?: string;
  logoUrl?: string;
  logoAlt?: string;
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  accentColor?: string;
  changeMenuColorOnOpen?: boolean;
  isFixed?: boolean;
  closeOnClickAway?: boolean;
  menuLabel?: string;
  closeLabel?: string;
  openAriaLabel?: string;
  closeAriaLabel?: string;
  /** Extra controls shown before the menu toggle (e.g. cart link). */
  headerTrailing?: ReactNode;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
}

declare const StaggeredMenu: (props: StaggeredMenuProps) => ReactNode;
export default StaggeredMenu;
