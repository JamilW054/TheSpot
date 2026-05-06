import { PublicFooter, PublicNavbar } from "@/components/layout";

export default function PublicLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <PublicNavbar />
      <main className="flex min-h-0 w-full min-w-0 flex-1 flex-col pt-24 sm:pt-26">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
