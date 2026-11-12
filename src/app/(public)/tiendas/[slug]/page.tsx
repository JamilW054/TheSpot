import { BadgeCheck, Globe, Instagram, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/catalog/ProductCard";
import { getProducts } from "@/database/repositories";
import { getPublicStoreBySlug } from "@/database/repositories/stores";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; orden?: string }>;
}

export const revalidate = 120;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const store = await getPublicStoreBySlug(slug);
  if (!store) return { title: "Tienda no encontrada" };
  return {
    title: store.name,
    description:
      store.tagline ??
      store.description?.slice(0, 160) ??
      `Compra en ${store.name} en The Spot.`,
    openGraph: {
      images: store.bannerUrl
        ? [{ url: store.bannerUrl }]
        : store.logoUrl
          ? [{ url: store.logoUrl }]
          : [],
    },
  };
}

const ORDERS = [
  ["recientes", "Más nuevos"],
  ["precio-menor", "Precio: menor"],
  ["precio-mayor", "Precio: mayor"],
  ["az", "A–Z"],
] as const;

function instagramUrl(handle: string): string {
  if (/^https?:\/\//i.test(handle)) return handle;
  return `https://instagram.com/${handle.replace(/^@/, "")}`;
}

export default async function TiendaPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { q, orden } = await searchParams;
  const store = await getPublicStoreBySlug(slug);
  if (!store) notFound();
  const order = ORDERS.some(([k]) => k === orden)
    ? (orden as (typeof ORDERS)[number][0])
    : "recientes";
  const products = await getProducts({
    storeId: store.id,
    busqueda: q,
    orden: order,
  });

  return (
    <div>
      <section className="relative h-40 bg-gradient-to-br from-red-700 via-red-600 to-rose-400 sm:h-56">
        {store.bannerUrl ? (
          // biome-ignore lint/performance/noImgElement: portada de tienda (URL externa)
          <img
            src={store.bannerUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : null}
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-background bg-muted text-2xl font-black text-muted-foreground shadow-md">
              {store.logoUrl ? (
                // biome-ignore lint/performance/noImgElement: logo de tienda (URL externa)
                <img
                  src={store.logoUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                store.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="pb-1">
              <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight sm:text-3xl">
                {store.name}
                {store.isOfficial ? (
                  <BadgeCheck
                    className="size-6 text-primary"
                    aria-label="Tienda oficial"
                  />
                ) : null}
              </h1>
              {store.tagline ? (
                <p className="text-sm text-muted-foreground">{store.tagline}</p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {store.province ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-4" aria-hidden />
                {[store.city, store.province].filter(Boolean).join(", ")}
              </span>
            ) : null}
            {store.instagram ? (
              <a
                href={instagramUrl(store.instagram)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-primary"
              >
                <Instagram className="size-4" aria-hidden /> Instagram
              </a>
            ) : null}
            {store.website ? (
              <a
                href={store.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-primary"
              >
                <Globe className="size-4" aria-hidden /> Sitio web
              </a>
            ) : null}
          </div>
        </div>

        {store.description ? (
          <p className="mt-6 max-w-3xl whitespace-pre-line text-sm text-muted-foreground">
            {store.description}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold">
            {products.length} {products.length === 1 ? "producto" : "productos"}
          </p>
          <form
            className="flex flex-wrap gap-2"
            action={`/tiendas/${store.slug}`}
          >
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder={`Buscar en ${store.name}`}
              className="h-10 w-56 rounded-full border border-border bg-card px-4 text-sm"
            />
            <select
              name="orden"
              defaultValue={order}
              className="h-10 rounded-full border border-border bg-card px-3 text-sm"
            >
              {ORDERS.map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="h-10 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              Filtrar
            </button>
          </form>
        </div>

        {products.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-semibold">
              {q
                ? "No encontramos productos con esa búsqueda."
                : "Esta tienda aún no tiene productos publicados."}
            </p>
            <Link
              href="/catalogo"
              className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
            >
              Ver todo el catálogo
            </Link>
          </div>
        ) : (
          <section
            aria-label={`Productos de ${store.name}`}
            className="grid grid-cols-2 gap-3 py-6 pb-16 min-[480px]:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5"
          >
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
