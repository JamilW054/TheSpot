import { BadgeCheck, MapPin, Store } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getPublicStores } from "@/database/repositories/stores";

export const metadata: Metadata = {
  title: "Tiendas",
  description: "Todas las tiendas verificadas que venden en The Spot.",
};

export const revalidate = 300;

export default async function TiendasPage() {
  const stores = await getPublicStores();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            Marketplace
          </p>
          <h1 className="text-3xl font-black tracking-tight">Tiendas</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cada tienda fue revisada por The Spot antes de vender. Compra en
            varias a la vez con un solo checkout.
          </p>
        </div>
        <Link
          href="/vender"
          className="inline-flex h-10 items-center gap-2 self-start rounded-full border border-border px-5 text-sm font-semibold hover:border-primary hover:text-primary"
        >
          <Store className="size-4" aria-hidden /> Vende con nosotros
        </Link>
      </div>

      {stores.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          Muy pronto verás aquí las tiendas del marketplace.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((s) => (
            <li key={s.id}>
              <Link
                href={`/tiendas/${s.slug}`}
                className="group block overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative h-28 bg-gradient-to-br from-red-600 to-rose-400">
                  {s.bannerUrl ? (
                    // biome-ignore lint/performance/noImgElement: portada de tienda (URL externa)
                    <img
                      src={s.bannerUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="relative px-4 pb-4">
                  <div className="-mt-8 flex size-16 items-center justify-center overflow-hidden rounded-2xl border-4 border-card bg-muted text-lg font-black text-muted-foreground">
                    {s.logoUrl ? (
                      // biome-ignore lint/performance/noImgElement: logo de tienda (URL externa)
                      <img
                        src={s.logoUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      s.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 font-bold group-hover:text-primary">
                    {s.name}
                    {s.isOfficial ? (
                      <BadgeCheck
                        className="size-4 text-primary"
                        aria-label="Tienda oficial"
                      />
                    ) : null}
                  </p>
                  {s.tagline ? (
                    <p className="line-clamp-1 text-sm text-muted-foreground">
                      {s.tagline}
                    </p>
                  ) : null}
                  {s.province ? (
                    <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3.5" aria-hidden />
                      {[s.city, s.province].filter(Boolean).join(", ")}
                    </p>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
