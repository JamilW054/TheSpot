import { PublicFooter, PublicNavbar } from "@/components/layout";

export default function PublicLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <PublicNavbar />
      <main className="flex flex-1 w-full flex-col pt-24 sm:pt-26">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
