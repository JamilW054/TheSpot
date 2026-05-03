"use client";

import { getCatalogTextureUrl } from "@/lib/catalog-texture";
import { renderElementsToTextureUrl } from "@/lib/render-design-to-texture";
import type { CanvasElement } from "@/types";
import type { CatalogProduct } from "@/types";
import type { Design } from "@/types";
import { useEffect, useRef, useState } from "react";
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

function useLocalTextureUrl(
  sourceUrl: string | null,
  productId: string,
  productName: string
): string | null {
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!sourceUrl || typeof window === "undefined") {
      setLocalUrl(null);
      return;
    }
    if (sourceUrl.startsWith("data:")) {
      setLocalUrl(sourceUrl);
      return;
    }
    const absoluteUrl = sourceUrl.startsWith("/") ? window.location.origin + sourceUrl : sourceUrl;
    const isPlacehold = absoluteUrl.includes("placehold.co");
    console.log("[Catalog] Petición de textura para producto", productId, `(${productName}):`, isPlacehold ? "(placehold.co — actualiza textures.url o cover_image_url en Supabase con la URL de Storage)" : absoluteUrl);
    let cancelled = false;
    fetch(absoluteUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = url;
        console.log("[Catalog] Textura descargada localmente para", productId, "→ blob URL lista para vista previa");
        setLocalUrl(url);
      })
      .catch((err) => {
        if (!cancelled) console.warn("[Catalog] Error descargando textura para", productId, err);
        setLocalUrl(sourceUrl);
      });
    return () => {
      cancelled = true;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [sourceUrl, productId, productName]);

  return localUrl ?? sourceUrl;
}

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
      renderElementsToTextureUrl(rewritten, baseTextureUrl)
        .then((url) => setTextureUrl(url ?? baseTextureUrl))
        .catch(() => setTextureUrl(baseTextureUrl));
    } else {
      setTextureUrl(baseTextureUrl);
    }
  }, [product.id, design?.id, baseTextureUrl, design?.canvasElements?.length]);

  const localTextureUrl = useLocalTextureUrl(textureUrl, product.id, product.name);

  return (
    <CatalogProductViewer
      coverImage={product.coverImage}
      textureUrl={localTextureUrl}
      compact={compact}
    />
  );
}
