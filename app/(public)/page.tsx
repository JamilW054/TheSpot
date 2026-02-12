import Image from "next/image";
import Link from "next/link";
import { LineShadowText } from "@/components/ui";

function HeroTag() {
  return (
    <span
      className="inline-block rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-200"
      aria-hidden
    >
      Elegancia sin esfuerzo, cada día
    </span>
  );
}

function TitleScribble({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden>
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-foreground/60"
      >
        <path d="M8 5c-2 1-3 3-2 5s2 3 4 2" />
        <path d="M16 19c2-1 3-3 2-5s-2-3-4-2" />
      </svg>
    </span>
  );
}

const HERO_CARDS = [
  {
    bg: "bg-orange-400 dark:bg-orange-600",
    radius: "rounded-tl-[2.5rem] rounded-tr-xl rounded-br-[2.5rem] rounded-bl-xl",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
    alt: "Estilo casual",
  },
  {
    bg: "bg-emerald-500 dark:bg-emerald-600",
    radius: "rounded-tl-xl rounded-tr-[2rem] rounded-br-xl rounded-bl-[2rem]",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop",
    alt: "Moda elegante",
  },
  {
    bg: "bg-amber-400 dark:bg-amber-500",
    radius: "rounded-tl-[2rem] rounded-tr-[2rem] rounded-br-xl rounded-bl-xl",
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop",
    alt: "Tendencias",
  },
  {
    bg: "bg-sky-400 dark:bg-sky-500",
    radius: "rounded-tl-xl rounded-tr-[2.5rem] rounded-br-xl rounded-bl-[2rem]",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop",
    alt: "Estilo urbano",
  },
  {
    bg: "bg-violet-400 dark:bg-violet-500",
    radius: "rounded-tl-[2rem] rounded-tr-[2.5rem] rounded-br-[2rem] rounded-bl-xl",
    img: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop",
    alt: "Colección",
  },
];

export default function PublicPage() {
  return (
    <article className="min-h-[80vh] flex flex-col">
      {/* Hero: mensaje + CTAs */}
      <section
        className="flex flex-col items-center text-center pt-8 pb-12 sm:pt-12 sm:pb-16"
        aria-labelledby="hero-title"
      >
        <div className="flex flex-col items-center gap-6 max-w-3xl mx-auto">
          <HeroTag />
          <h1
            id="hero-title"
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight px-2"
          >
            <span className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
              <TitleScribble className="hidden sm:block shrink-0" />
              <LineShadowText className="block text-balance">
                Diseña y compra
                <br />
                tu estilo
              </LineShadowText>
              <TitleScribble className="hidden sm:block shrink-0 scale-x-[-1]" />
            </span>
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-xl">
            Crea tus diseños en el editor, previsualízalos en mockups y compra
            o encarga tu ropa con Buxxep. Calidad y personalización en un solo
            lugar.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="#comprar"
              className="inline-flex items-center justify-center font-medium h-12 px-6 text-lg rounded-full border-2 border-border bg-transparent hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-opacity"
            >
              Comprar en Buxxep
            </Link>
            <Link
              href="/editor"
              className="inline-flex items-center justify-center font-medium h-12 px-6 text-lg rounded-full bg-primary text-primary-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-opacity"
            >
              Mandar mi diseño
            </Link>
          </div>
        </div>
      </section>

      {/* Galería con formas orgánicas */}
      <section
        className="flex flex-wrap items-end justify-center gap-2 sm:gap-4 pb-12 sm:pb-16"
        aria-label="Galería de estilos"
      >
        {HERO_CARDS.map((card, i) => (
          <div
            key={card.alt}
            className={`overflow-hidden ${card.bg} ${card.radius} w-[140px] h-[200px] sm:w-[160px] sm:h-[240px] md:w-[180px] md:h-[260px] shrink-0 shadow-lg`}
            style={{
              marginLeft: i > 0 ? "-0.5rem" : 0,
              zIndex: i,
            }}
          >
            <Image
              src={card.img}
              alt={card.alt}
              width={400}
              height={500}
              className="w-full h-full object-cover object-top"
              sizes="(max-width: 640px) 140px, (max-width: 768px) 160px, 180px"
            />
          </div>
        ))}
      </section>

      {/* Franja inferior tipo partners */}
      <footer className="mt-auto pt-8 pb-6 border-t border-border">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm text-muted-foreground">
          <span>Diseño personalizado</span>
          <span>Editor tipo Canva</span>
          <span>Mockups 2D y 3D</span>
          <span>Envío Buxxep</span>
        </div>
      </footer>
    </article>
  );
}
