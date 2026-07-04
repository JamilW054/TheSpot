"use client";

import { ExternalLink, Plus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Drawer } from "@/components/ui/drawer";
import type { CategoryRow } from "@/database/repositories/categories";
import type { SizePresetRow } from "@/database/repositories/size-presets";
import { CategoryDeleteButton } from "./category-delete-button";
import { CategoryForm } from "./category-form";

function thumbUnoptimized(src: string): boolean {
  return src.includes("placehold.co");
}

interface Props {
  initialRows: CategoryRow[];
  sizePresets: SizePresetRow[];
}

export function CategoriasManager({ initialRows, sizePresets }: Props) {
  const router = useRouter();
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<CategoryRow | null>(null);
  const [previewRow, setPreviewRow] = useState<CategoryRow | null>(null);
  const createKeyRef = useRef(0);
  const [createKey, setCreateKey] = useState(0);

  const openCreate = useCallback(() => {
    createKeyRef.current += 1;
    setCreateKey(createKeyRef.current);
    setDrawerMode("create");
  }, []);

  const openEdit = useCallback((row: CategoryRow) => {
    setSelected(row);
    setDrawerMode("edit");
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerMode(null);
    setSelected(null);
  }, []);

  const handleSuccess = useCallback(() => {
    closeDrawer();
    router.refresh();
  }, [closeDrawer, router]);

  const btnCls =
    "inline-flex size-8 items-center justify-center rounded-[10px] border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <>
      {/* Top bar */}
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-[18px] bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Plus className="size-4" aria-hidden />
          Nueva categoría
        </button>
        <Link
          href="/catalogo"
          target="_blank"
          rel="noopener noreferrer"
          className={btnCls}
          aria-label="Ver tienda pública"
          title="Tienda pública"
        >
          <ExternalLink className="size-4" aria-hidden />
        </Link>
      </div>

      {initialRows.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          No hay categorías. Crea la primera con el botón.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Miniatura", "Nombre", "Slug", "Orden", "Acciones"].map(
                  (h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-4 py-3 text-[13px] font-medium text-muted-foreground"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {initialRows.map((c) => {
                const url = c.image_url?.trim();
                return (
                  <tr
                    key={c.id}
                    className="border-b border-border last:border-0 transition-colors hover:bg-muted/20"
                  >
                    <td className="px-4 py-2">
                      <span className="relative flex size-10 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/60">
                        {url ? (
                          <Image
                            src={url}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                            unoptimized={thumbUnoptimized(url)}
                          />
                        ) : (
                          <span className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                            —
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {c.slug}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{c.sort_order}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewRow(c)}
                          className={btnCls}
                          aria-label="Ver detalles"
                          title="Ver detalles"
                        >
                          <ExternalLink className="size-3.5" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(c)}
                          className={btnCls}
                          aria-label={`Editar ${c.name}`}
                          title="Editar"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden
                          >
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          </svg>
                        </button>
                        <CategoryDeleteButton categoryId={c.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create drawer */}
      <Drawer
        open={drawerMode === "create"}
        onClose={closeDrawer}
        title="Nueva categoría"
        width="lg"
      >
        <CategoryForm
          key={createKey}
          mode="create"
          sizePresets={sizePresets}
          onSuccess={handleSuccess}
          onCancel={closeDrawer}
        />
      </Drawer>

      {/* Edit drawer */}
      <Drawer
        open={drawerMode === "edit"}
        onClose={closeDrawer}
        title="Editar categoría"
        width="lg"
      >
        {drawerMode === "edit" && selected && (
          <CategoryForm
            key={selected.id}
            mode="edit"
            initial={selected}
            sizePresets={sizePresets}
            onSuccess={handleSuccess}
            onCancel={closeDrawer}
          />
        )}
      </Drawer>

      {/* Preview modal */}
      {previewRow && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop closes modal */}
          <div
            aria-hidden="true"
            onClick={() => setPreviewRow(null)}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />
          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <p className="text-[15px] font-semibold text-foreground">
                Categoría
              </p>
              <button
                type="button"
                onClick={() => setPreviewRow(null)}
                className="flex size-8 items-center justify-center rounded-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Cerrar"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <div className="p-5">
              {previewRow.image_url?.trim() && (
                <div className="mb-4 aspect-video w-full overflow-hidden rounded-[10px] bg-muted">
                  <Image
                    src={previewRow.image_url.trim()}
                    alt={previewRow.name}
                    width={400}
                    height={225}
                    className="size-full object-cover"
                    unoptimized={thumbUnoptimized(previewRow.image_url.trim())}
                  />
                </div>
              )}
              <div className="space-y-3">
                {[
                  { label: "Nombre", value: previewRow.name },
                  { label: "Slug", value: previewRow.slug },
                  { label: "Orden", value: String(previewRow.sort_order) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {label}
                    </p>
                    <p className="text-sm text-foreground">{value}</p>
                  </div>
                ))}
                <Link
                  href={`/catalogo?categoria=${encodeURIComponent(previewRow.slug)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80"
                >
                  <ExternalLink className="size-3" aria-hidden />
                  Ver en tienda
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
