import { Star } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Mis reseñas | Buxxep",
  description: "Reseñas que has dejado en Buxxep.",
};

export default function ResenasPage() {
  return (
    <article className="w-full max-w-lg px-4 sm:px-6 pb-20 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Mis reseñas
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Opiniones que has compartido sobre productos.
        </p>
      </header>

      <div className="animate-scale-in rounded-[14px] border border-border bg-card p-12 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-muted/60">
          <Star className="size-8 text-muted-foreground" aria-hidden />
        </div>
        <h2 className="text-base font-semibold text-foreground">
          Sin reseñas aún
        </h2>
        <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground leading-relaxed">
          Después de recibir un pedido podrás dejar tu opinión sobre los
          productos comprados.
        </p>
        <Link
          href="/catalogo"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-[10px] bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Explorar catálogo
        </Link>
      </div>
    </article>
  );
}
