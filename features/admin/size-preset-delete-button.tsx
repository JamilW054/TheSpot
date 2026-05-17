"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { adminDeleteSizePreset } from "@/lib/actions/size-presets-admin";

const iconGhost =
  "inline-flex size-9 items-center justify-center rounded-md border-2 border-border text-muted-foreground transition-colors hover:border-destructive/60 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

interface Props {
  presetId: string;
  presetName: string;
}

export function SizePresetDeleteButton({ presetId, presetName }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (
      !confirm(
        `¿Eliminar el tipo de talla "${presetName}"?\n\nLas categorías que lo usen quedarán sin tipo de talla asignado.`,
      )
    )
      return;

    startTransition(async () => {
      try {
        await adminDeleteSizePreset(presetId);
        router.refresh();
      } catch (e) {
        alert(e instanceof Error ? e.message : "Error al eliminar.");
      }
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleDelete}
      className={iconGhost}
      aria-label={`Eliminar ${presetName}`}
      title="Eliminar"
    >
      <Trash2 className="size-4" aria-hidden />
    </button>
  );
}
