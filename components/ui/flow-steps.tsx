import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Where you are in a multi-step flow (design/ux-laws, 27 Nov 2026).
 *
 * The Zeigarnik effect: a task people can see is unfinished stays on their
 * mind, so they come back to finish it. Sign-up runs across four screens
 * (email, mobile code, first top-up, Connect download) on three pages, and
 * until now nothing told a new customer how far along they were or what was
 * left. The 10 Nov funnel lost two thirds of GPU visitors between the sign-up
 * view and the verified mobile.
 *
 * One strip, the same on every screen of the flow: a short bar and a label per
 * step. Done steps carry a tick, the current one is ink and bold, the rest are
 * quiet. Blue only; the page's one yellow highlight is never spent here.
 *
 * No state and no hooks: it renders on the server and inside client forms.
 * Sign-up uses it through components/ui/signup-steps.tsx, which picks the
 * step names.
 * Labels are 13px and the strip fits four steps inside a 390px card.
 */
export function FlowSteps({
  current,
  steps,
  label = "Sign-up progress",
  className,
}: {
  /** 1-based index of the step in progress. steps.length + 1 = all done. */
  current: number;
  steps: readonly string[];
  label?: string;
  className?: string;
}) {
  const total = steps.length;
  const shown = Math.min(current, total);
  return (
    <ol
      aria-label={`${label}: step ${shown} of ${total}`}
      className={cn("grid gap-2", className)}
      style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
      data-cf-steps={current}
    >
      {steps.map((name, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={name} aria-current={active ? "step" : undefined} className="min-w-0">
            <span
              aria-hidden
              className={cn(
                "block h-1 rounded-full transition-colors",
                done || active ? "bg-blue" : "bg-ink/10",
              )}
            />
            <span
              className={cn(
                "mt-2 flex items-center gap-1 text-[13px] leading-4",
                active ? "font-semibold text-ink" : done ? "text-ink-2" : "text-ink-3",
              )}
            >
              {/* The tick needs 18px a 390px card does not have once three steps are
                  done ("Add funds" was cut short): phones show done by the bar. */}
              {done ? <Check aria-hidden className="hidden h-3.5 w-3.5 shrink-0 text-blue min-[440px]:block" strokeWidth={2.5} /> : null}
              <span className="truncate">{name}</span>
              {done ? <span className="sr-only"> (done)</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
