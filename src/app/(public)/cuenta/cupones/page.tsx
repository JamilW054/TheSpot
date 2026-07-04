import { Tag } from "lucide-react";

export const metadata = {
  title: "Cupones | Buxxep",
  description: "Tus cupones y códigos de descuento en Buxxep.",
};

export default function CuponesPage() {
  return (
    <article className="w-full max-w-lg px-4 sm:px-6 pb-20 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Cupones
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tus códigos de descuento y ofertas exclusivas.
        </p>
      </header>

      <div className="animate-scale-in rounded-[14px] border border-border bg-card p-12 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-muted/60">
          <Tag className="size-8 text-muted-foreground" aria-hidden />
        </div>
        <h2 className="text-base font-semibold text-foreground">
          Sin cupones por ahora
        </h2>
        <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground leading-relaxed">
          Cuando tengas cupones activos o códigos de descuento aparecerán aquí.
        </p>
      </div>
    </article>
  );
}
