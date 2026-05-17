import { PageLayout } from "@/components/layout";
import { SizePresetForm } from "@/features/admin/size-preset-form";

export default function AdminTallasNuevoPage() {
  return (
    <PageLayout
      title="Nuevo tipo de talla"
      description="Define un nombre y las tallas disponibles para este tipo de producto."
    >
      <SizePresetForm mode="create" />
    </PageLayout>
  );
}
