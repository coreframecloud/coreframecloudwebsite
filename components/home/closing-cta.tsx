/**
 * Last thing on the page. One decision, both directions offered.
 *
 * The trial figure is live: if trials are switched off in the control plane,
 * `trial` is null and this falls back to a plain "create an account" rather than
 * advertising an offer the platform will refuse after someone has handed over
 * their ID.
 */

import Link from "next/link";
import type { TrialTerms } from "@/lib/rate-card";
import { COMPANY } from "@/lib/company";

export function ClosingCta({ trial }: { trial: TrialTerms | null }) {
  const minutes = trial?.gpu_minutes;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-cyan-300/20 bg-[radial-gradient(ellipse_70%_120%_at_50%_0%,rgba(34,211,238,0.13),transparent_70%)] px-6 py-16 text-center sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Start today</p>

        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold leading-[1.12] tracking-[-0.025em] text-white sm:text-4xl lg:text-5xl">
          {minutes ? (
            <>
              {minutes} minutes on an RTX 5080.
              <br />
              <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                Free, and no card.
              </span>
            </>
          ) : (
            <>
              An RTX 5080, by the minute.
              <br />
              <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                Nothing to commit to.
              </span>
            </>
          )}
        </h2>

        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/70">
          Open your own project on it and decide for yourself. That&apos;s a more
          honest test than anything we could put on this page.
        </p>

        {/* Two genuinely different actions. Both buttons pointing at /login
            would just be the same door twice — this audience asks hardware
            questions before it signs up, which is why the second one opens a
            conversation instead. */}
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <Link href="/login" className="cf-btn-primary">
            Create your free account
          </Link>
          <a
            href={`${COMPANY.whatsapp}?text=${encodeURIComponent(
              "Hi Coreframe — I have a question about the GPU workstations.",
            )}`}
            target="_blank"
            rel="noreferrer"
            className="cf-btn-secondary"
          >
            Ask us a question
          </a>
        </div>
      </div>
    </section>
  );
}
