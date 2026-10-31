import type { ReactNode } from "react";

/**
 * Scannable pointers for a hero (owner, 31 Oct 2026: "a lot of text by the
 * spaceship image... do it as pointers"). A bold lead of a few words and at
 * most one short line each, with the site's yellow dot. Works on the dark
 * page hero (.cf-pagehero turns strong/p white) and on paper.
 */
export type Pointer = { lead: string; line?: string };

export function Pointers({ items, className = "" }: { items: Pointer[]; className?: string }) {
  return (
    <ul className={`grid gap-x-8 gap-y-3.5 sm:grid-cols-2 ${className}`}>
      {items.map((p) => (
        <li key={p.lead} className="flex min-w-0 gap-3">
          <span aria-hidden className="mt-[0.55em] h-2 w-2 shrink-0 rounded-full bg-hl" />
          <p className="min-w-0 text-[15px] leading-[1.45]">
            <strong className="block text-[16.5px] font-semibold">{p.lead}</strong>
            {p.line ? <span className="block">{p.line}</span> : null}
          </p>
        </li>
      ))}
    </ul>
  );
}

/**
 * The full wording behind a native <details> (same pattern as the home
 * "What is Coreframe?"): in the server HTML for crawlers and answer engines,
 * opened by find-in-page, never display:none.
 */
export function ReadMore({ label = "Read more", children, className = "" }: { label?: string; children: ReactNode; className?: string }) {
  return (
    <details className={`group ${className}`}>
      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-3 text-[13.5px] font-semibold tracking-[0.04em] uppercase [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden
          className="grid h-7 w-7 place-items-center rounded-full border border-current/30 text-[17px] leading-none font-light"
        >
          <span className="group-open:hidden">+</span>
          <span className="hidden group-open:inline">−</span>
        </span>
        {label}
      </summary>
      <div className="mt-2">{children}</div>
    </details>
  );
}
