import { Skeleton } from "@/components/ui/skeleton";
import { AdminCard } from "./admin-card";

/** Claves estables para listas de skeletons (contenido estático, sin reorden). */
function keys(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `${prefix}-${i + 1}`);
}

/** Rejilla de KPIs en carga. */
export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {keys("stat", count).map((k) => (
        <AdminCard key={k} className="p-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-8 w-32" />
          <Skeleton className="mt-2 h-3 w-20" />
        </AdminCard>
      ))}
    </div>
  );
}

/** Tarjeta de gráfico en carga. */
export function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <AdminCard className="p-5">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-4 w-full" height={height} />
    </AdminCard>
  );
}

/** Tabla en carga: cabecera + filas. */
export function TableSkeleton({
  rows = 6,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  const columnKeys = keys("col", columns);
  return (
    <AdminCard className="overflow-hidden">
      <div className="border-b border-border px-5 py-4">
        <Skeleton className="h-4 w-44" />
      </div>
      <div className="divide-y divide-border">
        {keys("row", rows).map((rowKey) => (
          <div key={rowKey} className="flex items-center gap-4 px-5 py-3.5">
            {columnKeys.map((colKey, c) => (
              <Skeleton
                key={colKey}
                className={`h-3.5 ${c === 0 ? "w-20" : c === 1 ? "w-40" : "w-24"}`}
              />
            ))}
          </div>
        ))}
      </div>
    </AdminCard>
  );
}
