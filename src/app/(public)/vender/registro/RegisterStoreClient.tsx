"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { StoreProfileForm } from "@/features/stores/store-profile-form";
import { registerStoreAction } from "@/lib/actions/stores";
import { useAuth } from "@/lib/auth-context";

export function RegisterStoreClient() {
  const router = useRouter();
  const { login } = useAuth();
  const creds = useRef<{ email: string; password: string } | null>(null);

  return (
    <StoreProfileForm
      mode="register"
      submitLabel="Enviar solicitud"
      onSubmit={async (values) => {
        creds.current = {
          email: values.email.trim().toLowerCase(),
          password: values.password ?? "",
        };
        return registerStoreAction({
          ...values,
          password: values.password ?? "",
          acceptPolicies: Boolean(values.acceptPolicies),
        });
      }}
      onDone={async () => {
        const c = creds.current;
        if (c) {
          try {
            await login(c.email, c.password);
          } catch {
            router.push("/login?next=/panel");
            return;
          }
        }
        router.push("/panel/solicitud");
      }}
    />
  );
}
