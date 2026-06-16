import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CuentaSidebar } from "./CuentaSidebar";

export default async function CuentaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/cuenta");
  }

  const rawName = user.user_metadata?.full_name as string | undefined;
  const sidebarUser = {
    name: rawName?.trim() || user.email?.split("@")[0] || "Usuario",
    email: user.email ?? "",
  };

  return (
    <div className="flex w-full flex-1 flex-col lg:flex-row">
      <CuentaSidebar sidebarUser={sidebarUser} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
