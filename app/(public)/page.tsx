import { readdir } from "fs/promises";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { GiveawayPromoSection } from "@/components/landing/GiveawayPromoSection";
import { InstagramEmbeds } from "@/components/landing/InstagramEmbeds";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import MagicBento from "@/components/MagicBento";
import {
  getCategoriesPublic,
  getCategoryCoverByCategoryId,
  getGiveawayGoalPurchases,
  getGiveawayPaidPurchaseCount,
  getProducts,
} from "@/lib/db";

async function getClothDesignImageUrls(): Promise<string[]> {
  try {
    const dir = path.join(process.cwd(), "public", "cloths");
    const names = await readdir(dir);
    return names
      .filter((n) => /\.(jpe?g|jpeg|png|webp)$/i.test(n))
      .sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
      )
      .map((n) => `/cloths/${n}`);
  } catch {
    return [];
  }
}

const MODEL_ACTITUD = "/people/modelo-actitud.png";

const TICKER_ITEMS = [
  { id: "t1", text: "NUEVA COLECCIÓN 2025" },
  { id: "t2", text: "ENVÍO A TODO EL PAÍS" },
  { id: "t3", text: "PERSONALIZA TU PRENDA" },
  { id: "t4", text: "50% COLECCIÓN HOMBRE" },
  { id: "t5", text: "PAGOS 100% SEGUROS" },
  { id: "t6", text: "DISEÑA EN MINUTOS" },
  { id: "t7", text: "50% COLECCIÓN MUJER" },
  { id: "t8", text: "EDITA · PERSONALIZA · COMPRA" },
];

const C = "max-w-7xl mx-auto px-4 sm:px-6";
const S = "py-16 sm:py-20";

export default async function PublicPage() {
  const [clothDesigns, giveawayPaidCount, products, categories, covers] = await Promise.all([
    getClothDesignImageUrls(),
    getGiveawayPaidPurchaseCount(),
    getProducts(),
    getCategoriesPublic(),
    getCategoryCoverByCategoryId(),
  ]);
  const giveawayGoal = getGiveawayGoalPurchases();
  const featured = products.slice(0, 8);
  const clothSlice = clothDesigns.slice(0, 3);

  return (
    <article className="flex flex-col bg-background text-foreground overflow-x-hidden">

      {/* ─── 1. SORTEO ───────────────────────────────────────────────── */}
      <GiveawayPromoSection
        paidPurchaseCount={giveawayPaidCount}
        goalPurchases={giveawayGoal}
      />

      {/* ─── 2. TICKER ───────────────────────────────────────────────── */}
      <div
        className="w-full border-y border-border bg-background py-3 overflow-hidden"
        aria-hidden
      >
        <div className="flex animate-marquee gap-0 whitespace-nowrap">
          {[
            ...TICKER_ITEMS.map((t) => ({ key: t.id, text: t.text })),
            ...TICKER_ITEMS.map((t) => ({ key: `${t.id}-b`, text: t.text })),
          ].map((item) => (
            <span
              key={item.key}
              className="inline-flex items-center gap-4 px-6 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
            >
              {item.text}
              <span className="size-1.5 rounded-full bg-primary shrink-0" />
            </span>
          ))}
        </div>
      </div>

      {/* ─── 3. CATEGORÍAS ───────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className={`${S} border-t border-border`} aria-labelledby="sec-cats">
          <div className={C}>
            <ScrollReveal>
              <div className="flex items-end justify-between gap-4 mb-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
                    Buxxep · Tienda
                  </p>
                  <h2
                    id="sec-cats"
                    className="mt-1 text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground"
                  >
                    Explorar por <span className="landing-wavy-underline">categoría</span>
                  </h2>
                </div>
                <Link
                  href="/catalogo"
                  className="shrink-0 text-xs font-semibold text-primary hover:underline underline-offset-2"
                >
                  Ver todo →
                </Link>
              </div>
            </ScrollReveal>
            <div
              className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-4 lg:grid-cols-6 sm:overflow-visible"
              style={{ scrollbarWidth: "none" }}
            >
              <ScrollReveal>
                <Link
                  href="/catalogo"
                  className="group relative shrink-0 flex w-[30vw] sm:w-auto overflow-hidden rounded-2xl bg-muted/60 border border-border/60 hover:border-primary/40 transition-all duration-300 hover:shadow-[0_8px_32px_-10px_rgba(60,200,247,0.3)]"
                  style={{ aspectRatio: "2/3" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <span className="block text-white text-[11px] font-bold uppercase tracking-widest leading-tight">
                      Todo
                    </span>
                    <span className="block text-white/50 text-[10px] mt-0.5">Ver catálogo</span>
                  </div>
                </Link>
              </ScrollReveal>
              {categories.map((cat, i) => {
                const thumb = cat.image_url ?? covers[cat.id];
                return (
                  <ScrollReveal key={cat.id} delay={i * 50}>
                    <Link
                      href={`/catalogo?categoria=${cat.slug}`}
                      className="group relative shrink-0 flex w-[30vw] sm:w-auto overflow-hidden rounded-2xl bg-muted border border-border/60 hover:border-primary/40 transition-all duration-300 hover:shadow-[0_8px_32px_-10px_rgba(60,200,247,0.3)]"
                      style={{ aspectRatio: "2/3" }}
                    >
                      {thumb && (
                        <Image
                          src={thumb}
                          alt={cat.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                          sizes="(max-width:640px) 30vw, 200px"
                          unoptimized={thumb.startsWith("http")}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-3">
                        <span className="block text-white text-[11px] font-bold leading-tight line-clamp-2">
                          {cat.name}
                        </span>
                        <span className="block text-white/50 text-[10px] mt-0.5">Ver →</span>
                      </div>
                    </Link>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── 4. PRODUCTOS DESTACADOS ─────────────────────────────────── */}
      {featured.length > 0 && (
        <section className={`${S} ${C} border-t border-border`} aria-labelledby="sec-featured">
          <ScrollReveal>
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
                  Buxxep · Tienda
                </p>
                <h2
                  id="sec-featured"
                  className="mt-1 text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground"
                >
                  Productos <span className="landing-wavy-underline">destacados</span>
                </h2>
              </div>
              <Link
                href="/catalogo"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Ver todo →
              </Link>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {featured.map((product, i) => (
              <ScrollReveal key={product.id} delay={i * 55}>
                <Link
                  href={`/catalogo/${product.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card transition-all duration-200 hover:border-primary/40 hover:shadow-[0_12px_40px_-16px_rgba(60,200,247,0.3)] hover:-translate-y-0.5"
                >
                  <div className="relative aspect-3/4 overflow-hidden bg-muted">
                    <Image
                      src={product.coverImage}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                      sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,20vw"
                      unoptimized={product.coverImage?.startsWith("http")}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="flex flex-col gap-1 border-t border-border/60 p-2.5 sm:p-3">
                    <span className="text-xs font-semibold leading-tight line-clamp-1 sm:text-sm group-hover:text-primary transition-colors">
                      {product.name}
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="tabular-nums text-sm font-bold text-primary">
                        {product.price}
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground group-hover:text-primary transition-colors">
                        Ver →
                      </span>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* ─── 4. TEMPORADA ────────────────────────────────────────────── */}
      <section className="hidden sm:flex relative w-full overflow-hidden min-h-[55vh] sm:min-h-[60vh] items-center">
        <Image
          src={MODEL_ACTITUD}
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/55 to-transparent" />
        <div className={`relative z-10 ${C} w-full py-20`}>
          <ScrollReveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-primary mb-3">
              Ahora disponible
            </p>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black uppercase tracking-tight text-white leading-tight max-w-xl">
              Colección<br />
              <span className="text-primary">Temporada 2025</span>
            </h2>
            <p className="mt-4 text-white/75 max-w-sm text-sm leading-relaxed">
              Prendas frescas y modernas pensadas para la nueva temporada.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/catalogo?orden=recientes"
                className="inline-flex items-center justify-center rounded-xl bg-white text-black px-7 py-3 text-sm font-bold hover:bg-white/90 transition-colors"
              >
                Ver colección →
              </Link>
              <Link
                href="/editor"
                className="inline-flex items-center justify-center rounded-xl border border-white/30 text-white px-7 py-3 text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                Diseñar
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── 5. DISEÑOS EN TELA ──────────────────────────────────────── */}
      {clothSlice.length > 0 && (
        <section className="hidden sm:block w-full border-t border-border bg-muted/15" aria-labelledby="sec-cloths">
          {/* Header contenido */}
          <div className={`${C} pt-16 sm:pt-20 pb-8`}>
            <ScrollReveal>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
                    Buxxep · Diseños
                  </p>
                  <h2
                    id="sec-cloths"
                    className="mt-1 text-2xl sm:text-4xl font-black uppercase tracking-tight text-foreground"
                  >
                    Diseños en <span className="landing-wavy-underline">tela</span>
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-snug text-muted-foreground">
                    Piezas y estampados Buxxep que puedes llevar al editor o comprar en el catálogo.
                  </p>
                </div>
                <Link
                  href="/catalogo"
                  className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  Ver catálogo →
                </Link>
              </div>
            </ScrollReveal>
          </div>
          {/* Grid de imágenes */}
          <div className={`${C} pb-8 sm:pb-12`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {clothSlice.map((src, i) => (
                <ScrollReveal key={src} delay={i * 80} className="h-full">
                  <Link href="/catalogo" className="group block h-full overflow-hidden relative rounded-2xl">
                    <div className="relative w-full" style={{ minHeight: "70vh" }}>
                      <Image
                        src={src}
                        alt={`Diseño de ropa Buxxep ${i + 1}`}
                        fill
                        className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                        sizes="(max-width:640px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                        <span className="text-sm font-bold uppercase tracking-widest text-white">
                          Look {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-white/80 text-xl leading-none" aria-hidden>→</span>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── 6. BENTO / CARACTERÍSTICAS ──────────────────────────────── */}
      <section className={`hidden sm:block ${S} border-t border-border ${C}`} aria-labelledby="sec-bento">
        <ScrollReveal>
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
              Buxxep · Calidad
            </p>
            <h2
              id="sec-bento"
              className="mt-1 text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground"
            >
              Hecho para el día a día <span className="landing-wavy-underline">fuerte</span>
            </h2>
            <p className="mt-2 text-muted-foreground text-sm max-w-md">
              Prendas que aguantan el ritmo. Personalízalas a tu gusto en el editor.
            </p>
          </div>
        </ScrollReveal>
        <MagicBento
          textAutoHide
          enableStars
          enableSpotlight
          enableBorderGlow
          enableTilt={false}
          enableMagnetism={false}
          clickEffect
          spotlightRadius={400}
          particleCount={12}
          glowColor="60, 200, 247"
          disableAnimations={false}
        />
      </section>

      {/* ─── 7. CÓMO FUNCIONA ────────────────────────────────────────── */}
      <section className="hidden sm:block w-full border-t border-border bg-muted/30" aria-labelledby="sec-how">
        <div className={`${C} py-20 sm:py-28`}>
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary mb-3">
                Buxxep · Proceso
              </p>
              <h2
                id="sec-how"
                className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-foreground"
              >
                Cómo funciona
              </h2>
            </div>
          </ScrollReveal>
          <ol className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
            {[
              {
                step: "01",
                title: "Elige prenda",
                text: "Entra al catálogo, explora por categoría y selecciona la prenda que más te guste.",
                href: "/catalogo",
                cta: "Ver catálogo",
              },
              {
                step: "02",
                title: "Diseña",
                text: "Abre el editor y personaliza con texto, imágenes, formas y colores en segundos.",
                href: "/editor",
                cta: "Abrir editor",
              },
              {
                step: "03",
                title: "Compra",
                text: "Añade al carrito, realiza tu pago de forma segura y recibe tu pedido en casa.",
                href: "/carrito",
                cta: "Ver carrito",
              },
            ].map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 120} className="h-full">
                <li className="flex flex-col gap-6 px-0 py-10 sm:px-10 sm:py-0">
                  <span className="text-[5rem] sm:text-[6rem] font-black tabular-nums leading-none text-primary/20">
                    {item.step}
                  </span>
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.text}</p>
                  </div>
                  <Link
                    href={item.href}
                    className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline underline-offset-2"
                  >
                    {item.cta} →
                  </Link>
                </li>
              </ScrollReveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── 8. INSTAGRAM ───────────────────────────────────────────── */}
      <div className="hidden sm:block">
        <InstagramEmbeds />
      </div>
    </article>
  );
}
