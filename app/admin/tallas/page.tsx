import { Pencil, Plus, Ruler } from "lucide-react";
import Link from "next/link";
import { SizePresetDeleteButton } from "@/features/admin/size-preset-delete-button";
import { getSizePresetsForAdmin } from "@/lib/db/size-presets";

export default async function AdminTallasPage() {
  const presets = await getSizePresetsForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 md:text-3xl">
            Tipos de talla
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Grupos de tallas disponibles por tipo de producto.
          </p>
        </div>
        <Link
          href="/admin/tallas/nuevo"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" aria-hidden />
          Nuevo tipo
        </Link>
      </div>

      {presets.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-zinc-700/60 bg-zinc-900/60 py-16 text-center">
          <Ruler className="size-12 text-zinc-700" aria-hidden />
          <div>
            <p className="text-sm font-medium text-zinc-300">Sin tipos de talla</p>
            <p className="mt-1 text-xs text-zinc-600">Crea el primero con el botón.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-zinc-700/60 md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-700/60 bg-zinc-800/70 text-zinc-400">
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {presets.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-zinc-800/60 transition-colors last:border-0 hover:bg-zinc-800/30"
                  >
                    <td className="px-4 py-3 font-medium text-zinc-100">{p.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/tallas/${p.id}/editar`}
                          title="Editar"
                          className="inline-flex size-9 items-center justify-center rounded-lg border border-zinc-700/50 text-zinc-500 transition-colors hover:border-zinc-500 hover:text-zinc-200"
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

          <div className="space-y-3 md:hidden">
            {presets.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-700/60 bg-zinc-900/60 px-4 py-3"
              >
                <p className="font-medium text-zinc-100">{p.name}</p>
                <div className="flex gap-1">
                  <Link
                    href={`/admin/tallas/${p.id}/editar`}
                    className="inline-flex size-9 items-center justify-center rounded-lg border border-zinc-700/50 text-zinc-500 transition-colors hover:border-zinc-500 hover:text-zinc-200"
                  >
                    <Pencil className="size-4" aria-hidden />
                  </Link>
                  <SizePresetDeleteButton presetId={p.id} presetName={p.name} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
