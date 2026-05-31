import Link from "next/link";
import { CatalogDeleteButton } from "@/features/admin/catalog-delete-button";
import { Badge } from "@/components/ui/badge";
import { getProductsAdmin } from "@/lib/db";
import { coverImageFromMedia } from "@/lib/db/products";
import { formatDOPFromCents } from "@/lib/format-currency";
import {
  ExternalLink,
  Eye,
  Package,
  Pencil,
  Plus,
  ShoppingBag,
  Wand2,
  XCircle,
} from "lucide-react";

export default async function AdminCatalogoPage() {
  const products = await getProductsAdmin();

  const totalActivos = products.filter((p) => p.is_active).length;
  const totalInactivos = products.length - totalActivos;
  const totalPersonalizables = products.filter((p) => p.is_customizable).length;

  return (
    <div className="space-y-6">
      {/* ── Encabezado ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 md:text-3xl">
            Catálogo
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Gestiona artículos: crear, editar y publicar en la tienda.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link
            href="/admin/catalogo/nuevo"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" aria-hidden />
            Nuevo artículo
          </Link>
          <Link
            href="/catalogo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700/60"
          >
            <ExternalLink className="size-4" aria-hidden />
            Tienda pública
          </Link>
        </div>
      </div>

      {/* ── Métricas ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Total",
            value: products.length,
            icon: ShoppingBag,
            color: "text-zinc-300",
            bg: "bg-zinc-800/50",
          },
          {
            label: "Activos",
            value: totalActivos,
            icon: Eye,
            color: "text-emerald-400",
            bg: "bg-emerald-900/20",
          },
          {
            label: "Inactivos",
            value: totalInactivos,
            icon: XCircle,
            color: "text-zinc-500",
            bg: "bg-zinc-800/50",
          },
          {
            label: "Personalizables",
            value: totalPersonalizables,
            icon: Wand2,
            color: "text-primary",
            bg: "bg-primary/10",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className={`flex items-center gap-3 rounded-2xl border border-zinc-700/60 p-4 ${bg}`}
          >
            <Icon className={`size-5 shrink-0 ${color}`} aria-hidden />
            <div className="min-w-0">
              <p className="text-xs text-zinc-500">{label}</p>
              <p className={`text-xl font-bold tabular-nums ${color}`}>
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabla desktop ── */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-zinc-700/60 bg-zinc-900/60 py-16 text-center">
          <Package className="size-12 text-zinc-700" aria-hidden />
          <div>
            <p className="text-sm font-medium text-zinc-300">
              Sin productos en el catálogo
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              Crea el primer artículo para empezar.
            </p>
          </div>
          <Link
            href="/admin/catalogo/nuevo"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" aria-hidden />
            Nuevo artículo
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden overflow-hidden rounded-2xl border border-zinc-700/60 md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-700/60 bg-zinc-800/70 text-zinc-400">
                  <th className="w-14 px-4 py-3 font-medium" />
                  <th className="px-4 py-3 font-medium">Artículo</th>
                  <th className="px-4 py-3 font-medium">Precio</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Editor</th>
                  <th className="px-4 py-3 text-right font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const cover = coverImageFromMedia(p.product_media);
                  const hasDiscount =
                    p.original_price_cents != null &&
                    p.original_price_cents > p.base_price_cents;
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-zinc-800/60 transition-colors last:border-0 hover:bg-zinc-800/30"
                    >
                      {/* Thumbnail */}
                      <td className="px-4 py-3">
                        <div className="size-10 overflow-hidden rounded-lg border border-zinc-700/50 bg-zinc-800">
                          {cover ? (
                            // biome-ignore lint/performance/noImgElement: thumbnail
                            <img
                              src={cover}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center">
                              <Package className="size-4 text-zinc-700" aria-hidden />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Nombre + slug */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-zinc-100">{p.name}</p>
                        <p className="mt-0.5 font-mono text-[10px] text-zinc-600">
                          /{p.slug}
                        </p>
                      </td>

                      {/* Precio */}
                      <td className="px-4 py-3">
                        <span className="font-semibold tabular-nums text-zinc-100">
                          {formatDOPFromCents(p.base_price_cents)}
                        </span>
                        {hasDiscount ? (
                          <span className="ml-2 text-xs text-zinc-600 line-through tabular-nums">
                            {formatDOPFromCents(p.original_price_cents!)}
                          </span>
                        ) : null}
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3">
                        {p.is_active ? (
                          <Badge variant="success">Activo</Badge>
                        ) : (
                          <Badge variant="warning">Inactivo</Badge>
                        )}
                      </td>

                      {/* Personalizable */}
                      <td className="px-4 py-3">
                        {p.is_customizable ? (
                          <Badge variant="default">
                            <Wand2 className="mr-1 size-3" aria-hidden />
                            Sí
                          </Badge>
                        ) : (
                          <span className="text-xs text-zinc-700">—</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {p.is_active ? (
                            <Link
                              href={`/catalogo/${p.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Ver en tienda"
                              className="inline-flex size-9 items-center justify-center rounded-lg border border-zinc-700/50 text-zinc-500 transition-colors hover:border-zinc-500 hover:text-zinc-200"
                            >
                              <Eye className="size-4" aria-hidden />
                            </Link>
                          ) : null}
                          <Link
                            href={`/admin/catalogo/${p.slug}/editar`}
                            title="Editar"
                            className="inline-flex size-9 items-center justify-center rounded-lg border border-zinc-700/50 text-zinc-500 transition-colors hover:border-zinc-500 hover:text-zinc-200"
                          >
                            <Pencil className="size-4" aria-hidden />
                          </Link>
                          <CatalogDeleteButton productId={p.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {products.map((p) => {
              const cover = coverImageFromMedia(p.product_media);
              const hasDiscount =
                p.original_price_cents != null &&
                p.original_price_cents > p.base_price_cents;
              return (
                <div
                  key={p.id}
                  className="overflow-hidden rounded-2xl border border-zinc-700/60 bg-zinc-900/60"
                >
                  <div className="flex items-start gap-4 p-4">
                    <div className="size-16 shrink-0 overflow-hidden rounded-xl border border-zinc-700/50 bg-zinc-800">
                      {cover ? (
                        // biome-ignore lint/performance/noImgElement: mobile thumbnail
                        <img
                          src={cover}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center">
                          <Package className="size-5 text-zinc-700" aria-hidden />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start gap-2">
                        <p className="flex-1 font-semibold leading-tight text-zinc-100">
                          {p.name}
                        </p>
                        {p.is_active ? (
                          <Badge variant="success">Activo</Badge>
                        ) : (
                          <Badge variant="warning">Inactivo</Badge>
                        )}
                      </div>
                      <p className="mt-0.5 font-mono text-[10px] text-zinc-600">
                        /{p.slug}
                      </p>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-sm font-bold tabular-nums text-zinc-100">
                          {formatDOPFromCents(p.base_price_cents)}
                        </span>
                        {hasDiscount ? (
                          <span className="text-xs text-zinc-600 line-through tabular-nums">
                            {formatDOPFromCents(p.original_price_cents!)}
                          </span>
                        ) : null}
                      </div>
                      {p.is_customizable ? (
                        <div className="mt-1">
                          <Badge variant="default">
                            <Wand2 className="mr-1 size-3" aria-hidden />
                            Personalizable
                          </Badge>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t border-zinc-800/60 bg-zinc-800/30 px-4 py-3">
                    {p.is_active ? (
                      <Link
                        href={`/catalogo/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/50 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
                      >
                        <Eye className="size-3.5" aria-hidden />
                        Ver
                      </Link>
                    ) : null}
                    <Link
                      href={`/admin/catalogo/${p.slug}/editar`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                    >
                      <Pencil className="size-3.5" aria-hidden />
                      Editar
                    </Link>
                    <div className="ml-auto">
                      <CatalogDeleteButton productId={p.id} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
