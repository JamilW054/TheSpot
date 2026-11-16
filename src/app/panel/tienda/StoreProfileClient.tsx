"use client";

import { useRouter } from "next/navigation";
import {
  type StoreFormValues,
  StoreProfileForm,
} from "@/features/stores/store-profile-form";
import { updateMyStoreProfile } from "@/lib/actions/stores";

export function StoreProfileClient({
  initial,
}: {
  initial: Partial<StoreFormValues>;
}) {
  const router = useRouter();
  return (
    <StoreProfileForm
      mode="profile"
      initial={initial}
      submitLabel="Guardar cambios"
      onSubmit={(values) => updateMyStoreProfile(values)}
      onDone={() => router.refresh()}
    />
  );
}
