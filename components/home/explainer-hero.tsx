/**
 * Homepage hero — the "what is this, actually" version.
 *
 * WHY THIS REPLACED THE OLD HERO. Customers told us they did not understand the
 * concept. The previous hero led with speed ("5× faster rendering"), which only
 * lands if you already know what the product IS. This one leads with the trade
 * everyone in the market already understands — a workstation costs ₹6 lakh and
 * sits idle — and then says what you get instead.
 *
 * NOTHING HERE IS HARDCODED THAT BILLING CAN CHANGE. The hourly rate and the
 * trial come in as props from the live rate card, same rule as the old
 * PricingSection: the homepage must never advertise a number billing does not
 * charge. If the rate card is unreachable the price simply is not shown, rather
 * than a stale figure being printed.
 */

import Link from "next/link";
import { WORKSTATION_REPLACEMENT_COST } from "@/lib/node-spec";
import type { TrialTerms, FirstTopupBonus } from "@/lib/rate-card";

const HARDWARE_COST = WORKSTATION_REPLACEMENT_COST;

export function ExplainerHero({
  adhocRate,
  trial,
  bonus,
}: {
  adhocRate?: string;
  trial: TrialTerms | null;
  bonus: FirstTopupBonus | null;
}) {
  const trialMinutes = trial?.gpu_minutes;
  const bonusCap = bonus
    ? `₹${Math.round(bonus.capRupees).toLocaleString("en-IN")}`
    : null;

  return (
    <section className="relative mx-auto max-w-7xl px-4 pt-16 pb-14 sm:px-6 sm:pt-24 lg:px-8">
      <div className="flex flex-col items-center text-center">
        <p className="cf-eyebrow">GPU workstations, by the hour</p>

        <h1 className="cf-display mt-5 max-w-4xl">
          A {HARDWARE_COST} workstation.
          <br />
          <span className="bg-gradient-to-r from-blue to-blue bg-clip-text text-transparent">
            {adhocRate ? `${adhocRate} an hour.` : "Rented by the hour."}
          </span>
        </h1>

        {/* WAS FORTY WORDS. The old version spent three lines explaining where
            the machine lives before saying what is on it -- and what is on it
            is the whole difference from a bare cloud GPU, which arrives empty
            and expects you to install Windows software over SSH. Location is a
            chip below; the software is the sentence. */}
        <p className="mt-6 max-w-2xl text-base leading-7 text-ink sm:text-lg sm:leading-8">
          A full Windows workstation with an RTX 5080, on the laptop you already
          own. D5 Render, Lumion, Enscape and Twinmotion are already installed.
        </p>

        <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
          <Link href="/login" className="cf-btn-primary w-full sm:w-auto">
            {trialMinutes ? `Start free — ${trialMinutes} minutes` : "Create an account"}
          </Link>
          <Link href="#how" className="cf-btn-secondary w-full sm:w-auto">
            See how it works
          </Link>
        </div>

        {trialMinutes ? (
          <p className="mt-4 text-sm text-ink-2">No card required. Nothing to cancel.</p>
        ) : null}

        {/* THE BONUS HAS BEEN LIVE AND UNMENTIONED. public_pricing.py has served
            first_topup_bonus_percent and _cap_rupees since it shipped, and
            lib/rate-card.ts has had them typed -- no page ever rendered them.
            Billing has been granting a promotion nothing advertised.

            Read through firstTopupBonus(), not getTrialTerms(), so switching
            off free minutes cannot hide a promotion that is still being paid
            out. Both numbers come from the rate card: on 28 Sep 2026 the live
            cap was ₹1,000 while it was believed to be ₹500, which is exactly
            why this must never be typed by hand. */}
        {bonus && bonusCap ? (
          <p className="mt-3 text-sm font-medium text-blue">
            {bonus.percent}% extra on your first top-up, up to {bonusCap}.
          </p>
        ) : null}

        {/* THE OTHER PRODUCT, AND THE CHEAPER DOOR.
            Studio has been live and taking money with nothing on this page
            pointing at it. It is deliberately not a third button competing
            with the two above -- renting a workstation is the bigger sale and
            should keep the primary action -- but somebody who came here for
            "a picture of my floor plan" and not "a machine by the hour" had
            no way to discover that we sell exactly that. */}
        <div className="mt-8 w-full sm:w-auto">
          <Link
            href="/floor-plan-to-render"
            className="group inline-flex flex-col gap-1 rounded-cf border border-rule bg-paper-2 px-5 py-4 text-left transition hover:border-rule-strong hover:bg-paper-2"
          >
            <span className="text-sm font-semibold text-ink">
              Just need a picture of a floor plan?{" "}
              <span className="text-[#2D7FF9] group-hover:underline">
                Try Coreframe Studio →
              </span>
            </span>
          </Link>
        </div>

        <ul className="mt-10 flex flex-wrap justify-center gap-2.5">
          {[
            /* THESE FOUR ARE THE COMPETITIVE POSITION, COMPRESSED.
               The alternative most studios are actually weighing is a
               dollar-priced foreign cloud, and every chip after the first is
               something one of those cannot say: the machine is in India, the
               invoice carries GST, and the meter stops at the minute rather
               than rounding up an hour. Naming the rival outright would date
               badly; stating what we do is durable and does the same work. */
            "RTX 5080 · 16 GB GDDR7",
            "Hosted in Bengaluru",
            "Priced in ₹, GST invoice",
            "Billed per minute",
          ].map((chip, i) => (
            <li
              key={chip}
              className="inline-flex items-center gap-2.5 rounded-full border border-blue/25 bg-paper-2 px-4 py-2 text-sm text-ink"
            >
              {i === 0 ? (
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue" />
                </span>
              ) : null}
              {chip}
            </li>
          ))}
        </ul>

        <FlowDiagram />
      </div>
    </section>
  );
}

/**
 * The one picture that explains the product. Laptop → workstation → your files.
 *
 * Deliberately an inline SVG with real <text>, not an image: it stays crisp,
 * it is readable by a screen reader through the <title>, and an AI crawler can
 * read the labels. Label sizes are 13–17px at the SVG's own scale, because the
 * previous version of this diagram used 8px text on a dark background and was
 * illegible on a normal monitor.
 */
function FlowDiagram() {
  return (
    <div className="mt-14 w-full max-w-4xl rounded-3xl border border-rule bg-paper-2 p-5 sm:p-8">
      <svg
        viewBox="0 0 900 200"
        className="h-auto w-full"
        role="img"
        aria-labelledby="cf-flow-title"
      >
        <title id="cf-flow-title">
          Your laptop connects over a 1 Gbps link to a Coreframe RTX 5080
          workstation in Bengaluru, and your project files stay on Coreframe
          storage in India between sessions.
        </title>
        <defs>
          <linearGradient id="cfFlowGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>

        {/* laptop */}
        <rect x="24" y="46" width="150" height="94" rx="10" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.20)" strokeWidth="1.6" />
        <rect x="10" y="140" width="178" height="14" rx="6" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.15)" strokeWidth="1.2" />
        <rect x="38" y="60" width="122" height="66" rx="5" fill="rgba(34,211,238,.10)" stroke="rgba(34,211,238,.34)" strokeWidth="1.2" />
        <text x="99" y="98" textAnchor="middle" fontSize="15" fill="#e8eef5" fontFamily="system-ui" fontWeight="600">Your laptop</text>
        <text x="99" y="180" textAnchor="middle" fontSize="14" fill="#a8bccd" fontFamily="system-ui">Any spec. Anywhere.</text>

        <line x1="196" y1="93" x2="322" y2="93" stroke="url(#cfFlowGrad)" strokeWidth="2" strokeDasharray="7 6" opacity=".55" />
        <circle r="5" fill="#22d3ee">
          <animate attributeName="cx" values="200;318" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="cy" values="93;93" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <text x="259" y="74" textAnchor="middle" fontSize="13" fill="#a8bccd" fontFamily="system-ui">1 Gbps</text>

        {/* the machine */}
        <rect x="330" y="34" width="238" height="120" rx="18" fill="rgba(34,211,238,.09)" stroke="url(#cfFlowGrad)" strokeWidth="2" />
        <text x="449" y="74" textAnchor="middle" fontSize="15" fill="#22d3ee" fontFamily="system-ui" fontWeight="800" letterSpacing="2.4">COREFRAME</text>
        <text x="449" y="101" textAnchor="middle" fontSize="17" fill="#ffffff" fontFamily="system-ui" fontWeight="700">RTX 5080 workstation</text>
        <text x="449" y="126" textAnchor="middle" fontSize="14" fill="#a8bccd" fontFamily="system-ui">Bengaluru · billed per minute</text>
        <circle cx="449" cy="34" r="5" fill="#34d399">
          <animate attributeName="opacity" values="1;.25;1" dur="2.2s" repeatCount="indefinite" />
        </circle>

        <line x1="576" y1="93" x2="700" y2="93" stroke="url(#cfFlowGrad)" strokeWidth="2" strokeDasharray="7 6" opacity=".55" />
        <circle r="5" fill="#34d399">
          <animate attributeName="cx" values="580;696" dur="2.4s" begin=".8s" repeatCount="indefinite" />
          <animate attributeName="cy" values="93;93" dur="2.4s" begin=".8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" dur="2.4s" begin=".8s" repeatCount="indefinite" />
        </circle>

        {/* storage */}
        <rect x="706" y="46" width="170" height="94" rx="12" fill="rgba(52,211,153,.08)" stroke="rgba(52,211,153,.45)" strokeWidth="1.6" />
        <text x="791" y="84" textAnchor="middle" fontSize="16" fill="#ffffff" fontFamily="system-ui" fontWeight="700">Your files</text>
        <text x="791" y="108" textAnchor="middle" fontSize="14" fill="#a8bccd" fontFamily="system-ui">stay between sessions</text>
        <text x="791" y="180" textAnchor="middle" fontSize="14" fill="#a8bccd" fontFamily="system-ui">Storage in India</text>
      </svg>
    </div>
  );
}
