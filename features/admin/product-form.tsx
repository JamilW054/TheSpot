"use client";

import type { BaseModelRow } from "@/lib/db/base-models";
import type { ProductRow } from "@/lib/db/products";
import {
  adminCreateProduct,
  adminUpdateProduct,
  type AdminProductActionState,
} from "@/lib/actions/products-admin";
import { Input } from "@/components/ui/input";
import {
  ImagePlus,
  Loader2,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const iconBtn =
  "inline-flex size-10 shrink-0 items-center justify-center rounded-md border-2 border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

interface ProductFormProps {
  mode: "create" | "edit";
  models: BaseModelRow[];
  initial?: ProductRow;
}

export function ProductForm({ mode, models, initial }: ProductFormProps) {
  const router = useRouter();
  const actionFn =
    mode === "create" ? adminCreateProduct : adminUpdateProduct;
  const [state, formAction] = useActionState<
    AdminProductActionState | undefined,
    FormData
  >(actionFn, undefined);

  const [coverUrl, setCoverUrl] = useState(initial?.cover_image_url ?? "");
  const [uploadBusy, setUploadBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.ok) {
      router.replace("/admin/catalogo");
      router.refresh();
    }
  }, [state?.ok, router]);

  const priceDopDefault =
    initial != null ? (initial.price_cents / 100).toFixed(2) : "";

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
      if (!u) {
        throw new Error(
          "R2 no devolvió URL pública. Configura R2_PUBLIC_BASE_URL y vuelve a subir.",
        );
      }
      setCoverUrl(u);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al subir la imagen.");
    } finally {
      setUploadBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      {mode === "edit" && initial ? (
        <input type="hidden" name="product_id" value={initial.id} />
      ) : null}

      <input type="hidden" name="cover_image_url" value={coverUrl} />

      {state?.error ? (
        <p
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="mb-3 text-sm font-medium text-foreground">
          Imagen del producto (R2)
        </p>
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex min-h-28 min-w-28 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/30">
            {coverUrl ? (
              // biome-ignore lint/performance/noImgElement: preview URL dinámica R2
              <img
                src={coverUrl}
                alt=""
                className="max-h-40 max-w-full object-contain"
              />
            ) : (
              <span className="px-2 text-center text-xs text-muted-foreground">
                Sin imagen
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
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
              className={iconBtn}
              aria-label="Subir imagen"
              disabled={uploadBusy}
              onClick={() => fileRef.current?.click()}
            >
              {uploadBusy ? (
                <Loader2 className="size-5 animate-spin" aria-hidden />
              ) : (
                <ImagePlus className="size-5" aria-hidden />
              )}
            </button>
            {coverUrl ? (
              <button
                type="button"
                className={iconBtn}
                aria-label="Quitar imagen"
                disabled={uploadBusy}
                onClick={() => setCoverUrl("")}
              >
                <Trash2 className="size-5" aria-hidden />
              </button>
            ) : null}
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          PNG, JPEG o WebP (máx. 5 MB). Se usa como portada y textura base del
          catálogo.
        </p>
      </div>

      <Input
        label="Nombre"
        name="name"
        required
        defaultValue={initial?.name ?? ""}
        placeholder="Ej. Camiseta básica"
      />

      <Input
        label="Slug (URL)"
        name="slug"
        defaultValue={initial?.slug ?? ""}
        placeholder="Se genera desde el nombre si lo dejas vacío"
      />

      <div className="space-y-1.5">
        <label
          htmlFor="product-description"
          className="text-sm font-medium text-foreground"
        >
          Descripción
        </label>
        <textarea
          id="product-description"
          name="description"
          rows={4}
          defaultValue={initial?.description ?? ""}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          placeholder="Detalle del artículo"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Precio (DOP)"
          name="price_dop"
          type="text"
          inputMode="decimal"
          required
          defaultValue={priceDopDefault}
          placeholder="0.00"
        />
        <Input
          label="Orden"
          name="sort_order"
          type="number"
          min={0}
          defaultValue={initial?.sort_order ?? 0}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="product-model_path"
          className="text-sm font-medium text-foreground"
        >
          Plantilla base (model_path)
        </label>
        <select
          id="product-model_path"
          name="model_path"
          required
          defaultValue={initial?.model_path ?? ""}
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">Seleccionar…</option>
          {models.map((m) => (
            <option key={m.path} value={m.path}>
              {m.name} ({m.path})
            </option>
          ))}
        </select>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="published"
          defaultChecked={initial?.published ?? true}
          className="size-4 rounded border-border"
        />
        Publicado en la tienda
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          aria-label={
            mode === "create" ? "Crear artículo" : "Guardar cambios"
          }
          title={mode === "create" ? "Crear artículo" : "Guardar cambios"}
          className="inline-flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Save className="size-5" aria-hidden />
        </button>
        <button
          type="button"
          className={`${iconBtn} size-10`}
          aria-label="Cancelar"
          onClick={() => router.push("/admin/catalogo")}
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>
    </form>
  );
}
