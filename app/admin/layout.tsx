import { AdminViewportScrollbar } from "@/components/admin/AdminViewportScrollbar";
import { RequireAuth } from "@/components/auth";
import { AppShell } from "@/components/layout";
import { AdminFeedbackProvider } from "@/contexts/admin-feedback-context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth requireAdmin>
      <AdminViewportScrollbar />
      <div className="dark min-h-full bg-zinc-950 text-zinc-100">
        <AdminFeedbackProvider>
          <AppShell variant="admin">{children}</AppShell>
        </AdminFeedbackProvider>
      </div>
    </RequireAuth>
  );
}
