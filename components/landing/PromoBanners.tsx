"use client";

import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicBanner } from "@/lib/db/banners";

const BRAND_ACCENT = "#3CC8F7";
const AUTOPLAY_MS = 5500;

function getDaysLeft(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function CountdownPill({ expiresAt }: { expiresAt: string | null }) {
  const days = getDaysLeft(expiresAt);
  if (days === null) return null;

  let label: string;
  if (days === 0) label = "Últimas horas";
  else if (days === 1) label = "Termina mañana";
  else label = `Termina en ${days} días`;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
      <Clock className="size-3 shrink-0" aria-hidden />
      {label}
    </span>
  );
}

function BannerImage({
  src,
  alt,
  priority,
  className,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      className={`object-cover ${className ?? ""}`}
      sizes="(max-width: 1280px) 100vw, 1280px"
      unoptimized={src.startsWith("http")}
    />
  );
}

function Slide({
  banner,
  priority,
}: {
  banner: PublicBanner;
  priority?: boolean;
}) {
  const accent = banner.accentColor?.trim() || BRAND_ACCENT;
  const desktopSrc = banner.imageUrl;
  const mobileSrc = banner.imageUrlMobile ?? banner.imageUrl;

  const inner = (
    <>
      {/* Imagen desktop — fallback si no hay mobile */}
      {desktopSrc && (
        <div className="absolute inset-0 hidden sm:block">
          <BannerImage
            src={desktopSrc}
            alt={banner.title}
            priority={priority}
          />
        </div>
      )}
      {/* Imagen mobile */}
      {mobileSrc && (
        <div className="absolute inset-0 sm:hidden">
          <BannerImage src={mobileSrc} alt={banner.title} priority={priority} />
        </div>
      )}
      {/* Gradiente fallback cuando no hay imagen */}
      {!desktopSrc && !mobileSrc && (
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(120deg, ${accent}, #0c0c0e)` }}
        />
      )}

      {/* Scrim */}
      <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/45 to-black/10" />

      {/* Contenido */}
      <div className="relative flex h-full flex-col justify-center gap-2 px-6 sm:px-10 lg:px-14">
        <div className="flex flex-wrap items-center gap-2">
          {banner.eyebrow && (
            <span
              className="text-[11px] font-bold uppercase tracking-[0.22em]"
              style={{ color: accent }}
            >
              {banner.eyebrow}
            </span>
          )}
          <CountdownPill expiresAt={banner.expiresAt} />
        </div>

        <h2 className="max-w-md text-2xl font-black uppercase leading-[1.05] tracking-tight text-white line-clamp-2 sm:text-3xl lg:text-4xl">
          {banner.title}
        </h2>

        {banner.subtitle && (
          <p className="max-w-sm text-sm leading-snug text-white/80 line-clamp-2">
            {banner.subtitle}
          </p>
        )}

        {banner.linkPath && (
          <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition-transform group-hover/slide:translate-x-0.5">
            Ver ahora
            <ChevronRight className="size-4" aria-hidden />
          </span>
        )}
      </div>
    </>
  );

  const cls =
    "group/slide relative block h-full w-full shrink-0 overflow-hidden bg-muted";

  return banner.linkPath ? (
    <Link href={banner.linkPath} className={cls} aria-label={banner.title}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export function PromoBanners({ banners }: { banners: PublicBanner[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const count = banners.length;

  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count <= 1 || paused) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [count, paused]);

  if (count === 0) return null;

  return (
    <div className="w-full px-3 pt-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* biome-ignore lint/a11y/noStaticElementInteractions: pausa autoplay; controles accesibles por separado */}
        <div
          className="relative h-44 overflow-hidden rounded-2xl border border-border sm:h-56 lg:h-72"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            const start = touchStartX.current;
            if (start == null) return;
            const dx = (e.changedTouches[0]?.clientX ?? start) - start;
            if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
            touchStartX.current = null;
          }}
        >
          {/* Track */}
          <div
            className="flex h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {banners.map((banner, i) => (
              <Slide key={banner.id} banner={banner} priority={i === 0} />
            ))}
          </div>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="Banner anterior"
                className="absolute left-3 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="Banner siguiente"
                className="absolute right-3 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <ChevronRight className="size-5" aria-hidden />
              </button>

              {/* Dots */}
              <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-2">
                {banners.map((banner, i) => (
                  <button
                    key={banner.id}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Ir al banner ${i + 1}`}
                    aria-current={i === index}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index
                        ? "w-6 bg-white"
                        : "w-1.5 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
