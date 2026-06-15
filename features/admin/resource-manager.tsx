"use client";

import { Eye, Pencil, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { ResourceDeleteButton } from "./resource-delete-button";
import { ResourceForm, type ResourceActionState, type ResourceField } from "./resource-form";
import type { ResourceColumn } from "./resource-list";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ResourceManagerProps<T> {
  initialRows: T[];
  columns: ResourceColumn<T>[];
  getId: (row: T) => string;
  entityLabel: string;
  newLabel?: string;
  emptyLabel?: string;

  // Create drawer
  createTitle?: string;
  createFields?: ResourceField[];
  createAction?: (
    prev: ResourceActionState | undefined,
    fd: FormData,
  ) => Promise<ResourceActionState>;
  /** Extra content rendered inside the create form (e.g. a product picker). */
  createFormChildren?: ReactNode;

  // Edit drawer — if editHref is provided it overrides the drawer
  editTitle?: string;
  getEditFields?: (row: T) => ResourceField[];
  editIdFieldName?: string;
  editAction?: (
    prev: ResourceActionState | undefined,
    fd: FormData,
  ) => Promise<ResourceActionState>;
  /** Link-based edit (overrides drawer). Use when edit needs a dedicated page. */
  editHref?: (id: string) => string;
  /** Extra content inside the edit form keyed to the selected row. */
  getEditFormChildren?: (row: T) => ReactNode;

  // Delete
  deleteAction?: (id: string) => Promise<void>;
  deleteTitle?: string;
  deleteDescription?: string;

  // Preview modal
  renderPreview?: (row: T) => ReactNode;
}

// ---------------------------------------------------------------------------
// ResourceManager
// ---------------------------------------------------------------------------

export function ResourceManager<T>({
  initialRows,
  columns,
  getId,
  entityLabel,
  newLabel = "Nuevo",
  emptyLabel = "No hay registros todavía.",
  createTitle,
  createFields,
  createAction,
  createFormChildren,
  editTitle,
  getEditFields,
  editIdFieldName,
  editAction,
  editHref,
  getEditFormChildren,
  deleteAction,
  deleteTitle,
  deleteDescription,
  renderPreview,
}: ResourceManagerProps<T>) {
  const router = useRouter();
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | null>(null);
  const [selectedRow, setSelectedRow] = useState<T | null>(null);
  const [previewRow, setPreviewRow] = useState<T | null>(null);
  const createKeyRef = useRef(0);
  const [createKey, setCreateKey] = useState(0);

  const handleSuccess = useCallback(() => {
    setDrawerMode(null);
    setSelectedRow(null);
    router.refresh();
  }, [router]);

  const closeDrawer = useCallback(() => {
    setDrawerMode(null);
    setSelectedRow(null);
  }, []);

  const openCreate = useCallback(() => {
    createKeyRef.current += 1;
    setCreateKey(createKeyRef.current);
    setDrawerMode("create");
  }, []);

  const openEdit = useCallback((row: T) => {
    setSelectedRow(row);
    setDrawerMode("edit");
  }, []);

  const hasDrawerEdit = Boolean(getEditFields && editAction && !editHref);
  const hasLinkEdit = Boolean(editHref);
  const hasCreate = Boolean(createFields && createAction);

  const btnCls =
    "inline-flex size-8 items-center justify-center rounded-[10px] border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <>
      {/* ── New button ── */}
      {hasCreate && (
        <div className="mb-5">
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-[10px] bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Plus className="size-4" aria-hidden />
            {newLabel}
          </button>
        </div>
      )}

      {/* ── Table ── */}
      {initialRows.length === 0 ? (
        <div className="rounded-[14px] border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[14px] border border-border">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {columns.map((c) => (
                  <th
                    key={c.header}
                    scope="col"
                    className="px-4 py-3 text-[13px] font-medium text-muted-foreground"
                  >
                    {c.header}
                  </th>
                ))}
                <th
                  scope="col"
                  className="px-4 py-3 text-[13px] font-medium text-muted-foreground"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {initialRows.map((row) => {
                const id = getId(row);
                return (
                  <tr
                    key={id}
                    className="border-b border-border last:border-0 transition-colors hover:bg-muted/20"
                  >
                    {columns.map((c) => (
                      <td
                        key={c.header}
                        className={`px-4 py-3 text-sm ${c.className ?? ""}`}
                      >
                        {c.cell(row)}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {/* Eye — always shown */}
                        <button
                          type="button"
                          onClick={() => setPreviewRow(row)}
                          className={btnCls}
                          aria-label="Ver detalles"
                          title="Ver detalles"
                        >
                          <Eye className="size-3.5" aria-hidden />
                        </button>

                        {/* Edit — drawer */}
                        {hasDrawerEdit && (
                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            className={btnCls}
                            aria-label="Editar"
                            title="Editar"
                          >
                            <Pencil className="size-3.5" aria-hidden />
                          </button>
                        )}

                        {/* Edit — link */}
                        {hasLinkEdit && editHref && (
                          <Link
                            href={editHref(id)}
                            className={btnCls}
                            aria-label="Editar"
                            title="Editar"
                          >
                            <Pencil className="size-3.5" aria-hidden />
                          </Link>
                        )}

                        {/* Delete */}
                        {deleteAction && (
                          <ResourceDeleteButton
                            action={deleteAction}
                            id={id}
                            title={deleteTitle}
                            description={deleteDescription}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create drawer ── */}
      {hasCreate && (
        <Drawer
          open={drawerMode === "create"}
          onClose={closeDrawer}
          title={createTitle ?? newLabel}
        >
          {createFields && createAction && (
            <ResourceForm
              key={createKey}
              mode="create"
              fields={createFields}
              action={createAction}
              entityLabel={entityLabel}
              onSuccess={handleSuccess}
              onCancel={closeDrawer}
            >
              {createFormChildren}
            </ResourceForm>
          )}
        </Drawer>
      )}

      {/* ── Edit drawer ── */}
      {hasDrawerEdit && (
        <Drawer
          open={drawerMode === "edit"}
          onClose={closeDrawer}
          title={editTitle ?? `Editar`}
        >
          {drawerMode === "edit" && selectedRow && getEditFields && editAction && (
            <ResourceForm
              key={getId(selectedRow)}
              mode="edit"
              fields={getEditFields(selectedRow)}
              action={editAction}
              idFieldName={editIdFieldName}
              idValue={getId(selectedRow)}
              entityLabel={entityLabel}
              onSuccess={handleSuccess}
              onCancel={closeDrawer}
            >
              {getEditFormChildren?.(selectedRow)}
            </ResourceForm>
          )}
        </Drawer>
      )}

      {/* ── Preview modal ── */}
      {previewRow && (
        <PreviewModal
          row={previewRow}
          columns={columns}
          renderPreview={renderPreview}
          onClose={() => setPreviewRow(null)}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Preview Modal
// ---------------------------------------------------------------------------

function PreviewModal<T>({
  row,
  columns,
  renderPreview,
  onClose,
}: {
  row: T;
  columns: ResourceColumn<T>[];
  renderPreview?: (row: T) => ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop click closes modal */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />
      <div className="relative z-10 w-full max-w-sm rounded-[14px] border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="text-[15px] font-semibold text-foreground">Detalles</p>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Cerrar"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">
          {renderPreview ? (
            renderPreview(row)
          ) : (
            <div className="space-y-4">
              {columns.map((col) => (
                <div key={col.header}>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {col.header}
                  </p>
                  <div className="text-sm text-foreground">{col.cell(row)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
