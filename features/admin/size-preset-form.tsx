"use client";

import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
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

const DEFAULT_HEX = "#111111";

interface ColorItem {
  label: string;
  hex: string;
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

  const [kind, setKind] = useState<"size" | "color">(initial?.kind ?? "size");
  const [name, setName] = useState(initial?.name ?? "");
  const [sizesRaw, setSizesRaw] = useState(initial?.sizes?.join(", ") ?? "");
  const [colors, setColors] = useState<ColorItem[]>(() =>
    (initial?.items ?? [])
      .filter((i) => i.hex || initial?.kind === "color")
      .map((i) => ({ label: i.label, hex: i.hex ?? DEFAULT_HEX })),
  );

  const sizePreview = sizesRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Payload de items para la acción: color usa el picker; talla usa el texto.
  const itemsJson = useMemo(() => {
    if (kind === "color") {
      return JSON.stringify(
        colors
          .map((c) => ({ label: c.label.trim(), hex: c.hex }))
          .filter((c) => c.label),
      );
    }
    return JSON.stringify(sizePreview.map((label) => ({ label, hex: null })));
  }, [kind, colors, sizePreview]);

  const seenState = useRef<typeof state>(undefined);
  useEffect(() => {
    if (!state || state === seenState.current) return;
    seenState.current = state;
    if (state.ok) {
      const label =
        mode === "create"
          ? "Tipo de variante creado correctamente."
          : "Tipo de variante guardado correctamente.";
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

  const addColor = () =>
    setColors((prev) => [...prev, { label: "", hex: DEFAULT_HEX }]);
  const updateColor = (i: number, patch: Partial<ColorItem>) =>
    setColors((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)),
    );
  const removeColor = (i: number) =>
    setColors((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <form action={formAction} className="space-y-5">
      {mode === "edit" && initial ? (
        <input type="hidden" name="preset_id" value={initial.id} />
      ) : null}
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="items_json" value={itemsJson} />

      <section className="rounded-2xl border border-zinc-700/70 bg-zinc-900/60 p-5 space-y-4">
        {/* Tipo de eje */}
        <div className="space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Tipo de variante
          </span>
          <div className="flex gap-2">
            {(["size", "color"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={`inline-flex h-10 flex-1 items-center justify-center rounded-lg border text-sm font-semibold transition-colors ${
                  kind === k
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-transparent text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {k === "size" ? "Talla" : "Color"}
              </button>
            ))}
          </div>
        </div>

        {/* Nombre */}
        <Input
          label="Nombre"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={kind === "color" ? "Ej. Colores muebles" : "Ej. Ropa"}
        />

        {kind === "size" ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label
                htmlFor="sizes-input"
                className="text-xs font-medium uppercase tracking-wider text-zinc-400"
              >
                Tallas <span className="text-red-400">*</span>
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
                <span className="font-mono text-foreground/80">35, 36, 37</span>{" "}
                o{" "}
                <span className="font-mono text-foreground/80">Talla única</span>
              </p>
            </div>
            {sizePreview.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {sizePreview.map((s) => (
                  <span
                    key={s}
                    className="rounded-md border border-border bg-muted px-3 py-1 text-sm font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-2.5">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Colores <span className="text-red-400">*</span>
            </span>
            <div className="space-y-2">
              {colors.map((c, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: filas editables sin id estable
                  key={i}
                  className="flex items-center gap-2"
                >
                  <input
                    type="color"
                    value={c.hex}
                    onChange={(e) => updateColor(i, { hex: e.target.value })}
                    aria-label="Color"
                    className="size-10 shrink-0 cursor-pointer rounded-lg border border-border bg-transparent p-1"
                  />
                  <input
                    type="text"
                    value={c.label}
                    onChange={(e) => updateColor(i, { label: e.target.value })}
                    placeholder="Nombre del color (ej. Negro)"
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  />
                  <button
                    type="button"
                    onClick={() => removeColor(i)}
                    aria-label="Quitar color"
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addColor}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Plus className="size-4" aria-hidden />
              Añadir color
            </button>
          </div>
        )}

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
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
          {mode === "create" ? "Crear tipo" : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={() => (onCancel ? onCancel() : router.push("/admin/tallas"))}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700/60"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Cancelar
        </button>
      </div>
    </form>
  );
}
