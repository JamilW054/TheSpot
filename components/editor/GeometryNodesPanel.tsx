"use client";

import { useCallback, useEffect, useState } from "react";

export interface GeometryNodesPanelProps {
  /** Ruta del modelo GLTF actual (ej. /models/tshirt/scene.gltf). Si no hay modelo, no se muestra contenido. */
  modelPath: string | null;
}

/**
 * Panel que carga y muestra el JSON del modelo GLTF para inspección/edición de nodos de geometría.
 * El GLTF trabaja con JSON: escenas, nodos, mallas, materiales, accesorios, etc.
 */
export function GeometryNodesPanel({ modelPath }: GeometryNodesPanelProps) {
  const [json, setJson] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (path: string) => {
    setLoading(true);
    setError(null);
    setJson(null);
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setJson(JSON.stringify(data, null, 2));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar el modelo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (modelPath) load(modelPath);
    else {
      setJson(null);
      setError(null);
    }
  }, [modelPath, load]);

  if (!modelPath) {
    return (
      <div className="rounded-xl border border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        Selecciona una prenda en Prendas para ver los nodos de geometría del modelo GLTF aquí.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-muted/20 p-4 text-center text-sm text-muted-foreground">
        Cargando nodos…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-center text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <p className="shrink-0 text-xs text-muted-foreground">
        JSON del modelo (escenas, nodos, mallas, materiales). Editable para inspección; los cambios no se aplican al
        modelo en tiempo real.
      </p>
      <textarea
        className="min-h-[320px] flex-1 w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-xs text-foreground"
        value={json ?? ""}
        onChange={(e) => setJson(e.target.value)}
        spellCheck={false}
        aria-label="Editor JSON del modelo GLTF"
      />
    </div>
  );
}
