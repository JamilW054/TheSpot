"use client";

import { CATALOG_3D_MODEL } from "@/config/catalog";
import { getCatalogTextureUrl } from "@/lib/catalog-texture";
import { renderElementsToTextureUrl } from "@/lib/render-design-to-texture";
import type { CanvasElement } from "@/types";
import type { CatalogProduct } from "@/types";
import type { Design } from "@/types";
import { useEffect, useState } from "react";
import { CatalogProductViewer } from "./CatalogProductViewer";

/** Rewrite external image URLs to use the app proxy so canvas loadImage doesn't hit CORS. */
function rewriteImageUrlsForCors(elements: CanvasElement[]): CanvasElement[] {
  if (typeof window === "undefined") return elements;
  const origin = window.location.origin;
  return elements.map((el) => {
    if (el.type === "image" && el.content && (el.content.startsWith("http://") || el.content.startsWith("https://"))) {
      return { ...el, content: `${origin}/api/texture?url=${encodeURIComponent(el.content)}` };
    }
    if (el.type === "path" && el.brushTexture && (el.brushTexture.startsWith("http://") || el.brushTexture.startsWith("https://"))) {
      return { ...el, brushTexture: `${origin}/api/texture?url=${encodeURIComponent(el.brushTexture)}` };
    }
    return el;
  });
}

export interface CatalogProductViewerWithDesignProps {
  product: CatalogProduct;
  /** Design template to render onto the product texture (e.g. product.defaultDesignId). */
  design: Design | null;
  compact?: boolean;
}

/**
 * Shows the catalog 3D product with either the base texture or the design (canvas elements)
 * rendered onto the texture, so images/text/shapes from the design appear on the garment.
 */
export function CatalogProductViewerWithDesign({
  product,
  design,
  compact = false,
}: CatalogProductViewerWithDesignProps) {
  const baseTextureUrl = getCatalogTextureUrl(product) ?? product.coverImage ?? null;
  const [textureUrl, setTextureUrl] = useState<string | null>(baseTextureUrl);

  useEffect(() => {
    const elements = design?.canvasElements?.length ? design.canvasElements : null;
    if (elements && elements.length > 0) {
      const rewritten = rewriteImageUrlsForCors(elements);
      renderElementsToTextureUrl(
        rewritten,
        baseTextureUrl,
        CATALOG_3D_MODEL
      )
        .then((url) => setTextureUrl(url ?? baseTextureUrl))
        .catch(() => setTextureUrl(baseTextureUrl));
    } else {
      setTextureUrl(baseTextureUrl);
    }
  }, [product.id, design?.id, baseTextureUrl, design?.canvasElements?.length]);

  return (
    <CatalogProductViewer
      modelPath={CATALOG_3D_MODEL}
      textureUrl={textureUrl}
      compact={compact}
    />
  );
}
