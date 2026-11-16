"use client";

import { useRouter } from "next/navigation";
import {
  type StoreFormValues,
  StoreProfileForm,
} from "@/features/stores/store-profile-form";
import { resubmitStoreApplication } from "@/lib/actions/stores";
import type { StoreStatus } from "@/lib/stores/status";

export function ResubmitClient({
  status,
  initial,
}: {
  status: StoreStatus;
  initial: Partial<StoreFormValues>;
}) {
  const router = useRouter();
  return (
    <StoreProfileForm
      mode="resubmit"
      initial={initial}
      submitLabel={
        status === "rejected" ? "Reenviar solicitud" : "Guardar cambios"
      }
      onSubmit={(values) => resubmitStoreApplication(values)}
      onDone={() => router.refresh()}
    />
  );
}
