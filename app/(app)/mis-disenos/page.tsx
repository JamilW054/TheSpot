import { DesignCard } from "@/components/designs";
import { PageLayout } from "@/components/layout";
import { MOCK_DESIGNS } from "@/config/mock-data";

export default function MisDisenosPage() {
  return (
    <PageLayout title="Mis diseños">
      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {MOCK_DESIGNS.map((design) => (
          <DesignCard key={design.id} design={design} />
        ))}
      </div>
    </PageLayout>
  );
}
