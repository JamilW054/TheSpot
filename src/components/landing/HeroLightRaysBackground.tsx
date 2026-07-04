"use client";

/** Fondo decorativo del hero (solo CSS; sin WebGL). */
export function HeroLightRaysBackground() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.07] via-transparent to-muted/30 dark:from-primary/10 dark:to-muted/20" />
      <div className="absolute -top-[45%] left-1/2 h-[95%] w-[140%] max-w-none -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_55%_45%_at_50%_0%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_72%)] opacity-90 blur-3xl dark:opacity-70" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/80 to-transparent" />
    </div>
  );
}
