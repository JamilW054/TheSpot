import Link from "next/link";

export function ComingSoonPanel({
  name,
  compact = false,
}: {
  name?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`col-span-full rounded-[1.75rem] border border-rose-100 bg-[#fff8f9] text-center ${
        compact ? "px-4 py-10" : "px-6 py-16"
      }`}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
        Coming soon
      </p>
      <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
        {name ?? "Este drop"}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Lo estamos armando. Mientras, el catálogo activo es{" "}
        <span className="font-semibold text-foreground">Perfumes</span> y{" "}
        <span className="font-semibold text-foreground">Tenis</span>.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Link
          href="/catalogo?categoria=perfumes"
          className="inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white"
        >
          Ver perfumes
        </Link>
        <Link
          href="/catalogo?categoria=tenis"
          className="inline-flex rounded-full border border-rose-200 bg-white px-5 py-2.5 text-sm font-bold text-foreground hover:border-primary hover:text-primary"
        >
          Ver tenis
        </Link>
      </div>
    </div>
  );
}
