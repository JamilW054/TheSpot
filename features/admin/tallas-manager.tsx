"use client";

import { Plus, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Drawer } from "@/components/ui/drawer";
import type { SizePresetRow } from "@/lib/db/size-presets";
import { SizePresetDeleteButton } from "./size-preset-delete-button";
import { SizePresetForm } from "./size-preset-form";

interface Props {
  initialRows: SizePresetRow[];
}

export function TallasManager({ initialRows }: Props) {
  const router = useRouter();
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<SizePresetRow | null>(null);
  const [previewRow, setPreviewRow] = useState<SizePresetRow | null>(null);
  const createKeyRef = useRef(0);
  const [createKey, setCreateKey] = useState(0);

  const openCreate = useCallback(() => {
    createKeyRef.current += 1;
    setCreateKey(createKeyRef.current);
    setDrawerMode("create");
  }, []);

  const openEdit = useCallback((row: SizePresetRow) => {
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
      <div className="mb-5">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-[10px] bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Plus className="size-4" aria-hidden />
          Nuevo tipo de variante
        </button>
      </div>

      {initialRows.length === 0 ? (
        <div className="rounded-[14px] border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          No hay tipos de variante. Crea el primero con el botón.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[14px] border border-border">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Nombre", "Tipo", "Valores", "Orden", "Acciones"].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-4 py-3 text-[13px] font-medium text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {initialRows.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border last:border-0 transition-colors hover:bg-muted/20"
                >
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {p.kind === "color" ? "Color" : "Talla"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {p.items.map((it) => (
                        <span
                          key={it.label}
                          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium"
                        >
                          {it.hex ? (
                            <span
                              className="size-3 rounded-full border border-border"
                              style={{ backgroundColor: it.hex }}
                              aria-hidden
                            />
                          ) : null}
                          {it.label}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{p.sort_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewRow(p)}
                        className={btnCls}
                        aria-label="Ver detalles"
                        title="Ver detalles"
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
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className={btnCls}
                        aria-label={`Editar ${p.name}`}
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
                      <SizePresetDeleteButton
                        presetId={p.id}
                        presetName={p.name}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create drawer */}
      <Drawer open={drawerMode === "create"} onClose={closeDrawer} title="Nuevo tipo de variante">
        <SizePresetForm
          key={createKey}
          mode="create"
          onSuccess={handleSuccess}
          onCancel={closeDrawer}
        />
      </Drawer>

      {/* Edit drawer */}
      <Drawer open={drawerMode === "edit"} onClose={closeDrawer} title="Editar tipo de variante">
        {drawerMode === "edit" && selected && (
          <SizePresetForm
            key={selected.id}
            mode="edit"
            initial={selected}
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
          <div className="relative z-10 w-full max-w-sm rounded-[14px] border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <p className="text-[15px] font-semibold text-foreground">
                {previewRow.name}
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
            <div className="p-5 space-y-4">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {previewRow.kind === "color"
                    ? "Colores disponibles"
                    : "Tallas disponibles"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {previewRow.items.map((it) => (
                    <span
                      key={it.label}
                      className="inline-flex items-center gap-1.5 rounded-[10px] border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                    >
                      {it.hex ? (
                        <span
                          className="size-3.5 rounded-full border border-border"
                          style={{ backgroundColor: it.hex }}
                          aria-hidden
                        />
                      ) : null}
                      {it.label}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Orden
                </p>
                <p className="tabular-nums text-sm text-foreground">
                  {previewRow.sort_order}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
