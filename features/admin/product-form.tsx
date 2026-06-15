"use client";

import {
  Crown,
  ImagePlus,
  Loader2,
  Plus,
  Ruler,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { SelectMenu } from "@/components/ui/select-menu";
import { Textarea } from "@/components/ui/textarea";
import { useAdminFeedback } from "@/contexts/admin-feedback-context";
import {
  type AdminProductActionState,
  adminCreateProduct,
  adminUpdateProduct,
} from "@/lib/actions/products-admin";
import { adminCreateBrand } from "@/lib/actions/admin-crud";
import type { CategoryRow } from "@/lib/db/categories";
import { type AdminProductRow, tagsFromRow } from "@/lib/db/products";
import type { SizePresetRow } from "@/lib/db/size-presets";
import { CategoryForm } from "./category-form";
import { brandFields } from "./resource-fields";
import { ResourceForm } from "./resource-form";
import { SizePresetForm } from "./size-preset-form";

const labelCls = "block text-[13px] font-medium text-foreground mb-1.5";
const fieldCls =
  "h-9 w-full rounded-[10px] border border-border bg-[#0c0c0e] px-2 text-sm font-medium text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20";

interface VariantState {
  size: string;
  enabled: boolean;
  qty: number;
}

interface VariantPayload {
  size: string;
  qty: number;
  active: boolean;
}

interface SelectOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  mode: "create" | "edit";
  categories: CategoryRow[];
  sizePresets: SizePresetRow[];
  brands?: SelectOption[];
  lineas?: SelectOption[];
  warehouses?: SelectOption[];
  initial?: AdminProductRow;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const SINGLE = "__single__";

function centsToDop(value: number | string | null | undefined): string {
  if (value == null) return "";
  const n = typeof value === "string" ? Number.parseFloat(value) : value;
  return Number.isFinite(n) ? (n / 100).toFixed(2) : "";
}

function initialVariantMap(
  initial: AdminProductRow | undefined,
  presetSizes: string[] | null,
  mode: "create" | "edit",
): Record<string, VariantState> {
  const existing = new Map<string, VariantState>();
  for (const v of initial?.product_variants ?? []) {
    const size =
      typeof v.attributes?.size === "string" ? v.attributes.size : "";
    const qty = (v.inventory ?? []).reduce((s, i) => s + (i.quantity ?? 0), 0);
    existing.set(size || SINGLE, {
      size,
      enabled: v.is_active !== false,
      qty,
    });
  }

  // Edit mode: only show sizes that already exist on the product
  if (mode === "edit" && existing.size > 0) {
    const map: Record<string, VariantState> = {};
    for (const [key, v] of existing) {
      map[key] = v;
    }
    return map;
  }

  // Create mode (or edit with no existing variants): show all preset sizes
  const map: Record<string, VariantState> = {};
  if (presetSizes && presetSizes.length > 0) {
    for (const s of presetSizes) {
      map[s] = existing.get(s) ?? { size: s, enabled: true, qty: 0 };
    }
    for (const [key, v] of existing) {
      if (key !== SINGLE && !map[key]) map[key] = v;
    }
  } else {
    map[SINGLE] = existing.get(SINGLE) ??
      [...existing.values()][0] ?? {
        size: "",
        enabled: true,
        qty: 0,
      };
  }
  return map;
}

export function ProductForm({
  mode,
  categories,
  sizePresets,
  brands = [],
  lineas = [],
  warehouses = [],
  initial,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const router = useRouter();
  const { showSuccess, showError } = useAdminFeedback();
  const actionFn = mode === "create" ? adminCreateProduct : adminUpdateProduct;
  const [state, formAction] = useActionState<
    AdminProductActionState | undefined,
    FormData
  >(actionFn, undefined);

  // Gallery
  const [media, setMedia] = useState<string[]>(() =>
    [...(initial?.product_media ?? [])]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((m) => m.url)
      .filter(Boolean),
  );
  const [uploadBusy, setUploadBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Sub-drawers
  const [brandDrawerOpen, setBrandDrawerOpen] = useState(false);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [sizePresetDrawerOpen, setSizePresetDrawerOpen] = useState(false);
  const [brandDrawerKey, setBrandDrawerKey] = useState(0);
  const [categoryDrawerKey, setCategoryDrawerKey] = useState(0);
  const [sizePresetDrawerKey, setSizePresetDrawerKey] = useState(0);

  // Category + size preset
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    initial?.category_id ?? "",
  );
  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  );
  const [selectedSizePresetId, setSelectedSizePresetId] = useState(() => {
    const initialCategory = categories.find(
      (c) => c.id === initial?.category_id,
    );
    return initialCategory?.size_preset_id ?? "";
  });
  useEffect(() => {
    const nextPresetId = selectedCategoryId
      ? (selectedCategory?.size_preset_id ?? sizePresets[0]?.id ?? "")
      : "";
    setSelectedSizePresetId(nextPresetId);
  }, [selectedCategoryId, selectedCategory?.size_preset_id, sizePresets]);

  const selectedSizePreset = useMemo(
    () => sizePresets.find((p) => p.id === selectedSizePresetId) ?? null,
    [selectedSizePresetId, sizePresets],
  );
  const presetSizes = useMemo(
    () => selectedSizePreset?.sizes ?? null,
    [selectedSizePreset],
  );

  // Variants
  const [variants, setVariants] = useState<Record<string, VariantState>>(() =>
    initialVariantMap(initial, presetSizes, mode),
  );
  useEffect(() => {
    setVariants(initialVariantMap(initial, presetSizes, mode));
  }, [presetSizes, initial, mode]);

  const variantPayload = useMemo<VariantPayload[]>(() => {
    const out: VariantPayload[] = [];
    for (const v of Object.values(variants)) {
      const single = v.size === "";
      if (!single && !v.enabled) continue;
      out.push({ size: v.size, qty: v.qty, active: single ? true : v.enabled });
    }
    return out;
  }, [variants]);

  const updateVariant = (key: string, patch: Partial<VariantState>) =>
    setVariants((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  // In edit mode: sizes not yet in the product (from preset) that can be added
  const unusedPresetSizes = useMemo(() => {
    if (mode !== "edit" || !presetSizes) return [];
    const existingKeys = new Set(Object.keys(variants));
    return presetSizes.filter((s) => !existingKeys.has(s));
  }, [mode, presetSizes, variants]);

  // Warehouse
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(
    warehouses[0]?.id ?? "",
  );

  // Action state
  const seenState = useRef<typeof state>(undefined);
  useEffect(() => {
    if (!state || state === seenState.current) return;
    seenState.current = state;
    if (state.ok) {
      showSuccess(
        mode === "create"
          ? "Producto creado correctamente."
          : "Producto guardado correctamente.",
        () => {
          if (onSuccess) {
            onSuccess();
            return;
          }
          router.replace("/admin/catalogo");
          router.refresh();
        },
      );
    } else if (state.error) {
      showError(state.error);
    }
  }, [state, mode, showSuccess, showError, router, onSuccess]);

  async function onPickFile(file: File) {
    setUploadBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("scope", "catalog");
      const res = await fetch("/api/storage/r2/upload", {
        method: "POST",
        body: fd,
      });
      const body = (await res.json()) as {
        ok?: boolean;
        url?: string | null;
        error?: string;
      };
      if (!res.ok || !body.ok) throw new Error(body.error ?? `Error ${res.status}`);
      const u = typeof body.url === "string" ? body.url : "";
      if (!u) throw new Error("R2 no devolvió URL pública.");
      setMedia((prev) => [...prev, u]);
    } catch (e) {
      showError(e instanceof Error ? e.message : "Error al subir la imagen.");
    } finally {
      setUploadBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function promoteTocover(url: string) {
    setMedia((prev) => [url, ...prev.filter((u) => u !== url)]);
  }

  const variantEntries = Object.entries(variants);
  const hasSizes = presetSizes != null && presetSizes.length > 0;

  const priceDopDefault = centsToDop(initial?.base_price_cents);
  const originalPriceDopDefault = centsToDop(initial?.original_price_cents);
  const tagsDefault = initial ? tagsFromRow(initial.product_tags).join(", ") : "";

  return (
    <>
      <form action={formAction} className="space-y-5">
        {mode === "edit" && initial ? (
          <input type="hidden" name="product_id" value={initial.id} />
        ) : null}
        <input
          type="hidden"
          name="media_json"
          value={JSON.stringify(media)}
        />
        <input
          type="hidden"
          name="variants_json"
          value={JSON.stringify(variantPayload)}
        />
        <input
          type="hidden"
          name="warehouse_id"
          value={selectedWarehouseId}
        />

        {/* ── Imágenes ── */}
        <section className="rounded-[14px] border border-border bg-card p-4">
          <p className={`${labelCls} text-base`}>Imágenes</p>
          <p className="mb-3 text-xs text-muted-foreground">
            Primera imagen = portada. Haz clic en una para promoverla.
          </p>
          <div className="flex flex-wrap items-start gap-2.5">
            {media.map((url, i) => (
              <div
                key={url}
                className="group relative flex size-24 shrink-0 overflow-hidden rounded-[10px] border border-border bg-muted/30"
              >
                {/* biome-ignore lint/performance/noImgElement: preview URL dinámica R2 */}
                <img
                  src={url}
                  alt={`Imagen ${i + 1}`}
                  className="size-full object-cover"
                />
                {i !== 0 ? (
                  <button
                    type="button"
                    aria-label={`Hacer portada: imagen ${i + 1}`}
                    onClick={() => promoteTocover(url)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <span className="flex items-center gap-1 rounded-full bg-primary/90 px-2 py-0.5 text-[9px] font-semibold text-primary-foreground">
                      <Crown className="size-2.5" aria-hidden />
                      Portada
                    </span>
                  </button>
                ) : (
                  <span className="absolute left-1 top-1 flex items-center gap-1 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-semibold text-primary-foreground pointer-events-none">
                    <Crown className="size-2.5" aria-hidden />
                    Portada
                  </span>
                )}
                <button
                  type="button"
                  aria-label="Quitar imagen"
                  onClick={() =>
                    setMedia((prev) => prev.filter((u) => u !== url))
                  }
                  className="absolute right-1 top-1 inline-flex size-5 items-center justify-center rounded-md bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive"
                >
                  <Trash2 className="size-3" aria-hidden />
                </button>
              </div>
            ))}

            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              aria-hidden
              tabIndex={-1}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onPickFile(f);
              }}
            />
            <button
              type="button"
              className="inline-flex size-24 shrink-0 flex-col items-center justify-center gap-1 rounded-[10px] border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-50"
              aria-label="Añadir imagen"
              disabled={uploadBusy}
              onClick={() => fileRef.current?.click()}
            >
              {uploadBusy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <ImagePlus className="size-4" aria-hidden />
              )}
              <span className="text-[10px] font-medium">Añadir</span>
            </button>
          </div>
        </section>

        {/* ── Info básica ── */}
        <section className="rounded-[14px] border border-border bg-card p-4 space-y-4">
          <p className={`${labelCls} text-base`}>Información básica</p>

          <Input
            label="Nombre"
            name="name"
            required
            defaultValue={initial?.name ?? ""}
            placeholder="Ej. Camiseta básica"
          />

          {mode === "edit" && initial?.slug ? (
            <p className="text-xs text-muted-foreground">
              URL:{" "}
              <span className="font-mono text-foreground">
                /catalogo/{initial.slug}
              </span>
            </p>
          ) : null}

          <Textarea
            id="product-description"
            name="description"
            rows={3}
            label="Descripción"
            defaultValue={initial?.description ?? ""}
            placeholder="Detalle del artículo"
          />

          <Textarea
            id="product-tags"
            name="tags"
            rows={2}
            label="Etiquetas (separadas por coma)"
            defaultValue={tagsDefault}
            placeholder="verano, básicos, unisex"
          />
        </section>

        {/* ── Clasificación ── */}
        <section className="rounded-[14px] border border-border bg-card p-4 space-y-4">
          <p className={`${labelCls} text-base`}>Clasificación</p>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Categoría */}
            <div className="relative">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-[13px] font-medium text-foreground">Categoría</span>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryDrawerKey((k) => k + 1);
                    setCategoryDrawerOpen(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <Plus className="size-3" aria-hidden />
                  Nueva
                </button>
              </div>
              <SelectMenu
                name="category_id"
                placeholder="Sin categoría"
                value={selectedCategoryId}
                onChange={setSelectedCategoryId}
                options={[
                  { value: "", label: "Sin categoría" },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ]}
                disabled={categories.length === 0}
              />
            </div>

            {/* Tipo de talla */}
            <div className="relative">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-[13px] font-medium text-foreground">Tipo de talla</span>
                <button
                  type="button"
                  onClick={() => {
                    setSizePresetDrawerKey((k) => k + 1);
                    setSizePresetDrawerOpen(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <Plus className="size-3" aria-hidden />
                  Nuevo
                </button>
              </div>
              <SelectMenu
                placeholder={selectedCategoryId ? "Sin tallas" : "Elige categoría primero"}
                value={selectedSizePresetId}
                onChange={setSelectedSizePresetId}
                disabled={!selectedCategoryId || sizePresets.length === 0}
                options={sizePresets.map((p) => ({
                  value: p.id,
                  label: `${p.name} (${p.sizes.join(", ")})`,
                }))}
              />
            </div>

            {/* Marca */}
            <div className="relative">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-[13px] font-medium text-foreground">Marca</span>
                <button
                  type="button"
                  onClick={() => {
                    setBrandDrawerKey((k) => k + 1);
                    setBrandDrawerOpen(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <Plus className="size-3" aria-hidden />
                  Nueva
                </button>
              </div>
              <SelectMenu
                name="brand_id"
                placeholder="Sin marca"
                defaultValue={initial?.brand_id ?? ""}
                options={[
                  { value: "", label: "Sin marca" },
                  ...brands.map((b) => ({ value: b.id, label: b.name })),
                ]}
              />
            </div>

            {/* Línea */}
            <div className="relative">
              <span className={labelCls}>Línea</span>
              <SelectMenu
                name="linea_id"
                placeholder="Sin línea"
                defaultValue={initial?.linea_id ?? ""}
                options={[
                  { value: "", label: "Sin línea" },
                  ...lineas.map((l) => ({ value: l.id, label: l.name })),
                ]}
              />
            </div>
          </div>
        </section>

        {/* ── Precios ── */}
        <section className="rounded-[14px] border border-border bg-card p-4 space-y-4">
          <p className={`${labelCls} text-base`}>Precios</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Precio base (DOP)"
              name="price_dop"
              type="text"
              inputMode="decimal"
              required
              defaultValue={priceDopDefault}
              placeholder="0.00"
            />
            <Input
              label="Precio anterior (DOP)"
              name="original_price_dop"
              type="text"
              inputMode="decimal"
              defaultValue={originalPriceDopDefault}
              placeholder="0.00 (opcional)"
            />
          </div>
        </section>

        {/* ── Variantes e inventario ── */}
        <section className="rounded-[14px] border border-border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className={`${labelCls} text-base`}>Variantes e inventario</p>
            {/* Warehouse selector */}
            {warehouses.length > 0 && (
              <div className="relative flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                  Almacén
                </span>
                <div className="relative w-40">
                  <SelectMenu
                    value={selectedWarehouseId}
                    onChange={setSelectedWarehouseId}
                    options={warehouses.map((w) => ({
                      value: w.id,
                      label: w.name,
                    }))}
                    className="space-y-0!"
                  />
                </div>
              </div>
            )}
          </div>

          {hasSizes ? (
            <div className="space-y-4">
              {/* Toggle tallas */}
              <div className="rounded-[14px] border border-border bg-muted/10 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Tallas disponibles
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {mode === "edit"
                        ? "Tallas asignadas. Pulsa para activar/desactivar."
                        : "Pulsa para activar o desactivar."}
                    </p>
                  </div>
                  <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                    {Object.values(variants).filter((v) => v.enabled).length}{" "}
                    activas
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {variantEntries.map(([key, v]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        updateVariant(key, { enabled: !v.enabled })
                      }
                      className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-4 text-sm font-semibold transition-all ${
                        v.enabled
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-background text-foreground hover:border-primary/60 hover:bg-primary/5"
                      }`}
                      aria-pressed={v.enabled}
                      aria-label={`${v.enabled ? "Desactivar" : "Activar"} talla ${v.size}`}
                    >
                      {v.size}
                    </button>
                  ))}

                  {/* In edit mode: add unused sizes from preset */}
                  {unusedPresetSizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setVariants((prev) => ({
                          ...prev,
                          [s]: { size: s, enabled: true, qty: 0 },
                        }));
                      }}
                      className="inline-flex h-10 min-w-10 items-center justify-center gap-1 rounded-full border border-dashed border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      title={`Agregar talla ${s}`}
                    >
                      <Plus className="size-3" aria-hidden />
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock por talla */}
              <div className="rounded-[14px] border border-border bg-card p-4">
                <p className="mb-3 text-sm font-semibold text-foreground">
                  Stock por talla
                </p>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {variantEntries
                    .filter(([, v]) => v.enabled)
                    .map(([key, v]) => (
                      <div
                        key={key}
                        className="rounded-lg border border-primary/20 bg-primary/5 p-3 shadow-sm"
                      >
                        <p className="mb-2 text-sm font-semibold text-foreground">
                          {v.size}
                        </p>
                        <label className="block text-xs font-medium text-muted-foreground">
                          Stock
                          <input
                            type="number"
                            min={0}
                            value={v.qty}
                            onChange={(e) =>
                              updateVariant(key, {
                                qty: Math.max(
                                  0,
                                  Number(e.target.value) || 0,
                                ),
                              })
                            }
                            className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-base font-semibold text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                          />
                        </label>
                      </div>
                    ))}
                </div>
                {variantEntries.filter(([, v]) => v.enabled).length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Activa al menos una talla para ver su stock.
                  </p>
                ) : null}
              </div>
            </div>
          ) : selectedCategoryId ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-[10px] border border-border bg-muted/20 px-3 py-2.5 text-sm text-muted-foreground">
                <Ruler className="size-4 shrink-0" aria-hidden />
                <span>
                  Sin tallas.{" "}
                  <a
                    href="/admin/tallas"
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    Configurar tallas
                  </a>
                </span>
              </div>
              <label className={labelCls}>
                Stock
                <input
                  type="number"
                  min={0}
                  value={variants[SINGLE]?.qty ?? 0}
                  onChange={(e) =>
                    updateVariant(SINGLE, {
                      qty: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                  className={`${fieldCls} mt-1.5 w-24`}
                />
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Selecciona una categoría con tallas, o deja variante única.
              </p>
              <label className={labelCls}>
                Stock (variante única)
                <input
                  type="number"
                  min={0}
                  value={variants[SINGLE]?.qty ?? 0}
                  onChange={(e) =>
                    updateVariant(SINGLE, {
                      qty: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                  className={`${fieldCls} mt-1.5 w-24`}
                />
              </label>
            </div>
          )}
        </section>

        {/* ── Configuración ── */}
        <section className="rounded-[14px] border border-border bg-card p-4">
          <p className={`${labelCls} text-base mb-3`}>Configuración</p>
          <div className="flex flex-wrap gap-5">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
              <input
                type="checkbox"
                name="published"
                defaultChecked={initial?.is_active ?? true}
                className="size-4 rounded border-border accent-primary"
              />
              Publicado en la tienda
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
              <input
                type="checkbox"
                name="is_customizable"
                defaultChecked={initial?.is_customizable ?? false}
                className="size-4 rounded border-border accent-primary"
              />
              Personalizable
            </label>
          </div>
        </section>

        {/* ── Acciones ── */}
        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-[10px] bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Save className="size-4" aria-hidden />
            {mode === "create" ? "Crear artículo" : "Guardar cambios"}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-[10px] border border-border bg-transparent px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => {
              if (onCancel) {
                onCancel();
                return;
              }
              router.push("/admin/catalogo");
            }}
          >
            <X className="size-4" aria-hidden />
            Cancelar
          </button>
        </div>
      </form>

      {/* Sub-drawers */}
      <Drawer
        open={brandDrawerOpen}
        onClose={() => setBrandDrawerOpen(false)}
        title="Nueva marca"
        width="md"
      >
        <ResourceForm
          key={brandDrawerKey}
          mode="create"
          fields={brandFields()}
          action={adminCreateBrand}
          entityLabel="la marca"
          onSuccess={() => {
            setBrandDrawerOpen(false);
            router.refresh();
          }}
          onCancel={() => setBrandDrawerOpen(false)}
        />
      </Drawer>

      <Drawer
        open={categoryDrawerOpen}
        onClose={() => setCategoryDrawerOpen(false)}
        title="Nueva categoría"
        width="lg"
      >
        <CategoryForm
          key={categoryDrawerKey}
          mode="create"
          sizePresets={sizePresets}
          onSuccess={() => {
            setCategoryDrawerOpen(false);
            router.refresh();
          }}
          onCancel={() => setCategoryDrawerOpen(false)}
        />
      </Drawer>

      <Drawer
        open={sizePresetDrawerOpen}
        onClose={() => setSizePresetDrawerOpen(false)}
        title="Nuevo tipo de talla"
        width="md"
      >
        <SizePresetForm
          key={sizePresetDrawerKey}
          mode="create"
          onSuccess={() => {
            setSizePresetDrawerOpen(false);
            router.refresh();
          }}
          onCancel={() => setSizePresetDrawerOpen(false)}
        />
      </Drawer>
    </>
  );
}
