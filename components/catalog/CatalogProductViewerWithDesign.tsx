"use client";

import {
  getCatalogDisplayImageUrl,
  getCatalogTextureUrl,
} from "@/lib/catalog-texture";
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
    if (
      el.type === "image" &&
      el.content &&
      (el.content.startsWith("http://") || el.content.startsWith("https://"))
    ) {
      return {
        ...el,
        content: `${origin}/api/texture?url=${encodeURIComponent(el.content)}`,
      };
    }
    if (
      el.type === "path" &&
      el.brushTexture &&
      (el.brushTexture.startsWith("http://") ||
        el.brushTexture.startsWith("https://"))
    ) {
      return {
        ...el,
        brushTexture: `${origin}/api/texture?url=${encodeURIComponent(el.brushTexture)}`,
      };
    }
    return el;
  });
}

export interface CatalogProductViewerWithDesignProps {
  product: CatalogProduct;
  /** Diseño opcional para pintar sobre la textura (solo uso interno; catálogo público no envía plantillas). */
  design: Design | null;
  compact?: boolean;
}

export function CatalogProductViewerWithDesign({
  product,
  design,
  compact = false,
}: CatalogProductViewerWithDesignProps) {
  const displayUrl =
    getCatalogDisplayImageUrl(product) ?? product.coverImage ?? null;
  const canvasBaseUrl =
    getCatalogTextureUrl(product) ?? product.coverImage ?? null;

  const [textureUrl, setTextureUrl] = useState<string | null>(displayUrl);

  useEffect(() => {
    const elements = design?.canvasElements?.length
      ? design.canvasElements
      : null;
    if (elements && elements.length > 0) {
      const rewritten = rewriteImageUrlsForCors(elements);
      renderElementsToTextureUrl(rewritten, canvasBaseUrl)
        .then((url) => setTextureUrl(url ?? displayUrl))
        .catch(() => setTextureUrl(displayUrl));
    } else {
      setTextureUrl(displayUrl);
    }
  }, [
    product.id,
    design?.id,
    displayUrl,
    canvasBaseUrl,
    design?.canvasElements?.length,
  ]);

  return (
    <CatalogProductViewer
      coverImage={product.coverImage}
      textureUrl={textureUrl}
      compact={compact}
    />
  );
}
