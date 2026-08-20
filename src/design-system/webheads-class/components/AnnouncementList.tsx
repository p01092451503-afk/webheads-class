import {
  forwardRef,
  useId,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../lib/utils";
import { Badge, type BadgeTone } from "./Badge";
import { Chip } from "./Chip";
import { Input } from "./Input";
import { Pagination } from "./Pagination";

export interface AnnouncementItem {
  /** Stable identifier, used as React key. */
  id: string;
  /** Notice title / headline. */
  title: string;
  /** Display date, e.g. "2026.08.20". Pass a pre-formatted string, or an ISO
   *  string together with `formatDate` to control formatting. */
  date: string;
  /** Category label shown in the chip, e.g. "공지", "학습", "행사". */
  category: string;
  /** Semantic colour of the category chip. Defaults to "neutral". */
  tone?: BadgeTone;
  /** Destination when the item is used for navigation. Renders an `<a>` when set. */
  href?: string;
  /** Marks the item as unread — adds a NEW-style outline badge. */
  isNew?: boolean;
}

/** Sentinel value meaning "no category filter". */
export const ANNOUNCEMENT_ALL_CATEGORIES = "";

export interface AnnouncementListProps
  extends Omit<HTMLAttributes<HTMLUListElement>, "onPageChange"> {
  /** Notice items to render. */
  items: AnnouncementItem[];
  /** Optional formatter applied to `date` when it looks like an ISO timestamp. */
  formatDate?: (date: string) => string;
  /** Message shown when `items` is empty (after filtering). */
  emptyText?: string;
  /** Message shown when filtering yields no results. Defaults to a search-specific hint. */
  noResultText?: string;
  /** Optional node rendered after the list, e.g. a "더보기" link. */
  footer?: ReactNode;

  /** Show the category filter chips. Defaults to true when `filterCategories`
   *  or any category control prop is provided. */
  filterable?: boolean;
  /** Override the derived category list. Include the "all" label yourself only if
   *  you also set `allCategoryLabel` to empty. */
  filterCategories?: string[];
  /** Label for the "show all" chip. Defaults to "전체". */
  allCategoryLabel?: string;
  /** Currently selected category. Empty string means "all". Provide with
   *  `onCategoryChange` for controlled filtering (server-side). */
  category?: string;
  /** Called when the selected category changes. */
  onCategoryChange?: (category: string) => void;

  /** Show the search input. Defaults to true when `searchable` or any search
   *  control prop is provided. */
  searchable?: boolean;
  /** Placeholder for the search input. */
  searchPlaceholder?: string;
  /** Current search keyword. Provide with `onQueryChange` for controlled search. */
  query?: string;
  /** Called when the search keyword changes. */
  onQueryChange?: (query: string) => void;

  /** Items shown per page. Enables the pager. Defaults to 10 when any paging prop is set. */
  pageSize?: number;
  /** Current 1-based page. Provide together with `onPageChange` for controlled paging
   *  (server-side): pass only the current page's `items` plus `totalItems`. */
  page?: number;
  /** Called with the next page. Required for controlled paging. */
  onPageChange?: (page: number) => void;
  /** Total item count across all pages. Required for controlled paging. */
  totalItems?: number;
  /** Hides the pager even when paging props are set. */
  hidePagination?: boolean;

  /** Shows animated skeleton placeholder rows instead of items. Use while fetching. */
  loading?: boolean;
  /** Number of skeleton rows rendered while `loading`. Defaults to 5 (or `pageSize`). */
  skeletonCount?: number;
}

function looksLikeIso(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value.trim());
}

/** Splits `text` on every case-insensitive occurrence of `query`, wrapping the
 *  matches in `<mark>` so the searched keyword stands out in the title. */
function highlight(text: string, query: string): ReactNode {
  if (!query) return text;
  const needle = query.toLowerCase();
  const haystack = text.toLowerCase();
  const parts: ReactNode[] = [];
  let cursor = 0;
  let found = haystack.indexOf(needle);
  while (found !== -1) {
    if (found > cursor) parts.push(text.slice(cursor, found));
    parts.push(
      <mark key={`${found}`} className="jc-announcement__mark">
        {text.slice(found, found + needle.length)}
      </mark>,
    );
    cursor = found + needle.length;
    found = haystack.indexOf(needle, cursor);
  }
  if (cursor === 0) return text;
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

/** Vertical list of notice items with date, category chip and consistent spacing.
 *  Optional category filtering and keyword search are applied client-side in
 *  uncontrolled mode; in controlled mode (page/onPageChange) the parent is
 *  responsible for filtering server-side — pass the filtered page of `items`
 *  and respond to `onCategoryChange`/`onQueryChange`. */
export const AnnouncementList = forwardRef<HTMLUListElement, AnnouncementListProps>(
  function AnnouncementList(
    {
      items,
      formatDate,
      emptyText = "등록된 공지가 없습니다.",
      noResultText = "검색/조건에 맞는 공지가 없습니다.",
      footer,

      filterable,
      filterCategories,
      allCategoryLabel = "전체",
      category,
      onCategoryChange,

      searchable,
      searchPlaceholder = "공지 제목 검색",
      query,
      onQueryChange,

      pageSize,
      page,
      onPageChange,
      totalItems,
      hidePagination = false,
      loading = false,
      skeletonCount,
      className,
      ...props
    },
    ref,
  ) {
    const controlledPaging = page !== undefined && onPageChange !== undefined;
    const controlledCategory = category !== undefined && onCategoryChange !== undefined;
    const controlledQuery = query !== undefined && onQueryChange !== undefined;

    const showFilters = filterable ?? (filterCategories !== undefined || controlledCategory);
    const showSearch = searchable ?? controlledQuery;

    const [internalCategory, setInternalCategory] = useState<string>(ANNOUNCEMENT_ALL_CATEGORIES);
    const [internalQuery, setInternalQuery] = useState<string>("");

    const activeCategory = controlledCategory ? category! : internalCategory;
    const activeQuery = (controlledQuery ? query! : internalQuery).trim();

    // Derived category list (preserving first-seen order from items).
    const categories = useMemo(() => {
      if (filterCategories) return filterCategories;
      const seen = new Set<string>();
      const list: string[] = [];
      for (const item of items) {
        if (!seen.has(item.category)) {
          seen.add(item.category);
          list.push(item.category);
        }
      }
      return list;
    }, [items, filterCategories]);

    // Client-side filtering (uncontrolled). In controlled-paging mode the
    // parent supplies already-filtered items, so we skip local filtering.
    const filtered = useMemo(() => {
      if (controlledPaging) return items;
      return items.filter((item) => {
        if (activeCategory && item.category !== activeCategory) return false;
        if (activeQuery && !item.title.toLowerCase().includes(activeQuery.toLowerCase()))
          return false;
        return true;
      });
    }, [items, controlledPaging, activeCategory, activeQuery]);

    // Per-category result counts, respecting the active search query. Only
    // meaningful in local-filtering mode (controlled-paging supplies a page,
    // not the full set), so we return null there and omit the badge.
    const counts = useMemo(() => {
      if (controlledPaging) return null;
      const map: Record<string, number> = { [ANNOUNCEMENT_ALL_CATEGORIES]: 0 };
      for (const cat of categories) map[cat] = 0;
      const q = activeQuery.toLowerCase();
      for (const item of items) {
        if (q && !item.title.toLowerCase().includes(q)) continue;
        map[ANNOUNCEMENT_ALL_CATEGORIES]++;
        if (map[item.category] !== undefined) map[item.category]++;
      }
      return map;
    }, [items, categories, controlledPaging, activeQuery]);

    const size = pageSize ?? 10;
    const paged = pageSize !== undefined || controlledPaging;
    const skeletonRows = Math.max(1, skeletonCount ?? pageSize ?? 5);

    const total = controlledPaging ? (totalItems ?? filtered.length) : filtered.length;
    const totalPages = paged ? Math.max(1, Math.ceil(total / size)) : 1;
    const [internalPage, setInternalPage] = useState(1);
    // Reset to first page whenever the filter narrows the set.
    const filterKey = `${activeCategory}::${activeQuery}`;
    const [lastFilterKey, setLastFilterKey] = useState(filterKey);
    if (lastFilterKey !== filterKey) {
      setLastFilterKey(filterKey);
      if (!controlledPaging && internalPage !== 1) setInternalPage(1);
    }
    const currentPage = Math.min(
      Math.max(1, controlledPaging ? page! : internalPage),
      totalPages,
    );

    const visible = useMemo(() => {
      if (!paged || controlledPaging) return filtered;
      const start = (currentPage - 1) * size;
      return filtered.slice(start, start + size);
    }, [filtered, paged, controlledPaging, currentPage, size]);

    const handlePageChange = (next: number) => {
      if (controlledPaging) onPageChange!(next);
      else setInternalPage(next);
    };

    const handleCategory = (next: string) => {
      if (controlledCategory) onCategoryChange!(next);
      else setInternalCategory(next);
    };

    const handleQuery = (next: string) => {
      if (controlledQuery) onQueryChange!(next);
      else setInternalQuery(next);
    };

    const searchId = useId();
    const hasActiveFilter = Boolean(activeCategory) || Boolean(activeQuery);

    return (
      <div className={cn("jc-announcement", className)}>
        {showFilters || showSearch ? (
          <div className="jc-announcement__toolbar">
            {showSearch ? (
              <div className="jc-announcement__search">
                <Input
                  id={searchId}
                  type="search"
                  inputMode="search"
                  autoComplete="off"
                  placeholder={searchPlaceholder}
                  value={controlledQuery ? query! : internalQuery}
                  onChange={(e) => handleQuery(e.target.value)}
                  aria-label={searchPlaceholder}
                />
              </div>
            ) : null}
            {showFilters ? (
              <div className="jc-announcement__chips" role="group" aria-label="카테고리 필터">
                <Chip
                  selected={activeCategory === ANNOUNCEMENT_ALL_CATEGORIES}
                  onClick={() => handleCategory(ANNOUNCEMENT_ALL_CATEGORIES)}
                >
                  {allCategoryLabel}
                  {counts && activeCategory === ANNOUNCEMENT_ALL_CATEGORIES ? (
                    <span className="jc-announcement__count" aria-label="검색 결과">
                      {counts[ANNOUNCEMENT_ALL_CATEGORIES]}
                    </span>
                  ) : null}
                </Chip>
                {categories.map((cat) => (
                  <Chip
                    key={cat}
                    selected={activeCategory === cat}
                    onClick={() => handleCategory(cat)}
                  >
                    {cat}
                    {counts && activeCategory === cat ? (
                      <span className="jc-announcement__count" aria-label="검색 결과">
                        {counts[cat]}
                      </span>
                    ) : null}
                  </Chip>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <ul ref={ref} className="jc-announcement__list" {...props}>
          {loading ? (
            Array.from({ length: skeletonRows }, (_, i) => (
              <li key={`sk-${i}`} className="jc-announcement__skeleton" aria-hidden="true">
                <span className="jc-announcement__bone jc-announcement__bone--date" />
                <span className="jc-announcement__bone jc-announcement__bone--badge" />
                <span className="jc-announcement__bone jc-announcement__bone--title" />
              </li>
            ))
          ) : visible.length === 0 ? (
            <li className="jc-announcement__empty">
              <svg
                className="jc-announcement__empty-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M3 7l9 6 9-6" />
                <rect x="3" y="5" width="18" height="14" rx="2" />
              </svg>
              <span className="jc-announcement__empty-text">
                {hasActiveFilter ? noResultText : emptyText}
              </span>
            </li>
          ) : (
            visible.map((item) => {
              const Tag = item.href ? "a" : ("div" as const);
              const date =
                formatDate && looksLikeIso(item.date) ? formatDate(item.date) : item.date;
              return (
                <li key={item.id} className="jc-announcement__item">
                  <Tag
                    {...(item.href ? { href: item.href } : {})}
                    className="jc-announcement__row"
                  >
                    <span className="jc-announcement__date">{date}</span>
                    <Badge tone={item.tone ?? "neutral"}>{item.category}</Badge>
                    {item.isNew ? <Badge tone="outline">NEW</Badge> : null}
                    <span className="jc-announcement__title">
                      {highlight(item.title, activeQuery)}
                    </span>
                  </Tag>
                </li>
              );
            })
          )}
        </ul>
        {!loading && paged && !hidePagination && totalPages > 1 ? (
          <div className="jc-announcement__pager">
            <Pagination page={currentPage} totalPages={totalPages} onChange={handlePageChange} />
          </div>
        ) : null}
        {footer ? <div className="jc-announcement__footer">{footer}</div> : null}
      </div>
    );
  },
);
