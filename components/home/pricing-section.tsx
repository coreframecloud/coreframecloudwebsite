"use client";

import { InPageLink } from "@/components/ui/in-page-link";
import { NODE } from "@/lib/node-spec";
import { trackEvent } from "@/lib/analytics";
import Link from "next/link";
import { STORAGE, type StorageTerms } from "@/lib/storage-terms";

/**
 * Every price on this section now comes from the control-plane rate card, via
 * props from the page (a server component). Nothing here is typed by hand.
 *
 * That was not true until 18 Aug 2026: the ad-hoc rate was live, but the tier
 * headline (₹339), the three overage rates, the entry plan fee (₹19,000) and
 * the storage rate (₹1,999) were all inline — so changing a plan in the admin
 * panel updated the enterprise page's source of truth and left this block
 * quoting the old numbers next to a live one. A price that is right in one card
 * and stale in the card beside it is worse than either alone, because the
 * customer cannot tell which to believe.
 *
 * Anything null renders as nothing rather than as a fallback. See the note at
 * the top of lib/rate-card.ts for why a stale price is worse than no price.
 */
/**
 * What to show where a price goes when the rate card could not be reached.
 *
 * It used to be `{rate ?? "—"}` inside a text-5xl font-bold span, which renders
 * an em dash at 48px as a solid black bar — it reads as a redaction, not as an
 * absence. And it only ever appears when the control plane is unreachable,
 * which is precisely the moment the pricing page must not look broken.
 *
 * Saying nothing is still right; saying it quietly is better than a black bar.
 */
function Price({ value, unit }: { value?: string | null; unit: string }) {
  if (!value) {
    return (
      <p className="mt-4 text-sm leading-6 text-ink-2">
        Live pricing is briefly unavailable. Email{" "}
        <a
          href="mailto:admin@coreframecloud.com"
          className="text-blue underline underline-offset-4"
        >
          admin@coreframecloud.com
        </a>{" "}
        and we will send the current rate card.
      </p>
    );
  }
  return (
    <div className="mt-4 flex items-end gap-2">
      <span className="text-5xl font-bold text-ink">{value}</span>
      <span className="mb-1.5 text-lg text-ink-2">{unit}</span>
    </div>
  );
}

export function PricingSection({
  adhocRate,
  storage = STORAGE,
  billingNote,
  bestOverage,
  entryPlanFee,
  storageRate,
  perMinute,
  example,
  commitmentCheaper = false,
}: {
  adhocRate?: string;
  storage?: StorageTerms;
  billingNote: string;
  bestOverage?: string | null;
  entryPlanFee?: string | null;
  storageRate?: string | null;
  perMinute?: string | null;
  example?: { minutes: number; cost: string } | null;
  /** Whether committing is ACTUALLY cheaper on both the overage rate and the
   *  cost of an included hour. Never assert it without this — the claim used to
   *  render whenever both numbers merely existed. */
  commitmentCheaper?: boolean;
}) {
  return (
    <section id="pricing" className="border-b border-rule">
      <div className="cf-wide px-5 py-10 lg:py-14">
        {/* NO HEADER HERE. This component used to carry its own "PRICING /
            Two ways to render." because it lived three-quarters of the way
            down the homepage and needed to announce itself. It is now the body
            of /pricing, which has its own h1 — so the header rendered twice,
            two eyebrows and two headings stacked. The page owns the heading;
            this owns the cards. */}

        <div className="mt-12 grid gap-6 lg:grid-cols-2">

          {/* Ad-hoc */}
          <div className="rounded-[28px] border border-rule bg-paper-2 p-8">
            <div className="cf-eyebrow">
              Ad-hoc · Pay-as-you-go
            </div>
            <Price value={adhocRate} unit="/ GPU-hour" />
            {/* Per hour is the headline because that is the unit every
                alternative quotes, and a buyer who has to convert units to
                compare assumes the conversion is the point. Per minute goes
                here, as the mechanism — with a worked example, because "billed
                per minute" is abstract and "₹100" is not. */}
            {perMinute ? (
              <p className="mt-2 text-sm text-blue">
                {perMinute} a minute
                {example ? ` — a ${example.minutes}-minute session costs ${example.cost}` : ""}
              </p>
            ) : null}
            <p className="mt-4 text-sm leading-6 text-ink-2">
              Spin up anytime, no contract. {billingNote} Best for one-off renders
              or trying the platform before committing.
            </p>

            <ul className="mt-6 space-y-2 text-sm text-ink-2">
              <li className="flex gap-2"><span className="text-blue">✓</span> No commitment, cancel anytime</li>
              <li className="flex gap-2"><span className="text-blue">✓</span> {NODE.os}, streamed at {NODE.stream} in the Connect app</li>
              <li className="flex gap-2"><span className="text-blue">✓</span> {NODE.gpu} · {NODE.vram}</li>
              <li className="flex gap-2"><span className="text-blue">✓</span> <span className="text-ink-3">{storage.trialGb} GB persistent storage free, {storage.paidGb} GB with credit · kept {storage.retentionDays} days · session scratch cleared at session end</span></li>
            </ul>

            <div className="mt-8">
              <Link
                href="/signup"
                className="cf-btn-primary w-full text-center block"
                onClick={() => trackEvent("signup_click", { location: "pricing_adhoc" })}
              >
                Get started
              </Link>
            </div>
          </div>

          {/* Committed */}
          <div className="rounded-[28px] border border-blue/20 bg-blue/[0.04] p-8">
            <div className="cf-eyebrow">
              Committed Monthly Plans
            </div>
            <Price value={bestOverage} unit="/ GPU-hour" />
            <p className="mt-4 text-sm leading-6 text-ink-2">
              {/* The claim is conditional on it being TRUE, not on both numbers
                  existing. Cut the ad-hoc rate far enough and every tier inverts
                  — the API refuses to publish those, and this refuses to assert
                  it. When it does not hold, the plans still have a real pitch;
                  it just is not "cheaper per hour". */}
              {commitmentCheaper && adhocRate
                ? `Committing is genuinely cheaper per hour — every tier bills below the ${adhocRate} ad-hoc rate, on included hours and extra ones alike. `
                : ""}
              Included hours, named seats and NAS storage come with the monthly fee.
              {storageRate ? ` Extra persistent storage is billed openly at ${storageRate}/TB/month, with no egress charge — pulling your own files back costs nothing.` : ""}
            </p>

            <ul className="mt-6 space-y-2 text-sm text-ink-2">
              <li className="flex gap-2"><span className="text-blue">✓</span> Persistent NAS storage (2–10 TB included)</li>
              <li className="flex gap-2"><span className="text-blue">✓</span> 5–25 named render seats</li>
              <li className="flex gap-2"><span className="text-blue">✓</span> Included GPU-hours each month</li>
              {entryPlanFee ? <li className="flex gap-2"><span className="text-blue">✓</span> Plans from {entryPlanFee}/month</li> : null}
            </ul>

            <div className="mt-8">
              <Link
                href="/enterprise"
                className="cf-btn-primary w-full text-center block"
                onClick={() => trackEvent("enterprise_click", { location: "pricing_committed" })}
              >
                See Committed Plans →
              </Link>
            </div>
          </div>
        </div>

        {/* Storage add-on — available on any plan, including ad-hoc */}
        <div className="mt-6 rounded-[24px] border border-rule bg-paper-2 px-6 py-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <div className="cf-eyebrow">
              Add-on · Persistent NAS storage
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-2">
              Need your project files to outlive the session? Add persistent NAS storage to any
              account — ad-hoc or committed. Your data is retained for as long as the storage
              subscription is active.
            </p>
          </div>
          <div className="mt-4 shrink-0 sm:mt-0 sm:text-right">
            <div className="text-3xl font-bold text-ink">{storageRate ?? "—"}</div>
            <div className="text-sm text-ink-2">/ TB / month</div>
          </div>
        </div>

        {/* BYOL note */}
        <div className="mt-6 rounded-[20px] border border-rule bg-paper-2 px-6 py-5">
          <p className="text-sm leading-6 text-ink-2">
            <span className="font-semibold text-ink-2">Software licences are BYOL</span> — Bring Your Own Licence.
            D5 Render, Lumion, Enscape, SolidWorks, 3ds Max, and similar apps all work on our instances.
            Named-user licences are fully supported — install your licence on the workstation and it activates against your existing seat.
            <span className="font-semibold text-ink-2"> All prices include GST.</span> What you see is what you pay —
            an 18% GST component is inside every rate, and business customers get a full tax invoice showing the split.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <InPageLink
            targetId="reserve-access"
            className="cf-btn-primary"
            onClick={() => trackEvent("reserve_click", { location: "pricing_section_bottom" })}
          >
            Reserve Access
          </InPageLink>
          <Link href="/enterprise" className="cf-btn-secondary" onClick={() => trackEvent("enterprise_click", { location: "pricing_bottom" })}>
            Compare plans
          </Link>
        </div>
      </div>
    </section>
  );
}
