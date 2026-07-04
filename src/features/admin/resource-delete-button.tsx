"use client";

import { useRouter } from "next/navigation";
import { ConfirmDeleteButton } from "./confirm-delete-button";

interface ResourceDeleteButtonProps {
  /** Server action que elimina por id. */
  action: (id: string) => Promise<void>;
  id: string;
  title?: string;
  description?: string;
  triggerLabel?: string;
  redirectTo?: string;
}

export function ResourceDeleteButton({
  action,
  id,
  title = "¿Eliminar?",
  description = "Esta acción no se puede deshacer.",
  triggerLabel = "Eliminar",
  redirectTo,
}: ResourceDeleteButtonProps) {
  const router = useRouter();
  return (
    <ConfirmDeleteButton
      title={title}
      description={description}
      triggerLabel={triggerLabel}
      onConfirm={() => action(id)}
      onSuccess={() => {
        if (redirectTo) router.replace(redirectTo);
        router.refresh();
      }}
    />
  );
}
