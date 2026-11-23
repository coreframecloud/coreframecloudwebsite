"use client";

/**
 * Pagination footer for the lists on My Activity (owner, 23 Nov 2026: "strict
 * 5 entries and pagination after that"). One look for every list: "1–5 of 23"
 * on the left, Previous / page / Next on the right. `more` means older rows
 * exist on the server that are not loaded yet, so Next stays enabled and the
 * count reads "23+".
 */
export const LIST_PAGE = 5;

export function Pager({
  page,
  total,
  more = false,
  loading = false,
  onPage,
  size = LIST_PAGE,
}: {
  /** Zero-based page index. */
  page: number;
  /** Rows loaded so far. */
  total: number;
  more?: boolean;
  loading?: boolean;
  onPage: (page: number) => void;
  size?: number;
}) {
  const pages = Math.max(1, Math.ceil(total / size));
  if (pages <= 1 && !more) return null;
  const from = Math.min(total, page * size + 1);
  const to = Math.min(total, (page + 1) * size);
  const hasNext = page + 1 < pages || more;
  const btn =
    "inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-rule-strong px-3 text-xs font-semibold text-ink transition hover:bg-paper-2 disabled:pointer-events-none disabled:opacity-40";
  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3 border-t border-rule px-4 py-2.5 sm:px-6"
      aria-label="Pages"
    >
      <p className="text-xs tabular-nums text-ink-3">
        {loading && from > to ? "Loading…" : `${from}–${to} of ${total}${more ? "+" : ""}`}
      </p>
      <div className="flex items-center gap-2">
        <button type="button" className={btn} onClick={() => onPage(page - 1)} disabled={page === 0} aria-label="Previous page">
          ‹ Prev
        </button>
        <span className="min-w-14 text-center text-xs tabular-nums text-ink-2">
          {page + 1} / {pages}
          {more ? "+" : ""}
        </span>
        <button type="button" className={btn} onClick={() => onPage(page + 1)} disabled={!hasNext || loading} aria-label="Next page">
          Next ›
        </button>
      </div>
    </nav>
  );
}
