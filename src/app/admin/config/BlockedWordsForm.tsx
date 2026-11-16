"use client";

import { Loader2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminFeedback } from "@/contexts/admin-feedback-context";
import { adminSaveBlockedWords } from "@/lib/actions/stores";

/** Palabras que mandan un producto a revisión aunque la tienda sea confiable. */
export function BlockedWordsForm({ initial }: { initial: string[] }) {
  const router = useRouter();
  const { showSuccess, showError } = useAdminFeedback();
  const [value, setValue] = useState(initial.join(", "));
  const [pending, start] = useTransition();
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Palabras prohibidas</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const res = await adminSaveBlockedWords(value);
              if (!res.ok) {
                showError(res.error);
                return;
              }
              showSuccess("Lista guardada.");
              router.refresh();
            });
          }}
        >
          <label htmlFor="blocked-words" className="block text-sm font-medium">
            Separadas por coma
          </label>
          <textarea
            id="blocked-words"
            rows={5}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Si el nombre, la descripción o las etiquetas de un producto
            contienen alguna, el producto queda «En revisión» hasta que lo
            apruebes en Moderación (no aplica a tu tienda oficial).
          </p>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <ShieldAlert className="size-4" aria-hidden />
            )}
            Guardar
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
