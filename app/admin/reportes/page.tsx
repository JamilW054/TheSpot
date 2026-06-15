import { BarChart2 } from "lucide-react";
import Link from "next/link";
import { PageLayout } from "@/components/layout";

export default function AdminReportesPage() {
  return (
    <PageLayout title="Reportes" description="Análisis de ventas, ingresos y actividad.">
      <div className="rounded-[14px] border border-border bg-card px-6 py-16 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-[14px] bg-muted">
          <BarChart2 className="size-7 text-muted-foreground" aria-hidden />
        </div>
        <p className="mt-4 text-sm font-medium text-foreground">Próximamente</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Informes de pedidos, ingresos y actividad de usuarios.
        </p>
        <Link
          href="/admin"
          className="mt-5 inline-flex items-center gap-1.5 rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Volver al dashboard
        </Link>
      </div>
    </PageLayout>
  );
}
