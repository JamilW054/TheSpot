"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface CatalogProductViewerProps {
  coverImage: string;
  /** Composite texture (base + design); when set, shown instead of cover only. */
  textureUrl?: string | null;
  compact?: boolean;
}

export function CatalogProductViewer({
  coverImage,
  textureUrl = null,
  compact = false,
}: CatalogProductViewerProps) {
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

  const wrapperClass = compact
    ? "h-full min-h-0 w-full overflow-hidden rounded-xl border border-border bg-muted/20"
    : "min-h-[320px] w-full overflow-hidden rounded-xl border border-border bg-muted/20";

  const showContent = compact ? mounted && everInView : mounted;
  const displayUrl = textureUrl && textureUrl.length > 0 ? textureUrl : coverImage;
  const isDataUrl = displayUrl.startsWith("data:");

  if (!showContent) {
    return <div ref={containerRef} className={wrapperClass} aria-hidden />;
  }

  return (
    <div ref={containerRef} className={`relative ${wrapperClass}`}>
      {isDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- data URLs from canvas export
        <img
          src={displayUrl}
          alt=""
          className="size-full object-contain"
        />
      ) : (
        <Image
          src={displayUrl}
          alt=""
          fill
          className="object-contain p-2"
          sizes={compact ? "(max-width: 768px) 45vw, 280px" : "(max-width: 1024px) 90vw, 560px"}
          unoptimized={displayUrl.includes("placehold.co")}
        />
      )}
    </div>
  );
}
