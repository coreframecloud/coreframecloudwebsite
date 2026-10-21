import Link from "next/link";
import type { BlogContext } from "@/lib/blog/types";
import { introMoreGpusNote, withArticle } from "@/lib/rate-card";

/**
 * The soft call to action at the foot of every post.
 *
 * Offer terms come only from the rate card (getIntroOffer via BlogContext).
 * When no offer is live, the block says what the machine is and stops; it
 * never falls back to a typed "₹1,000 = 8 hours".
 */
export function BlogCta({ ctx }: { ctx: BlogContext }) {
  const o = ctx.intro;
  return (
    <section className="mt-16 rounded-cf border border-blue/20 bg-blue/[0.05] p-6 sm:p-8">
      <p className="cf-eyebrow mb-4">Try it on your own project</p>
      <h2 className="font-display text-[26px] leading-tight font-semibold text-ink">
        Open your heaviest scene on a Coreframe GPU workstation.
      </h2>
      <p className="mt-3 text-[16px] leading-7 text-ink-2">
        {o && ctx.introPrice && ctx.introHours
          ? `New accounts: your first top-up of ${ctx.introPrice} buys ${ctx.introHours}${o.gpuName ? ` on ${withArticle(o.gpuName)}` : ""}${introMoreGpusNote(o)}${o.validityDays ? `, to use within ${o.validityDays} days` : ""}. `
          : ctx.hourly
            ? `${ctx.hourly} ${ctx.taxIncl}, billed per minute. `
            : ""}
        Sign up with an email and a WhatsApp code, no ID documents. International cards work.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/signup" className="cf-btn-primary">
          Create an account
        </Link>
        <Link href="/pricing" className="cf-btn-secondary">
          See pricing
        </Link>
      </div>
    </section>
  );
}
