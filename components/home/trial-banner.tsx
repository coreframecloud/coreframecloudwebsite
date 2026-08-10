import Link from "next/link";
import type { TrialTerms } from "@/lib/rate-card";

/**
 * Free-trial offer, rendered only when the control plane says there is one.
 *
 * Every number here comes from `/public/rate-card`, never from this file. A
 * hardcoded "200 free minutes" would survive a change to `trial_gpu_minutes`
 * and quietly become a promise nobody is keeping — the same drift that had the
 * hero, the FAQ and billing quoting three different hourly rates.
 *
 * The terms are stated plainly rather than buried. Someone has to hand over
 * Aadhaar-based identity verification to claim this, and finding out about that
 * requirement *after* signing up is a worse experience than reading it here.
 * One person, one trial is also stated up front, because the alternative is a
 * customer discovering it at the moment they are refused.
 */
export function TrialBanner({ terms }: { terms: TrialTerms | null }) {
  if (!terms) return null;

  const bonus =
    terms.first_topup_bonus_percent > 0
      ? `Add money later and we match your first top-up ${terms.first_topup_bonus_percent}%, up to ₹${terms.first_topup_bonus_cap_rupees.toLocaleString("en-IN")}.`
      : null;

  return (
    <section className="border-b border-white/10 bg-emerald-500/[0.07]">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-emerald-300">
              Free to try
            </div>

            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
              {terms.gpu_minutes} minutes of RTX 5080 time, free
            </h2>

            <p className="mt-3 max-w-2xl text-base leading-7 text-white/70">
              Enough to open a real D5 Render project and watch it finish in a
              fraction of the time your laptop takes. Plus {terms.storage_gb}GB
              of project storage. No card, no commitment — we only ask for
              payment if you decide to keep going.
            </p>

            <ul className="mt-4 space-y-1.5 text-sm text-white/60">
              {/*
                The clock objection, answered before it is raised. Someone
                pricing this against a laptop assumes a slow upload eats their
                free time, and quietly decides 200 minutes is not much. It is
                also simply true: billing anchors on the first
                `moonlight_stream_started` event, a session that never streams
                bills zero, and files are copied to the NAS over SMB with no
                session running at all.
              */}
              <li>
                · Upload your project files first — copying to your Coreframe
                storage costs nothing. The clock starts when the desktop
                appears, not before
              </li>
              <li>
                · Free minutes are used first — your wallet only starts paying
                once they run out
              </li>
              <li>
                · GPU minutes valid {terms.gpu_validity_days} days · storage{" "}
                {terms.storage_validity_days} days, so you can always get your
                files back
              </li>
              {terms.requires_identity_verification && (
                <li>
                  · Requires DigiLocker identity verification — one trial per
                  person
                </li>
              )}
            </ul>

            {bonus && <p className="mt-4 text-sm text-emerald-300">{bonus}</p>}
          </div>

          <div className="shrink-0">
            <Link href="/signup" className="cf-btn-primary">
              Claim {terms.gpu_minutes} free minutes
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
