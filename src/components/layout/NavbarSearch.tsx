"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@/components/theme-provider";
import { isComingSoonCategory } from "@/config/brand";
import type { CategoryRow } from "@/database/repositories/categories";

interface Props {
  categories?: CategoryRow[];
}

export function NavbarSearch({ categories = [] }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 64, left: 0, width: 600 });
  const [mobileOpen, setMobileOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropId = "navbar-search-drop";
  const router = useRouter();

  /* ── build parent/child tree ── */
  const parents = categories.filter((c) => !c.parent_id);
  const byParent: Record<string, CategoryRow[]> = {};
  for (const c of categories) {
    if (c.parent_id) {
      byParent[c.parent_id] ??= [];
      byParent[c.parent_id].push(c);
    }
  }
  const isFlat = parents.length === 0;

  /* ── position desktop dropdown ── */
  function calcPos() {
    const el = inputRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const w = Math.min(window.innerWidth - 32, 640);
    const centerX = rect.left + rect.width / 2;
    setDropPos({
      top: rect.bottom + 10,
      left: Math.max(16, Math.min(centerX - w / 2, window.innerWidth - w - 16)),
      width: w,
    });
  }

  function openDrop() {
    calcPos();
    setOpen(true);
  }

  /* ── close desktop dropdown on outside click ── */
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const portal = document.getElementById(dropId);
      if (
        inputRef.current?.contains(e.target as Node) ||
        portal?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  /* ── lock body scroll when mobile overlay is open ── */
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/catalogo?q=${encodeURIComponent(q)}` : "/catalogo");
    setOpen(false);
    setMobileOpen(false);
    setQuery("");
  }

  function openMobileSearch() {
    setMobileOpen(true);
  }

  function closeMobileSearch() {
    setMobileOpen(false);
    setQuery("");
  }

  /* ── shared category list ── */
  function CategoryContent({ onNav }: { onNav: () => void }) {
    if (isFlat) {
      return (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalogo?categoria=${cat.slug}`}
              onClick={onNav}
              className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {cat.image_url && (
                <Image
                  src={cat.image_url}
                  alt=""
                  width={20}
                  height={20}
                  className="size-5 rounded-full object-cover"
                  unoptimized={cat.image_url.startsWith("http")}
                />
              )}
              {cat.name}
              {isComingSoonCategory(cat.slug) ? (
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-primary">
                  Soon
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {parents.map((parent) => {
          const children = byParent[parent.id] ?? [];
          return (
            <div key={parent.id}>
              <Link
                href={`/catalogo?categoria=${parent.slug}`}
                onClick={onNav}
                className="flex items-center gap-2.5 mb-3 group"
              >
                {parent.image_url && (
                  <Image
                    src={parent.image_url}
                    alt=""
                    width={32}
                    height={32}
                    className="size-8 rounded-full object-cover border border-border"
                    unoptimized={parent.image_url.startsWith("http")}
                  />
                )}
                <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                  {parent.name}
                </span>
              </Link>
              {children.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pl-10">
                  {children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/catalogo?categoria=${child.slug}`}
                      onClick={onNav}
                      className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  /* ── desktop dropdown portal ── */
  const desktopDropdown =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            id={dropId}
            style={{
              position: "fixed",
              top: dropPos.top,
              left: dropPos.left,
              width: dropPos.width,
              zIndex: 9999,
            }}
            className="bg-background border border-border rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-background">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                Explorar catálogo
              </p>
              <Link
                href="/catalogo"
                onClick={() => setOpen(false)}
                className="text-[11px] font-semibold text-primary hover:underline underline-offset-2"
              >
                Ver todo →
              </Link>
            </div>
            <div className="overflow-y-auto max-h-[65vh] p-5">
              <CategoryContent onNav={() => setOpen(false)} />
            </div>
          </div>,
          document.body,
        )
      : null;

  /* ── mobile full-screen overlay ── */
  const mobileOverlay =
    mobileOpen && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-9999 flex flex-col bg-background sm:hidden">
            {/* Search bar + cancel */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <form onSubmit={handleSubmit} className="flex-1">
                <div className="relative">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                    aria-hidden
                  />
                  <input
                    autoFocus
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar en el catálogo…"
                    aria-label="Buscar en el catálogo"
                    className="w-full rounded-full border border-border bg-muted pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/70 transition-colors"
                  />
                </div>
              </form>
              <button
                type="button"
                onClick={closeMobileSearch}
                className="shrink-0 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
            </div>
            {/* Category browser */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                  Explorar catálogo
                </p>
                <Link
                  href="/catalogo"
                  onClick={closeMobileSearch}
                  className="text-[11px] font-semibold text-primary hover:underline underline-offset-2"
                >
                  Ver todo →
                </Link>
              </div>
              <div className="p-5">
                <CategoryContent onNav={closeMobileSearch} />
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {/* Mobile: icon button only */}
      <button
        type="button"
        onClick={openMobileSearch}
        className={`sm:hidden flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
          isDark
            ? "text-white/70 hover:bg-white/15 hover:text-white"
            : "text-foreground/60 hover:bg-rose-50 hover:text-primary"
        }`}
        aria-label="Abrir búsqueda"
      >
        <Search className="size-4.5" aria-hidden />
      </button>

      {/* Desktop: full search input */}
      <div className="relative hidden sm:block w-full sm:max-w-md">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="relative w-full">
            <Search
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 size-4 pointer-events-none ${
                isDark ? "text-white/55" : "text-foreground/45"
              }`}
              aria-hidden
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={openDrop}
              placeholder="Buscar en el catálogo…"
              aria-label="Buscar en el catálogo"
              className={`w-full rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/70 focus:shadow-[0_0_24px_-4px_rgba(220,38,38,0.45)] transition-all duration-200 ${
                isDark
                  ? "border border-white/25 bg-white/12 text-white placeholder:text-white/50 focus:bg-white/20"
                  : "border border-rose-200 bg-rose-50/70 text-foreground placeholder:text-foreground/40 focus:bg-white"
              }`}
            />
          </div>
        </form>
        {desktopDropdown}
      </div>

      {mobileOverlay}
    </>
  );
}
