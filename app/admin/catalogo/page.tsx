import { PageLayout } from "@/components/layout";
import { CatalogoManager } from "@/features/admin/catalogo-manager";
import { getProductsAdmin } from "@/lib/db";
import { getCategoriesForAdmin } from "@/lib/db/categories";
import {
  brandOptionsRepo,
  lineaOptionsRepo,
  warehousesRepo,
} from "@/lib/db/repositories";
import { getSizePresetsForAdmin } from "@/lib/db/size-presets";

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminCatalogoPage({ searchParams }: PageProps) {
  const [products, categories, sizePresets, brands, lineas, allWarehouses, params] =
    await Promise.all([
      getProductsAdmin(),
      getCategoriesForAdmin(),
      getSizePresetsForAdmin(),
      brandOptionsRepo.findMany(),
      lineaOptionsRepo.findMany(),
      warehousesRepo.findMany(),
      searchParams ?? Promise.resolve(undefined),
    ]);

  const warehouses = allWarehouses
    .filter((w) => w.is_active)
    .map((w) => ({ id: w.id, name: w.name }));

  const totalActivos = products.filter((p) => p.is_active).length;
  const totalInactivos = products.length - totalActivos;
  const totalPersonalizables = products.filter((p) => p.is_customizable).length;

  return (
    <PageLayout
      title="Catálogo"
      description="CRUD de artículos: crear, editar, eliminar y ver en la tienda."
    >
      <CatalogoManager
        initialProducts={products}
        categories={categories}
        sizePresets={sizePresets}
        brands={brands}
        lineas={lineas}
        warehouses={warehouses}
        initialOpenCreate={(params as Record<string, string> | undefined)?.create === "1"}
      />
    </PageLayout>
  );
}
