import { PublicFooter, PublicNavbar } from "@/components/layout";
import { WishlistProvider } from "@/contexts/wishlist-context";
import { getCategoriesPublic } from "@/lib/db/categories";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategoriesPublic();

  return (
    <WishlistProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <PublicNavbar categories={categories} />
        <main className="flex min-h-0 w-full min-w-0 flex-1 flex-col pt-20 sm:pt-26">
          {children}
        </main>
        <PublicFooter />
      </div>
    </WishlistProvider>
  );
}
