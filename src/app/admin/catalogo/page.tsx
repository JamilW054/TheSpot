import { StoreFilter } from "@/components/admin/StoreFilter";
import { AdminPageHeader, StatCard } from "@/components/admin/ui";
import { listStoreOptions } from "@/database/repositories/stores";
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
  const params = (await searchParams) ?? {};
  const tienda = typeof params.tienda === "string" ? params.tienda : null;
  const [products, categories, sizePresets, brands, allWarehouses, stores] =
    await Promise.all([
      getProductsAdmin({ storeId: tienda }),
      getCategoriesForAdmin(),
      getSizePresetsForAdmin(),
      brandOptionsRepo.findMany(),
      warehousesRepo.findMany(),
      listStoreOptions(),
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
        description="Todos los productos del marketplace. Puedes editar o despublicar cualquiera; los nuevos de tu tienda se crean desde /panel."
        actions={<StoreFilter stores={stores} value={tienda} />}
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
