"use client";

import { useState } from "react";
import type { Mockup } from "@/types";

export interface MockupPanelProps {
  mockups: Mockup[];
}

export function MockupPanel({ mockups }: MockupPanelProps) {
  const [selectedMockupId, setSelectedMockupId] = useState<string | null>(null);
  const selectedMockup = selectedMockupId != null
    ? mockups.find((m) => m.id === selectedMockupId)
    : null;

  if (mockups.length === 0) {
    return (
      <p className="mt-2 text-sm text-muted-foreground">
        No hay mockups configurados.
      </p>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-3">
      <ul className="grid gap-1.5" role="list" aria-label="Lista de mockups">
        {mockups.map((mockup) => {
          const isSelected = mockup.id === selectedMockupId;
          return (
            <li key={mockup.id}>
              <button
                type="button"
                onClick={() => setSelectedMockupId(mockup.id)}
                className={`w-full rounded border px-2 py-2 text-left text-sm transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border bg-background hover:bg-muted/50 text-foreground"
                }`}
                aria-pressed={isSelected}
              >
                <span className="font-medium">{mockup.name}</span>
                <span className="ml-1.5 text-muted-foreground text-xs uppercase">
                  {mockup.category}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <section aria-label="Vista previa del mockup" className="flex flex-col gap-1.5">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Vista previa
        </h3>
        {selectedMockup != null ? (
          <div className="rounded border border-border bg-muted/20 overflow-hidden min-h-[120px] flex items-center justify-center">
            {selectedMockup.imageUrl ? (
              <img
                src={selectedMockup.imageUrl}
                alt={selectedMockup.name}
                className="max-h-48 w-auto max-w-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 p-4 text-muted-foreground text-sm">
                <span>{selectedMockup.name}</span>
                <span className="text-xs">Sin imagen</span>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded border border-dashed border-border bg-muted/10 flex min-h-[120px] items-center justify-center text-muted-foreground text-sm">
            Selecciona un mockup para ver la vista previa
          </div>
        )}
      </section>
    </div>
  );
}
