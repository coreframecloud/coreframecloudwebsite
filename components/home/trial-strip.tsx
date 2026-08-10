import Link from "next/link";
import { getRateCard, getTrialTerms } from "@/lib/rate-card";

/**
 * Slim site-wide trial strip, above the header on every page.
 *
 * Separate from `TrialBanner`, which is the full offer block on the homepage.
 * A visitor who lands on /d5-render or /enscape-cloud-gpu from a search result
 * never sees the homepage at all, and those are the pages with the highest
 * intent — someone typing "enscape cloud gpu" is further along than someone
 * browsing the front page. The offer has to travel with them.
 *
 * Deliberately one line. A repeat of the full banner on every page reads as
 * nagging and pushes the actual page content below the fold on a laptop; the
 * strip states the offer and gets out of the way.
 *
 * Renders nothing at all when the control plane says there is no trial — same
 * rule as the price. Never advertise what the platform will not grant.
 */
export async function TrialStrip() {
  const terms = getTrialTerms(await getRateCard());
  if (!terms) return null;

  return (
    <div className="border-b border-emerald-400/20 bg-emerald-500/10">
      <Link
        href="/signup"
        className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-6 py-2 text-center text-sm text-emerald-200 transition-colors hover:text-white"
      >
        <span className="font-medium">
          {terms.gpu_minutes} free minutes on an RTX 5080
        </span>
        <span className="hidden text-emerald-300/60 sm:inline">·</span>
        <span className="hidden text-emerald-300/80 sm:inline">
          {terms.storage_gb}GB storage included, no card needed
        </span>
        <span className="ml-1 underline underline-offset-4">Start free →</span>
      </Link>
    </div>
  );
}
