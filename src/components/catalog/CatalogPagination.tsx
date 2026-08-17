import Link from "next/link";

interface CatalogPaginationProps {
  currentPage: number;
  totalPages: number;
  query: Record<string, string | string[] | undefined>;
}

function pageHref(
  query: CatalogPaginationProps["query"],
  page: number,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (key === "pagina" || value === undefined) continue;
    const first = Array.isArray(value) ? value[0] : value;
    if (first) params.set(key, first);
  }
  if (page > 1) params.set("pagina", String(page));
  const search = params.toString();
  return search
    ? `/catalogo?${search}#lista-productos`
    : "/catalogo#lista-productos";
}

function visiblePages(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages]
    .filter((page) => page > 0 && page <= total)
    .sort((a, b) => a - b);
  const result: (number | string)[] = [];
  for (const page of sorted) {
    const previous = result.at(-1);
    if (typeof previous === "number" && page - previous > 1)
      result.push(`ellipsis-${previous}-${page}`);
    result.push(page);
  }
  return result;
}

export function CatalogPagination({
  currentPage,
  totalPages,
  query,
}: CatalogPaginationProps) {
  if (totalPages <= 1) return null;
  const linkClass =
    "inline-flex size-10 items-center justify-center rounded-full border border-rose-200 text-sm font-semibold transition-colors hover:border-primary hover:text-primary";

  return (
    <nav
      aria-label="Paginación del catálogo"
      className="flex flex-wrap items-center justify-center gap-2 pb-16"
    >
      {currentPage > 1 && (
        <Link
          href={pageHref(query, currentPage - 1)}
          className={`${linkClass} w-auto px-4`}
        >
          Anterior
        </Link>
      )}
      {visiblePages(currentPage, totalPages).map((page) =>
        typeof page === "string" ? (
          <span key={page} className="px-1 text-muted-foreground" aria-hidden>
            …
          </span>
        ) : (
          <Link
            key={page}
            href={pageHref(query, page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`${linkClass} ${page === currentPage ? "border-primary bg-primary text-primary-foreground hover:text-primary-foreground" : ""}`}
          >
            {page}
          </Link>
        ),
      )}
      {currentPage < totalPages && (
        <Link
          href={pageHref(query, currentPage + 1)}
          className={`${linkClass} w-auto px-4`}
        >
          Siguiente
        </Link>
      )}
    </nav>
  );
}
