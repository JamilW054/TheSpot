import { PageLayout } from "@/components/layout";
import { SizePresetForm } from "@/features/admin/size-preset-form";

export default function AdminTallasNuevoPage() {
  return (
    <PageLayout
      title="Nuevo tipo"
      description="Nombre y valores: tallas (38–44), tamaños (30ml/50ml) o unitalla."
    >
      <SizePresetForm mode="create" />
    </PageLayout>
  );
}
