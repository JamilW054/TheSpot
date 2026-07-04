import { PageLayout } from "@/components/layout";
import { TallasManager } from "@/features/admin/tallas-manager";
import { getSizePresetsForAdmin } from "@/database/repositories/size-presets";

export default async function AdminTallasPage() {
  const presets = await getSizePresetsForAdmin();
  return (
    <PageLayout
      title="Tipos de talla"
      description="Define los grupos de tallas por tipo de producto. Cada categoría puede tener un tipo asignado."
    >
      <TallasManager initialRows={presets} />
    </PageLayout>
  );
}
