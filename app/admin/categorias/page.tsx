import { ExternalLink, Pencil, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PageLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryDeleteButton } from "@/features/admin/category-delete-button";
import { getCategoriesForAdmin } from "@/lib/db";

const iconGhost =
  "inline-flex size-9 items-center justify-center rounded-md border-2 border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const iconPrimary =
  "inline-flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function thumbUnoptimized(src: string): boolean {
  return src.includes("placehold.co");
}

export default async function AdminCategoriasPage() {
  const rows = await getCategoriesForAdmin();

  return (
    <PageLayout
      title="Categorías"
      description="CRUD de categorías del catálogo público (slug, orden, miniatura). Los cambios se reflejan en /catalogo."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/admin/categorias/nuevo"
          className={iconPrimary}
          aria-label="Nueva categoría"
          title="Nueva categoría"
        >
          <Plus className="size-5" aria-hidden />
        </Link>
        <Link
          href="/catalogo"
          target="_blank"
          rel="noopener noreferrer"
          className={iconGhost}
          aria-label="Ver tienda pública"
          title="Tienda pública"
        >
          <ExternalLink className="size-5" aria-hidden />
        </Link>
      </div>

      {rows.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No hay categorías. Crea la primera con el botón +.
          </CardContent>
        </Card>
      ) : (
        <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th scope="col" className="px-4 py-3 font-medium">
                  Miniatura
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Nombre
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Slug
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Orden
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const url = c.image_url?.trim();
                return (
                  <tr
                    key={c.id}
                    className="border-b border-border transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-2">
                      <span className="relative flex size-12 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/60">
                        {url ? (
                          <Image
                            src={url}
                            alt=""
                            fill
                            sizes="48px"
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
                      <div className="flex flex-wrap items-center gap-1">
                        <Link
                          href={`/catalogo?categoria=${encodeURIComponent(c.slug)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={iconGhost}
                          aria-label={`Ver ${c.name} en tienda`}
                          title="Ver en tienda"
                        >
                          <ExternalLink className="size-4" aria-hidden />
                        </Link>
                        <Link
                          href={`/admin/categorias/${c.id}/editar`}
                          className={iconGhost}
                          aria-label={`Editar ${c.name}`}
                          title="Editar"
                        >
                          <Pencil className="size-4" aria-hidden />
                        </Link>
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

      {rows.length > 0 ? (
        <div className="grid gap-3 md:hidden">
          {rows.map((c) => {
            const url = c.image_url?.trim();
            return (
              <Card key={c.id} className="border-border overflow-hidden">
                <CardContent className="flex gap-3 p-4">
                  <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/60">
                    {url ? (
                      <Image
                        src={url}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                        unoptimized={thumbUnoptimized(url)}
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-xs text-muted-foreground">
                        —
                      </span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {c.slug}
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        Orden {c.sort_order}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Link
                        href={`/catalogo?categoria=${encodeURIComponent(c.slug)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={iconGhost}
                        aria-label="Ver en tienda"
                      >
                        <ExternalLink className="size-4" aria-hidden />
                      </Link>
                      <Link
                        href={`/admin/categorias/${c.id}/editar`}
                        className={iconPrimary}
                        aria-label="Editar"
                      >
                        <Pencil className="size-4" aria-hidden />
                      </Link>
                      <CategoryDeleteButton categoryId={c.id} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}
    </PageLayout>
  );
}
