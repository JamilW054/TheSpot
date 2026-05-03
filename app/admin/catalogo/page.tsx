import Link from "next/link";
import { PageLayout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getProductsAdmin } from "@/lib/db";
import { formatDOPFromCents } from "@/lib/format-currency";

const linkPrimarySm =
  "inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const linkOutlineSm =
  "inline-flex h-8 items-center justify-center rounded-md border-2 border-border bg-transparent px-3 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const linkSecondarySm =
  "inline-flex h-8 items-center justify-center rounded-md bg-secondary px-3 text-sm font-medium text-secondary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default async function AdminCatalogoPage() {
  const products = await getProductsAdmin();

  return (
    <PageLayout
      title="Catálogo"
      description="Todos los artículos (publicados y borradores). La edición completa y el alta con modelos 3D enlazan con Supabase y reglas de negocio — usa «Editar» para el formulario en construcción."
    >
      <div className="mb-4 flex flex-wrap gap-3">
        <Link href="/admin/catalogo/nuevo" className={linkPrimarySm}>
          Nuevo artículo
        </Link>
        <Link
          href="/catalogo"
          target="_blank"
          rel="noopener noreferrer"
          className={linkOutlineSm}
        >
          Ver tienda pública
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
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/catalogo/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkOutlineSm}
                      >
                        Ver
                      </Link>
                      <Link
                        href={`/admin/catalogo/${p.slug}/editar`}
                        className={linkSecondarySm}
                      >
                        Editar
                      </Link>
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
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/catalogo/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkOutlineSm}
                  >
                    Ver
                  </Link>
                  <Link
                    href={`/admin/catalogo/${p.slug}/editar`}
                    className={linkPrimarySm}
                  >
                    Editar
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </PageLayout>
  );
}
