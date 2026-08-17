import { AdminPageHeader, StatCard } from "@/components/admin/ui";
import { getProductsAdmin } from "@/database/repositories";
import { getCategoriesForAdmin } from "@/database/repositories/categories";
import {
  brandOptionsRepo,
  warehousesRepo,
} from "@/database/repositories/repositories";
import { getSizePresetsForAdmin } from "@/database/repositories/size-presets";
import { CatalogoManager } from "@/features/admin/catalogo-manager";

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminCatalogoPage({ searchParams }: PageProps) {
  const [products, categories, sizePresets, brands, allWarehouses, params] =
    await Promise.all([
      getProductsAdmin(),
      getCategoriesForAdmin(),
      getSizePresetsForAdmin(),
      brandOptionsRepo.findMany(),
      warehousesRepo.findMany(),
      searchParams ?? Promise.resolve(undefined),
    ]);

  const warehouses = allWarehouses
    .filter((w) => w.is_active)
    .map((w) => ({ id: w.id, name: w.name }));

  const totalActivos = products.filter((p) => p.is_active).length;
  const totalBorradores = products.length - totalActivos;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Productos"
        description="Gestiona el catálogo: precios, rentabilidad, inventario y publicación."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Productos" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Publicados"
          value={totalActivos}
          sub="visibles en tienda"
        />
        <StatCard
          label="Borradores"
          value={totalBorradores}
          sub="sin publicar"
        />
      </div>

      <CatalogoManager
        initialProducts={products}
        categories={categories}
        sizePresets={sizePresets}
        brands={brands}
        warehouses={warehouses}
        initialOpenCreate={
          (params as Record<string, string> | undefined)?.create === "1"
        }
      />
    </div>
  );
}
