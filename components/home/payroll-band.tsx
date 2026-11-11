import { TrackedLink } from "@/components/analytics/tracked-link";
import { OFFERINGS } from "@/lib/offerings";

// The GPU entry the home page's GPU card uses (price first, account at Start).
const GPU_ENTRY = OFFERINGS.find((o) => o.id === "gpu")?.cta.href ?? "/software/gpu-workstation-rental-india#pick-a-gpu";

/**
 * The payroll tagline (owner, 11 Nov 2026). Full width, one line of
 * headline, one quieter line under it, and a text link instead of a button
 * (never salesy: the ask is small and last). "payroll" carries the band's one
 * yellow marker, the paper highlight style (.cf-hl-marker). Same words in
 * both currencies: it quotes no price.
 *
 * Used on the home page right after the hero, and on the GPU workstations
 * page after its price block. `location` tells the two apart in analytics.
 */
export function PayrollBand({ location, className = "" }: { location: string; className?: string }) {
  return (
    <section className={`px-5 ${className}`} aria-labelledby={`payroll-${location}`}>
      <div className="cf-wide text-center">
        <h2 id={`payroll-${location}`} className="cf-section-title mx-auto max-w-[40rem]">
          At a studio, waiting isn&rsquo;t an annoyance. It&rsquo;s <span className="cf-hl-marker">payroll</span>.
        </h2>
        <p className="cf-lead mx-auto mt-4 max-w-[36rem]">
          Three people watching a progress bar is three salaries standing still.
        </p>
        <p className="mt-6">
          <TrackedLink
            href={GPU_ENTRY}
            event="offering_cta_click"
            params={{ offering: "gpu", label: "Put the render on our GPU", location }}
            className="inline-flex min-h-11 items-center text-[15px] font-medium text-ink underline decoration-rule underline-offset-4 transition hover:decoration-ink"
          >
            Put the render on our GPU&nbsp;&rarr;
          </TrackedLink>
        </p>
      </div>
    </section>
  );
}
