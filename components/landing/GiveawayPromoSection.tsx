import Image from "next/image";
import Link from "next/link";
import {
  Bike,
  Flag,
  Instagram,
  Lock,
  ShoppingBag,
  Smartphone,
} from "lucide-react";
import { formatGiveawayNumber } from "@/lib/db/giveaway-stats";

/** Igual que la landing (`page.tsx`): misma caja útil y márgenes laterales */
const LANDING_CONTAINER = "max-w-6xl mx-auto px-4 sm:px-6";

/** Franjas barra de meta — dos azules planos (sin degradado suave) */
const STRIPE_A = "#3CC8F7";
const STRIPE_B = "#0a5f8c";

function StripedProgressFill({
  idSuffix,
  pct,
}: {
  idSuffix: string;
  pct: number;
}) {
  const patternId = `stripes-${idSuffix}`;
  const w = Math.round((Math.min(100, pct) / 100) * 400);
  return (
    <svg
      className="h-9 w-full overflow-hidden rounded-md sm:h-10"
      preserveAspectRatio="none"
      viewBox="0 0 400 36"
      aria-hidden
    >
      <defs>
        <pattern
          id={patternId}
          width="14"
          height="14"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-45)"
        >
          <rect width="7" height="14" fill={STRIPE_B} />
          <rect x="7" width="7" height="14" fill={STRIPE_A} />
        </pattern>
      </defs>
      <rect width="400" height="36" fill="#0f172a" rx="4" />
      <rect width={w} height="36" fill={`url(#${patternId})`} rx="4" />
    </svg>
  );
}

export interface GiveawayPromoSectionProps {
  /** Pedidos con pago confirmado (`payment_status = paid`), desde Supabase. */
  paidPurchaseCount: number;
  /** Meta del sorteo (por defecto 20.000 o env `GIVEAWAY_GOAL_PURCHASES`). */
  goalPurchases: number;
}

export function GiveawayPromoSection({
  paidPurchaseCount,
  goalPurchases,
}: GiveawayPromoSectionProps) {
  const posterSrc = "/landing/buxxep-sorteo-poster.png";
  const goal = Math.max(1, Math.floor(goalPurchases));
  const current = Math.max(0, Math.floor(paidPurchaseCount));
  const pct = Math.min(100, Math.round((current / goal) * 100));
  const formattedGoal = formatGiveawayNumber(goal);
  const formattedCount = formatGiveawayNumber(current);

  return (
    <section className={`${LANDING_CONTAINER} py-8 sm:py-10 lg:py-12`}>
      <div
        className="overflow-hidden rounded-2xl border border-border bg-zinc-950 text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10"
        aria-labelledby="giveaway-heading"
      >
        <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-11">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-start lg:gap-12">
            <div className="order-2 flex min-w-0 flex-col gap-6 lg:order-1">
              <div className="flex flex-col gap-3">
                <Link
                  href="/"
                  className="inline-flex w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded-md"
                >
                  <span className="relative block h-10 w-[200px] sm:h-11 sm:w-[220px]">
                    <Image
                      src="/resources/buxxep-transparent.png"
                      alt="Buxxep"
                      fill
                      className="object-contain object-left"
                      sizes="220px"
                      priority={false}
                    />
                  </span>
                </Link>
                <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-400">
                  Paga · cobra · crece
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3.5 py-2 text-[11px] font-semibold leading-snug text-zinc-100">
                  <Lock className="size-3.5 shrink-0 text-primary" aria-hidden />
                  Pagos 100% seguros con Azul
                </div>
              </div>

              <div className="space-y-2">
                <h2 id="giveaway-heading" className="leading-[1.02]">
                  <span className="block text-[clamp(1.85rem,4.6vw,3rem)] font-black uppercase tracking-tight text-white">
                    Gana
                  </span>
                  <span className="mt-1 block text-[clamp(1.55rem,4vw,2.55rem)] font-bold italic tracking-tight text-primary">
                    en grande
                  </span>
                  <span className="mt-3 inline-block rounded-lg border border-primary/50 bg-primary/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-100 sm:text-sm">
                    Con Buxxep
                  </span>
                </h2>
              </div>

              <div className="flex flex-wrap items-end gap-4 border-l-2 border-primary pl-5">
                <span
                  className="font-black tabular-nums leading-none text-[clamp(2.75rem,7vw,4rem)] text-primary"
                  aria-hidden
                >
                  11
                </span>
                <div className="pb-0.5">
                  <p className="text-base font-bold uppercase tracking-wide text-white sm:text-lg">
                    Ganadores
                  </p>
                  <ul className="mt-3 space-y-2.5 text-xs font-medium leading-snug text-zinc-300 sm:text-sm">
                    <li className="flex gap-2.5">
                      <Bike className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                      <span>1 ganador moto Vengala 250</span>
                    </li>
                    <li className="flex gap-2.5">
                      <ShoppingBag
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        aria-hidden
                      />
                      <span>10 ganadores RD$1.500 en compras</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="order-1 flex justify-center lg:order-2 lg:pt-1">
              <figure className="relative w-[min(100%,240px)] shrink-0 overflow-hidden rounded-xl border border-zinc-700/90 bg-black sm:w-[260px] lg:w-[270px]">
                <Image
                  src={posterSrc}
                  alt="Promoción sorteo Buxxep"
                  width={750}
                  height={1334}
                  className="h-auto w-full object-contain object-top"
                  sizes="(max-width:1024px) 70vw, 270px"
                  priority={false}
                />
              </figure>
            </div>

            <div className="order-3 flex min-w-0 flex-col justify-start gap-4 lg:max-w-sm lg:justify-self-end">
              <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/80 p-4 sm:p-5">
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-zinc-600 bg-zinc-950">
                    <Smartphone className="size-5 text-primary" aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase leading-snug text-white">
                      Compra en Buxxep y participa automáticamente
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                      Mientras más compras, más oportunidades tienes.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-zinc-500">
                Sorteo al alcanzar la meta de compras. Revisa las bases en redes y en la app.
              </p>
            </div>
          </div>

          <div className="mt-12 space-y-4 border-t border-zinc-800 pt-10">
            <div className="space-y-2 text-center">
              <p className="text-sm font-semibold text-zinc-100 sm:text-base">
                Llevamos{" "}
                <span className="tabular-nums text-primary">{formattedCount}</span>{" "}
                de{" "}
                <span className="tabular-nums text-white">{formattedGoal}</span>{" "}
                compras pagadas
              </p>
              <p className="mx-auto max-w-lg text-xs leading-relaxed text-zinc-500 sm:text-sm">
                La barra refleja los pedidos con pago confirmado en Buxxep. Al
                completar la meta se eligen los ganadores.
              </p>
            </div>
            <div className="mx-auto max-w-3xl">
              <div
                className="flex items-center gap-3 text-[11px] font-semibold tabular-nums text-zinc-400 sm:text-xs"
                role="progressbar"
                aria-valuemin={0}
                aria-valuenow={current}
                aria-valuemax={goal}
                aria-valuetext={`${formattedCount} de ${formattedGoal} compras pagadas, ${pct} por ciento`}
                aria-label="Avance de compras pagadas hacia la meta del sorteo"
              >
                <span>0</span>
                <div className="min-w-0 flex-1">
                  <StripedProgressFill idSuffix="main" pct={pct} />
                </div>
                <span className="flex items-center gap-1 whitespace-nowrap">
                  {formattedGoal}
                  <Flag className="size-4 text-primary" aria-hidden />
                </span>
              </div>
              <p className="mt-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                ★ Se eligen los ganadores ★
              </p>
              <p className="sr-only" aria-live="polite">
                Sorteo: {formattedCount} de {formattedGoal} compras pagadas. La
                meta está al {pct} por ciento.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-2 sm:gap-2.5">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={`prize-${i + 1}`}
                className="flex h-[86px] w-[72px] shrink-0 flex-col justify-between rounded-lg border border-primary/40 bg-zinc-900/90 p-2 text-center sm:h-[90px] sm:w-[76px]"
              >
                <p className="text-[9px] font-semibold uppercase leading-tight text-zinc-100">
                  RD$ 1.500 en compras
                </p>
                <span className="mx-auto flex size-7 items-center justify-center rounded-full border border-primary/60 text-[11px] font-bold text-primary">
                  {i + 1}
                </span>
              </div>
            ))}
            <div className="flex h-[86px] w-[92px] shrink-0 flex-col justify-between rounded-lg border-2 border-primary bg-zinc-900 p-2 text-center sm:h-[90px] sm:w-[100px]">
              <div className="flex flex-1 flex-col items-center justify-center gap-1">
                <Bike className="size-5 text-primary" aria-hidden />
                <p className="text-[9px] font-semibold uppercase leading-tight text-white">
                  Moto Vengala 250
                </p>
              </div>
              <span className="mx-auto flex size-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                11
              </span>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-6 border-t border-zinc-800 pt-10">
            <Link
              href="/catalogo"
              className="inline-flex w-full max-w-md items-center justify-center rounded-xl bg-primary px-8 py-3.5 text-base font-bold uppercase tracking-wide text-primary-foreground transition-opacity hover:opacity-95 sm:text-lg"
            >
              Participa ahora
            </Link>

            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-10">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Disponible en
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="rounded-lg border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-300">
                  Google Play
                </span>
                <span className="rounded-lg border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-300">
                  App Store
                </span>
              </div>
            </div>

            <a
              href="https://www.instagram.com/buxxep.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-primary"
            >
              <Instagram className="size-5 text-primary" aria-hidden />
              Síguenos @buxxep.app
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
