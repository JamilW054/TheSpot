import { ConditionalFooter, PublicShell } from "@/components/layout";
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
        <PublicShell categories={categories}>{children}</PublicShell>
        <ConditionalFooter />
      </div>
    </WishlistProvider>
  );
}
