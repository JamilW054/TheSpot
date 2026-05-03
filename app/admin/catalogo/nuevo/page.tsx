import Link from "next/link";
import { PageLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminCatalogoNuevoPage() {
  return (
    <PageLayout
      title="Nuevo artículo"
      description="Flujo de alta en construcción: el catálogo exige modelo 3D en base_models, textura base y precio. Usa esta página como checklist hasta conectar formularios y acciones de servidor."
    >
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Pasos previstos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              Dar de alta la ruta del modelo en{" "}
              <code className="rounded bg-muted px-1 text-xs">base_models</code>{" "}
              (solo rutas permitidas).
            </li>
            <li>Crear o enlazar textura base en la tabla textures.</li>
            <li>
              Insertar fila en{" "}
              <code className="rounded bg-muted px-1 text-xs">products</code>{" "}
              (slug único, precio, published).
            </li>
            <li>Subir imágenes de portada / medios desde Medios (R2).</li>
          </ol>
          <p>
            <Link
              href="/admin/catalogo"
              className="text-primary underline-offset-4 hover:underline"
            >
              ← Volver al catálogo
            </Link>
          </p>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
