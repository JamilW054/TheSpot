"use client";

import { ExternalLink, Pencil, Plus, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/drawer";
import { ProductForm } from "./product-form";
import { CatalogDeleteButton } from "./catalog-delete-button";
import {
  effectivePriceCents,
  type AdminProductRow,
} from "@/lib/db/products";
import { formatDOPFromCents } from "@/lib/format-currency";

interface Props {
  initialProducts: AdminProductRow[];
  categories: { id: string; name: string; size_preset_id?: string | null }[];
  sizePresets: { id: string; name: string; sizes: string[] }[];
  brands: { id: string; name: string }[];
  lineas: { id: string; name: string }[];
  warehouses: { id: string; name: string }[];
  initialOpenCreate?: boolean;
}

const btnCls =
  "inline-flex size-8 items-center justify-center rounded-[10px] border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export function CatalogoManager({
  initialProducts,
  categories,
  sizePresets,
  brands,
  lineas,
  warehouses,
  initialOpenCreate = false,
}: Props) {
  const router = useRouter();
  const [previewProduct, setPreviewProduct] = useState<AdminProductRow | null>(null);
  const [createOpen, setCreateOpen] = useState(initialOpenCreate);
  const createKeyRef = useRef(0);
  const [createKey, setCreateKey] = useState(0);
  const [editProduct, setEditProduct] = useState<AdminProductRow | null>(null);
  const editKeyRef = useRef(0);
  const [editKey, setEditKey] = useState(0);

  const brandById = useMemo(
    () => new Map(brands.map((b) => [b.id, b.name])),
    [brands],
  );
  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );
  const lineaById = useMemo(
    () => new Map(lineas.map((l) => [l.id, l.name])),
    [lineas],
  );

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

  return (
    <>
      {/* Top bar */}
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-[10px] bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Plus className="size-4" aria-hidden />
          Nuevo artículo
        </button>
        <Link
          href="/catalogo"
          target="_blank"
          rel="noopener noreferrer"
          className={btnCls}
          aria-label="Ver tienda pública"
          title="Tienda pública"
        >
          <ExternalLink className="size-4" aria-hidden />
        </Link>
      </div>

      {initialProducts.length === 0 ? (
        <div className="rounded-[14px] border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          No hay productos en la base de datos.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[14px] border border-border">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  "",
                  "Nombre",
                  "Precio",
                  "Ant.",
                  "Marca",
                  "Estado",
                  "Acciones",
                ].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-4 py-3 text-[13px] font-medium text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {initialProducts.map((p) => {
                const coverUrl =
                  [...(p.product_media ?? [])]
                    .sort(
                      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
                    )
                    .find((m) => m.is_cover)?.url ??
                  p.product_media?.[0]?.url;
                const originalPrice = p.original_price_cents
                  ? formatDOPFromCents(
                      typeof p.original_price_cents === "string"
                        ? Number.parseFloat(p.original_price_cents)
                        : p.original_price_cents,
                    )
                  : null;
                const brandName = p.brand_id
                  ? (brandById.get(p.brand_id) ?? "—")
                  : "—";

                return (
                  <tr
                    key={p.id}
                    className="border-b border-border last:border-0 transition-colors hover:bg-muted/20"
                  >
                    {/* Thumbnail */}
                    <td className="px-3 py-2">
                      <span className="relative flex size-10 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/60">
                        {coverUrl ? (
                          // biome-ignore lint/performance/noImgElement: dynamic R2 URL
                          <img
                            src={coverUrl}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <span className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                            —
                          </span>
                        )}
                      </span>
                    </td>
                    {/* Nombre */}
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    {/* Precio actual */}
                    <td className="px-4 py-3 tabular-nums text-foreground">
                      {formatDOPFromCents(effectivePriceCents(p))}
                    </td>
                    {/* Precio anterior */}
                    <td className="px-4 py-3 tabular-nums">
                      {originalPrice ? (
                        <span className="text-muted-foreground line-through">
                          {originalPrice}
                        </span>
                      ) : (
                        <span className="text-border">—</span>
                      )}
                    </td>
                    {/* Marca */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {brandName}
                    </td>
                    {/* Estado */}
                    <td className="px-4 py-3">
                      {p.is_active ? (
                        <Badge variant="success">Publicado</Badge>
                      ) : (
                        <Badge variant="warning">Borrador</Badge>
                      )}
                    </td>
                    {/* Acciones */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {/* Eye preview */}
                        <button
                          type="button"
                          onClick={() => setPreviewProduct(p)}
                          className={btnCls}
                          aria-label={`Vista previa de ${p.name}`}
                          title="Vista previa"
                        >
                          <EyeIcon />
                        </button>
                        {/* Store link */}
                        <Link
                          href={`/catalogo/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={btnCls}
                          aria-label={`Ver ${p.name} en tienda`}
                          title="Ver en tienda"
                        >
                          <ExternalLink className="size-3.5" aria-hidden />
                        </Link>
                        {/* Edit drawer */}
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          className={btnCls}
                          aria-label={`Editar ${p.name}`}
                          title="Editar"
                        >
                          <Pencil className="size-3.5" aria-hidden />
                        </button>
                        <CatalogDeleteButton productId={p.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview modal */}
      {previewProduct && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          {/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop closes modal */}
          <div
            aria-hidden="true"
            onClick={() => setPreviewProduct(null)}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />
          <div className="relative z-10 w-full max-w-sm rounded-[14px] border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <p className="text-[15px] font-semibold text-foreground">
                Vista previa
              </p>
              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                className="flex size-8 items-center justify-center rounded-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Cerrar"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[80vh]">
              {/* Cover image */}
              {previewProduct.product_media?.[0]?.url && (
                // biome-ignore lint/performance/noImgElement: dynamic preview URL from product media
                <img
                  src={previewProduct.product_media[0].url}
                  alt={previewProduct.name}
                  className="aspect-video w-full object-cover"
                />
              )}

              <div className="p-5 space-y-4">
                {/* Name + status */}
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
                    <Badge variant="success">Publicado</Badge>
                  ) : (
                    <Badge variant="warning">Borrador</Badge>
                  )}
                </div>

                {/* Prices */}
                <div className="flex items-baseline gap-3">
                  <span className="text-lg font-bold tabular-nums text-foreground">
                    {formatDOPFromCents(effectivePriceCents(previewProduct))}
                  </span>
                  {previewProduct.original_price_cents ? (
                    <span className="tabular-nums text-sm text-muted-foreground line-through">
                      {formatDOPFromCents(
                        typeof previewProduct.original_price_cents === "string"
                          ? Number.parseFloat(previewProduct.original_price_cents)
                          : previewProduct.original_price_cents,
                      )}
                    </span>
                  ) : null}
                </div>

                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-3">
                  {previewProduct.brand_id && brandById.get(previewProduct.brand_id) && (
                    <div>
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Marca
                      </p>
                      <p className="text-sm text-foreground">
                        {brandById.get(previewProduct.brand_id)}
                      </p>
                    </div>
                  )}
                  {previewProduct.category_id && categoryById.get(previewProduct.category_id) && (
                    <div>
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Categoría
                      </p>
                      <p className="text-sm text-foreground">
                        {categoryById.get(previewProduct.category_id)}
                      </p>
                    </div>
                  )}
                  {previewProduct.linea_id && lineaById.get(previewProduct.linea_id) && (
                    <div>
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Línea
                      </p>
                      <p className="text-sm text-foreground">
                        {lineaById.get(previewProduct.linea_id)}
                      </p>
                    </div>
                  )}
                  {previewProduct.is_customizable && (
                    <div>
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Extra
                      </p>
                      <p className="text-sm text-primary">Personalizable</p>
                    </div>
                  )}
                </div>

                {/* Sizes + stock */}
                {(() => {
                  const activeVariants = (previewProduct.product_variants ?? []).filter(
                    (v) => v.is_active !== false,
                  );
                  const withSizes = activeVariants.filter(
                    (v) => typeof v.attributes?.size === "string" && v.attributes.size,
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
                              className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2.5 py-1.5"
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

                {/* Description */}
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

                {/* Tags */}
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
                          <span
                            key={tag}
                            className="rounded-full border border-border bg-muted/30 px-2.5 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Media count */}
                {(previewProduct.product_media?.length ?? 0) > 1 && (
                  <p className="text-[11px] text-muted-foreground">
                    {previewProduct.product_media!.length} imágenes en galería
                  </p>
                )}

                {/* Edit CTA */}
                <div className="pt-1 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewProduct(null);
                      openEdit(previewProduct);
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
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

      {/* Create drawer */}
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
          lineas={lineas}
          warehouses={warehouses}
          onSuccess={handleCreateSuccess}
          onCancel={closeCreate}
        />
      </Drawer>

      {/* Edit drawer */}
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
            lineas={lineas}
            warehouses={warehouses}
            onSuccess={handleEditSuccess}
            onCancel={closeEdit}
          />
        )}
      </Drawer>
    </>
  );
}
