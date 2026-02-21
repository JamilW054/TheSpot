"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const MockupViewer3D = dynamic(
  () => import("@/components/editor/MockupViewer3D").then((m) => ({ default: m.MockupViewer3D })),
  {
    ssr: false,
    loading: () => (
      <div className="flex size-full min-h-0 items-center justify-center rounded-xl bg-muted/50 text-sm text-muted-foreground">
        Cargando…
      </div>
    ),
  }
);

interface CatalogProductViewerProps {
  modelPath: string;
  /** URL de la textura base (tabla textures en DB). */
  textureUrl?: string | null;
  /** Vista compacta para la cuadrícula del catálogo (rellena el contenedor, vista fija de frente). */
  compact?: boolean;
}

export function CatalogProductViewer({ modelPath, textureUrl = null, compact = false }: CatalogProductViewerProps) {
  const [mounted, setMounted] = useState(false);
  const [everInView, setEverInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!compact || !mounted || !containerRef.current) return;
    const el = containerRef.current;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setEverInView(true);
      },
      { rootMargin: "80px", threshold: 0.01 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [compact, mounted]);

  const wrapperClass =
    compact
      ? "h-full min-h-0 w-full overflow-hidden rounded-xl border border-border bg-muted/20"
      : "min-h-[320px] w-full overflow-hidden rounded-xl border border-border bg-muted/20";

  const showViewer = compact ? mounted && everInView : mounted;

  if (!showViewer) {
    return <div ref={containerRef} className={wrapperClass} aria-hidden />;
  }

  return (
    <div ref={containerRef} className={wrapperClass}>
      <MockupViewer3D
        modelPath={modelPath}
        textureUrl={textureUrl ?? null}
        fullSize={!compact}
        compact={compact}
        fixedFrontView={compact}
        garmentColorHex="#ffffff"
      />
    </div>
  );
}
