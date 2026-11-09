import { ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { AdminCard } from "./admin-card";

export interface StatCardProps {
  /** Etiqueta caption (12px uppercase, tracking 0.05em). */
  label: string;
  /** Valor grande (escala tipográfica, tabular-nums). */
  value: string | number;
  /** Texto secundario bajo el valor. */
  sub?: string;
  /** Icono funcional (trazo fino). */
  icon?: ReactNode;
  /** Variación vs. periodo anterior, en %. Positiva = verde, negativa = roja. */
  deltaPct?: number | null;
  /** Resalta el valor con el acento de marca. */
  accent?: boolean;
  /** Color del valor principal — "danger" para cifras negativas (p. ej. pérdida neta). */
  valueTone?: "default" | "danger";
  /** Tamaño del valor. "sm" para textos largos (p. ej. nombre de producto). */
  valueSize?: "default" | "sm";
  /** Si se indica, toda la tarjeta es un enlace (p. ej. al listado filtrado). */
  href?: string;
}

/**
 * Stat Block (DESIGN.md): la métrica se establece solo con escala
 * tipográfica — label caption arriba, valor 30px/600 con tracking apretado.
 */
export function StatCard({
  label,
  value,
  sub,
  icon,
  deltaPct,
  accent = false,
  valueTone = "default",
  valueSize = "default",
  href,
}: StatCardProps) {
  const hasDelta = deltaPct != null && Number.isFinite(deltaPct);
  const deltaUp = hasDelta && (deltaPct as number) >= 0;
  const card = (
    <AdminCard
      className={`p-5 ${href ? "h-full transition-shadow group-hover:ring-2 group-hover:ring-primary/25" : ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
          {label}
        </p>
        {icon ? (
          <span
            className={`flex size-8 shrink-0 items-center justify-center rounded-[10px] ${
              accent
                ? "bg-(--admin-brand-soft) text-(--admin-brand-strong)"
                : "bg-muted text-muted-foreground"
            }`}
            aria-hidden
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p
        className={`mt-3 font-semibold tabular-nums tracking-[-0.025em] ${
          valueSize === "sm"
            ? "line-clamp-2 text-sm leading-snug"
            : "truncate text-3xl"
        } ${
          valueTone === "danger" ? "text-(--admin-danger)" : "text-foreground"
        }`}
      >
        {value}
      </p>
      {(sub || hasDelta) && (
        <div className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
          {hasDelta ? (
            <span
              className={`inline-flex items-center gap-1 font-medium tabular-nums ${
                deltaUp ? "text-(--admin-success)" : "text-(--admin-danger)"
              }`}
            >
              {deltaUp ? (
                <TrendingUp className="size-3.5" aria-hidden />
              ) : (
                <TrendingDown className="size-3.5" aria-hidden />
              )}
              {deltaUp ? "+" : ""}
              {(deltaPct as number).toFixed(1)}%
            </span>
          ) : null}
          {sub ? <span className="truncate">{sub}</span> : null}
          {href ? (
            <ChevronRight
              className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          ) : null}
        </div>
      )}
    </AdminCard>
  );
  if (!href) return card;
  return (
    <Link
      href={href}
      className="group block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {card}
    </Link>
  );
}
