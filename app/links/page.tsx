/**
 * The one link in the Instagram bio.
 *
 * Kept as a SERVER component. It exports `metadata`, which a client component
 * may not do, and the price and the trial below are read from the live rate
 * card — the same rule as every other page on this site. The draft version of
 * this file used inline `onMouseOver`/`onMouseOut` handlers, which a server
 * component cannot pass ("Event handlers cannot be passed to Client Component
 * props") and which would have failed the build outright.
 *
 * PHONE FIRST, AND LITERALLY SO. Every visitor arrives by tapping a bio link
 * inside the Instagram in-app browser, one-handed, on a 390px screen. So: one
 * column, one tap target per row, 64px minimum on each, 16px body type that
 * iOS will not offer to zoom, and no hover state that carries meaning. The
 * hover and focus rings are Tailwind classes rather than an inline <style>
 * block, so they are plain CSS and work before hydration.
 *
 * It was a dark page with hand-written hex colours sitting between the light
 * site header and the light site footer, which the root layout renders on this
 * route like any other. It now uses the same tokens as the rest of the site.
 */

import type { Metadata } from "next";
import { COMPANY } from "@/lib/company";
import { NODE, NODE_SUMMARY } from "@/lib/node-spec";
import { getRateCard, adhocRate, billingSentence, getTrialTerms } from "@/lib/rate-card";

export const metadata: Metadata = {
  title: "Coreframe Cloud — Links",
  // NO PRICE and NO TRIAL TERMS in the metadata. A description is cached by
  // search engines and quoted by answer engines for months, and it is the one
  // string on the page that cannot read the live rate card without making
  // metadata generation do a network call. The draft carried "₹399/hr" here,
  // twice, while billing had been ₹299 for days — and an unconditional "free
  // trial" here would outlive the day the trial is switched off.
  description:
    `${NODE.gpu} GPU workstations for architects and creative studios. Billed per minute, GST included. Hosted in ${NODE.location}.`,
  alternates: { canonical: "/links" },
  openGraph: {
    title: "Coreframe Cloud",
    description: `GPU workstations for architects. ${NODE.gpu}, billed per minute, hosted in ${NODE.location}.`,
    url: "https://www.coreframecloud.com/links",
    siteName: "Coreframe Cloud",
    // public/og-image.png does not exist — the draft pointed at it, which would
    // have shipped a broken preview card on exactly the surface that matters
    // most here: the WhatsApp and Instagram share sheet.
    images: [{ url: "https://www.coreframecloud.com/logo-horizontal.png", width: 1200, height: 630 }],
  },
};

type BioLink = {
  /** The tap target's own sentence. Kept short enough to hold two lines at 390px. */
  label: string;
  /** The fact underneath it. This is where the detail goes, not in the label. */
  note: string;
  href: string;
  primary?: boolean;
};

/**
 * Every href is a route that exists. The draft pointed at /cfd and /pricing,
 * neither of which was a route at the time; /pricing is a real page now and
 * /ansys-cfd-gpu is the CFD page. Two of the five links in the Instagram bio
 * would have 404'd.
 *
 * /tools is real but is NOT a Next route — next.config.ts rewrites it to the
 * control plane. It resolves; do not "fix" it by pointing somewhere else.
 */
function bioLinks(rate: string | null, trialMinutes: number | null): BioLink[] {
  return [
    {
      // The minutes are live or they are absent. Never a number the platform
      // will not grant — the person finds out after handing over an Aadhaar.
      label: trialMinutes ? `Start free. ${trialMinutes} GPU minutes, no card.` : "Create an account.",
      note: trialMinutes
        ? "An email address is the whole sign-up. The minutes are credited once your ID check clears."
        : "An email address is the whole sign-up. Add credit when you need a machine.",
      href: "https://www.coreframecloud.com/?utm_source=instagram&utm_medium=bio&utm_content=start_free",
      primary: true,
    },
    {
      // The rate is live or it is absent. Never a number billing does not charge.
      label: rate ? `See the rate. ${rate} an hour.` : "See what an hour costs.",
      note: "Pay by the minute when you need a machine for an afternoon, or commit monthly if you are on it every week.",
      // Query BEFORE the fragment. `/#pricing?utm_source=...` puts the whole
      // query string inside the fragment, where it never reaches analytics —
      // the link still works, so the tracking silently measures nothing.
      href: "https://www.coreframecloud.com/pricing?utm_source=instagram&utm_medium=bio&utm_content=pricing",
    },
    {
      label: "Check an IFC file before you convert it.",
      note: "Free, no signup. It names the doors that lost their openings, the spaces that went missing and the wrong units.",
      href: "https://www.coreframecloud.com/tools?utm_source=instagram&utm_medium=bio&utm_content=ifc_tool",
    },
    {
      label: "Run CFD on a GPU.",
      note: "You bring the solver licence. We size the machine for your mesh and say so before you book.",
      href: "https://www.coreframecloud.com/ansys-cfd-gpu?utm_source=instagram&utm_medium=bio&utm_content=cfd",
    },
    {
      label: "Ask us something on WhatsApp.",
      note: "A file that will not open, a deadline this week, what a month of this costs.",
      href: `${COMPANY.whatsapp}?text=Hi%2C+I+saw+your+Instagram+and+want+to+know+more+about+Coreframe+Cloud.`,
    },
  ];
}

export default async function LinksPage() {
  const card = await getRateCard();
  const rate = adhocRate(card);
  const trial = getTrialTerms(card);

  return (
    <main className="bg-paper">
      <section className="cf-section px-5">
        {/* Narrower than cf-col on purpose. This is a phone page; 460px keeps
            the line length short on a tablet instead of stretching five tap
            targets across a 680px measure. */}
        <div className="mx-auto w-full max-w-[460px]">
          <p className="cf-eyebrow">Coreframe Cloud</p>

          <h1 className="cf-display mt-3">A render machine you rent by the minute.</h1>

          <p className="cf-lead mt-4">
            One {NODE.gpu} workstation in {NODE.location}, streamed at {NODE.stream} to the
            laptop you already own. Start it when a deadline lands. Stop it when the render is
            done.
          </p>

          <p className="mt-5 font-mono text-[12.5px] leading-[1.7] break-words text-ink-3">
            {NODE_SUMMARY}
          </p>

          {rate ? (
            <p className="mt-1 font-mono text-[12.5px] leading-[1.7] break-words text-ink-2">
              {rate} an hour{card?.prices_include_gst ? ", GST included" : ""}
            </p>
          ) : null}

          {/* One column. Never two. A row of side-by-side links on a 390px
              screen gives you two 165px targets and a mis-tap. */}
          <div className="mt-8 flex flex-col gap-3.5">
            {bioLinks(rate, trial?.gpu_minutes ?? null).map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  "flex min-h-[64px] w-full items-center gap-4 rounded-cf px-5 py-4 transition-colors " +
                  "focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-blue " +
                  (link.primary
                    ? "bg-blue text-white hover:bg-blue-ink"
                    : "border border-rule bg-paper-2 text-ink hover:bg-paper")
                }
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-base leading-[1.35] font-semibold break-words">
                    {link.label}
                  </span>
                  <span
                    className={
                      "mt-1 block text-sm leading-[1.45] break-words " +
                      (link.primary ? "text-white/80" : "text-ink-2")
                    }
                  >
                    {link.note}
                  </span>
                </span>
                <span
                  aria-hidden
                  className={"shrink-0 text-lg leading-none " + (link.primary ? "text-white/70" : "text-ink-3")}
                >
                  &rarr;
                </span>
              </a>
            ))}
          </div>

          {/* One honest line about how billing works, from the rate card itself. */}
          <p className="mt-7 text-sm leading-[1.6] text-ink-2">{billingSentence(card)}</p>

          <p className="mt-7 border-t border-rule pt-5 font-mono text-[11.5px] leading-none tracking-[0.16em] text-ink-3 uppercase">
            {NODE.location}
          </p>
        </div>
      </section>
    </main>
  );
}
