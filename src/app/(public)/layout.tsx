import { ConditionalFooter, PublicShell } from "@/components/layout";
import { StoreSettingsProvider } from "@/contexts/store-settings-context";
import { WishlistProvider } from "@/contexts/wishlist-context";
import { getCategoriesPublic } from "@/database/repositories/categories";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategoriesPublic();
  // Marketplace: el envío gratis es por tienda (se calcula en el checkout).
  const freeShippingMinCents = 0;
  const comingSoonSlugs = categories
    .filter((c) => c.coming_soon)
    .map((c) => c.slug);

  return (
    <StoreSettingsProvider value={{ freeShippingMinCents, comingSoonSlugs }}>
      <WishlistProvider>
        <div className="min-h-screen flex flex-col bg-background text-foreground">
          <PublicShell categories={categories}>{children}</PublicShell>
          <ConditionalFooter />
        </div>
      </WishlistProvider>
    </StoreSettingsProvider>
  );
}
