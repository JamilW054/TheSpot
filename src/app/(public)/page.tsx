import {
  Footprints,
  Gem,
  ShoppingBag,
  Sparkles,
  SprayCan,
  Truck,
  Wallet,
  Watch,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AcceptedPayments } from "@/components/brand/AcceptedPayments";
import { SpotWordmark } from "@/components/brand/SpotWordmark";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { SpotTicker } from "@/components/landing/SpotTicker";
import {
  BRAND_NAME,
  BRAND_TAGLINE,
  isComingSoonCategory,
} from "@/config/brand";
import {
  getCategoriesPublic,
  getCategoryCoverByCategoryId,
  getProducts,
} from "@/database/repositories";

const C = "max-w-6xl mx-auto px-4 sm:px-6";

const CAT_ICONS: Record<string, typeof Sparkles> = {
  belleza: Sparkles,
  relojes: Watch,
  perfumes: SprayCan,
  gorras: Gem,
  tenis: Footprints,
};

const CAT_ROTATE = [
  "-rotate-3",
  "rotate-2",
  "-rotate-1",
  "rotate-3",
  "rotate-0",
];

const PERKS = [
  {
    icon: Gem,
    title: "Marcas que quieres",
    text: "Lo que ves es lo que llega. Originales, en un solo catálogo.",
  },
  {
    icon: Truck,
    title: "Envío a todo el país",
    text: "Santo Domingo y el interior. Coordinamos la entrega contigo.",
  },
  {
    icon: Wallet,
    title: "Contra entrega o transferencia",
    text: "Paga contra entrega o por transferencia (Banreservas y Popular).",
  },
  {
    icon: ShoppingBag,
    title: "Pedido sin cuenta",
    text: "Entras, armas el mix y listo. Consultas el pedido por número.",
  },
];

export default async function PublicPage() {
  const [products, categories, covers] = await Promise.all([
    getProducts(),
    getCategoriesPublic(),
    getCategoryCoverByCategoryId(),
  ]);
  const soonSlugs = categories.filter((c) => c.coming_soon).map((c) => c.slug);
  // Copy de portada según las categorías configuradas en el admin.
  const roots = categories.filter((c) => !c.parent_id);
  const listEs = (names: string[]) =>
    names.length <= 1
      ? (names[0] ?? "")
      : `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
  const liveNames = roots.filter((c) => !c.coming_soon).map((c) => c.name);
  const soonNames = roots.filter((c) => c.coming_soon).map((c) => c.name);
  const heroAvailability = [
    liveNames.length
      ? `${listEs(liveNames)} ${liveNames.length === 1 ? "ya está" : "ya están"} en el spot.`
      : "",
    soonNames.length ? `${listEs(soonNames)}: coming soon.` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const tickerItems = [
    ...liveNames,
    ...soonNames.map((n) => `${n} · coming soon`),
    "Envío a todo el país",
    "Pago contra entrega",
    "Transferencia bancaria",
  ];
  const featured = products
    .filter((p) => !isComingSoonCategory(p.categorySlug, soonSlugs))
    .slice(0, 8);

  return (
    <article className="flex flex-col overflow-x-hidden bg-white text-foreground">
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-[-6rem] size-[34rem] rounded-full bg-primary/12 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-48 -left-40 size-[24rem] rounded-full bg-rose-200/60 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-1/4 size-40 rounded-full bg-primary/10 blur-2xl"
        />

        <div
          className={`${C} relative grid items-center gap-10 py-10 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-20`}
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary shadow-sm">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-40" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              Santo Domingo · RD
            </div>

            <div className="mt-5">
              <SpotWordmark />
            </div>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              {BRAND_TAGLINE} {heroAvailability}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/catalogo"
                className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_-12px_rgba(225,29,72,0.7)] transition hover:brightness-110"
              >
                Explorar catálogo
              </Link>
              <Link
                href="/ayuda"
                className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-white px-7 py-3.5 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary"
              >
                Cómo comprar
              </Link>
            </div>

            <AcceptedPayments className="mt-7" />
          </div>

          {categories.length > 0 && (
            <div className="relative hidden min-h-[22rem] lg:block">
              <div
                aria-hidden
                className="absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-primary/20"
              />
              <div className="grid grid-cols-2 gap-4 pt-6">
                {categories.slice(0, 4).map((cat, i) => {
                  const Icon = CAT_ICONS[cat.slug] ?? Sparkles;
                  const thumb = cat.image_url ?? covers[cat.id];
                  const soon = isComingSoonCategory(cat.slug, soonSlugs);
                  return (
                    <Link
                      key={cat.id}
                      href={`/catalogo?categoria=${cat.slug}`}
                      className={`group relative overflow-hidden rounded-[1.6rem] border border-rose-100 bg-white p-2 shadow-[0_16px_40px_-24px_rgba(225,29,72,0.45)] transition hover:-translate-y-1 hover:border-primary/40 ${CAT_ROTATE[i % CAT_ROTATE.length]}`}
                    >
                      <div className="relative aspect-4/5 overflow-hidden rounded-[1.2rem] bg-rose-50">
                        {thumb ? (
                          <Image
                            src={thumb}
                            alt=""
                            fill
                            className={`object-cover transition duration-500 group-hover:scale-105 ${soon ? "opacity-70" : ""}`}
                            sizes="180px"
                            unoptimized={thumb.startsWith("http")}
                          />
                        ) : (
                          <div className="grid size-full place-items-center">
                            <Icon className="size-8 text-primary" aria-hidden />
                          </div>
                        )}
                        {soon ? (
                          <span className="absolute inset-x-2 bottom-2 rounded-full bg-white/95 px-2 py-1 text-center text-[10px] font-black uppercase tracking-wide text-primary">
                            Coming soon
                          </span>
                        ) : null}
                      </div>
                      <p className="px-2 py-2 text-center text-xs font-black uppercase tracking-wide">
                        {cat.name}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      <SpotTicker items={tickerItems} />

      {categories.length > 0 && (
        <section className="bg-white" aria-labelledby="sec-cats">
          <div className={`${C} py-12 sm:py-16`}>
            <div className="mb-8 flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                  El mix
                </p>
                <h2
                  id="sec-cats"
                  className="mt-1 text-3xl font-black tracking-tight sm:text-4xl"
                >
                  Cinco mundos. Un solo spot.
                </h2>
              </div>
              <Link
                href="/catalogo"
                className="hidden text-sm font-semibold text-primary hover:underline sm:inline"
              >
                Ver todo
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {categories.map((cat, i) => {
                const Icon = CAT_ICONS[cat.slug] ?? Sparkles;
                const thumb = cat.image_url ?? covers[cat.id];
                const soon = isComingSoonCategory(cat.slug, soonSlugs);
                return (
                  <ScrollReveal key={cat.id} delay={i * 40}>
                    <Link
                      href={`/catalogo?categoria=${cat.slug}`}
                      className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-rose-100 bg-[#fff8f9] transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white hover:shadow-[0_14px_32px_-18px_rgba(225,29,72,0.4)]"
                    >
                      {soon ? (
                        <span className="absolute top-3 right-3 z-10 rounded-full bg-primary px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">
                          Soon
                        </span>
                      ) : null}
                      <div className="relative mx-auto mt-5 grid size-16 place-items-center overflow-hidden rounded-full border-2 border-white bg-white shadow-sm sm:size-20">
                        {thumb ? (
                          <Image
                            src={thumb}
                            alt=""
                            fill
                            className={`object-cover ${soon ? "opacity-60" : ""}`}
                            sizes="80px"
                            unoptimized={thumb.startsWith("http")}
                          />
                        ) : (
                          <Icon className="size-7 text-primary" aria-hidden />
                        )}
                      </div>
                      <div className="px-3 py-4 text-center">
                        <span className="text-sm font-black uppercase tracking-wide">
                          {cat.name}
                        </span>
                        <span className="mt-1 block text-[11px] font-semibold text-primary">
                          {soon ? "Coming soon" : "Ver drop"}
                        </span>
                      </div>
                    </Link>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section
        className="border-y border-rose-100 bg-[#fff8f9]"
        aria-label="Por qué The Spot"
      >
        <div className={`${C} grid gap-3 py-10 sm:grid-cols-2 lg:grid-cols-4`}>
          {PERKS.map((perk) => (
            <div
              key={perk.title}
              className="rounded-[1.4rem] border border-rose-100 bg-white px-4 py-5"
            >
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <perk.icon className="size-4" aria-hidden />
              </span>
              <p className="mt-3 text-sm font-bold">{perk.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {perk.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="bg-white" aria-labelledby="sec-drop">
          <div className={`${C} py-12 sm:py-16`}>
            <div className="mb-8 flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                  En {BRAND_NAME} ahora
                </p>
                <h2
                  id="sec-drop"
                  className="mt-1 text-3xl font-black tracking-tight sm:text-4xl"
                >
                  Lo más pedido
                </h2>
              </div>
              <Link
                href="/catalogo"
                className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
              >
                Catálogo
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 min-[520px]:grid-cols-3 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section
        className="border-t border-rose-100 bg-[#fff8f9]"
        aria-labelledby="sec-how"
      >
        <div className={`${C} py-14 sm:py-20`}>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
            Súper fácil
          </p>
          <h2
            id="sec-how"
            className="mt-2 max-w-xl text-3xl font-black tracking-tight sm:text-5xl"
          >
            Tres pasos y es tuyo
          </h2>
          <ol className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                n: "01",
                t: "Elige",
                d: "Elige perfume o tenis ahora. Belleza, relojes y gorras llegan pronto.",
              },
              {
                n: "02",
                t: "Pide",
                d: "Checkout de invitado. Sin cuenta. Te contactamos para pagar.",
              },
              {
                n: "03",
                t: "Paga",
                d: "Pago contra entrega o transferencia. Coordinamos entrega a todo el país.",
              },
            ].map((s) => (
              <li
                key={s.n}
                className="rounded-[1.75rem] border border-rose-100 bg-white p-6 shadow-[0_12px_32px_-20px_rgba(225,29,72,0.4)]"
              >
                <span className="text-xs font-black tracking-[0.2em] text-primary">
                  {s.n}
                </span>
                <h3 className="mt-3 text-2xl font-black">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.d}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <SpotTicker variant="rose" items={tickerItems} />

      <section className="bg-primary">
        <div
          className={`${C} flex flex-col items-start justify-between gap-6 py-14 sm:flex-row sm:items-center`}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
              The Spot · República Dominicana
            </p>
            <p className="mt-2 max-w-md text-3xl font-black tracking-tight text-white sm:text-4xl">
              El punto donde se juntan las marcas que ya quieres.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-bold text-primary transition hover:bg-rose-50"
          >
            Ir al catálogo
          </Link>
        </div>
      </section>
    </article>
  );
}
