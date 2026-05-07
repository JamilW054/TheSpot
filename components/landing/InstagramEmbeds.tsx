"use client";

import { LANDING_INSTAGRAM_EMBED_SHORTCODES } from "@/config/landing-images";

/**
 * Embeds oficiales de posts de Instagram (@buxxep).
 */
const INSTAGRAM_PROFILE = "https://www.instagram.com/buxxep/";

const CONTAINER = "max-w-7xl mx-auto px-4 sm:px-6";

/** Marco más bajo; el iframe interior sigue siendo más alto y se recorta con overflow hidden. */
const CARD_FRAME_H = "h-[400px] sm:h-[420px]";

const IFRAME_INNER_H_PX = 560;

/**
 * Escalones en desktop: cada card un peldaño más abajo y a la derecha que la anterior.
 */
const STAIRS_BY_INDEX: readonly string[] = [
  "lg:translate-x-0 lg:translate-y-0 lg:z-[3]",
  "lg:translate-x-2 lg:translate-y-14 xl:translate-y-16 lg:z-[2]",
  "lg:translate-x-4 lg:translate-y-28 xl:translate-y-32 lg:z-[1]",
];

export function InstagramEmbeds() {
  return (
    <section
      className="bg-muted/30 dark:bg-muted/10 pt-10 sm:pt-12 pb-28 sm:pb-32 lg:pb-44 xl:pb-52"
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
          className="block text-center text-xl font-semibold text-foreground hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded mb-10 sm:mb-12"
        >
          @buxxep
        </a>

        <div className="flex flex-col items-center gap-8 sm:gap-9 lg:flex-row lg:flex-nowrap lg:justify-center lg:items-start lg:gap-x-5 xl:gap-x-8">
          {LANDING_INSTAGRAM_EMBED_SHORTCODES.map((shortcode, i) => (
            <div
              key={shortcode}
              className={[
                "w-full max-w-[min(100%,300px)] shrink-0 transition-transform duration-300 ease-out",
                STAIRS_BY_INDEX[i] ?? "",
              ].join(" ")}
            >
              <div
                className={`relative mx-auto w-full ${CARD_FRAME_H} overflow-hidden rounded-xl border border-border bg-background shadow-md`}
              >
                <iframe
                  src={`https://www.instagram.com/p/${shortcode}/embed/`}
                  title={`Post de Instagram @buxxep ${shortcode}`}
                  className="absolute left-0 top-0 w-full border-0 bg-background"
                  height={IFRAME_INNER_H_PX}
                  loading="lazy"
                  allowFullScreen
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
