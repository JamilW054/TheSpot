import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/ui";
import {
  getModerationQueue,
  getOpenReports,
} from "@/database/repositories/moderation";
import { ModerationClient } from "./ModerationClient";

export const dynamic = "force-dynamic";

const TABS = [
  ["pending", "En revisión"],
  ["denuncias", "Denuncias"],
  ["rejected", "Rechazados"],
  ["blocked", "Bloqueados"],
] as const;

type Tab = (typeof TABS)[number][0];

export default async function ModeracionPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: rawTab } = await searchParams;
  const tab: Tab = TABS.some(([k]) => k === rawTab)
    ? (rawTab as Tab)
    : "pending";
  const [products, reports] = await Promise.all([
    tab === "denuncias" ? Promise.resolve([]) : getModerationQueue(tab),
    getOpenReports(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Moderación"
        description="Revisa los productos antes de publicarlos y atiende las denuncias de los clientes. Nada sexual, prohibido ni falsificado."
      />
      <nav
        className="flex flex-wrap gap-1.5"
        aria-label="Secciones de moderación"
      >
        {TABS.map(([k, label]) => (
          <Link
            key={k}
            href={`/admin/moderacion?tab=${k}`}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              k === tab
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
            {k === "denuncias" && reports.length > 0
              ? ` (${reports.length})`
              : ""}
          </Link>
        ))}
      </nav>
      <ModerationClient
        tab={tab}
        products={products}
        reports={tab === "denuncias" ? reports : []}
      />
    </div>
  );
}
