"use client";

import { Store } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

/**
 * Selector de tienda para las vistas globales del admin (pedidos, ventas,
 * productos). Escribe `?tienda=<id>` en la URL; vacío = todas las tiendas.
 */
export function StoreFilter({
  stores,
  value,
}: {
  stores: { id: string; name: string }[];
  value: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, start] = useTransition();

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <Store className="size-4 text-muted-foreground" aria-hidden />
      <span className="sr-only">Filtrar por tienda</span>
      <select
        value={value ?? ""}
        disabled={pending}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          if (e.target.value) params.set("tienda", e.target.value);
          else params.delete("tienda");
          params.delete("page");
          const q = params.toString();
          start(() =>
            router.replace(q ? `${pathname}?${q}` : pathname, {
              scroll: false,
            }),
          );
        }}
        className="h-9 rounded-xl border border-border bg-card px-3 text-sm disabled:opacity-60"
      >
        <option value="">Todas las tiendas</option>
        {stores.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </label>
  );
}
