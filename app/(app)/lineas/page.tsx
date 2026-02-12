import { LineaCard } from "@/components/lineas";
import { PageLayout } from "@/components/layout";
import { MOCK_LINEAS } from "@/config/mock-data";

export default function LineasPage() {
  return (
    <PageLayout title="Líneas de ropa">
      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {MOCK_LINEAS.map((linea) => (
          <LineaCard key={linea.id} linea={linea} />
        ))}
      </div>
    </PageLayout>
  );
}
