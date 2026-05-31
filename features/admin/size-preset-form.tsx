"use client";

import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
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

  const seenState = useRef<typeof state>(undefined);
  useEffect(() => {
    if (!state || state === seenState.current) return;
    seenState.current = state;
    if (state.ok) {
      showSuccess(
        mode === "create" ? "Tipo de talla creado." : "Tipo de talla guardado.",
        () => { router.replace("/admin/tallas"); router.refresh(); },
      );
    } else if (state.error) {
      showError(state.error);
    }
  }, [state, mode, showSuccess, showError, router]);

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
            id="sp-name"
            name="name"
            required
            defaultValue={initial?.name ?? ""}
            placeholder="Ej. Ropa, Calzado, Gorras"
            className="h-10 w-full rounded-xl border border-zinc-700/60 bg-zinc-800/70 px-4 text-sm text-zinc-100 placeholder:text-zinc-600 transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
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
