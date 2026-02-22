"use client";

/**
 * Embeds oficiales de posts de Instagram (@buxxep).
 * Cada iframe carga la URL de embed de Instagram para el post.
 */
const EMBED_SHORTCODES = [
  "DBURvQ9vqA-",
  "DBURRqrPXqt",
  "DBURFxEP3Ti",
  "CxGm1UVP5sC",
  "CxGmx8_vwrf",
] as const;

const INSTAGRAM_PROFILE = "https://www.instagram.com/buxxep/";

const CONTAINER = "max-w-6xl mx-auto px-4 sm:px-6";

export function InstagramEmbeds() {
  return (
    <section
      className="py-8 bg-muted/30 dark:bg-muted/10"
      aria-label="Posts de Instagram @buxxep"
    >
      <div className={`w-full ${CONTAINER}`}>
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-2 text-center">
          Síguenos
        </p>
        <a
          href={INSTAGRAM_PROFILE}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xl font-semibold text-foreground hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded mb-8"
        >
          @buxxep
        </a>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {EMBED_SHORTCODES.map((shortcode) => (
            <div
              key={shortcode}
              className="relative w-full min-h-[520px] sm:min-h-[560px] rounded-lg overflow-hidden bg-muted shadow-md"
            >
              <iframe
                src={`https://www.instagram.com/p/${shortcode}/embed/`}
                title={`Post de Instagram @buxxep ${shortcode}`}
                className="absolute inset-0 w-full h-full min-h-[520px] border-0"
                loading="lazy"
                allowFullScreen
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
