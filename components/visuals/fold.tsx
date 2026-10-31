import type { ReactNode } from "react";

/**
 * A section folded behind its heading: the title stays on the page, the
 * prose opens on tap. Used to cut walls of text (owner, 11 Oct 2026) without
 * deleting content search engines and answer engines already read; the
 * text is in the HTML whether open or not.
 */
export function Fold({ title, children, open = false }: { title: string; children: ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group mt-6 rounded-[24px] border border-rule bg-paper px-6 sm:px-7">
      {/* The padding sits on the summary so the whole row is the tap target. */}
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
        <h2 className="font-heading text-[20px] leading-7 font-medium text-ink sm:text-[22px]">{title}</h2>
        <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink/[0.06] text-ink-2 transition group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="pb-6">{children}</div>
    </details>
  );
}
