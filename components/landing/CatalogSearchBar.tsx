import Image from "next/image";
import Link from "next/link";
import { getCategoriesPublic } from "@/lib/db/categories";

export async function CatalogSearchBar() {
  const categories = await getCategoriesPublic();

  if (categories.length === 0) return null;

  return (
    <div className="fixed top-24 sm:top-26 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2">
        <div
          className="flex gap-3 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalogo?categoria=${cat.slug}`}
              className="shrink-0 flex flex-col items-center gap-1 group"
            >
              <div className="size-12 sm:size-14 rounded-full overflow-hidden border-2 border-border bg-muted group-hover:border-primary transition-colors">
                {cat.image_url ? (
                  <Image
                    src={cat.image_url}
                    alt={cat.name}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase">
                    {cat.name.slice(0, 2)}
                  </div>
                )}
              </div>
              <span className="text-[10px] font-medium text-center text-foreground leading-tight w-14 line-clamp-2">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
