import { getProducts } from "@/database/repositories";
import { WishlistContent } from "./WishlistContent";

export const metadata = {
  title: "Lista de deseos | Buxxep",
  description: "Tus productos guardados en Buxxep.",
};

export default async function WishlistPage() {
  const products = await getProducts();

  return (
    <article className="w-full max-w-2xl px-4 sm:px-6 pb-20 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Lista de deseos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Productos que guardaste para más tarde.
        </p>
      </header>

      <WishlistContent allProducts={products} />
    </article>
  );
}
