import Link from "next/link";
import { getRateCard, getTrialTerms } from "@/lib/rate-card";

/**
 * The trial offer, above the header on every page.
 *
 * WHY IT IS BLACK. It was pale blue type on a pale blue wash — the lowest
 * contrast element on the site, sitting in the one position guaranteed to be
 * seen first, saying the one thing most likely to start a trial. It read as a
 * cookie notice, which is exactly the thing people have trained themselves to
 * look past.
 *
 * Inverting it to the near-black terminal colour makes it the strongest mark
 * on a white page WITHOUT inventing anything: --color-term and its mono type
 * are already the site's signature device, the block where every hard fact
 * lives. The strip now reads as one of those, which is also true — it is a
 * fact about what the trial contains.
 *
 * The number carries the message. "200" set large in mono against a dim label
 * is legible at a glance from the corner of the eye; a sentence is not. Every
 * figure comes from the control plane, and the whole strip disappears when
 * there is no trial to offer — never advertise what the platform will refuse
 * after someone has handed over their ID.
 *
 * Still deliberately one line. A full banner on every page reads as nagging
 * and pushes real content below the fold on a laptop.
 */
export async function TrialStrip() {
  const terms = getTrialTerms(await getRateCard());
  if (!terms) return null;

  return (
    <div className="bg-term">
      <Link
        href="/signup"
        className="group cf-wide flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-5 py-2.5 text-center"
      >
        <span className="flex items-baseline gap-1.5">
          <span className="font-mono text-[17px] leading-none font-semibold tracking-[-0.01em] text-white tabular-nums">
            {terms.gpu_minutes}
          </span>
          <span className="font-mono text-[11px] leading-none font-medium tracking-[0.18em] text-term-dim uppercase">
            free minutes
          </span>
        </span>

        <span className="hidden h-3 w-px bg-white/15 sm:block" aria-hidden="true" />

        <span className="hidden font-mono text-[11px] leading-none tracking-[0.1em] text-term-ink/70 sm:inline">
          on a real RTX 5080 · {terms.storage_gb} GB storage · no card
        </span>

        <span className="font-mono text-[11px] leading-none font-semibold tracking-[0.14em] text-term-key uppercase underline decoration-term-key/40 underline-offset-4 transition-colors group-hover:decoration-term-key">
          Start free →
        </span>
      </Link>
    </div>
  );
}
