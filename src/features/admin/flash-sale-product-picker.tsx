"use client";

import { useMemo, useState } from "react";

interface ProductChoice {
  id: string;
  name: string;
}

interface FlashSaleProductPickerProps {
  products: ProductChoice[];
  /** Ids de productos ya incluidos en la flash sale. */
  selectedIds?: string[];
}

/**
 * Selector de productos para una flash sale. Renderiza checkboxes con
 * name="product_ids" para que se envíen dentro del ResourceForm.
 */
export function FlashSaleProductPicker({
  products,
  selectedIds = [],
}: FlashSaleProductPickerProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(selectedIds),
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">
          Productos en la promoción
        </p>
        <span className="text-xs text-muted-foreground">
          {selected.size} seleccionado(s)
        </span>
      </div>

      <input
        type="search"
        placeholder="Buscar producto…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-3 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      />

      <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
        {filtered.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">
            Sin productos.
          </p>
        ) : (
          filtered.map((p) => (
            <label
              key={p.id}
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
            >
              <input
                type="checkbox"
                name="product_ids"
                value={p.id}
                checked={selected.has(p.id)}
                onChange={() => toggle(p.id)}
                className="size-4 rounded border-border"
              />
              {p.name}
            </label>
          ))
        )}
      </div>
    </div>
  );
}
