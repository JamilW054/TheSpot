import { CartProvider } from "@/contexts/cart-context";
import { PublicNavbar } from "@/components/layout";

export default function PublicLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <PublicNavbar />
        <main className="flex flex-1 w-full flex-col pt-0">
          {children}
        </main>
      </div>
    </CartProvider>
  );
}
