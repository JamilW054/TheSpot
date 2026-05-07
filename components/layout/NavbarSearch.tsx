"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CategoryRow } from "@/lib/db/categories";

interface Props {
  categories?: CategoryRow[];
}

export function NavbarSearch({ categories = [] }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 64, left: 0, width: 600 });
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

  /* ── position dropdown using bounding rect ── */
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

  /* ── close on outside click ── */
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/catalogo?q=${encodeURIComponent(q)}` : "/catalogo");
    setOpen(false);
    setQuery("");
  }

  /* ── dropdown via portal (avoids overflow:hidden on StaggeredMenu) ── */
  const dropdown =
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
            {/* sticky header */}
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
              {isFlat ? (
                /* ── Flat list (no parent hierarchy yet) ── */
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/catalogo?categoria=${cat.slug}`}
                      onClick={() => setOpen(false)}
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
                    </Link>
                  ))}
                </div>
              ) : (
                /* ── Hierarchical list ── */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {parents.map((parent) => {
                    const children = byParent[parent.id] ?? [];
                    return (
                      <div key={parent.id}>
                        <Link
                          href={`/catalogo?categoria=${parent.slug}`}
                          onClick={() => setOpen(false)}
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
                                onClick={() => setOpen(false)}
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
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative w-full sm:max-w-md">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative w-full">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/55 pointer-events-none"
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
            className="w-full rounded-full border border-white/25 bg-white/12 pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-primary/70 focus:bg-white/20 focus:shadow-[0_0_24px_-4px_rgba(60,200,247,0.45)] transition-all duration-200"
          />
        </div>
      </form>
      {dropdown}
    </div>
  );
}
