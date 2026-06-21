"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { ProductImageViewer } from "./ProductImageViewer";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

function imageNeedsUnoptimized(src: string): boolean {
  return src.includes("placehold.co");
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);

  const hasSrc = images.length > 0;
  const src = hasSrc ? images[activeIdx] : "/placeholder-product.png";

  const prev = () => setActiveIdx((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActiveIdx((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="flex flex-col gap-3 min-w-0">
      {/* Main image */}
      <div className="group relative aspect-3/4 sm:aspect-square overflow-hidden rounded-2xl border border-border bg-muted/20">
        {hasSrc ? (
          <Image
            key={src}
            src={src}
            alt={name}
            fill
            className="object-cover object-center transition-opacity duration-300"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            unoptimized={imageNeedsUnoptimized(src)}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground text-sm">
            Sin imagen
          </div>
        )}

        {/* Abrir visor a pantalla completa al hacer clic en la imagen */}
        {hasSrc && (
          <button
            type="button"
            onClick={() => setViewerOpen(true)}
            aria-label="Ampliar imagen"
            className="absolute inset-0 cursor-zoom-in"
          >
            <span className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-background/70 text-foreground opacity-0 shadow-md backdrop-blur-sm transition-opacity group-hover:opacity-100">
              <Expand className="size-4" aria-hidden />
            </span>
          </button>
        )}

        {/* Nav arrows — only when multiple images */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Imagen anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full border border-border bg-background/80 text-foreground opacity-0 shadow-md backdrop-blur-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:bg-background"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Imagen siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full border border-border bg-background/80 text-foreground opacity-0 shadow-md backdrop-blur-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:bg-background"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  aria-label={`Imagen ${i + 1}`}
                  className={`size-1.5 rounded-full transition-all ${
                    i === activeIdx
                      ? "w-4 bg-primary"
                      : "bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setActiveIdx(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={`relative size-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                i === activeIdx
                  ? "border-primary"
                  : "border-border opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`${name} — ${i + 1}`}
                fill
                className="object-cover object-center"
                sizes="64px"
                unoptimized={imageNeedsUnoptimized(img)}
              />
            </button>
          ))}
        </div>
      )}

      {/* Visor a pantalla completa (zoom, pan, pinch, swipe) */}
      {viewerOpen && hasSrc && (
        <ProductImageViewer
          images={images}
          name={name}
          initialIndex={activeIdx}
          onIndexChange={setActiveIdx}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
}
