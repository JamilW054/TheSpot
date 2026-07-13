import { PageLayout } from "@/components/layout";
import {
  getActivePartnersCurrentStatement,
  partnersRepo,
} from "@/database/repositories/partners";
import {
  type PartnerListRow,
  SociosManager,
} from "@/features/admin/socios-manager";
import { currentMonthStart, derivePartnerStatus } from "@/lib/partners";

const monthNameLabel = new Intl.DateTimeFormat("es-DO", {
  month: "long",
  year: "numeric",
  timeZone: "America/Santo_Domingo",
});

export default async function AdminSociosPage() {
  const [partners, statements] = await Promise.all([
    // Incluye inactivos: el listado es la herramienta de gestión, no el dashboard.
    partnersRepo.findMany(),
    getActivePartnersCurrentStatement(),
  ]);

  const byPartner = new Map(statements.map((s) => [s.partnerId, s]));

  const rows: PartnerListRow[] = partners.map((p) => {
    const s = byPartner.get(p.id);
    return {
      ...p,
      dueCents: s?.dueCents ?? 0,
      paidCents: s?.paidCents ?? 0,
      balanceCents: s?.balanceCents ?? 0,
      lastPaymentDate: s?.lastPaymentDate ?? null,
      // Un socio inactivo no sale de la vista de "activos": su estado se deriva
      // de sus cifras (todas a 0 → "sin deuda"), no se inventa un estado nuevo.
      status: s?.status ?? derivePartnerStatus(0, 0),
    };
  });

  const monthLabel = monthNameLabel.format(
    new Date(`${currentMonthStart()}T12:00:00Z`),
  );

  return (
    <PageLayout
      title="Socios y terceros"
      description="Organizaciones o personas que cobran de forma recurrente: porcentaje de la ganancia o monto fijo mensual."
    >
      <SociosManager initialRows={rows} monthLabel={monthLabel} />
    </PageLayout>
  );
}
