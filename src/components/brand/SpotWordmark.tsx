export function SpotWordmark({
  className = "",
  size = "hero",
}: {
  className?: string;
  size?: "hero" | "compact";
}) {
  if (size === "compact") {
    return (
      <span
        className={`inline-flex items-baseline font-black tracking-tight ${className}`}
      >
        the sp
        <span className="relative mx-[0.04em] inline-flex size-[0.72em] translate-y-[0.06em] items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-primary" />
          <span className="absolute inset-[26%] rounded-full bg-white" />
        </span>
        t<span className="text-primary">.</span>
      </span>
    );
  }

  return (
    <h1
      className={`font-black leading-[0.82] tracking-[-0.06em] ${className}`}
      aria-label="the spot."
    >
      <span
        aria-hidden
        className="block text-[clamp(2.4rem,8vw,4.5rem)] text-foreground"
      >
        the
      </span>
      <span
        aria-hidden
        className="mt-1 flex flex-wrap items-center text-[clamp(4.2rem,16vw,9.5rem)]"
      >
        sp
        <span className="relative mx-[0.04em] inline-flex size-[0.72em] shrink-0 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-primary shadow-[0_18px_40px_-16px_rgba(225,29,72,0.7)]" />
          <span className="absolute inset-[22%] rounded-full bg-white" />
        </span>
        t<span className="text-primary">.</span>
      </span>
    </h1>
  );
}
