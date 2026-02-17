import { AppShell } from "@/components/layout";
import { RequireAuth } from "@/components/auth";

export default function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <RequireAuth requireAdmin>
      <div className="dark min-h-full bg-zinc-950 text-zinc-100">
        <AppShell variant="admin">{children}</AppShell>
      </div>
    </RequireAuth>
  );
}
