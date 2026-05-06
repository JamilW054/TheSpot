import { AdminViewportScrollbar } from "@/components/admin/AdminViewportScrollbar";
import { RequireAuth } from "@/components/auth";
import { AppShell } from "@/components/layout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth requireAdmin>
      <AdminViewportScrollbar />
      <div className="dark min-h-full bg-zinc-950 text-zinc-100">
        <AppShell variant="admin">{children}</AppShell>
      </div>
    </RequireAuth>
  );
}
