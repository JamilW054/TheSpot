import { AppShell } from "@/components/layout";
import { RequireAuth } from "@/components/auth";

export default function AppLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}
