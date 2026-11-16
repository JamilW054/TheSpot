import { AdminPageHeader, StatCard } from "@/components/admin/ui";
import { getProductsAdmin } from "@/database/repositories";
import { getCategoriesForAdmin } from "@/database/repositories/categories";
import { brandOptionsRepo } from "@/database/repositories/repositories";
import { getSizePresetsForAdmin } from "@/database/repositories/size-presets";
import { CatalogoManager } from "@/features/admin/catalogo-manager";
import { requirePanelStore } from "@/lib/auth/store-actor";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PanelCatalogoPage({ searchParams }: PageProps) {
  const { store } = await requirePanelStore();
  const [products, categories, sizePresets, brands, params] = await Promise.all(
    [
      getProductsAdmin({ storeId: store.id }),
      getCategoriesForAdmin(),
      getSizePresetsForAdmin(),
      brandOptionsRepo.findMany(),
      searchParams ?? Promise.resolve(undefined),
    ],
  );

  const published = products.filter(
    (p) => p.is_active && (p.moderation_status ?? "approved") === "approved",
  ).length;
  const inReview = products.filter(
    (p) => p.moderation_status === "pending",
  ).length;
  const rejected = products.filter(
    (p) =>
      p.moderation_status === "rejected" || p.moderation_status === "blocked",
  ).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Productos"
        description="Tu catálogo: precios, fotos, variantes e inventario. Los productos nuevos pueden pasar por revisión antes de publicarse."
        breadcrumbs={[
          { label: "Panel", href: "/panel" },
          { label: "Productos" },
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Publicados"
          value={published}
          sub="visibles en The Spot"
        />
        <StatCard
          label="En revisión"
          value={inReview}
          sub="esperando aprobación"
        />
        <StatCard
          label="Rechazados"
          value={rejected}
          sub="corrige y vuelve a guardar"
        />
      </div>
      <CatalogoManager
        initialProducts={products}
        categories={categories}
        sizePresets={sizePresets}
        brands={brands}
        warehouses={[]}
        initialOpenCreate={
          (params as Record<string, string> | undefined)?.create === "1"
        }
      />
    </div>
  );
}
