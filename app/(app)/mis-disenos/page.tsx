import { DesignCard } from "@/components/designs";
import { PageLayout } from "@/components/layout";
import { getDesigns } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export default async function MisDisenosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const designs = await getDesigns(user?.id ?? undefined);
  return (
    <PageLayout title="Mis diseños">
      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {designs.map((design) => (
          <DesignCard key={design.id} design={design} />
        ))}
      </div>
    </PageLayout>
  );
}
