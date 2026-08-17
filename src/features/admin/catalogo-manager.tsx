"use client";

import { ExternalLink, Eye, Package, Pencil, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  AdminBadge,
  AdminFilterSelect,
  AdminSearchInput,
  DataTable,
  type DataTableColumn,
  EmptyState,
} from "@/components/admin/ui";
import { Drawer } from "@/components/ui/drawer";
import type { CategoryRow } from "@/database/repositories/categories";
import {
  type AdminProductRow,
  effectivePriceCents,
} from "@/database/repositories/products";
import type { SizePresetRow } from "@/database/repositories/size-presets";
import { formatDOPFromCents } from "@/lib/format-currency";
import { computeProductProfit } from "@/lib/pricing";
import { CatalogDeleteButton } from "./catalog-delete-button";
import { ProductForm } from "./product-form";

interface Props {
  initialProducts: AdminProductRow[];
  categories: CategoryRow[];
  sizePresets: SizePresetRow[];
  brands: { id: string; name: string }[];
  warehouses: { id: string; name: string }[];
  initialOpenCreate?: boolean;
}

type StockFilter = "all" | "in" | "low" | "out";
type StatusFilter = "all" | "published" | "draft";

const iconBtnCls =
  "inline-flex size-8 items-center justify-center rounded-[18px] border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function toCents(value: number | string | null | undefined): number {
  if (value == null) return 0;
  const n = typeof value === "string" ? Number.parseFloat(value) : value;
  return Number.isFinite(n) ? Math.round(n) : 0;
}

/** Unidades disponibles sumando el inventario de las variantes activas. */
function availableStock(p: AdminProductRow): number {
  let total = 0;
  for (const v of p.product_variants ?? []) {
    if (v.is_active === false) continue;
    for (const inv of v.inventory ?? []) {
      total += Math.max(0, (inv.quantity ?? 0) - (inv.reserved ?? 0));
    }
  }
  return total;
}

function coverUrl(p: AdminProductRow): string | undefined {
  return (
    [...(p.product_media ?? [])]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .find((m) => m.is_cover)?.url ?? p.product_media?.[0]?.url
  );
}

export function CatalogoManager({
  initialProducts,
  categories,
  sizePresets,
  brands,
  warehouses,
  initialOpenCreate = false,
}: Props) {
  const router = useRouter();
  const [previewProduct, setPreviewProduct] = useState<AdminProductRow | null>(
    null,
  );
  const [createOpen, setCreateOpen] = useState(initialOpenCreate);
  const createKeyRef = useRef(0);
  const [createKey, setCreateKey] = useState(0);
  const [editProduct, setEditProduct] = useState<AdminProductRow | null>(null);
  const editKeyRef = useRef(0);
  const [editKey, setEditKey] = useState(0);

  // Filtros
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

  const brandById = useMemo(
    () => new Map(brands.map((b) => [b.id, b.name])),
    [brands],
  );
  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return initialProducts.filter((p) => {
      if (q) {
        const brand = p.brand_id ? (brandById.get(p.brand_id) ?? "") : "";
        const haystack = `${p.name} ${p.slug} ${brand}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (categoryFilter !== "all" && p.category_id !== categoryFilter)
        return false;
      if (statusFilter === "published" && !p.is_active) return false;
      if (statusFilter === "draft" && p.is_active) return false;
      if (stockFilter !== "all") {
        const stock = availableStock(p);
        if (stockFilter === "out" && stock > 0) return false;
        if (stockFilter === "low" && (stock === 0 || stock > 5)) return false;
        if (stockFilter === "in" && stock <= 0) return false;
      }
      return true;
    });
  }, [
    initialProducts,
    search,
    categoryFilter,
    statusFilter,
    stockFilter,
    brandById,
  ]);

  const openCreate = useCallback(() => {
    createKeyRef.current += 1;
    setCreateKey(createKeyRef.current);
    setCreateOpen(true);
  }, []);

  const closeCreate = useCallback(() => {
    setCreateOpen(false);
    router.replace("/admin/catalogo");
  }, [router]);

  const handleCreateSuccess = useCallback(() => {
    setCreateOpen(false);
    setPreviewProduct(null);
    router.replace("/admin/catalogo");
    router.refresh();
  }, [router]);

  const openEdit = useCallback((p: AdminProductRow) => {
    editKeyRef.current += 1;
    setEditKey(editKeyRef.current);
    setEditProduct(p);
  }, []);

  const closeEdit = useCallback(() => setEditProduct(null), []);

  const handleEditSuccess = useCallback(() => {
    setEditProduct(null);
    setPreviewProduct(null);
    router.refresh();
  }, [router]);

  const columns = useMemo<DataTableColumn<AdminProductRow>[]>(
    () => [
      {
        key: "producto",
        header: "Producto",
        sortValue: (p) => p.name,
        cell: (p) => {
          const url = coverUrl(p);
          return (
            <span className="flex min-w-0 items-center gap-3">
              <span className="relative flex size-10 shrink-0 overflow-hidden rounded-[10px] bg-muted ring-1 ring-border/60">
                {url ? (
                  // biome-ignore lint/performance/noImgElement: URL dinámica de R2
                  <img src={url} alt="" className="size-full object-cover" />
                ) : (
                  <span className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                    —
                  </span>
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium text-foreground">
                  {p.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {p.category_id
                    ? (categoryById.get(p.category_id) ?? "Sin categoría")
                    : "Sin categoría"}
                </span>
              </span>
            </span>
          );
        },
        className: "max-w-[280px]",
      },
      {
        key: "precio",
        header: "Precio",
        align: "right",
        sortValue: (p) => effectivePriceCents(p),
        cell: (p) => {
          const original = toCents(p.original_price_cents);
          return (
            <span className="inline-flex flex-col items-end">
              <span className="tabular-nums text-foreground">
                {formatDOPFromCents(effectivePriceCents(p))}
              </span>
              {original > 0 ? (
                <span className="text-xs tabular-nums text-muted-foreground line-through">
                  {formatDOPFromCents(original)}
                </span>
              ) : null}
            </span>
          );
        },
      },
      {
        key: "margen",
        header: "Margen",
        align: "right",
        sortValue: (p) => {
          const profit = computeProductProfit(
            effectivePriceCents(p),
            toCents(p.cost_cents),
          );
          return profit.marginPct ?? -1000;
        },
        cell: (p) => {
          const cost = toCents(p.cost_cents);
          if (cost <= 0) {
            return <span className="text-xs text-muted-foreground">—</span>;
          }
          const profit = computeProductProfit(effectivePriceCents(p), cost);
          const pct = profit.marginPct;
          return (
            <span className="inline-flex flex-col items-end">
              <span
                className={`tabular-nums font-medium ${
                  profit.grossProfitCents < 0
                    ? "text-(--admin-danger)"
                    : "text-foreground"
                }`}
              >
                {pct != null ? `${pct.toFixed(1)}%` : "—"}
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {formatDOPFromCents(profit.grossProfitCents)}
              </span>
            </span>
          );
        },
        className: "hidden lg:table-cell",
        headerClassName: "hidden lg:table-cell",
      },
      {
        key: "marca",
        header: "Marca",
        sortValue: (p) => (p.brand_id ? (brandById.get(p.brand_id) ?? "") : ""),
        cell: (p) => (
          <span className="text-muted-foreground">
            {p.brand_id ? (brandById.get(p.brand_id) ?? "—") : "—"}
          </span>
        ),
        className: "hidden md:table-cell",
        headerClassName: "hidden md:table-cell",
      },
      {
        key: "stock",
        header: "Stock",
        align: "right",
        sortValue: (p) => availableStock(p),
        cell: (p) => {
          const stock = availableStock(p);
          if (stock <= 0) return <AdminBadge tone="danger">Agotado</AdminBadge>;
          if (stock <= 5)
            return <AdminBadge tone="warning">{stock} uds</AdminBadge>;
          return <span className="tabular-nums text-foreground">{stock}</span>;
        },
        className: "hidden sm:table-cell",
        headerClassName: "hidden sm:table-cell",
      },
      {
        key: "estado",
        header: "Estado",
        sortValue: (p) => (p.is_active ? 1 : 0),
        cell: (p) =>
          p.is_active ? (
            <AdminBadge tone="success" dot>
              Publicado
            </AdminBadge>
          ) : (
            <AdminBadge tone="neutral" dot>
              Borrador
            </AdminBadge>
          ),
      },
      {
        key: "acciones",
        header: <span className="sr-only">Acciones</span>,
        align: "right",
        cell: (p) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setPreviewProduct(p)}
              className={iconBtnCls}
              aria-label={`Vista previa de ${p.name}`}
              title="Vista previa"
            >
              <Eye className="size-3.5" aria-hidden />
            </button>
            <Link
              href={`/catalogo/${p.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={iconBtnCls}
              aria-label={`Ver ${p.name} en tienda`}
              title="Ver en tienda"
            >
              <ExternalLink className="size-3.5" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={() => openEdit(p)}
              className={iconBtnCls}
              aria-label={`Editar ${p.name}`}
              title="Editar"
            >
              <Pencil className="size-3.5" aria-hidden />
            </button>
            <CatalogDeleteButton productId={p.id} />
          </div>
        ),
      },
    ],
    [brandById, categoryById, openEdit],
  );

  const hasFilters =
    search.trim() !== "" ||
    categoryFilter !== "all" ||
    statusFilter !== "all" ||
    stockFilter !== "all";

  return (
    <>
      {/* Barra de herramientas: búsqueda, filtros y CTA */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre, URL o marca…"
          className="w-full sm:w-72"
        />
        <AdminFilterSelect
          value={categoryFilter}
          onChange={setCategoryFilter}
          ariaLabel="Filtrar por categoría"
          options={[
            { value: "all", label: "Todas las categorías" },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        <AdminFilterSelect
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as StatusFilter)}
          ariaLabel="Filtrar por estado"
          options={[
            { value: "all", label: "Todos los estados" },
            { value: "published", label: "Publicados" },
            { value: "draft", label: "Borradores" },
          ]}
        />
        <AdminFilterSelect
          value={stockFilter}
          onChange={(v) => setStockFilter(v as StockFilter)}
          ariaLabel="Filtrar por stock"
          options={[
            { value: "all", label: "Todo el stock" },
            { value: "in", label: "Con stock" },
            { value: "low", label: "Stock bajo (≤5)" },
            { value: "out", label: "Agotados" },
          ]}
        />
        <div className="ms-auto flex items-center gap-2">
          <Link
            href="/catalogo"
            target="_blank"
            rel="noopener noreferrer"
            className={iconBtnCls}
            aria-label="Ver tienda pública"
            title="Tienda pública"
          >
            <ExternalLink className="size-4" aria-hidden />
          </Link>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-9 items-center gap-2 rounded-[18px] bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus className="size-4" aria-hidden />
            Nuevo artículo
          </button>
        </div>
      </div>

      {/* Recuento de resultados con filtros activos */}
      {hasFilters && (
        <p className="mb-3 text-sm text-muted-foreground">
          {filtered.length} de {initialProducts.length} productos
        </p>
      )}

      <DataTable
        rows={filtered}
        columns={columns}
        rowKey={(p) => p.id}
        pageSize={10}
        ariaLabel="Productos del catálogo"
        emptyState={
          <EmptyState
            icon={<Package className="size-5" />}
            title={
              hasFilters
                ? "Sin resultados con estos filtros"
                : "No hay productos todavía"
            }
            description={
              hasFilters
                ? "Prueba a limpiar la búsqueda o los filtros."
                : "Crea tu primer artículo para verlo en la tienda."
            }
            action={
              hasFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategoryFilter("all");
                    setStatusFilter("all");
                    setStockFilter("all");
                  }}
                  className="inline-flex h-9 items-center gap-2 rounded-[18px] bg-muted px-4 text-sm font-medium text-foreground transition-colors hover:bg-border/60"
                >
                  Limpiar filtros
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openCreate}
                  className="inline-flex h-9 items-center gap-2 rounded-[18px] bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Plus className="size-4" aria-hidden />
                  Nuevo artículo
                </button>
              )
            }
          />
        }
      />

      {/* Modal de vista previa */}
      {previewProduct && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            aria-hidden="true"
            onClick={() => setPreviewProduct(null)}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />
          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <p className="text-[15px] font-semibold text-foreground">
                Vista previa
              </p>
              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                className="flex size-8 items-center justify-center rounded-[18px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Cerrar"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[80vh]">
              {previewProduct.product_media?.[0]?.url && (
                // biome-ignore lint/performance/noImgElement: URL dinámica del producto
                <img
                  src={previewProduct.product_media[0].url}
                  alt={previewProduct.name}
                  className="aspect-video w-full object-cover"
                />
              )}

              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-base text-foreground leading-snug">
                      {previewProduct.name}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      /catalogo/{previewProduct.slug}
                    </p>
                  </div>
                  {previewProduct.is_active ? (
                    <AdminBadge tone="success">Publicado</AdminBadge>
                  ) : (
                    <AdminBadge tone="neutral">Borrador</AdminBadge>
                  )}
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-lg font-bold tabular-nums text-foreground">
                    {formatDOPFromCents(effectivePriceCents(previewProduct))}
                  </span>
                  {toCents(previewProduct.original_price_cents) > 0 ? (
                    <span className="tabular-nums text-sm text-muted-foreground line-through">
                      {formatDOPFromCents(
                        toCents(previewProduct.original_price_cents),
                      )}
                    </span>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {previewProduct.brand_id &&
                    brandById.get(previewProduct.brand_id) && (
                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Marca
                        </p>
                        <p className="text-sm text-foreground">
                          {brandById.get(previewProduct.brand_id)}
                        </p>
                      </div>
                    )}
                  {previewProduct.category_id &&
                    categoryById.get(previewProduct.category_id) && (
                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Categoría
                        </p>
                        <p className="text-sm text-foreground">
                          {categoryById.get(previewProduct.category_id)}
                        </p>
                      </div>
                    )}
                </div>

                {(() => {
                  const activeVariants = (
                    previewProduct.product_variants ?? []
                  ).filter((v) => v.is_active !== false);
                  const withSizes = activeVariants.filter(
                    (v) =>
                      typeof v.attributes?.size === "string" &&
                      v.attributes.size,
                  );
                  if (withSizes.length === 0) return null;
                  return (
                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Tallas / stock
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {withSizes.map((v) => {
                          const size = v.attributes?.size as string;
                          const stock = (v.inventory ?? []).reduce(
                            (s, i) => s + (i.quantity ?? 0),
                            0,
                          );
                          return (
                            <div
                              key={v.id ?? size}
                              className="flex items-center gap-1.5 rounded-[10px] border border-border bg-muted/30 px-2.5 py-1.5"
                            >
                              <span className="text-xs font-semibold text-foreground">
                                {size}
                              </span>
                              <span className="text-[11px] tabular-nums text-muted-foreground">
                                ×{stock}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {previewProduct.description && (
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Descripción
                    </p>
                    <p className="line-clamp-4 text-sm text-muted-foreground leading-relaxed">
                      {previewProduct.description}
                    </p>
                  </div>
                )}

                {(() => {
                  const tags = (previewProduct.product_tags ?? [])
                    .flatMap((pt) => {
                      const t = pt.tags;
                      if (!t) return [];
                      return Array.isArray(t) ? t : [t];
                    })
                    .map((t) => t.slug)
                    .filter(Boolean);
                  if (tags.length === 0) return null;
                  return (
                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Etiquetas
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                          <AdminBadge key={tag} tone="outline">
                            {tag}
                          </AdminBadge>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {(previewProduct.product_media?.length ?? 0) > 1 && (
                  <p className="text-[11px] text-muted-foreground">
                    {previewProduct.product_media?.length} imágenes en galería
                  </p>
                )}

                <div className="pt-1 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewProduct(null);
                      openEdit(previewProduct);
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-[18px] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <Pencil className="size-3.5" aria-hidden />
                    Editar producto
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawer de creación */}
      <Drawer
        open={createOpen}
        onClose={closeCreate}
        title="Nuevo artículo"
        width="lg"
      >
        <ProductForm
          key={createKey}
          mode="create"
          categories={categories}
          sizePresets={sizePresets}
          brands={brands}
          warehouses={warehouses}
          onSuccess={handleCreateSuccess}
          onCancel={closeCreate}
        />
      </Drawer>

      {/* Drawer de edición */}
      <Drawer
        open={!!editProduct}
        onClose={closeEdit}
        title={editProduct ? `Editar: ${editProduct.name}` : "Editar artículo"}
        width="lg"
      >
        {editProduct && (
          <ProductForm
            key={editKey}
            mode="edit"
            initial={editProduct}
            categories={categories}
            sizePresets={sizePresets}
            brands={brands}
            warehouses={warehouses}
            onSuccess={handleEditSuccess}
            onCancel={closeEdit}
          />
        )}
      </Drawer>
    </>
  );
}
