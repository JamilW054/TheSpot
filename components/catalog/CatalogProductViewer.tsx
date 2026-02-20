"use client";

import dynamic from "next/dynamic";

const MockupViewer3D = dynamic(
  () => import("@/components/editor/MockupViewer3D").then((m) => ({ default: m.MockupViewer3D })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[320px] w-full items-center justify-center rounded-xl bg-muted/50 text-sm text-muted-foreground">
        Cargando vista 3D…
      </div>
    ),
  }
);

interface CatalogProductViewerProps {
  modelPath: string;
}

export function CatalogProductViewer({ modelPath }: CatalogProductViewerProps) {
  return (
    <div className="min-h-[320px] w-full overflow-hidden rounded-xl border border-border bg-muted/20">
      <MockupViewer3D modelPath={modelPath} textureUrl={null} fullSize garmentColorHex="#ffffff" />
    </div>
  );
}
