import Link from "next/link";
import { CatalogDeleteButton } from "@/features/admin/catalog-delete-button";
import { PageLayout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getProductsAdmin } from "@/lib/db";
import { formatDOPFromCents } from "@/lib/format-currency";
import { ExternalLink, Eye, Pencil, Plus } from "lucide-react";

const iconGhost =
  "inline-flex size-9 items-center justify-center rounded-md border-2 border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const iconPrimary =
  "inline-flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export default async function AdminCatalogoPage() {
  const products = await getProductsAdmin();

  return (
    <PageLayout
      title="Catálogo"
      description="CRUD de artículos: crear, editar, eliminar (si no hay pedidos con ese producto) y ver en la tienda."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/admin/catalogo/nuevo"
          className={iconPrimary}
          aria-label="Nuevo artículo"
          title="Nuevo artículo"
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

      {products.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No hay productos en la base de datos.
          </CardContent>
        </Card>
      ) : (
        <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th scope="col" className="px-4 py-3 font-medium">
                  Nombre
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Slug
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Precio
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Visibilidad
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {p.slug}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatDOPFromCents(p.price_cents)}
                  </td>
                  <td className="px-4 py-3">
                    {p.published ? (
                      <Badge variant="success">Publicado</Badge>
                    ) : (
                      <Badge variant="warning">Borrador</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1">
                      <Link
                        href={`/catalogo/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={iconGhost}
                        aria-label={`Ver ${p.name} en tienda`}
                        title="Ver en tienda"
                      >
                        <Eye className="size-4" aria-hidden />
                      </Link>
                      <Link
                        href={`/admin/catalogo/${p.slug}/editar`}
                        className={iconGhost}
                        aria-label={`Editar ${p.name}`}
                        title="Editar"
                      >
                        <Pencil className="size-4" aria-hidden />
                      </Link>
                      <CatalogDeleteButton productId={p.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {products.length > 0 ? (
        <div className="grid gap-3 md:hidden">
          {products.map((p) => (
            <Card key={p.id} className="border-border">
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {p.slug}
                    </p>
                  </div>
                  {p.published ? (
                    <Badge variant="success">Publicado</Badge>
                  ) : (
                    <Badge variant="warning">Borrador</Badge>
                  )}
                </div>
                <p className="tabular-nums text-sm">
                  {formatDOPFromCents(p.price_cents)}
                </p>
                <div className="flex flex-wrap gap-1">
                  <Link
                    href={`/catalogo/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={iconGhost}
                    aria-label="Ver en tienda"
                    title="Ver en tienda"
                  >
                    <Eye className="size-4" aria-hidden />
                  </Link>
                  <Link
                    href={`/admin/catalogo/${p.slug}/editar`}
                    className={iconPrimary}
                    aria-label="Editar"
                    title="Editar"
                  >
                    <Pencil className="size-4" aria-hidden />
                  </Link>
                  <CatalogDeleteButton productId={p.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </PageLayout>
  );
}
