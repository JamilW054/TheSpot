"use client";

import { Loader2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  type AdminCategoryActionState,
  adminCreateCategory,
  adminUpdateCategory,
} from "@/lib/actions/categories-admin";
import type { CategoryRow } from "@/lib/db/categories";

const iconBtn =
  "inline-flex size-10 shrink-0 items-center justify-center rounded-md border-2 border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

interface CategoryFormProps {
  mode: "create" | "edit";
  initial?: CategoryRow;
}

export function CategoryForm({ mode, initial }: CategoryFormProps) {
  const router = useRouter();
  const actionFn =
    mode === "create" ? adminCreateCategory : adminUpdateCategory;
  const [state, formAction, pending] = useActionState<
    AdminCategoryActionState | undefined,
    FormData
  >(actionFn, undefined);

  useEffect(() => {
    if (state?.ok) {
      router.replace("/admin/categorias");
      router.refresh();
    }
  }, [state?.ok, router]);

  return (
    <form action={formAction} className="space-y-6">
      {mode === "edit" && initial ? (
        <input type="hidden" name="category_id" value={initial.id} />
      ) : null}

      {state?.error ? (
        <p
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <Input
        label="Nombre"
        name="name"
        required
        defaultValue={initial?.name ?? ""}
        placeholder="Ej. Sudaderas"
      />

      <Input
        label="Slug (opcional)"
        name="slug"
        defaultValue={initial?.slug ?? ""}
        placeholder="Se genera desde el nombre si lo dejas vacío"
      />
      <p className="-mt-4 text-xs text-muted-foreground">
        Usado en la URL del catálogo (?categoria=
        <span className="font-mono">slug</span>). Si ya existe, se añade un
        sufijo numérico.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Orden"
          name="sort_order"
          type="number"
          min={0}
          defaultValue={initial?.sort_order ?? 0}
        />
        <Input
          label="URL miniatura (opcional)"
          name="image_url"
          type="url"
          defaultValue={initial?.image_url ?? ""}
          placeholder="https://…"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          aria-label={mode === "create" ? "Crear categoría" : "Guardar cambios"}
          title={mode === "create" ? "Crear categoría" : "Guardar cambios"}
          className="inline-flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="size-5 animate-spin" aria-hidden />
          ) : (
            <Save className="size-5" aria-hidden />
          )}
        </button>
        <button
          type="button"
          className={`${iconBtn} size-10`}
          aria-label="Cancelar"
          onClick={() => router.push("/admin/categorias")}
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>
    </form>
  );
}
