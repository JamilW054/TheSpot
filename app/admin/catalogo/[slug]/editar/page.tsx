import Link from "next/link";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProductAdminBySlug } from "@/lib/db";
import { formatDOPFromCents } from "@/lib/format-currency";

const linkOutlineSm =
  "inline-flex h-8 items-center justify-center rounded-md border-2 border-border bg-transparent px-3 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const linkPrimarySm =
  "inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminCatalogoEditarPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductAdminBySlug(slug);
  if (!product) notFound();

  return (
    <PageLayout
      title={`Editar: ${product.name}`}
      description="Formulario CRUD en construcción. Datos actuales desde la base de datos."
    >
      <Card className="border-border">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base font-mono">{product.slug}</CardTitle>
          {product.published ? (
            <Badge variant="success">Publicado</Badge>
          ) : (
            <Badge variant="warning">Borrador</Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <dl className="grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Nombre</dt>
              <dd className="font-medium">{product.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Precio</dt>
              <dd className="tabular-nums">
                {formatDOPFromCents(product.price_cents)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Modelo (path)</dt>
              <dd className="font-mono text-xs break-all">
                {product.model_path}
              </dd>
            </div>
          </dl>
          <p className="text-muted-foreground">
            Aquí irán campos editables (nombre, precio, publicado, textura,
            diseño por defecto) y una acción de guardar vía server action.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/catalogo" className={linkOutlineSm}>
              ← Catálogo admin
            </Link>
            <Link
              href={`/catalogo/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={linkPrimarySm}
            >
              Ver en tienda
            </Link>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
