import { StatGridSkeleton, TableSkeleton } from "@/components/admin/ui";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCatalogoLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <StatGridSkeleton count={3} />
      <TableSkeleton rows={8} columns={6} />
    </div>
  );
}
