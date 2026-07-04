"use client";

import { adminDeleteSizePreset } from "@/lib/actions/size-presets-admin";
import { ConfirmDeleteButton } from "./confirm-delete-button";

const ghostDestructive =
  "inline-flex size-9 items-center justify-center rounded-md border-2 border-border text-muted-foreground transition-colors hover:border-destructive/60 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

interface Props {
  presetId: string;
  presetName: string;
}

export function SizePresetDeleteButton({ presetId, presetName }: Props) {
  return (
    <ConfirmDeleteButton
      title={`¿Eliminar "${presetName}"?`}
      description="Las categorías que usen este tipo de talla quedarán sin talla asignada. Esta acción no se puede deshacer."
      triggerClassName={ghostDestructive}
      triggerLabel={`Eliminar ${presetName}`}
      onConfirm={() => adminDeleteSizePreset(presetId)}
    />
  );
}
