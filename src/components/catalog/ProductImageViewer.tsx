"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw, X } from "lucide-react";
import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

interface ProductImageViewerProps {
  images: string[];
  name: string;
  /** Index to open on. */
  initialIndex: number;
  /** Notifica el índice actual para sincronizar la galería al cerrar. */
  onIndexChange?: (index: number) => void;
  onClose: () => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 5;
/** Horizontal drag (px) needed to flip to the prev/next image when not zoomed. */
const SWIPE_THRESHOLD = 60;

function imageNeedsUnoptimized(src: string): boolean {
  return src.includes("placehold.co");
}

interface Transform {
  scale: number;
  x: number;
  y: number;
}

const IDENTITY: Transform = { scale: 1, x: 0, y: 0 };

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/** Keep the image from being panned entirely out of view. */
function clampTranslate(t: Transform, w: number, h: number): Transform {
  const maxX = (Math.max(t.scale, 1) - 1) * w * 0.5;
  const maxY = (Math.max(t.scale, 1) - 1) * h * 0.5;
  return {
    scale: t.scale,
    x: clamp(t.x, -maxX, maxX),
    y: clamp(t.y, -maxY, maxY),
  };
}

export function ProductImageViewer({
  images,
  name,
  initialIndex,
  onIndexChange,
  onClose,
}: ProductImageViewerProps) {
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(initialIndex);
  const [transform, setTransform] = useState<Transform>(IDENTITY);
  /** Espejo síncrono de `transform` para leerlo dentro de listeners nativos. */
  const transformRef = useRef(transform);
  transformRef.current = transform;

  const stageRef = useRef<HTMLDivElement>(null);
  /** Active pointers, keyed by pointerId. */
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  /** Pinch bookkeeping. */
  const pinch = useRef<{ dist: number; scale: number } | null>(null);
  /** Single-pointer drag bookkeeping. */
  const drag = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const lastTap = useRef(0);

  const zoomed = transform.scale > 1.01;

  useEffect(() => setMounted(true), []);

  // Lock body scroll while open.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const resetTransform = useCallback(() => setTransform(IDENTITY), []);

  const goTo = useCallback(
    (next: number) => {
      const len = images.length;
      const normalized = ((next % len) + len) % len;
      setIndex(normalized);
      onIndexChange?.(normalized);
      resetTransform();
    },
    [images.length, resetTransform, onIndexChange],
  );

  const prev = useCallback(() => goTo(index - 1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  // Keyboard controls.
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "+" || e.key === "=") zoomBy(1.4);
      else if (e.key === "-") zoomBy(1 / 1.4);
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, prev, next]);

  const stageSize = () => {
    const el = stageRef.current;
    return el ? { w: el.clientWidth, h: el.clientHeight } : { w: 0, h: 0 };
  };

  /** Zoom around a point given in stage-local coords measured from the center. */
  const zoomAround = useCallback(
    (targetScale: number, cx: number, cy: number) => {
      setTransform((t) => {
        const s = clamp(targetScale, MIN_SCALE, MAX_SCALE);
        const ratio = s / t.scale;
        const nx = cx * (1 - ratio) + t.x * ratio;
        const ny = cy * (1 - ratio) + t.y * ratio;
        const { w, h } = stageSize();
        return clampTranslate({ scale: s, x: nx, y: ny }, w, h);
      });
    },
    [],
  );

  /** Zoom by a factor around the stage center. */
  const zoomBy = useCallback(
    (factor: number) => {
      setTransform((t) => {
        const s = clamp(t.scale * factor, MIN_SCALE, MAX_SCALE);
        const ratio = s / t.scale;
        const { w, h } = stageSize();
        return clampTranslate(
          { scale: s, x: t.x * ratio, y: t.y * ratio },
          w,
          h,
        );
      });
    },
    [],
  );

  // Rueda → zoom centrado en el cursor. Listener nativo NO pasivo para poder
  // hacer preventDefault (React registra onWheel como pasivo y lo bloquea).
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const handle = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;
      zoomAround(
        (e.deltaY < 0 ? 1.18 : 1 / 1.18) *
          (transformRef.current?.scale ?? 1),
        cx,
        cy,
      );
    };
    el.addEventListener("wheel", handle, { passive: false });
    return () => el.removeEventListener("wheel", handle);
  }, [zoomAround]);

  const onPointerDown = (e: ReactPointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      const pts = [...pointers.current.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinch.current = { dist, scale: transform.scale };
      drag.current = null;
    } else if (pointers.current.size === 1) {
      drag.current = {
        startX: e.clientX,
        startY: e.clientY,
        originX: transform.x,
        originY: transform.y,
        moved: false,
      };
    }
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Pinch-to-zoom.
    if (pointers.current.size === 2 && pinch.current) {
      const pts = [...pointers.current.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const rect = stageRef.current?.getBoundingClientRect();
      if (!rect) return;
      const midX = (pts[0].x + pts[1].x) / 2 - rect.left - rect.width / 2;
      const midY = (pts[0].y + pts[1].y) / 2 - rect.top - rect.height / 2;
      const targetScale = pinch.current.scale * (dist / pinch.current.dist);
      zoomAround(targetScale, midX, midY);
      return;
    }

    // Single-pointer: pan when zoomed, otherwise swipe-track.
    const d = drag.current;
    if (pointers.current.size === 1 && d) {
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true;

      if (zoomed) {
        const { w, h } = stageSize();
        // Capturar origen aquí; `drag.current` puede ser null cuando React
        // ejecute el updater (p. ej. tras soltar el puntero).
        const originX = d.originX;
        const originY = d.originY;
        setTransform((t) =>
          clampTranslate(
            { scale: t.scale, x: originX + dx, y: originY + dy },
            w,
            h,
          ),
        );
      }
    }
  };

  const endPointer = (e: ReactPointerEvent) => {
    const wasDrag = drag.current;
    pointers.current.delete(e.pointerId);

    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) {
      // Swipe to change image (only when not zoomed).
      if (!zoomed && wasDrag) {
        const dx = e.clientX - wasDrag.startX;
        const dy = e.clientY - wasDrag.startY;
        if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0) next();
          else prev();
        }
      }

      // Double-tap to toggle zoom.
      if (wasDrag && !wasDrag.moved) {
        const now = Date.now();
        if (now - lastTap.current < 300) {
          const rect = stageRef.current?.getBoundingClientRect();
          if (rect) {
            const cx = e.clientX - rect.left - rect.width / 2;
            const cy = e.clientY - rect.top - rect.height / 2;
            zoomed ? resetTransform() : zoomAround(2.5, cx, cy);
          }
          lastTap.current = 0;
        } else {
          lastTap.current = now;
        }
      }
      drag.current = null;
    }
  };

  if (!mounted) return null;

  const src = images[index] ?? "/placeholder-product.png";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${name} — visor de imágenes`}
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between px-4 py-3 text-white">
        <span className="text-sm font-medium tabular-nums text-white/80">
          {index + 1} / {images.length}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => zoomBy(1 / 1.4)}
            aria-label="Alejar"
            className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <Minus className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => zoomBy(1.4)}
            aria-label="Acercar"
            className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <Plus className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={resetTransform}
            aria-label="Restablecer zoom"
            disabled={!zoomed}
            className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-40"
          >
            <RotateCcw className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="ml-1 flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      {/* Stage */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: gesture surface for zoom/pan */}
      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        className="relative flex-1 touch-none select-none overflow-hidden"
        style={{ cursor: zoomed ? "grab" : "zoom-in" }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center will-change-transform"
          style={{
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
            transition: pointers.current.size > 0 ? "none" : "transform 0.18s ease-out",
          }}
        >
          {/* `unoptimized`: sirve el original a resolución completa para que el
              zoom no pixele (alta resolución sin pérdida). */}
          <Image
            key={src}
            src={src}
            alt={`${name} — ${index + 1}`}
            fill
            className="object-contain"
            sizes="100vw"
            quality={100}
            priority
            draggable={false}
            unoptimized
          />
        </div>

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Imagen anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Imagen siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex shrink-0 justify-center gap-2 overflow-x-auto px-4 py-3 scrollbar-none">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ver imagen ${i + 1}`}
              aria-current={i === index}
              className={`relative size-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                i === index
                  ? "border-white"
                  : "border-transparent opacity-50 hover:opacity-90"
              }`}
            >
              <Image
                src={img}
                alt=""
                fill
                className="object-cover object-center"
                sizes="56px"
                unoptimized={imageNeedsUnoptimized(img)}
              />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}
