/**
 * Homepage hero — the "what is this, actually" version.
 *
 * WHY THIS REPLACED THE OLD HERO. Customers told us they did not understand the
 * concept. The previous hero led with speed ("5× faster rendering"), which only
 * lands if you already know what the product IS. This one leads with the trade
 * everyone in the market already understands — a workstation costs ₹5 lakh and
 * sits idle — and then says what you get instead.
 *
 * NOTHING HERE IS HARDCODED THAT BILLING CAN CHANGE. The hourly rate and the
 * trial come in as props from the live rate card, same rule as the old
 * PricingSection: the homepage must never advertise a number billing does not
 * charge. If the rate card is unreachable the price simply is not shown, rather
 * than a stale figure being printed.
 */

import Link from "next/link";
import type { TrialTerms } from "@/lib/rate-card";

const HARDWARE_COST = "₹5,00,000";

export function ExplainerHero({
  adhocRate,
  trial,
}: {
  adhocRate?: string;
  trial: TrialTerms | null;
}) {
  const trialMinutes = trial?.gpu_minutes;

  return (
    <section className="relative mx-auto max-w-7xl px-4 pt-16 pb-14 sm:px-6 sm:pt-24 lg:px-8">
      <div className="flex flex-col items-center text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">GPU workstations, by the hour</p>

        <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-6xl lg:text-7xl">
          A {HARDWARE_COST} workstation.
          <br />
          <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
            {adhocRate ? `${adhocRate} an hour.` : "Rented by the hour."}
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
          Coreframe gives your team a full Windows workstation with an RTX 5080 in
          it — running in a data centre in Bengaluru, reachable from whatever
          laptop they already own. D5 Render, Lumion, Enscape, Twinmotion, 3ds Max
          and Blender are already installed.
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
          <p className="mt-4 text-sm text-white/55">No card required. Nothing to cancel.</p>
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
            href="/studio"
            className="group inline-flex flex-col gap-1 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-4 text-left transition hover:border-white/30 hover:bg-white/[0.07]"
          >
            <span className="text-sm font-semibold text-white">
              Just need a picture of a floor plan?{" "}
              <span className="text-[#2D7FF9] group-hover:underline">
                Try Coreframe Studio →
              </span>
            </span>
            <span className="text-sm text-white/55">
              Upload a DXF, pick a room, get an interior in seconds. ₹99 to
              start. No installer, no KYC.
            </span>
          </Link>
        </div>

        <ul className="mt-10 flex flex-wrap justify-center gap-2.5">
          {[
            "RTX 5080 · 16 GB GDDR7",
            "Dedicated 1 Gbps link",
            "Hosted in Bengaluru",
            "Per-minute billing",
          ].map((chip, i) => (
            <li
              key={chip}
              className="inline-flex items-center gap-2.5 rounded-full border border-cyan-300/25 bg-white/[0.04] px-4 py-2 text-sm text-white/85"
            >
              {i === 0 ? (
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
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
    <div className="mt-14 w-full max-w-4xl rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-8">
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
