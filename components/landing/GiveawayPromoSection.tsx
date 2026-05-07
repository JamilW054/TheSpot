import {
  Bike,
  Flag,
  Instagram,
  Lock,
  ShoppingBag,
  Smartphone,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatGiveawayNumber } from "@/lib/db/giveaway-stats";

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
  paidPurchaseCount: number;
  goalPurchases: number;
}

export function GiveawayPromoSection({
  paidPurchaseCount,
  goalPurchases,
}: GiveawayPromoSectionProps) {
  const goal = Math.max(1, Math.floor(goalPurchases));
  const current = Math.max(0, Math.floor(paidPurchaseCount));
  const pct = Math.min(100, Math.round((current / goal) * 100));
  const formattedGoal = formatGiveawayNumber(goal);
  const formattedCount = formatGiveawayNumber(current);

  return (
    <section
      className="w-full bg-zinc-950 text-white"
      aria-labelledby="giveaway-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 lg:py-24">
        {/* 3-col hero: content | moto image | participation */}
        <div className="grid gap-10 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-12">

          {/* ── Left: headline + prizes ── */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3.5 py-2 text-[11px] font-semibold leading-snug text-zinc-100">
                <Lock className="size-3.5 shrink-0 text-primary" aria-hidden />
                Pagos 100% seguros con Azul
              </div>
            </div>

            <div className="space-y-2">
              <h2 id="giveaway-heading" className="leading-[1.02]">
                <span className="block text-[clamp(2.4rem,6vw,4.5rem)] font-black uppercase tracking-tight text-white">
                  Gana
                </span>
                <span className="mt-1 block text-[clamp(2rem,5.5vw,3.8rem)] font-bold italic tracking-tight text-primary">
                  en grande
                </span>
                <span className="mt-4 inline-block rounded-lg border border-primary/50 bg-primary/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-100 sm:text-sm">
                  Con Buxxep
                </span>
              </h2>
            </div>

            <div className="flex flex-wrap items-end gap-4 border-l-2 border-primary pl-5">
              <span
                className="font-black tabular-nums leading-none text-[clamp(3.5rem,9vw,5.5rem)] text-primary"
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
                    <ShoppingBag className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <span>10 ganadores RD$1.500 en compras</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* ── Center: moto promotion image ── */}
          <div className="flex justify-center order-first lg:order-0">
            <div className="relative w-full max-w-xs sm:max-w-sm lg:w-80 lg:max-w-none">
              <Image
                src="/landing/moto-promotion.png"
                alt="Premio principal: Moto Vengala 250"
                width={400}
                height={500}
                className="w-full h-auto object-contain drop-shadow-[0_16px_48px_rgba(60,200,247,0.3)]"
                sizes="(max-width:768px) 80vw, 320px"
                priority
              />
            </div>
          </div>

          {/* ── Right: participation + progress + CTA ── */}
          <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/80 p-5 sm:p-6">
              <div className="flex gap-3 sm:gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-zinc-600 bg-zinc-950">
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

            {/* Progress */}
            <div className="space-y-3">
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-zinc-100 sm:text-base">
                  Llevamos{" "}
                  <span className="tabular-nums text-primary">{formattedCount}</span>{" "}
                  de{" "}
                  <span className="tabular-nums text-white">{formattedGoal}</span>{" "}
                  compras pagadas
                </p>
                <p className="text-xs leading-relaxed text-zinc-500">
                  Al completar la meta se eligen los ganadores.
                </p>
              </div>
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuenow={current}
                aria-valuemax={goal}
                aria-valuetext={`${formattedCount} de ${formattedGoal} compras pagadas, ${pct} por ciento`}
                aria-label="Avance de compras pagadas hacia la meta del sorteo"
                className="flex items-center gap-3 text-[11px] font-semibold tabular-nums text-zinc-400 sm:text-xs"
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
              <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                ★ Se eligen los ganadores ★
              </p>
              <p className="sr-only" aria-live="polite">
                Sorteo: {formattedCount} de {formattedGoal} compras pagadas.
                La meta está al {pct} por ciento.
              </p>
            </div>

            <Link
              href="/catalogo"
              className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-8 py-3.5 text-base font-bold uppercase tracking-wide text-primary-foreground transition-opacity hover:opacity-95"
            >
              Participa ahora
            </Link>

            <a
              href="https://www.instagram.com/buxxep.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 self-center text-sm font-medium text-zinc-400 transition-colors hover:text-primary"
            >
              <Instagram className="size-5 text-primary" aria-hidden />
              Síguenos @buxxep.app
            </a>
          </div>
        </div>

        {/* Prize mini-cards */}
        <div className="mt-14 flex flex-wrap justify-center gap-2 border-t border-zinc-800 pt-10 sm:gap-2.5">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={`prize-${i + 1}`}
              className="flex h-21.5 w-18 shrink-0 flex-col justify-between rounded-lg border border-primary/40 bg-zinc-900/90 p-2 text-center sm:h-22.5 sm:w-19"
            >
              <p className="text-[9px] font-semibold uppercase leading-tight text-zinc-100">
                RD$ 1.500 en compras
              </p>
              <span className="mx-auto flex size-7 items-center justify-center rounded-full border border-primary/60 text-[11px] font-bold text-primary">
                {i + 1}
              </span>
            </div>
          ))}
          <div className="flex h-21.5 w-23 shrink-0 flex-col justify-between rounded-lg border-2 border-primary bg-zinc-900 p-2 text-center sm:h-22.5 sm:w-25">
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

        {/* App stores */}
        <div className="mt-8 flex flex-col items-center gap-4 border-t border-zinc-800 pt-8 text-center sm:flex-row sm:justify-center sm:gap-10">
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
      </div>
    </section>
  );
}
