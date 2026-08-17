import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout";
import { SizePresetForm } from "@/features/admin/size-preset-form";
import { getSizePresetById } from "@/database/repositories/size-presets";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminTallasEditarPage({ params }: PageProps) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const preset = await getSizePresetById(id);
  if (!preset) notFound();

  return (
    <PageLayout
      title={`Editar: ${preset.name}`}
      description="Modifica el nombre o las tallas disponibles para este tipo."
    >
      <SizePresetForm mode="edit" initial={preset} />
    </PageLayout>
  );
}
