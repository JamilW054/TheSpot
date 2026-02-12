import { AppShell } from "@/components/layout";
import { RequireAuth } from "@/components/auth";

export default function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <RequireAuth requireAdmin>
      <AppShell variant="admin">{children}</AppShell>
    </RequireAuth>
  );
}
