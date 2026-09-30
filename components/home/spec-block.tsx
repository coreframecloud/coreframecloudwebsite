import type { ReactNode } from "react";

/**
 * The monospace fact block — the landing draft's recurring device.
 *
 * THE RULE: a specification never hides inside a paragraph. Prose explains
 * why something matters; this block states what it is. Every hard fact on the
 * site — a spec, a rate card, a comparison — belongs in one of these, and
 * nowhere else.
 *
 * It is deliberately a terminal rather than a table. A studio deciding whether
 * to rent a machine is reading for numbers, not for sentences, and a dark
 * monospace panel on white paper is the one place on the page the eye goes
 * first. Tables invite decoration; this cannot be decorated.
 *
 * Scrolls horizontally on a narrow screen instead of wrapping, because a
 * wrapped spec column stops being readable as a column.
 */
export function SpecBlock({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div>
      {label ? <p className="cf-eyebrow mb-5">{label}</p> : null}
      <div className="cf-term">
        <pre>{children}</pre>
      </div>
    </div>
  );
}

/** A dim key — the left-hand label inside a block. */
export function K({ children }: { children: ReactNode }) {
  return <span className="k">{children}</span>;
}

/** A value worth reading — the figure someone would write down. */
export function V({ children }: { children: ReactNode }) {
  return <span className="v">{children}</span>;
}

/** Ours, in the comparison blocks. */
export function B({ children }: { children: ReactNode }) {
  return <span className="b">{children}</span>;
}

/** A comment line. */
export function C({ children }: { children: ReactNode }) {
  return <span className="c">{children}</span>;
}
