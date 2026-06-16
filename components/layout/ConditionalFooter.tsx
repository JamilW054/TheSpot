"use client";

import { usePathname } from "next/navigation";
import { PublicFooter } from "./public-footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/cuenta")) return null;
  return <PublicFooter />;
}
