import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProducts } from "@/database/repositories";

function isExternalImage(src: string) {
  return (
    src.startsWith("http") ||
    src.includes("placehold.co") ||
    src.includes("unsplash.com")
  );
}

export default async function CuentaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const products = await getProducts();
  const featured = products.slice(0, 6);

  const fullName = user?.user_metadata?.full_name as string | undefined;
  const firstName = fullName?.split(" ")[0] || user?.email?.split("@")[0] || "";

  return (
    <article className="w-full max-w-2xl px-4 sm:px-6 pb-20 pt-6">
      {/* Welcome */}
      <div className="mb-7 animate-slide-up">
        <p className="text-sm text-muted-foreground">
          {firstName ? `¡Hola, ${firstName}!` : "¡Bienvenido!"}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
          Tu espacio en Buxxep
        </h1>
      </div>

      {/* Big CTA */}
      <Link
        href="/catalogo"
        className="group mb-8 flex items-center justify-between gap-4 rounded-[14px] bg-primary px-6 py-5 text-primary-foreground transition-opacity hover:opacity-95 animate-scale-in"
        style={{ animationDelay: "60ms" }}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest opacity-75">
            Tienda Buxxep
          </p>
          <p className="mt-1 text-xl font-black uppercase tracking-tight">
            Ver catálogo completo
          </p>
        </div>
        <ArrowRight
          className="size-6 shrink-0 transition-transform group-hover:translate-x-1"
          aria-hidden
        />
      </Link>

      {/* Products */}
      {featured.length > 0 && (
        <section className="animate-slide-up" style={{ animationDelay: "120ms" }}>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              Productos destacados
            </p>
            <Link
              href="/catalogo"
              className="text-xs font-medium text-primary hover:underline underline-offset-2"
            >
              Ver todo →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {featured.map((product) => (
              <Link
                key={product.id}
                href={`/catalogo/${product.slug ?? product.id}`}
                className="group flex flex-col overflow-hidden rounded-[14px] border border-border bg-card transition-all hover:border-primary/30"
              >
                <div className="relative aspect-3/4 w-full overflow-hidden bg-muted">
                  <Image
                    src={product.coverImage}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    sizes="(max-width:640px) 50vw, 33vw"
                    unoptimized={isExternalImage(product.coverImage)}
                  />
                  {product.originalPrice ? (
                    <span className="absolute left-2 top-2 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-white">
                      Oferta
                    </span>
                  ) : null}
                </div>
                <div className="p-3">
                  <p className="line-clamp-1 text-xs font-medium text-foreground">
                    {product.name}
                  </p>
                  <p className="mt-1 font-mono text-sm font-bold tabular-nums text-primary">
                    {product.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
