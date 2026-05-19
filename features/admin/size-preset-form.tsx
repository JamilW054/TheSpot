"use client";

import { Loader2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  type SizePresetActionState,
  adminCreateSizePreset,
  adminUpdateSizePreset,
} from "@/lib/actions/size-presets-admin";
import type { SizePresetRow } from "@/lib/db/size-presets";
import { useAdminFeedback } from "@/contexts/admin-feedback-context";

interface SizePresetFormProps {
  mode: "create" | "edit";
  initial?: SizePresetRow;
}

export function SizePresetForm({ mode, initial }: SizePresetFormProps) {
  const router = useRouter();
  const { showSuccess, showError } = useAdminFeedback();
  const actionFn = mode === "create" ? adminCreateSizePreset : adminUpdateSizePreset;
  const [state, formAction, pending] = useActionState<
    SizePresetActionState | undefined,
    FormData
  >(actionFn, undefined);

  const [sizesRaw, setSizesRaw] = useState(
    initial?.sizes?.join(", ") ?? "",
  );

  const preview = sizesRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const seenState = useRef<typeof state>(undefined);
  useEffect(() => {
    if (!state || state === seenState.current) return;
    seenState.current = state;
    if (state.ok) {
      const label = mode === "create" ? "Tipo de talla creado correctamente." : "Tipo de talla guardado correctamente.";
      showSuccess(label, () => {
        router.replace("/admin/tallas");
        router.refresh();
      });
    } else if (state.error) {
      showError(state.error);
    }
  }, [state, mode, showSuccess, showError, router]);

  return (
    <form action={formAction} className="space-y-8">
      {mode === "edit" && initial ? (
        <input type="hidden" name="preset_id" value={initial.id} />
      ) : null}

      <div className="rounded-xl border border-border bg-card p-6 sm:p-8 space-y-6">
        <Input
          label="Nombre del tipo de talla"
          name="name"
          required
          defaultValue={initial?.name ?? ""}
          placeholder="Ej. Ropa, Calzado, Gorras, Accesorios"
        />

        <div className="space-y-2">
          <label
            htmlFor="sizes-input"
            className="block text-sm font-medium text-foreground"
          >
            Tallas disponibles
          </label>
          <input
            id="sizes-input"
            name="sizes"
            type="text"
            value={sizesRaw}
            onChange={(e) => setSizesRaw(e.target.value)}
            placeholder="XS, S, M, L, XL, XXL"
            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Separadas por coma. Ej:{" "}
            <span className="font-mono text-foreground/80">35, 36, 37, 38</span>{" "}
            o{" "}
            <span className="font-mono text-foreground/80">S/M, M/L, Talla única</span>
          </p>
        </div>

        {preview.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Vista previa
            </p>
            <div className="flex flex-wrap gap-2">
              {preview.map((s) => (
                <span
                  key={s}
                  className="rounded-md border border-border bg-muted px-3 py-1 text-sm font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="sm:max-w-[160px]">
          <Input
            label="Orden"
            name="sort_order"
            type="number"
            min={0}
            defaultValue={initial?.sort_order ?? 0}
          />
        </div>
      </div>

      <footer className="flex flex-col-reverse gap-3 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => router.push("/admin/tallas")}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-transparent px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" aria-hidden />
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-95 disabled:pointer-events-none disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Save className="size-4" aria-hidden />
          )}
          {mode === "create" ? "Crear tipo de talla" : "Guardar cambios"}
        </button>
      </footer>
    </form>
  );
}
