import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { PageLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { SizePresetDeleteButton } from "@/features/admin/size-preset-delete-button";
import { getSizePresetsForAdmin } from "@/lib/db/size-presets";

const iconGhost =
  "inline-flex size-9 items-center justify-center rounded-md border-2 border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const iconPrimary =
  "inline-flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export default async function AdminTallasPage() {
  const presets = await getSizePresetsForAdmin();

  return (
    <PageLayout
      title="Tipos de talla"
      description="Define los grupos de tallas por tipo de producto. Cada categoría puede tener un tipo asignado."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/admin/tallas/nuevo"
          className={iconPrimary}
          aria-label="Nuevo tipo de talla"
          title="Nuevo tipo de talla"
        >
          <Plus className="size-5" aria-hidden />
        </Link>
      </div>

      {presets.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No hay tipos de talla. Crea el primero con el botón +.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th scope="col" className="px-4 py-3 font-medium">Nombre</th>
                  <th scope="col" className="px-4 py-3 font-medium">Tallas</th>
                  <th scope="col" className="px-4 py-3 font-medium">Orden</th>
                  <th scope="col" className="px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {presets.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {p.sizes.map((s) => (
                          <span
                            key={s}
                            className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{p.sort_order}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1">
                        <Link
                          href={`/admin/tallas/${p.id}/editar`}
                          className={iconGhost}
                          aria-label={`Editar ${p.name}`}
                          title="Editar"
                        >
                          <Pencil className="size-4" aria-hidden />
                        </Link>
                        <SizePresetDeleteButton presetId={p.id} presetName={p.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {presets.map((p) => (
              <Card key={p.id} className="border-border overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        Orden {p.sort_order}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Link
                        href={`/admin/tallas/${p.id}/editar`}
                        className={iconPrimary}
                        aria-label="Editar"
                      >
                        <Pencil className="size-4" aria-hidden />
                      </Link>
                      <SizePresetDeleteButton presetId={p.id} presetName={p.name} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {p.sizes.map((s) => (
                      <span
                        key={s}
                        className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </PageLayout>
  );
}
