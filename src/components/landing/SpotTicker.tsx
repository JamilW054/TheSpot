import { BRAND_TICKER } from "@/config/brand";

type Variant = "red" | "rose";

const STYLES: Record<Variant, { wrap: string; item: string; dot: string }> = {
  red: {
    wrap: "bg-primary text-white",
    item: "text-white",
    dot: "bg-white/80",
  },
  rose: {
    wrap: "bg-[#fff5f7] text-foreground border-y border-rose-100",
    item: "text-foreground",
    dot: "bg-primary",
  },
};

export function SpotTicker({
  variant = "red",
  items = BRAND_TICKER,
}: {
  variant?: Variant;
  items?: readonly string[];
}) {
  const style = STYLES[variant];
  const loop = [0, 1].flatMap((copy) => items.map((item) => ({ copy, item })));

  return (
    <div className={`relative overflow-hidden ${style.wrap}`} aria-hidden>
      <div className="flex w-max animate-marquee py-3">
        {loop.map(({ copy, item }) => (
          <span
            key={`${copy}-${item}`}
            className={`inline-flex shrink-0 items-center gap-4 px-4 text-[11px] font-black uppercase tracking-[0.18em] sm:text-xs ${style.item}`}
          >
            <span className={`size-1.5 shrink-0 rounded-full ${style.dot}`} />
            <span className="whitespace-nowrap">{item}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
