import { DesignCard, DraftCardsList } from "@/components/designs";
import { PageLayout } from "@/components/layout";
import { getDesigns } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export default async function MisDisenosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const designs = await getDesigns(user?.id ?? undefined);
  return (
    <PageLayout
      title="Mis diseños"
      description="Tus diseños guardados en la cuenta y borradores locales del editor."
    >
      <DraftCardsList />
      <section aria-labelledby="saved-heading">
        <h2
          id="saved-heading"
          className="text-lg font-semibold text-foreground mb-3"
        >
          Guardados en la nube
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {designs.map((design) => (
            <DesignCard key={design.id} design={design} />
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
