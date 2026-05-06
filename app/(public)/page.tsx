import { readdir } from "fs/promises";
import path from "node:path";
import Link from "next/link";
import Image from "next/image";
import { InstagramEmbeds } from "@/components/landing/InstagramEmbeds";
import { HeroLightRaysBackground } from "@/components/landing/HeroLightRaysBackground";
import MagicBento from "@/components/MagicBento";

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

const HERO_MODEL = "/people/modelo-joshua.png";
const MODEL_BIANDY = "/people/modelo-biandy.png";
const MODEL_ACTITUD = "/people/modelo-actitud.png";
const PROJECT_IMAGES = [
  "/project/project-01.png",
  "/project/project-02.png",
  "/project/project-03.png",
  "/project/project-04.png",
  "/project/project-05.png",
  "/project/project-06.png",
  "/project/project-07.png",
];

const CATEGORIES = ["TODOS", "NOVEDADES", "MUJER", "HOMBRE", "NIÑOS"] as const;

const CARD_LABELS = ["Sudadera y hoodie", "Abrigos y parkas", "Camisetas", "Jerséis"];

const FEATURES = [
  { num: "01", title: "PARA EL DÍA A DÍA", text: "Ropa cómoda y versátil para cada momento." },
  { num: "02", title: "MODA TENDENCIA", text: "Diseños actuales y con personalidad." },
  { num: "03", title: "URBANA Y JOVEN", text: "Estilo streetwear y personalizable." },
];

const CONTAINER = "max-w-6xl mx-auto px-4 sm:px-6";

export default async function PublicPage() {
  const clothDesigns = await getClothDesignImageUrls();

  return (
    <article className="min-h-screen flex flex-col bg-background text-foreground">
      {/* 1. Hero — CONTAINER */}
      <section className="relative min-h-0 bg-background border-b border-border pt-0 pb-6 md:pb-8 overflow-hidden" aria-labelledby="hero-title">
        <HeroLightRaysBackground />
        <div className={`relative z-10 w-full ${CONTAINER} flex flex-col md:flex-row md:items-stretch justify-between gap-4 md:gap-6`}>
          {/* Columna de texto centrada en Y; misma altura que la foto para evitar hueco arriba */}
          <div className="flex-1 min-w-0 flex flex-col justify-center py-4 md:py-0 pl-[14px] md:pl-24">
            <div className="absolute left-4 top-[40%] w-24 h-px bg-muted-foreground/25 rounded-full hidden md:block -rotate-[8deg]" />
            <h1
              id="hero-title"
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight uppercase"
            >
              <span className="block">Moda atemporal,</span>
              <span className="block text-foreground/70">alma moderna.</span>
            </h1>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base max-w-md">
              Lavado clásico, bolsillos delanteros con botones y corte ligeramente amplio.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/catalogo"
                className="inline-flex items-center justify-center font-semibold h-10 px-6 text-sm rounded-md border-2 border-primary text-primary bg-transparent hover:bg-primary/10 transition-colors"
              >
                Comprar ahora
              </Link>
              <Link
                href="/catalogo"
                className="inline-flex items-center justify-center font-semibold h-10 px-6 text-sm rounded-md border border-border text-foreground bg-transparent hover:bg-muted transition-colors"
              >
                Colección 2025
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-end relative w-full min-h-[280px] sm:min-h-[320px] md:min-h-[380px] -mt-2 md:mt-0">
            <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-40 h-40 md:w-48 text-primary/15 pointer-events-none" viewBox="0 0 200 200" fill="none" aria-hidden>
              <path d="M 120 40 Q 180 80 160 140 Q 140 180 80 160" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" fill="none" />
              <path d="M 100 60 Q 160 100 140 160" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" fill="none" />
            </svg>
            <div className="relative w-full max-w-md aspect-[4/5] h-full max-h-[55vh] object-bottom">
              <Image
                src={HERO_MODEL}
                alt="Modelo vistiendo ropa Buxxep"
                fill
                className="object-contain object-bottom"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Barra promocional — CONTAINER (solo la barra es full width, el contenido va en CONTAINER) */}
      <section className="w-full bg-background border-y border-border py-3" aria-label="Ofertas">
        <div className={`w-full ${CONTAINER} flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-medium text-foreground`}>
          <span className="bg-primary text-primary-foreground px-4 py-1.5 rounded">REBAJAS</span>
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" aria-hidden />
          <span className="text-muted-foreground">50% COLECCIÓN HOMBRE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" aria-hidden />
          <span className="text-muted-foreground">35% DTO AHORA</span>
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" aria-hidden />
          <span className="text-muted-foreground">50% COLECCIÓN MUJER</span>
        </div>
      </section>

      {/* 3. Modestia + estilo — CONTAINER (igual que antes) */}
      <section className={`py-6 border-b border-border ${CONTAINER}`} aria-labelledby="section-modesty">
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 id="section-modesty" className="text-xl sm:text-2xl font-bold text-foreground uppercase tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden />
            Donde la modestia encuentra el <span className="landing-wavy-underline">estilo</span>
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat}
                type="button"
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors shrink-0 ${
                  i === 0 ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {PROJECT_IMAGES.slice(0, 4).map((src, i) => (
            <Link key={src} href="/catalogo" className="group block rounded-lg overflow-hidden bg-card border border-border">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image src={src} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 1024px) 50vw, 25vw" />
              </div>
              <div className="p-3 flex items-center justify-between gap-2">
                <span className="font-medium text-foreground text-xs truncate">{CARD_LABELS[i] ?? "Ver colección"}</span>
                <span className="text-primary text-sm shrink-0" aria-hidden>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Diseños desde public/cloths — CONTAINER */}
      {clothDesigns.length > 0 ? (
        <section
          className={`py-6 border-b border-border bg-muted/15 ${CONTAINER}`}
          aria-labelledby="section-cloth-designs"
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="section-cloth-designs"
                className="flex items-center gap-2 text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl"
              >
                <span
                  className="size-1.5 shrink-0 rounded-full bg-primary"
                  aria-hidden
                />
                Diseños en <span className="landing-wavy-underline">tela</span>
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-snug text-muted-foreground">
                Piezas y estampados Buxxep que puedes llevar al editor o comprar
                en el catálogo.
              </p>
            </div>
            <Link
              href="/catalogo"
              className="inline-flex shrink-0 items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Ver catálogo →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clothDesigns.map((src, i) => (
              <figure
                key={src}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <Link href="/catalogo" className="group block">
                  <div className="relative aspect-[3/4]">
                    <Image
                      src={src}
                      alt={`Diseño de ropa Buxxep ${i + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <figcaption className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
                    <span className="text-xs font-medium text-muted-foreground">
                      Look {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm text-primary" aria-hidden>
                      →
                    </span>
                  </figcaption>
                </Link>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {/* 4. Diseñado para un mejor mañana — CONTAINER */}
      <section className={`py-6 bg-muted/20 ${CONTAINER}`} aria-labelledby="section-tomorrow">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="relative">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative aspect-[3/4] rounded-md overflow-hidden">
                <Image src={HERO_MODEL} alt="" fill className="object-cover" sizes="25vw" />
              </div>
              <div className="relative aspect-[3/4] rounded-md overflow-hidden mt-6">
                <Image src={MODEL_BIANDY} alt="" fill className="object-cover" sizes="25vw" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden />
              01/04
            </p>
          </div>
          <div className="space-y-3">
            <svg className="w-8 h-8 text-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
            <h2 id="section-tomorrow" className="text-xl sm:text-2xl font-bold text-foreground uppercase tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden />
              Diseñado para un mejor <span className="landing-wavy-underline">mañana</span>
            </h2>
            <p className="text-muted-foreground text-sm max-w-md leading-snug">
              Calidad y diseño personalizado en cada prenda. Crea la tuya en el editor y llévala en la calle.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>← Anterior</span>
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" aria-hidden />
              <span>Siguiente →</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Hecho para el día a día fuerte — MagicBento */}
      <section className={`py-6 border-b border-border ${CONTAINER}`} aria-labelledby="section-strength">
        <h2 id="section-strength" className="text-xl sm:text-2xl font-bold text-foreground uppercase tracking-tight flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden />
          Hecho para el día a día <span className="landing-wavy-underline">fuerte</span>
        </h2>
        <p className="text-muted-foreground text-sm mb-4">
          Prendas que aguantan el ritmo. Personalízalas a tu gusto en el editor.
        </p>
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

      {/* 6. Donde la moda encuentra actitud — full width imagen + overlay */}
      <section className="w-full relative min-h-[50vh] sm:min-h-[60vh] overflow-hidden" aria-labelledby="section-attitude">
        <Image
          src={MODEL_ACTITUD}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
        <div className={`absolute inset-0 ${CONTAINER} flex flex-col justify-center py-12`}>
          <h2 id="section-attitude" className="text-2xl sm:text-3xl md:text-4xl font-bold text-white uppercase tracking-tight max-w-xl">
            Donde la moda encuentra <span className="text-primary">actitud</span>
          </h2>
          <p className="mt-2 text-white/90 text-sm sm:text-base max-w-md">
            Estilo único para quien no sigue tendencias. Diseña, personaliza y compra en Buxxep.
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-1 text-xs sm:text-sm text-white/80">
            {FEATURES.map((f) => (
              <li key={f.num}>
                <span className="text-primary font-mono">{f.num}</span> {f.title}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 7. Cómo funciona — lista editorial sin cards */}
      <section className={`py-6 bg-muted/40 ${CONTAINER}`} aria-labelledby="how-title">
        <h2 id="how-title" className="text-lg font-bold text-foreground uppercase tracking-tight mb-4">
          Cómo funciona
        </h2>
        <ol className="list-none p-0 m-0 flex flex-col sm:flex-row sm:gap-10 gap-5">
          {[
            { step: 1, title: "Elige prenda", text: "Catálogo → elige la prenda." },
            { step: 2, title: "Diseña", text: "Editor: texto, imágenes y formas en el lienzo." },
            { step: 3, title: "Compra", text: "Carrito → pedido → te lo enviamos." },
          ].map((item) => (
            <li key={item.step} className="flex gap-3 sm:flex-1">
              <span className="text-primary font-mono text-base tabular-nums shrink-0">{item.step}.</span>
              <div>
                <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                <p className="mt-0.5 text-muted-foreground text-xs">{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <InstagramEmbeds />
    </article>
  );
}
