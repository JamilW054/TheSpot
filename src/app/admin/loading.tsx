import {
  ChartSkeleton,
  StatGridSkeleton,
  TableSkeleton,
} from "@/components/admin/ui";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-44" />
      </div>
      <StatGridSkeleton />
      <StatGridSkeleton />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <ChartSkeleton height={220} />
      </div>
      <TableSkeleton />
    </div>
  );
}
