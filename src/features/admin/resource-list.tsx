import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ResourceDeleteButton } from "./resource-delete-button";

export interface ResourceColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface ResourceListProps<T> {
  rows: T[];
  columns: ResourceColumn<T>[];
  getId: (row: T) => string;
  newHref: string;
  newLabel?: string;
  editHref?: (id: string) => string;
  deleteAction?: (id: string) => Promise<void>;
  deleteTitle?: string;
  deleteDescription?: string;
  emptyLabel?: string;
}

export function ResourceList<T>({
  rows,
  columns,
  getId,
  newHref,
  newLabel = "Nuevo",
  editHref,
  deleteAction,
  deleteTitle,
  deleteDescription,
  emptyLabel = "No hay registros todavía.",
}: ResourceListProps<T>) {
  return (
    <>
      <div className="mb-5">
        <Link
          href={newHref}
          className="inline-flex items-center gap-2 rounded-[18px] bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Plus className="size-4" aria-hidden />
          {newLabel}
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border">
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
                <th scope="col" className="px-4 py-3 text-[13px] font-medium text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
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
                        {editHref ? (
                          <Link
                            href={editHref(id)}
                            className="inline-flex size-8 items-center justify-center rounded-[10px] border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label="Editar"
                            title="Editar"
                          >
                            <Pencil className="size-3.5" aria-hidden />
                          </Link>
                        ) : null}
                        {deleteAction ? (
                          <ResourceDeleteButton
                            action={deleteAction}
                            id={id}
                            title={deleteTitle}
                            description={deleteDescription}
                          />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
