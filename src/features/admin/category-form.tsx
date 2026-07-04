"use client";

import { ImageIcon, Loader2, Save, Trash2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type ReactNode,
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Input } from "@/components/ui/input";
import { SelectMenu } from "@/components/ui/select-menu";
import { useAdminFeedback } from "@/contexts/admin-feedback-context";
import {
  type AdminCategoryActionState,
  adminCreateCategory,
  adminUpdateCategory,
} from "@/lib/actions/categories-admin";
import type { CategoryRow } from "@/database/repositories/categories";
import type { SizePresetRow } from "@/database/repositories/size-presets";

const MAX_IMAGE_URL_LEN = 2048;

function validateCategoryImageUrlInput(t: string): string | null {
  const s = t.trim();
  if (!s) return null;
  if (s.length > MAX_IMAGE_URL_LEN)
    return `Como máximo ${MAX_IMAGE_URL_LEN} caracteres.`;
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:")
      return "La URL debe empezar por http:// o https://.";
  } catch {
    return "URL no válida (prueba con el enlace directo a la imagen).";
  }
  return null;
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
      {children}
    </h2>
  );
}

interface CategoryFormProps {
  mode: "create" | "edit";
  initial?: CategoryRow;
  sizePresets?: SizePresetRow[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CategoryForm({
  mode,
  initial,
  sizePresets = [],
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const router = useRouter();
  const { showSuccess, showError } = useAdminFeedback();
  const fileInputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const actionFn =
    mode === "create" ? adminCreateCategory : adminUpdateCategory;
  const [state, formAction, pending] = useActionState<
    AdminCategoryActionState | undefined,
    FormData
  >(actionFn, undefined);

  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [uploadBusy, setUploadBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const urlError = validateCategoryImageUrlInput(imageUrl);

  const seenState = useRef<typeof state>(undefined);
  useEffect(() => {
    if (!state || state === seenState.current) return;
    seenState.current = state;
    if (state.ok) {
      const label =
        mode === "create"
          ? "Categoría creada correctamente."
          : "Categoría guardada correctamente.";
      showSuccess(label, () => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.replace("/admin/categorias");
          router.refresh();
        }
      });
    } else if (state.error) {
      showError(state.error);
    }
  }, [state, mode, showSuccess, showError, router, onSuccess]);

  async function uploadFile(file: File) {
    setUploadBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("scope", "categories");
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
      setImageUrl(u);
    } catch (e) {
      showError(e instanceof Error ? e.message : "Error al subir la imagen.");
    } finally {
      setUploadBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <form action={formAction} className="space-y-10">
      {mode === "edit" && initial ? (
        <input type="hidden" name="category_id" value={initial.id} />
      ) : null}

      <input type="hidden" name="image_url" value={imageUrl.trim()} />

      <section>
        <SectionLabel>Datos</SectionLabel>
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Nombre"
                name="name"
                required
                defaultValue={initial?.name ?? ""}
                placeholder="Ej. Sudaderas"
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Input
                label="Slug (opcional)"
                name="slug"
                defaultValue={initial?.slug ?? ""}
                placeholder="Vacío = se genera desde el nombre"
              />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Visible en la tienda como{" "}
                <span className="font-mono text-foreground/90">
                  ?categoria=
                  <span className="text-primary">slug</span>
                </span>
                . Si el slug ya existe, se añade un sufijo.
              </p>
            </div>
            <div className="sm:col-span-2 relative">
              <SelectMenu
                id="category-size_preset_id"
                name="size_preset_id"
                label="Tipo de talla"
                defaultValue={initial?.size_preset_id ?? ""}
                placeholder="Sin tallas definidas"
                options={[
                  { value: "", label: "Sin tallas definidas" },
                  ...sizePresets
                    .filter((p) => p.kind === "size")
                    .map((p) => ({
                      value: p.id,
                      label: `${p.name} (${p.sizes.join(", ")})`,
                    })),
                ]}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Las tallas disponibles al crear productos de esta categoría.
              </p>
            </div>

            <div className="sm:max-w-40">
              <Input
                label="Orden"
                name="sort_order"
                type="number"
                min={0}
                defaultValue={initial?.sort_order ?? 0}
              />
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionLabel>Imagen</SectionLabel>
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,200px)_1fr] lg:items-start">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-medium text-muted-foreground">
                Vista previa
              </span>
              <div className="aspect-square w-full max-w-50 overflow-hidden rounded-xl border border-border bg-muted">
                {imageUrl.trim() ? (
                  // biome-ignore lint/performance/noImgElement: vista previa URL dinámica / R2
                  <img
                    src={imageUrl.trim()}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <ImageIcon className="size-10 opacity-40" aria-hidden />
                    <span className="px-3 text-center text-xs font-medium">
                      Sin miniatura
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0 space-y-8">
              <input
                ref={fileRef}
                id={fileInputId}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                tabIndex={-1}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadFile(f);
                }}
              />

              <div className="space-y-3">
                <span className="text-xs font-medium text-muted-foreground">
                  Subir archivo
                </span>
                <label
                  htmlFor={fileInputId}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "copy";
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    if (!e.currentTarget.contains(e.relatedTarget as Node))
                      setDragOver(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const f = e.dataTransfer.files?.[0];
                    if (f) void uploadFile(f);
                  }}
                  className={`flex cursor-pointer items-center gap-4 rounded-xl border px-5 py-4 transition-colors ${
                    dragOver
                      ? "border-primary bg-muted ring-1 ring-primary"
                      : "border-border bg-background hover:border-border hover:bg-muted/60"
                  }`}
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
                    {uploadBusy ? (
                      <Loader2
                        className="size-6 animate-spin text-muted-foreground"
                        aria-hidden
                      />
                    ) : (
                      <Upload
                        className="size-6 text-muted-foreground"
                        aria-hidden
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block text-sm font-semibold text-foreground">
                      Arrastra aquí o haz clic para elegir
                    </span>
                    <span className="mt-1 block text-xs leading-snug text-muted-foreground">
                      PNG, JPEG o WebP · máx. 5 MB · Cloudflare R2
                    </span>
                  </span>
                </label>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={uploadBusy}
                    onClick={() => fileRef.current?.click()}
                    className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                  >
                    Examinar archivos…
                  </button>
                  {imageUrl.trim() ? (
                    <button
                      type="button"
                      disabled={uploadBusy}
                      onClick={() => setImageUrl("")}
                      className="inline-flex items-center gap-2 rounded-lg border border-destructive/40 bg-background px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-50"
                    >
                      <Trash2 className="size-4 shrink-0" aria-hidden />
                      Quitar imagen
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="border-t border-border pt-8">
                <label
                  htmlFor="category-image-url"
                  className="mb-2 block text-xs font-medium text-muted-foreground"
                >
                  O indicar URL de imagen
                </label>
                <input
                  id="category-image-url"
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  placeholder="https://i.imgur.com/ejemplo.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                />
                {urlError ? (
                  <p className="mt-2 text-xs text-destructive" role="alert">
                    {urlError}
                  </p>
                ) : (
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Usa una URL absoluta con{" "}
                    <span className="font-mono text-foreground/80">
                      https://
                    </span>
                    . Para Imgur, el enlace directo al archivo suele ser{" "}
                    <span className="font-mono text-foreground/80">
                      i.imgur.com
                    </span>
                    . Vacío = sin miniatura.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="flex flex-col-reverse gap-3 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() =>
            onCancel ? onCancel() : router.push("/admin/categorias")
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-transparent px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" aria-hidden />
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending || !!urlError}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-95 disabled:pointer-events-none disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Save className="size-4" aria-hidden />
          )}
          {mode === "create" ? "Crear categoría" : "Guardar cambios"}
        </button>
      </footer>
    </form>
  );
}
