export const dynamic = "force-dynamic";

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
      <div className="admin-scope min-h-full">
        <AdminFeedbackProvider>
          <AppShell>{children}</AppShell>
        </AdminFeedbackProvider>
      </div>
    </RequireAuth>
  );
}
