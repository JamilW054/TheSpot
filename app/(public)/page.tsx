import Link from "next/link";
import Image from "next/image";
import { InstagramEmbeds } from "@/components/landing/InstagramEmbeds";
import { NewsletterForm } from "@/components/landing/NewsletterForm";

const HERO_MODEL = "/people/modelo-joshua.png";
const MODEL_BIANDY = "/people/modelo-biandy.png";
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

export default function PublicPage() {
  return (
    <article className="min-h-screen flex flex-col bg-background text-foreground">
      {/* 1. Hero — CONTAINER */}
      <section className="relative min-h-0 bg-background border-b border-border pt-0 pb-6 md:pb-8" aria-labelledby="hero-title">
        <div className={`w-full ${CONTAINER} flex flex-col md:flex-row md:items-stretch justify-between gap-4 md:gap-6`}>
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

      {/* 3. Modestia + estilo — CONTAINER */}
      <section className={`py-8 border-b border-border ${CONTAINER}`} aria-labelledby="section-modesty">
          <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
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

      {/* 4. Diseñado para un mejor mañana — CONTAINER */}
      <section className={`py-8 bg-muted/20 ${CONTAINER}`} aria-labelledby="section-tomorrow">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
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

      {/* 5. Bento — CONTAINER, proporciones coherentes: 1 grande (2×2), 1 ancha (2×1), 5 pequeñas (1×1) */}
      <section className={`py-8 border-b border-border ${CONTAINER}`} aria-labelledby="section-strength">
          <div className="w-full text-center mb-6">
            <h2 id="section-strength" className="text-xl sm:text-2xl font-bold text-foreground uppercase tracking-tight inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden />
              Hecho para el día a día <span className="landing-wavy-underline">fuerte</span>
            </h2>
            <p className="mt-2 text-muted-foreground text-sm max-w-lg mx-auto">
              Prendas que aguantan el ritmo. Personalízalas a tu gusto en el editor 3D.
            </p>
          </div>
          <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-fr">
            {/* Grande: 2 cols × 2 rows = 4 celdas (misma altura que 2 filas de pequeñas) */}
            <div className="relative aspect-square lg:aspect-auto lg:row-span-2 lg:min-h-0 rounded-lg overflow-hidden lg:col-span-2">
              <Image src={PROJECT_IMAGES[0]} alt="" fill className="object-cover" sizes="(max-width: 1024px) 50vw, 50vw" />
            </div>
            <div className="relative aspect-square rounded-lg overflow-hidden min-h-0">
              <Image src={PROJECT_IMAGES[1]} alt="" fill className="object-cover" sizes="(max-width: 1024px) 50vw, 25vw" />
            </div>
            <div className="relative aspect-square rounded-lg overflow-hidden min-h-0">
              <Image src={PROJECT_IMAGES[2]} alt="" fill className="object-cover" sizes="(max-width: 1024px) 50vw, 25vw" />
            </div>
            <div className="relative aspect-square rounded-lg overflow-hidden min-h-0">
              <Image src={PROJECT_IMAGES[3]} alt="" fill className="object-cover" sizes="(max-width: 1024px) 50vw, 25vw" />
            </div>
            <div className="relative aspect-square rounded-lg overflow-hidden min-h-0">
              <Image src={PROJECT_IMAGES[4]} alt="" fill className="object-cover" sizes="(max-width: 1024px) 50vw, 25vw" />
            </div>
            <div className="relative aspect-square rounded-lg overflow-hidden min-h-0">
              <Image src={PROJECT_IMAGES[5]} alt="" fill className="object-cover" sizes="(max-width: 1024px) 50vw, 25vw" />
            </div>
            {/* Ancha: 2 cols en última fila para rellenar sin huecos */}
            <div className="relative aspect-square lg:aspect-2/1 rounded-lg overflow-hidden min-h-0 lg:col-span-2">
              <Image src={PROJECT_IMAGES[6]} alt="" fill className="object-cover" sizes="(max-width: 1024px) 50vw, 50vw" />
            </div>
          </div>
      </section>

      {/* 6. Donde la moda encuentra actitud — CONTAINER, más compacto */}
      <section className={`py-6 bg-muted/20 ${CONTAINER}`} aria-labelledby="section-attitude">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-2 min-w-0">
            <h2 id="section-attitude" className="text-lg sm:text-xl font-bold text-foreground uppercase tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden />
              Donde la moda encuentra <span className="landing-wavy-underline">actitud</span>
            </h2>
            <div className="relative w-full max-h-[240px] sm:max-h-[280px] aspect-[4/3] rounded-lg overflow-hidden border border-border">
              <Image src={PROJECT_IMAGES[1]} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm leading-snug">
              Estilo único para quien no sigue tendencias. Diseña, personaliza y compra en Buxxep.
            </p>
          </div>
          <div className="space-y-2">
            {FEATURES.map((f, i) => (
              <div
                key={f.num}
                className={`rounded-lg p-3 flex gap-2.5 ${
                  i === 0 ? "bg-primary text-primary-foreground" : "bg-card border border-primary/30"
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${i === 0 ? "bg-primary-foreground" : "bg-primary"}`} aria-hidden />
                <div className="min-w-0">
                  <h3 className="font-bold text-xs">{f.title}</h3>
                  <p className={i === 0 ? "text-primary-foreground/90 mt-0.5 text-[11px]" : "text-muted-foreground mt-0.5 text-[11px]"}>{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Cómo funciona — CONTAINER */}
      <section className={`py-8 bg-muted/40 ${CONTAINER}`} aria-labelledby="how-title">
        <div className="w-full">
          <h2 id="how-title" className="text-xl sm:text-2xl font-bold text-center text-foreground mb-6">
            Cómo funciona
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Elige prenda", text: "Entra al catálogo y elige la camiseta o prenda que quieras personalizar." },
              { step: "2", title: "Diseña", text: "Usa el editor: añade texto, imágenes y formas. Vista previa en 3D en tiempo real." },
              { step: "3", title: "Compra", text: "Añade al carrito y finaliza tu pedido. Nosotros lo preparamos y enviamos." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <span className="inline-flex justify-center items-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                  {item.step}
                </span>
                <h3 className="mt-3 font-semibold text-foreground text-base">{item.title}</h3>
                <p className="mt-1.5 text-muted-foreground text-xs sm:text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <InstagramEmbeds />

      {/* 8. Footer — CONTAINER */}
      <footer className="mt-auto border-t border-border bg-muted/30">
        <div className={`w-full ${CONTAINER} py-10`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            <div className="space-y-3">
              <Link href="/" className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                Buxxep
              </Link>
              <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                <Link href="/catalogo" className="hover:text-foreground transition-colors">Términos y condiciones</Link>
                <Link href="/catalogo" className="hover:text-foreground transition-colors">Política de privacidad</Link>
              </div>
              <a href="https://www.instagram.com/buxxep/" target="_blank" rel="noopener noreferrer" className="inline-block text-xs text-muted-foreground hover:text-foreground transition-colors" aria-label="Instagram">
                Instagram
              </a>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-foreground text-sm">Suscríbete al boletín</p>
              <NewsletterForm />
            </div>
            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
              <Link href="/catalogo" className="hover:text-foreground transition-colors">Catálogo</Link>
              <Link href="/editor" className="hover:text-foreground transition-colors">Editor</Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Buxxep. Todos los derechos reservados. Términos de uso · Privacidad</p>
            <p>CEO — Biandy Peguero</p>
          </div>
        </div>
      </footer>
    </article>
  );
}
