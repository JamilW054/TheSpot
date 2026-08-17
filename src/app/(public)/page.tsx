import Image from "next/image";
import Link from "next/link";
import { LandingProductCard } from "@/components/catalog/LandingProductCard";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import MagicBento from "@/components/MagicBento";
import {
  getCategoriesPublic,
  getCategoryCoverByCategoryId,
  getProducts,
} from "@/database/repositories";

const TICKER_ITEMS = [
  { id: "t1", text: "PERFUMES ORIGINALES" },
  { id: "t2", text: "ENVÍO A TODO EL PAÍS" },
  { id: "t3", text: "PEDIDO SIN CUENTA" },
  { id: "t4", text: "CONFIRMACIÓN POR WHATSAPP" },
  { id: "t5", text: "PARA ÉL Y PARA ELLA" },
  { id: "t6", text: "FRAGANCIAS DE NICHO" },
  { id: "t7", text: "EXPLORA · ELIGE · CONFIRMA" },
];

const C = "max-w-7xl mx-auto px-4 sm:px-6";
const S = "py-16 sm:py-20";

export default async function PublicPage() {
  const [products, categories, covers] = await Promise.all([
    getProducts(),
    getCategoriesPublic(),
    getCategoryCoverByCategoryId(),
  ]);
  const featured = products.slice(0, 6);

  // Bento — un producto representativo por categoría (usando la foto del
  // producto). Rellena con otros productos hasta llegar a 6 cajas.
  const bentoCards: {
    image: string | null;
    label: string;
    title: string;
    description: string;
    href: string;
  }[] = [];
  const usedProductIds = new Set<string>();
  for (const cat of categories) {
    if (bentoCards.length >= 6) break;
    const product = products.find(
      (p) => p.categorySlug === cat.slug && p.coverImage,
    );
    if (!product) continue;
    usedProductIds.add(product.id);
    bentoCards.push({
      image: product.coverImage,
      label: cat.name,
      title: product.name,
      description: product.price,
      href: `/catalogo/${product.slug}`,
    });
  }
  // Completar hasta 6 con productos aún no usados.
  for (const product of products) {
    if (bentoCards.length >= 6) break;
    if (usedProductIds.has(product.id) || !product.coverImage) continue;
    usedProductIds.add(product.id);
    bentoCards.push({
      image: product.coverImage,
      label: "Destacado",
      title: product.name,
      description: product.price,
      href: `/catalogo/${product.slug}`,
    });
  }

  return (
    <article className="flex flex-col bg-background text-foreground overflow-x-hidden">
      {/* ─── 0. CATÁLOGO ─────────────────────────────────────────────── */}
      <section className="w-full border-b border-border" aria-label="Catálogo">
        {/* Category tiles — square */}
        {categories.length > 0 && (
          <div className="w-full border-b border-border">
            <div
              className="max-w-7xl mx-auto w-full flex gap-3 sm:gap-4 overflow-x-auto px-3 sm:px-6 py-4"
              style={{ scrollbarWidth: "none" }}
            >
              {categories.map((cat) => {
                const thumb = cat.image_url ?? covers[cat.id];
                return (
                  <Link
                    key={cat.id}
                    href={`/catalogo?categoria=${cat.slug}`}
                    className="group shrink-0 flex flex-col items-center gap-2"
                  >
                    <div className="relative size-19 sm:size-22 overflow-hidden rounded-[14px] border border-border bg-muted transition duration-200 group-hover:border-foreground/30 group-active:scale-95">
                      {thumb ? (
                        <Image
                          src={thumb}
                          alt={cat.name}
                          width={88}
                          height={88}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          unoptimized={thumb.startsWith("http")}
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-sm font-semibold uppercase text-muted-foreground">
                          {cat.name.slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <span className="w-19 sm:w-22 text-center text-[11px] font-medium leading-tight text-foreground line-clamp-2">
                      {cat.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Sort tabs */}
        <div
          className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 pb-2 flex gap-2 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {(
            [
              { label: "Para Ti", href: "/catalogo" },
              { label: "Novedades", href: "/catalogo?orden=recientes" },
              { label: "Precio ↑", href: "/catalogo?orden=precio-menor" },
              { label: "Precio ↓", href: "/catalogo?orden=precio-mayor" },
              { label: "Ofertas", href: "/catalogo?precio=economico" },
              { label: "A-Z", href: "/catalogo?orden=az" },
            ] as const
          ).map((tab, i) => (
            <Link
              key={tab.label}
              href={tab.href}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
                i === 0
                  ? "bg-foreground text-background border-foreground"
                  : "border-border bg-transparent text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Header row */}
        <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 pb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span aria-hidden className="h-5 w-1 rounded-full bg-primary" />
            <h2 className="text-base font-black uppercase tracking-tight text-foreground sm:text-lg">
              Todo el catálogo
            </h2>
          </div>
          <span className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 tabular-nums text-xs font-semibold text-muted-foreground">
            {products.length} {products.length === 1 ? "producto" : "productos"}
          </span>
        </div>

        {/* Product grid */}
        <div className="max-w-7xl mx-auto w-full grid grid-cols-2 gap-2.5 min-[480px]:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 px-3 sm:px-4 pb-10">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ─── 1. TICKER ───────────────────────────────────────────────── */}
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

      {/* ─── 2. CATEGORÍAS ───────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section
          className={`${S} border-t border-border`}
          aria-labelledby="sec-cats"
        >
          <div className={C}>
            <ScrollReveal>
              <div className="flex items-end justify-between gap-4 mb-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
                    JW Parfum · Tienda
                  </p>
                  <h2
                    id="sec-cats"
                    className="mt-1 text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground"
                  >
                    Explorar por{" "}
                    <span className="landing-wavy-underline">categoría</span>
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
                  <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <span className="block text-white text-[11px] font-bold uppercase tracking-widest leading-tight">
                      Todo
                    </span>
                    <span className="block text-white/50 text-[10px] mt-0.5">
                      Ver catálogo
                    </span>
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
                      <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-3">
                        <span className="block text-white text-[11px] font-bold leading-tight line-clamp-2">
                          {cat.name}
                        </span>
                        <span className="block text-white/50 text-[10px] mt-0.5">
                          Ver →
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

      {/* ─── 3. PRODUCTOS DESTACADOS ─────────────────────────────────── */}
      {featured.length > 0 && (
        <section
          className="py-14 sm:py-20 border-t border-border"
          aria-labelledby="sec-featured"
        >
          <div className={C}>
            {/* ── Section header ── */}
            <ScrollReveal>
              <div className="mb-7 sm:mb-10">
                {/* Top row: badge + Ver-todo button (desktop) */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-[26px] border border-border bg-card px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                      <span className="size-1.5 rounded-full bg-primary" />
                      Temporada 2025
                    </span>
                    <h2
                      id="sec-featured"
                      className="mt-2.5 text-[2rem] sm:text-[clamp(2rem,4.5vw,3rem)] font-black uppercase tracking-[-0.03em] text-foreground leading-[0.9]"
                    >
                      Productos
                      <br />
                      <span className="text-primary">Destacados</span>
                    </h2>
                  </div>
                  <Link
                    href="/catalogo"
                    className="hidden sm:inline-flex shrink-0 group items-center gap-2 rounded-[10px] border border-border/80 bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:text-primary mt-1"
                  >
                    Ver todo
                    <svg
                      className="size-3.5 transition-transform group-hover:translate-x-0.5"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M3 8h10M9 4l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </ScrollReveal>

            {/* ── Mobile / tablet: responsive grid (< lg) ── */}
            <div className="grid grid-cols-2 min-[520px]:grid-cols-3 gap-2.5 sm:gap-3 lg:hidden">
              {featured.map((product, i) => (
                <ScrollReveal key={product.id} delay={i * 40}>
                  <LandingProductCard product={product} />
                </ScrollReveal>
              ))}
            </div>

            {/* Ver todo — mobile only (below grid) */}
            <Link
              href="/catalogo"
              className="mt-5 flex items-center justify-center gap-1.5 sm:hidden text-sm font-semibold text-primary hover:underline underline-offset-2"
            >
              Ver todo el catálogo →
            </Link>

            {/* ── Desktop editorial layout (lg+) ── */}
            <div className="hidden lg:flex flex-col gap-3">
              {/* Row 1: hero (left 38%) + 2×2 grid (right) */}
              <div
                className="flex gap-3"
                style={{ height: "clamp(420px, 42vw, 600px)" }}
              >
                <ScrollReveal className="w-[38%] shrink-0 h-full" delay={0}>
                  <LandingProductCard product={featured[0]} variant="hero" />
                </ScrollReveal>

                {/* 2×2 grid — grid-rows-2 distributes height evenly */}
                <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-3">
                  {featured.slice(1, 5).map((product, i) => (
                    <ScrollReveal
                      key={product.id}
                      delay={(i + 1) * 60}
                      className="h-full"
                    >
                      <LandingProductCard product={product} variant="fill" />
                    </ScrollReveal>
                  ))}
                </div>
              </div>

              {/* Row 2: wide card */}
              {featured[5] && (
                <ScrollReveal delay={280}>
                  <LandingProductCard product={featured[5]} variant="wide" />
                </ScrollReveal>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ─── 4. BENTO / CARACTERÍSTICAS ──────────────────────────────── */}
      <section
        className={`hidden sm:block ${S} border-t border-border ${C}`}
        aria-labelledby="sec-bento"
      >
        <ScrollReveal>
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
              JW Parfum · Explora
            </p>
            <h2
              id="sec-bento"
              className="mt-1 text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground"
            >
              Lo mejor de cada{" "}
              <span className="landing-wavy-underline">categoría</span>
            </h2>
            <p className="mt-2 text-muted-foreground text-sm max-w-md">
              Un producto destacado de cada categoría. Toca cualquiera para ver el
              producto.
            </p>
          </div>
        </ScrollReveal>
        <MagicBento
          cards={bentoCards}
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

      {/* ─── 5. CÓMO FUNCIONA ────────────────────────────────────────── */}
      <section
        className="w-full border-t border-border bg-background"
        aria-labelledby="sec-how"
      >
        <div className={`${C} py-20 sm:py-28`}>
          {/* Header */}
          <ScrollReveal>
            <div className="mb-12 flex flex-col gap-6 sm:mb-14 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <span aria-hidden className="h-0.5 w-9 bg-primary" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    Cómo funciona
                  </span>
                </div>
                <h2
                  id="sec-how"
                  className="text-4xl font-semibold tracking-tight text-foreground leading-[1.05] sm:text-5xl lg:text-6xl"
                >
                  Compra en
                  <br />
                  tres pasos
                </h2>
              </div>
            </div>
          </ScrollReveal>

          {/* Steps */}
          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                step: "01",
                title: "Elige tu perfume",
                text: "Entra al catálogo, explora por marca o categoría y encuentra la fragancia que más te guste.",
              },
              {
                step: "02",
                title: "Confirma tu pedido",
                text: "Añádelo al carrito y completa tus datos de contacto — sin necesidad de crear una cuenta.",
              },
              {
                step: "03",
                title: "Coordina por WhatsApp",
                text: "Te escribimos para confirmar el pago y la entrega. Sin cobros en línea.",
              },
            ].map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 100} className="h-full">
                <li className="relative flex h-full min-h-[200px] overflow-hidden rounded-2xl border border-border p-7 transition-colors duration-300 hover:border-foreground/30">
                  {/* watermark number */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-4 left-3 select-none text-[9rem] font-semibold leading-none tabular-nums text-foreground/[0.06]"
                  >
                    {item.step}
                  </span>
                  <div className="relative mt-auto ml-auto w-3/5 self-center">
                    <h3 className="text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.text}
                    </p>
                  </div>
                </li>
              </ScrollReveal>
            ))}
          </ol>

          {/* CTA */}
          <ScrollReveal>
            <div className="mt-12 flex flex-col gap-6 border-t border-border pt-10 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-foreground">
                  ¿Listo para empezar?
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Explora el catálogo y encuentra tu próximo perfume.
                </p>
              </div>
              <Link
                href="/catalogo"
                className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-background transition-opacity hover:opacity-90"
              >
                Ver catálogo
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── 6. CONTACTO DIRECTO ─────────────────────────────────────── */}
      <section className="w-full border-t border-border bg-muted/20">
        <div
          className={`${C} flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between`}
        >
          <ScrollReveal>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
                Sin pagos en línea
              </p>
              <p className="max-w-md text-sm text-muted-foreground">
                No pedimos tarjeta ni cobramos nada en el sitio: cada pedido
                se confirma directo contigo por WhatsApp.{" "}
                <Link
                  href="/seguridad"
                  className="text-primary hover:underline"
                >
                  Más información →
                </Link>
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

    </article>
  );
}
