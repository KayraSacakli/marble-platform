interface PaginationProps {
  currentPage: number;
  totalPages: number;
  locale: string;
  basePath?: string;
}

export function Pagination({ currentPage, totalPages, locale, basePath = '/products' }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: Array<number | 'ellipsis'> = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('ellipsis');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
  }

  const buildHref = (page: number) => `/${locale}${basePath}?page=${page}`;

  return (
    <nav className="pagination" aria-label="Pagination">
      <a
        href={buildHref(currentPage - 1)}
        className={`pagination__item ${currentPage <= 1 ? 'pagination__item--disabled' : ''}`}
        aria-label="Previous page"
        tabIndex={currentPage <= 1 ? -1 : 0}
      >
        ← Prev
      </a>

      {pages.map((page, index) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="pagination__ellipsis" aria-hidden="true">
            …
          </span>
        ) : (
          <a
            key={page}
            href={buildHref(page)}
            className={`pagination__item ${page === currentPage ? 'pagination__item--active' : ''}`}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </a>
        ),
      )}

      <a
        href={buildHref(currentPage + 1)}
        className={`pagination__item ${currentPage >= totalPages ? 'pagination__item--disabled' : ''}`}
        aria-label="Next page"
        tabIndex={currentPage >= totalPages ? -1 : 0}
      >
        Next →
      </a>
    </nav>
  );
}
