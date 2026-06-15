"use client";

import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useAdminFeedback } from "@/contexts/admin-feedback-context";
import {
  adminCreateSizePreset,
  adminUpdateSizePreset,
  type SizePresetActionState,
} from "@/lib/actions/size-presets-admin";
import type { SizePresetRow } from "@/lib/db/size-presets";

interface SizePresetFormProps {
  mode: "create" | "edit";
  initial?: SizePresetRow;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SizePresetForm({ mode, initial, onSuccess, onCancel }: SizePresetFormProps) {
  const router = useRouter();
  const { showSuccess, showError } = useAdminFeedback();
  const actionFn =
    mode === "create" ? adminCreateSizePreset : adminUpdateSizePreset;
  const [state, formAction, pending] = useActionState<
    SizePresetActionState | undefined,
    FormData
  >(actionFn, undefined);

  const [sizesRaw, setSizesRaw] = useState(initial?.sizes?.join(", ") ?? "");

  const preview = sizesRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const seenState = useRef<typeof state>(undefined);
  useEffect(() => {
    if (!state || state === seenState.current) return;
    seenState.current = state;
    if (state.ok) {
      const label =
        mode === "create"
          ? "Tipo de talla creado correctamente."
          : "Tipo de talla guardado correctamente.";
      showSuccess(label, () => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.replace("/admin/tallas");
          router.refresh();
        }
      });
    } else if (state.error) {
      showError(state.error);
    }
  }, [state, mode, showSuccess, showError, router, onSuccess]);

  return (
    <form action={formAction} className="space-y-5">
      {mode === "edit" && initial ? (
        <input type="hidden" name="preset_id" value={initial.id} />
      ) : null}

      <section className="rounded-2xl border border-zinc-700/70 bg-zinc-900/60 p-5">
        <div className="space-y-1.5">
          <label
            htmlFor="sp-name"
            className="text-xs font-medium uppercase tracking-wider text-zinc-400"
          >
            Nombre <span className="text-red-400">*</span>
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
            <span className="font-mono text-foreground/80">
              S/M, M/L, Talla única
            </span>
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

        <div className="sm:max-w-40">
          <Input
            label="Orden"
            name="sort_order"
            type="number"
            min={0}
            defaultValue={initial?.sort_order ?? 0}
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => (onCancel ? onCancel() : router.push("/admin/tallas"))}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-transparent px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
          {mode === "create" ? "Crear tipo" : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/tallas")}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700/60"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Cancelar
        </button>
      </div>
    </form>
  );
}
