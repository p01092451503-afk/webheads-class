import { forwardRef } from "react";
import { cn } from "../lib/utils";

export interface PaginationProps {
  /** Current 1-based page. */
  page: number;
  /** Total number of pages. */
  totalPages: number;
  /** Called with the page the user selected. */
  onChange: (page: number) => void;
  className?: string;
}

/** Numbered pager for notice, community and FAQ lists. */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  { page, totalPages, onChange, className },
  ref,
) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav ref={ref} aria-label="Pagination" className={cn("jc-pagination", className)}>
      <button
        type="button"
        className="jc-pagination__btn"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === page ? "page" : undefined}
          className={cn("jc-pagination__btn", p === page && "jc-pagination__btn--active")}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        className="jc-pagination__btn"
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        ›
      </button>
    </nav>
  );
});
