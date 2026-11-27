import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * One question list for the whole site (design/ux-laws, 27 Nov 2026).
 *
 * There were three: bordered cards with a blue plus (pricing, /go/*), a
 * divided box (software pages) and, on the application pages, every answer
 * printed open as a wall of text. Same content, three behaviours, and the
 * card version's tap target was the 23px line of text, not the row.
 *
 * Now: one divided box, each row a native <details>. The whole row is the
 * tap target (56px), the answer stays in the HTML for search and AI answers
 * (owner, 31 Oct 2026: collapse long answers, never display:none), and the
 * FAQPage JSON-LD beside each list is untouched.
 */
export type FaqItem = { q: string; a: ReactNode };

export function FaqList({
  items,
  openFirst = false,
  heading = false,
  className,
}: {
  items: readonly FaqItem[];
  /** Open the first answer, so the list reads as answers, not a menu. */
  openFirst?: boolean;
  /** Keep the question an <h3> for pages whose outline had it as one. */
  heading?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("divide-y divide-rule rounded-card border border-rule bg-paper", className)}>
      {items.map((f, i) => (
        <details key={f.q} open={openFirst && i === 0} className="group px-5 sm:px-6">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[16px] leading-6 font-semibold text-ink [&::-webkit-details-marker]:hidden">
            {heading ? <h3 className="min-w-0 font-semibold">{f.q}</h3> : <span className="min-w-0">{f.q}</span>}
            <span aria-hidden className="shrink-0 text-xl leading-none font-light text-ink-3 transition-transform duration-200 group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="max-w-[68ch] pb-5 text-[15px] leading-7 break-words text-ink-2">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
