"use client";

import { usePanelBase } from "@/lib/panel-base";
import { Crown, ImagePlus, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { SelectMenu } from "@/components/ui/select-menu";
import { Textarea } from "@/components/ui/textarea";
import { useAdminFeedback } from "@/contexts/admin-feedback-context";
import type { CategoryRow } from "@/database/repositories/categories";
import {
  type AdminProductRow,
  tagsFromRow,
} from "@/database/repositories/products";
import type { SizePresetRow } from "@/database/repositories/size-presets";
import { adminCreateBrand } from "@/lib/actions/admin-crud";
import {
  type AdminProductActionState,
  adminCreateProduct,
  adminUpdateProduct,
} from "@/lib/actions/products-admin";
import { formatDOPFromCents } from "@/lib/format-currency";
import { computeProductProfit } from "@/lib/pricing";
import { variantKey } from "@/lib/variants";
import { CategoryForm } from "./category-form";
import { brandFields } from "./resource-fields";
import { ResourceForm } from "./resource-form";
import { SizePresetForm } from "./size-preset-form";

const labelCls = "block text-[13px] font-medium text-foreground mb-1.5";
const fieldCls =
  "h-9 w-full rounded-[10px] border border-border bg-background px-2 text-sm font-medium text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20";
const stockInputCls =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-base font-semibold text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20";

interface ColorValue {
  label: string;
  hex: string;
}

interface VariantPayload {
  size: string;
  color: string;
  hex: string;
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
  warehouses?: SelectOption[];
  initial?: AdminProductRow;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function centsToDop(value: number | string | null | undefined): string {
  if (value == null) return "";
  const n = typeof value === "string" ? Number.parseFloat(value) : value;
  return Number.isFinite(n) ? (n / 100).toFixed(2) : "";
}

interface InitialAxes {
  sizeEnabled: boolean;
  colorEnabled: boolean;
  sizes: string[];
  colors: ColorValue[];
  stock: Record<string, number>;
  singleQty: number;
}

/** Reconstruye los ejes (talla/color) y el stock por combinación desde las variantes. */
function deriveInitialAxes(initial: AdminProductRow | undefined): InitialAxes {
  const variants = initial?.product_variants ?? [];
  const sizes: string[] = [];
  const colors: ColorValue[] = [];
  const seenSize = new Set<string>();
  const seenColor = new Set<string>();
  const stock: Record<string, number> = {};
  let singleQty = 0;

  for (const v of variants) {
    if (v.is_active === false) continue;
    const size =
      typeof v.attributes?.size === "string" ? v.attributes.size : "";
    const color =
      typeof v.attributes?.color === "string" ? v.attributes.color : "";
    const hex = typeof v.attributes?.hex === "string" ? v.attributes.hex : "";
    const qty = (v.inventory ?? []).reduce((s, i) => s + (i.quantity ?? 0), 0);
    if (size && !seenSize.has(size.toLowerCase())) {
      seenSize.add(size.toLowerCase());
      sizes.push(size);
    }
    if (color && !seenColor.has(color.toLowerCase())) {
      seenColor.add(color.toLowerCase());
      colors.push({ label: color, hex: hex || "#111111" });
    }
    if (!size && !color) singleQty = qty;
    else stock[variantKey(size, color)] = qty;
  }

  return {
    sizeEnabled: sizes.length > 0,
    colorEnabled: colors.length > 0,
    sizes,
    colors,
    stock,
    singleQty,
  };
}

/** Une dos listas de strings sin duplicar (case-insensitive), preservando orden. */
function unionSizes(a: string[], b: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of [...a, ...b]) {
    const k = s.toLowerCase();
    if (s && !seen.has(k)) {
      seen.add(k);
      out.push(s);
    }
  }
  return out;
}

/** Une dos listas de colores por label (case-insensitive), preservando orden. */
function unionColors(a: ColorValue[], b: ColorValue[]): ColorValue[] {
  const seen = new Set<string>();
  const out: ColorValue[] = [];
  for (const c of [...a, ...b]) {
    const k = c.label.toLowerCase();
    if (c.label && !seen.has(k)) {
      seen.add(k);
      out.push(c);
    }
  }
  return out;
}

export function ProductForm({
  mode,
  categories,
  sizePresets,
  brands = [],
  warehouses = [],
  initial,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const panelBase = usePanelBase();
  const router = useRouter();
  const { showSuccess, showError } = useAdminFeedback();
  const actionFn = mode === "create" ? adminCreateProduct : adminUpdateProduct;
  const [state, formAction] = useActionState<
    AdminProductActionState | undefined,
    FormData
  >(actionFn, undefined);

  const sizePresetList = useMemo(
    () => sizePresets.filter((p) => p.kind === "size"),
    [sizePresets],
  );
  const colorPresetList = useMemo(
    () => sizePresets.filter((p) => p.kind === "color"),
    [sizePresets],
  );

  const initialAxes = useMemo(() => deriveInitialAxes(initial), [initial]);

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
  const [presetDrawerOpen, setPresetDrawerOpen] = useState(false);
  const [brandDrawerKey, setBrandDrawerKey] = useState(0);
  const [categoryDrawerKey, setCategoryDrawerKey] = useState(0);
  const [presetDrawerKey, setPresetDrawerKey] = useState(0);

  // Category
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    initial?.category_id ?? "",
  );

  // ── Eje talla ──
  const [sizeEnabled, setSizeEnabled] = useState(initialAxes.sizeEnabled);
  const [sizePresetId, setSizePresetId] = useState("");
  const [activeSizes, setActiveSizes] = useState<string[]>(initialAxes.sizes);
  const sizePreset = useMemo(
    () => sizePresetList.find((p) => p.id === sizePresetId) ?? null,
    [sizePresetList, sizePresetId],
  );
  // Pills = tallas del preset ∪ tallas ya activas (para edición conserva existentes).
  const sizePool = useMemo(
    () => unionSizes(sizePreset?.sizes ?? [], activeSizes),
    [sizePreset, activeSizes],
  );

  // ── Eje color ──
  const [colorEnabled, setColorEnabled] = useState(initialAxes.colorEnabled);
  const [colorPresetId, setColorPresetId] = useState("");
  const [activeColors, setActiveColors] = useState<ColorValue[]>(
    initialAxes.colors,
  );
  const colorPreset = useMemo(
    () => colorPresetList.find((p) => p.id === colorPresetId) ?? null,
    [colorPresetList, colorPresetId],
  );
  const colorPool = useMemo(() => {
    const presetColors: ColorValue[] = (colorPreset?.items ?? []).map((i) => ({
      label: i.label,
      hex: i.hex ?? "#111111",
    }));
    return unionColors(presetColors, activeColors);
  }, [colorPreset, activeColors]);

  // ── Stock ──
  const [stockMap, setStockMap] = useState<Record<string, number>>(
    initialAxes.stock,
  );
  const [singleQty, setSingleQty] = useState<number>(initialAxes.singleQty);

  const hasSizeAxis = sizeEnabled && activeSizes.length > 0;
  const hasColorAxis = colorEnabled && activeColors.length > 0;
  const isSingle = !hasSizeAxis && !hasColorAxis;

  const cellQty = (size: string, color: string | null): number => {
    if (isSingle) return singleQty;
    return stockMap[variantKey(size, color)] ?? 0;
  };
  const setCellQty = (size: string, color: string | null, qty: number) => {
    const v = Math.max(0, qty || 0);
    if (isSingle) {
      setSingleQty(v);
      return;
    }
    setStockMap((prev) => ({ ...prev, [variantKey(size, color)]: v }));
  };

  const toggleSize = (s: string) =>
    setActiveSizes((prev) =>
      prev.some((x) => x.toLowerCase() === s.toLowerCase())
        ? prev.filter((x) => x.toLowerCase() !== s.toLowerCase())
        : [...prev, s],
    );
  const toggleColor = (c: ColorValue) =>
    setActiveColors((prev) =>
      prev.some((x) => x.label.toLowerCase() === c.label.toLowerCase())
        ? prev.filter((x) => x.label.toLowerCase() !== c.label.toLowerCase())
        : [...prev, c],
    );
  const sizeOn = (s: string) =>
    activeSizes.some((x) => x.toLowerCase() === s.toLowerCase());
  const colorOn = (label: string) =>
    activeColors.some((x) => x.label.toLowerCase() === label.toLowerCase());

  // Al elegir preset de talla: precarga sus tallas como activas.
  const onPickSizePreset = (id: string) => {
    setSizePresetId(id);
    const preset = sizePresetList.find((p) => p.id === id);
    if (preset) setActiveSizes(preset.sizes);
  };
  const onPickColorPreset = (id: string) => {
    setColorPresetId(id);
    const preset = colorPresetList.find((p) => p.id === id);
    if (preset)
      setActiveColors(
        preset.items.map((i) => ({ label: i.label, hex: i.hex ?? "#111111" })),
      );
  };

  // Payload de variantes: producto cartesiano de los ejes activos.
  const variantPayload = useMemo<VariantPayload[]>(() => {
    const sizesAxis = hasSizeAxis ? activeSizes : [""];
    const colorsAxis: (ColorValue | null)[] = hasColorAxis
      ? activeColors
      : [null];
    const out: VariantPayload[] = [];
    for (const s of sizesAxis) {
      for (const c of colorsAxis) {
        out.push({
          size: s,
          color: c?.label ?? "",
          hex: c?.hex ?? "",
          qty: cellQty(s, c?.label ?? null),
          active: true,
        });
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasSizeAxis,
    hasColorAxis,
    activeSizes,
    activeColors,
    stockMap,
    singleQty,
  ]);

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
          router.replace(`${panelBase}/catalogo`);
          router.refresh();
        },
      );
    } else if (state.error) {
      showError(state.error);
    }
  }, [state, mode, showSuccess, showError, router, onSuccess]);

  async function uploadOne(file: File): Promise<string> {
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
    if (!u) throw new Error("El almacenamiento no devolvió una URL pública.");
    return u;
  }

  /** Sube varias imágenes en orden; las que fallan se informan sin frenar al resto. */
  async function onPickFiles(files: File[]) {
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) return;
    setUploadBusy(true);
    const errors: string[] = [];
    try {
      for (const file of images) {
        try {
          const url = await uploadOne(file);
          setMedia((prev) => (prev.includes(url) ? prev : [...prev, url]));
        } catch (e) {
          errors.push(
            `${file.name}: ${e instanceof Error ? e.message : "error al subir"}`,
          );
        }
      }
      if (errors.length > 0) showError(errors.join("\n"));
    } finally {
      setUploadBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const [dragOver, setDragOver] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  function addImageUrl() {
    const u = urlDraft.trim();
    if (!/^https?:\/\//i.test(u)) {
      showError("Pega una URL que empiece con http:// o https://");
      return;
    }
    setMedia((prev) => (prev.includes(u) ? prev : [...prev, u]));
    setUrlDraft("");
  }
  function moveImage(url: string, dir: -1 | 1) {
    setMedia((prev) => {
      const i = prev.indexOf(url);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function promoteTocover(url: string) {
    setMedia((prev) => [url, ...prev.filter((u) => u !== url)]);
  }

  const priceDopDefault = centsToDop(initial?.base_price_cents);
  const originalPriceDopDefault = centsToDop(initial?.original_price_cents);
  const costDopDefault = centsToDop(initial?.cost_cents);

  // Rentabilidad en vivo: precio y coste como texto (inputs decimales).
  const [priceInput, setPriceInput] = useState(priceDopDefault);
  const [costInput, setCostInput] = useState(costDopDefault);
  const profit = useMemo(() => {
    const price = Number.parseFloat(priceInput.replace(",", "."));
    const cost = Number.parseFloat(costInput.replace(",", "."));
    return computeProductProfit(
      Number.isFinite(price) ? Math.round(price * 100) : 0,
      Number.isFinite(cost) ? Math.round(cost * 100) : 0,
    );
  }, [priceInput, costInput]);
  const tagsDefault = initial
    ? tagsFromRow(initial.product_tags).join(", ")
    : "";

  const axisToggleCls = (on: boolean) =>
    `inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors ${
      on
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-background text-foreground hover:border-primary/60"
    }`;

  return (
    <>
      <form action={formAction} className="space-y-5">
        {mode === "edit" && initial ? (
          <input type="hidden" name="product_id" value={initial.id} />
        ) : null}
        <input type="hidden" name="media_json" value={JSON.stringify(media)} />
        <input
          type="hidden"
          name="variants_json"
          value={JSON.stringify(variantPayload)}
        />
        <input type="hidden" name="warehouse_id" value={selectedWarehouseId} />

        {/* ── Imágenes ── */}
        <section
          className={`rounded-3xl border bg-card p-4 transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-border"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void onPickFiles(Array.from(e.dataTransfer.files));
          }}
        >
          <p className={`${labelCls} text-base`}>Imágenes</p>
          <p className="mb-3 text-xs text-muted-foreground">
            Arrastra varias fotos aquí o usa «Añadir» (PNG, JPG o WebP, máx. 5
            MB c/u). La primera es la portada: pasa el mouse sobre una foto
            para hacerla portada, moverla o quitarla.
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
                <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    aria-label={`Mover imagen ${i + 1} a la izquierda`}
                    disabled={i === 0}
                    onClick={() => moveImage(url, -1)}
                    className="inline-flex size-5 items-center justify-center rounded-md bg-black/60 text-[11px] text-white disabled:opacity-30"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    aria-label={`Mover imagen ${i + 1} a la derecha`}
                    disabled={i === media.length - 1}
                    onClick={() => moveImage(url, 1)}
                    className="inline-flex size-5 items-center justify-center rounded-md bg-black/60 text-[11px] text-white disabled:opacity-30"
                  >
                    ›
                  </button>
                </div>
              </div>
            ))}

            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              aria-hidden
              tabIndex={-1}
              onChange={(e) => {
                const list = e.target.files ? Array.from(e.target.files) : [];
                if (list.length > 0) void onPickFiles(list);
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
          <div className="mt-3 flex gap-2">
            <input
              type="url"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addImageUrl();
                }
              }}
              placeholder="…o pega la URL de una imagen"
              className="h-9 min-w-0 flex-1 rounded-[10px] border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={addImageUrl}
              disabled={!urlDraft.trim()}
              className="h-9 rounded-[10px] border border-border px-3 text-sm font-medium text-foreground transition-colors hover:border-primary disabled:opacity-50"
            >
              Agregar URL
            </button>
          </div>
        </section>

        {/* ── Info básica ── */}
        <section className="rounded-3xl border border-border bg-card p-4 space-y-4">
          <p className={`${labelCls} text-base`}>Información básica</p>

          <Input
            label="Nombre"
            name="name"
            required
            defaultValue={initial?.name ?? ""}
            placeholder="Ej. Noir Intense Eau de Parfum"
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
            placeholder="amaderado, unisex, regalo"
          />
        </section>

        {/* ── Clasificación ── */}
        <section className="rounded-3xl border border-border bg-card p-4 space-y-4">
          <p className={`${labelCls} text-base`}>Clasificación</p>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Categoría */}
            <div className="relative">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-[13px] font-medium text-foreground">
                  Categoría
                </span>
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

            {/* Marca */}
            <div className="relative">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-[13px] font-medium text-foreground">
                  Marca
                </span>
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
          </div>
        </section>

        {/* ── Precios y rentabilidad ── */}
        <section className="rounded-3xl border border-border bg-card p-4 space-y-4">
          <p className={`${labelCls} text-base`}>Precios y rentabilidad</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Precio de venta (DOP)"
              name="price_dop"
              type="text"
              inputMode="decimal"
              required
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
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
            <Input
              label="Coste unitario (DOP)"
              name="cost_dop"
              type="text"
              inputMode="decimal"
              value={costInput}
              onChange={(e) => setCostInput(e.target.value)}
              placeholder="0.00 (opcional)"
              help="Lo que te cuesta producir o adquirir una unidad."
            />
          </div>

          {/* Panel de rentabilidad calculado en vivo */}
          <div className="space-y-2">
            <dl className="flex flex-wrap gap-x-8 gap-y-4 rounded-[10px] border border-border bg-muted/40 p-4">
              <div className="min-w-[132px] flex-1 space-y-1.5">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Precio de venta
                </dt>
                <dd className="text-base font-semibold tabular-nums text-foreground">
                  {formatDOPFromCents(profit.priceCents)}
                </dd>
              </div>
              <div className="min-w-[132px] flex-1 space-y-1.5">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Ganancia bruta
                </dt>
                <dd
                  className={`text-base font-semibold tabular-nums ${
                    profit.grossProfitCents < 0
                      ? "text-destructive"
                      : "text-foreground"
                  }`}
                >
                  {formatDOPFromCents(profit.grossProfitCents)}
                </dd>
              </div>
              <div className="min-w-[132px] flex-1 space-y-1.5">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Margen
                </dt>
                <dd
                  className={`text-base font-semibold tabular-nums ${
                    (profit.marginPct ?? 0) < 0
                      ? "text-destructive"
                      : "text-foreground"
                  }`}
                >
                  {profit.marginPct != null
                    ? `${profit.marginPct.toFixed(1)}%`
                    : "—"}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* ── Variantes e inventario ── */}
        <section className="rounded-3xl border border-border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className={`${labelCls} text-base`}>Variantes e inventario</p>
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

          {/* Toggles de eje */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSizeEnabled((v) => !v)}
              className={axisToggleCls(sizeEnabled)}
              aria-pressed={sizeEnabled}
            >
              Varía por talla o tamaño
            </button>
            <button
              type="button"
              onClick={() => setColorEnabled((v) => !v)}
              className={axisToggleCls(colorEnabled)}
              aria-pressed={colorEnabled}
            >
              Varía por color
            </button>
            <button
              type="button"
              onClick={() => {
                setPresetDrawerKey((k) => k + 1);
                setPresetDrawerOpen(true);
              }}
              className="inline-flex h-9 items-center gap-1 rounded-full border border-dashed border-border bg-background px-3 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Plus className="size-3" aria-hidden />
              Nuevo tipo
            </button>
          </div>

          {/* Selección de valores por eje */}
          {sizeEnabled && (
            <div className="rounded-3xl border border-border bg-muted/10 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">Tallas / tamaños</p>
                <div className="w-56">
                  <SelectMenu
                    placeholder="Cargar desde tipo…"
                    value={sizePresetId}
                    onChange={onPickSizePreset}
                    disabled={sizePresetList.length === 0}
                    options={sizePresetList.map((p) => ({
                      value: p.id,
                      label: `${p.name} (${p.sizes.join(", ")})`,
                    }))}
                  />
                </div>
              </div>
              {sizePool.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {sizePool.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      aria-pressed={sizeOn(s)}
                      className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-4 text-sm font-semibold transition-all ${
                        sizeOn(s)
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-background text-foreground hover:border-primary/60"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Elige un tipo o crea uno con “Nuevo tipo”.
                </p>
              )}
            </div>
          )}

          {colorEnabled && (
            <div className="rounded-3xl border border-border bg-muted/10 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">Colores</p>
                <div className="w-56">
                  <SelectMenu
                    placeholder="Cargar desde tipo…"
                    value={colorPresetId}
                    onChange={onPickColorPreset}
                    disabled={colorPresetList.length === 0}
                    options={colorPresetList.map((p) => ({
                      value: p.id,
                      label: `${p.name} (${p.sizes.join(", ")})`,
                    }))}
                  />
                </div>
              </div>
              {colorPool.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {colorPool.map((c) => {
                    const on = colorOn(c.label);
                    return (
                      <button
                        key={c.label}
                        type="button"
                        onClick={() => toggleColor(c)}
                        aria-pressed={on}
                        className={`inline-flex h-10 items-center gap-2 rounded-full border px-3 text-sm font-semibold transition-all ${
                          on
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border bg-background text-foreground hover:border-primary/60"
                        }`}
                      >
                        <span
                          className="size-5 rounded-full border border-border"
                          style={{ backgroundColor: c.hex }}
                          aria-hidden
                        />
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Elige un tipo de color o crea uno con “Nuevo tipo”.
                </p>
              )}
            </div>
          )}

          {/* Stock */}
          <StockEditor
            isSingle={isSingle}
            hasSizeAxis={hasSizeAxis}
            hasColorAxis={hasColorAxis}
            activeSizes={activeSizes}
            activeColors={activeColors}
            cellQty={cellQty}
            setCellQty={setCellQty}
          />
        </section>

        {/* ── Configuración ── */}
        <section className="rounded-3xl border border-border bg-card p-4">
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
          </div>
        </section>

        {/* ── Acciones ── */}
        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-[18px] bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
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
              router.push(`${panelBase}/catalogo`);
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
          categories={categories}
          sizePresets={sizePresets}
          onSuccess={() => {
            setCategoryDrawerOpen(false);
            router.refresh();
          }}
          onCancel={() => setCategoryDrawerOpen(false)}
        />
      </Drawer>

      <Drawer
        open={presetDrawerOpen}
        onClose={() => setPresetDrawerOpen(false)}
        title="Nuevo tipo de variante"
        width="md"
      >
        <SizePresetForm
          key={presetDrawerKey}
          mode="create"
          onSuccess={() => {
            setPresetDrawerOpen(false);
            router.refresh();
          }}
          onCancel={() => setPresetDrawerOpen(false)}
        />
      </Drawer>
    </>
  );
}

interface StockEditorProps {
  isSingle: boolean;
  hasSizeAxis: boolean;
  hasColorAxis: boolean;
  activeSizes: string[];
  activeColors: ColorValue[];
  cellQty: (size: string, color: string | null) => number;
  setCellQty: (size: string, color: string | null, qty: number) => void;
}

/** Editor de stock: único, lista (un eje) o matriz (talla × color). */
function StockEditor({
  isSingle,
  hasSizeAxis,
  hasColorAxis,
  activeSizes,
  activeColors,
  cellQty,
  setCellQty,
}: StockEditorProps) {
  if (isSingle) {
    return (
      <div className="rounded-3xl border border-border bg-card p-4">
        <label className={labelCls}>
          Stock (variante única)
          <input
            type="number"
            min={0}
            value={cellQty("", null)}
            onChange={(e) => setCellQty("", null, Number(e.target.value))}
            className={`${fieldCls} mt-1.5 w-24`}
          />
        </label>
      </div>
    );
  }

  // Matriz talla × color
  if (hasSizeAxis && hasColorAxis) {
    return (
      <div className="overflow-x-auto rounded-3xl border border-border bg-card p-4">
        <p className="mb-3 text-sm font-semibold text-foreground">
          Stock por talla/tamaño y color
        </p>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">
                Talla \ Color
              </th>
              {activeColors.map((c) => (
                <th key={c.label} className="px-2 py-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                    <span
                      className="size-3.5 rounded-full border border-border"
                      style={{ backgroundColor: c.hex }}
                      aria-hidden
                    />
                    {c.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeSizes.map((s) => (
              <tr key={s} className="border-t border-border">
                <td className="px-2 py-2 text-sm font-semibold text-foreground">
                  {s}
                </td>
                {activeColors.map((c) => (
                  <td key={c.label} className="px-2 py-2">
                    <input
                      type="number"
                      min={0}
                      aria-label={`Stock ${s} ${c.label}`}
                      value={cellQty(s, c.label)}
                      onChange={(e) =>
                        setCellQty(s, c.label, Number(e.target.value))
                      }
                      className={`${stockInputCls} w-20`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Un solo eje: lista
  const cells: {
    key: string;
    label: string;
    hex?: string;
    size: string;
    color: string | null;
  }[] = hasSizeAxis
    ? activeSizes.map((s) => ({
        key: s,
        label: s,
        size: s,
        color: null,
      }))
    : activeColors.map((c) => ({
        key: c.label,
        label: c.label,
        hex: c.hex,
        size: "",
        color: c.label,
      }));

  return (
    <div className="rounded-3xl border border-border bg-card p-4">
      <p className="mb-3 text-sm font-semibold text-foreground">
        Stock por {hasSizeAxis ? "talla" : "color"}
      </p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cells.map((cell) => (
          <div
            key={cell.key}
            className="rounded-lg border border-primary/20 bg-primary/5 p-3 shadow-sm"
          >
            <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
              {cell.hex ? (
                <span
                  className="size-3.5 rounded-full border border-border"
                  style={{ backgroundColor: cell.hex }}
                  aria-hidden
                />
              ) : null}
              {cell.label}
            </p>
            <label className="block text-xs font-medium text-muted-foreground">
              Stock
              <input
                type="number"
                min={0}
                value={cellQty(cell.size, cell.color)}
                onChange={(e) =>
                  setCellQty(cell.size, cell.color, Number(e.target.value))
                }
                className={`${stockInputCls} mt-1.5`}
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
