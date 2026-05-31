"use client";

import type { ProductRow } from "@/lib/db/products";
import { coverImageFromMedia } from "@/lib/db/products";
import {
  adminCreateProduct,
  adminUpdateProduct,
  type AdminProductActionState,
} from "@/lib/actions/products-admin";
import { useAdminFeedback } from "@/contexts/admin-feedback-context";
import {
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  Package,
  Save,
  Tag,
  Trash2,
  Wand2,
} from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface ProductFormProps {
  mode: "create" | "edit";
  initial?: ProductRow;
}

function priceDopDefault(cents: number | null | undefined): string {
  if (cents == null || cents === 0) return "";
  return (cents / 100).toFixed(2);
}

export function ProductForm({ mode, initial }: ProductFormProps) {
  const router = useRouter();
  const { showSuccess, showError } = useAdminFeedback();
  const actionFn = mode === "create" ? adminCreateProduct : adminUpdateProduct;
  const [state, formAction] = useActionState<
    AdminProductActionState | undefined,
    FormData
  >(actionFn, undefined);

  const initialCover = initial
    ? coverImageFromMedia(initial.product_media)
    : "";
  const [coverUrl, setCoverUrl] = useState(initialCover);
  const [uploadBusy, setUploadBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
          router.replace("/admin/catalogo");
          router.refresh();
        },
      );
    } else if (state.error) {
      showError(state.error);
    }
  }, [state, mode, showSuccess, showError, router]);

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
      if (!res.ok || !body.ok) {
        throw new Error(body.error ?? `Error ${res.status}`);
      }
      const u = typeof body.url === "string" ? body.url : "";
      if (!u) throw new Error("R2 no devolvió URL pública.");
      setCoverUrl(u);
    } catch (e) {
      showError(e instanceof Error ? e.message : "Error al subir la imagen.");
    } finally {
      setUploadBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <form action={formAction} className="space-y-5">
      {mode === "edit" && initial ? (
        <input type="hidden" name="product_id" value={initial.id} />
      ) : null}
      <input type="hidden" name="cover_image_url" value={coverUrl} />

      {/* ── Imagen portada ── */}
      <section className="rounded-2xl border border-zinc-700/70 bg-zinc-900/60 p-5">
        <div className="mb-4 flex items-center gap-2">
          <ImageIcon className="size-4 text-zinc-500" aria-hidden />
          <h2 className="text-sm font-semibold text-zinc-200">
            Imagen de portada
          </h2>
        </div>

        <div className="flex flex-wrap items-start gap-5">
          <div className="relative flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-700/60 bg-zinc-800/60">
            {coverUrl ? (
              // biome-ignore lint/performance/noImgElement: preview R2
              <img
                src={coverUrl}
                alt="Portada del producto"
                className="size-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-1.5 px-3 text-center">
                <ImageIcon className="size-6 text-zinc-600" aria-hidden />
                <span className="text-[10px] leading-tight text-zinc-600">
                  Sin imagen
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
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
              disabled={uploadBusy}
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-600/70 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-700 disabled:opacity-50"
            >
              {uploadBusy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <ImageIcon className="size-4" aria-hidden />
              )}
              {uploadBusy ? "Subiendo…" : "Subir imagen"}
            </button>
            {coverUrl ? (
              <button
                type="button"
                disabled={uploadBusy}
                onClick={() => setCoverUrl("")}
                className="inline-flex items-center gap-2 rounded-xl border border-red-800/40 bg-red-900/20 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-900/30 disabled:opacity-50"
              >
                <Trash2 className="size-4" aria-hidden />
                Quitar imagen
              </button>
            ) : null}
            <p className="text-xs text-zinc-600">
              PNG, JPEG o WebP · máx. 5 MB
            </p>
          </div>
        </div>
      </section>

      {/* ── Información básica ── */}
      <section className="rounded-2xl border border-zinc-700/70 bg-zinc-900/60 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Package className="size-4 text-zinc-500" aria-hidden />
          <h2 className="text-sm font-semibold text-zinc-200">
            Información básica
          </h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="pf-name"
              className="text-xs font-medium uppercase tracking-wider text-zinc-400"
            >
              Nombre <span className="text-red-400">*</span>
            </label>
            <input
              id="pf-name"
              name="name"
              required
              defaultValue={initial?.name ?? ""}
              placeholder="Ej. Camiseta básica"
              className="h-10 w-full rounded-xl border border-zinc-700/60 bg-zinc-800/70 px-4 text-sm text-zinc-100 placeholder:text-zinc-600 transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {mode === "edit" && initial?.slug ? (
            <p className="flex items-center gap-1.5 text-xs text-zinc-600">
              <span className="font-mono text-zinc-500">/catalogo/{initial.slug}</span>
              <span>· El slug no cambia al editar</span>
            </p>
          ) : mode === "create" ? (
            <p className="text-xs text-zinc-600">
              La URL se genera automáticamente del nombre al crear.
            </p>
          ) : null}

          <div className="space-y-1.5">
            <label
              htmlFor="pf-description"
              className="text-xs font-medium uppercase tracking-wider text-zinc-400"
            >
              Descripción
            </label>
            <textarea
              id="pf-description"
              name="description"
              rows={4}
              defaultValue={initial?.description ?? ""}
              placeholder="Detalle del artículo…"
              className="w-full resize-none rounded-xl border border-zinc-700/60 bg-zinc-800/70 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </section>

      {/* ── Precios ── */}
      <section className="rounded-2xl border border-zinc-700/70 bg-zinc-900/60 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Tag className="size-4 text-zinc-500" aria-hidden />
          <h2 className="text-sm font-semibold text-zinc-200">Precios</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="pf-base-price"
              className="text-xs font-medium uppercase tracking-wider text-zinc-400"
            >
              Precio base (DOP) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                RD$
              </span>
              <input
                id="pf-base-price"
                name="base_price_dop"
                type="text"
                inputMode="decimal"
                required
                defaultValue={priceDopDefault(initial?.base_price_cents)}
                placeholder="0.00"
                className="h-10 w-full rounded-xl border border-zinc-700/60 bg-zinc-800/70 pl-11 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="pf-original-price"
              className="text-xs font-medium uppercase tracking-wider text-zinc-400"
            >
              Precio original (DOP)
              <span className="ml-2 font-normal normal-case text-zinc-600">
                opcional, para descuento
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                RD$
              </span>
              <input
                id="pf-original-price"
                name="original_price_dop"
                type="text"
                inputMode="decimal"
                defaultValue={priceDopDefault(initial?.original_price_cents)}
                placeholder="0.00"
                className="h-10 w-full rounded-xl border border-zinc-700/60 bg-zinc-800/70 pl-11 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <p className="text-xs text-zinc-600">
              Si se especifica, se muestra tachado junto al precio base.
            </p>
          </div>
        </div>
      </section>

      {/* ── Configuración ── */}
      <section className="rounded-2xl border border-zinc-700/70 bg-zinc-900/60 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Wand2 className="size-4 text-zinc-500" aria-hidden />
          <h2 className="text-sm font-semibold text-zinc-200">Configuración</h2>
        </div>

        <div className="space-y-3">
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-700/50 bg-zinc-800/40 px-4 py-3 transition-colors hover:bg-zinc-800/60">
            <div>
              <p className="text-sm font-medium text-zinc-200">
                Activo en la tienda
              </p>
              <p className="text-xs text-zinc-500">
                Visible para los clientes en el catálogo público.
              </p>
            </div>
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={initial?.is_active ?? true}
              className="size-5 cursor-pointer rounded border-zinc-600 accent-primary"
            />
          </label>

        </div>
      </section>

      {/* ── Acciones ── */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <Save className="size-4" aria-hidden />
          {mode === "create" ? "Crear artículo" : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/catalogo")}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700/60"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Cancelar
        </button>
      </div>
    </form>
  );
}
