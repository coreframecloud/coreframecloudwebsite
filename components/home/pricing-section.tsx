"use client";

import { NODE } from "@/lib/node-spec";
import { trackEvent } from "@/lib/analytics";
import Link from "next/link";
import { STORAGE, type StorageTerms } from "@/lib/storage-terms";
import { hoursLabel, rupees, type IntroOffer } from "@/lib/rate-card";
import { formatMoney, type Currency, type UsdRateCard } from "@/lib/money";

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
  intro = null,
  effectiveFrom = null,
  currency = "INR",
  usdTopup = null,
}: {
  /** "USD" for a visitor outside India (display only, see proxy.ts): no GST,
   *  dollar prices for plans and storage (everything is global, 15 Oct 2026). */
  currency?: Currency;
  /** Wallet top-up terms for the USD view, from the rate card's `usd` block. */
  usdTopup?: Pick<UsdRateCard, "topup_min_first" | "topup_max" | "bulk_topup_tiers"> | null;
  /** Lowest effective rate per included plan hour, from the rate card. */
  effectiveFrom?: { rupees: number; planName: string; storageFree?: boolean } | null;
  /** The first-top-up offer from the rate card, or null to say nothing. */
  intro?: IntroOffer | null;
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
  const usdView = currency === "USD";
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
                {example ? `, so a ${example.minutes}-minute session costs ${example.cost}` : ""}
              </p>
            ) : null}
            <p className="mt-4 text-sm leading-6 text-ink-2">No contract. {billingNote}</p>

            <ul className="mt-6 space-y-2 text-sm text-ink-2">
              {usdView && usdTopup && (
                <li className="flex gap-2"><span className="text-blue">✓</span> <span><b className="text-ink">Top up from {formatMoney(usdTopup.topup_min_first, "USD")} to {formatMoney(usdTopup.topup_max, "USD")}</b>{usdTopup.bulk_topup_tiers.length ? ` · ${usdTopup.bulk_topup_tiers.map((t) => `${formatMoney(t.min, "USD")}+ adds ${t.percent}%`).join(", ")}` : ""}</span></li>
              )}
              {intro && (
                <li className="flex gap-2"><span className="text-blue">✓</span> <span><b className="text-ink">First top-up: {rupees(intro.priceRupees)} = {hoursLabel(intro.hours)}</b>{intro.validityDays ? ` · use within ${intro.validityDays} days` : ""}</span></li>
              )}
              <li className="flex gap-2"><span className="text-blue">✓</span> Email and mobile sign-up, no paperwork</li>
              <li className="flex gap-2"><span className="text-blue">✓</span> {NODE.gpu} · {NODE.vram} · {NODE.stream}</li>
              <li className="flex gap-2"><span className="text-blue">✓</span> {storage.paidGb} GB of your own storage, kept between sessions</li>
            </ul>

            <div className="mt-8">
              <Link
                href="/signup"
                className="cf-btn-primary w-full text-center block"
                onClick={() => trackEvent("signup_click", { location: "pricing_adhoc" })}
              >
                Sign up
              </Link>
            </div>
          </div>

          {/* Committed */}
          <div className="rounded-[28px] border border-blue/20 bg-blue/[0.04] p-8">
            <div className="cf-eyebrow">
              Committed monthly plans
            </div>
            {usdView ? (
              bestOverage ? (
                <Price value={bestOverage} unit="/ GPU-hour" />
              ) : (
                <p className="mt-4 text-sm leading-6 text-ink-2">
                  Billed in US dollars, with no GST. Ask us for the plan prices.
                </p>
              )
            ) : effectiveFrom ? (
              <Price value={`≈ ₹${Math.round(effectiveFrom.rupees).toLocaleString("en-IN")}`} unit="/ hour" />
            ) : (
              <Price value={bestOverage} unit="/ GPU-hour" />
            )}
            {!usdView && effectiveFrom ? (
              <p className="mt-2 text-sm text-blue">
                per included hour on {effectiveFrom.planName},{" "}
                {effectiveFrom.storageFree ? "shared storage included, free" : "plus shared storage"}
                {adhocRate ? ` · pay as you go is ${adhocRate}/hr` : ""}
              </p>
            ) : null}
            <p className="mt-4 text-sm leading-6 text-ink-2">
              {/* The claim is conditional on it being TRUE, not on both numbers
                  existing. Cut the ad-hoc rate far enough and every tier inverts
                  — the API refuses to publish those, and this refuses to assert
                  it. When it does not hold, the plans still have a real pitch;
                  it just is not "cheaper per hour". */}
              {!usdView && commitmentCheaper && adhocRate ? `Cheaper per hour than ${adhocRate} pay-as-you-go. ` : ""}
              For studios: shared hours, shared cloud storage and a login for each person.
            </p>

            <ul className="mt-6 space-y-2 text-sm text-ink-2">
              <li className="flex gap-2"><span className="text-blue">✓</span> 2 to 10 TB of shared cloud storage</li>
              <li className="flex gap-2"><span className="text-blue">✓</span> 5 to 25 team logins</li>
              <li className="flex gap-2"><span className="text-blue">✓</span> Hours included every month</li>
              {entryPlanFee ? <li className="flex gap-2"><span className="text-blue">✓</span> Plans from {entryPlanFee}/month</li> : null}
            </ul>

            <div className="mt-8">
              <Link
                href="/enterprise"
                className="cf-btn-primary w-full text-center block"
                onClick={() => trackEvent("enterprise_click", { location: "pricing_committed" })}
              >
                See team plans →
              </Link>
            </div>
          </div>
        </div>

        {/* Storage add-on — available on any plan, including ad-hoc */}
        <div className="mt-6 rounded-[24px] border border-rule bg-paper-2 px-6 py-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <div className="cf-eyebrow">
              Add-on · More storage
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-2">
              Add storage to any account. Your files stay while the subscription is active.
            </p>
          </div>
          <div className="mt-4 shrink-0 sm:mt-0 sm:text-right">
            <div className="text-3xl font-bold text-ink">{storageRate ?? "—"}</div>
            <div className="text-sm text-ink-2">/ TB / month{usdView ? ", no GST" : ""}</div>
          </div>
        </div>

        {/* Licences and GST, as chips */}
        <div className="mt-6 flex flex-wrap gap-2.5 text-[13.5px]">
          {(usdView
            ? ["Prices in US dollars", "No GST: export of services", "Invoice in US dollars", "D5, Blender, Twinmotion installed", "Your own licence for paid apps like Lumion"]
            : ["GST included in every price", "Tax invoice with the GST split", "D5, Blender, Twinmotion installed", "Your own licence for paid apps like Lumion"]
          ).map((c) => (
            <span key={c} className="rounded-full bg-tint-blue px-3.5 py-2 text-ink-2">{c}</span>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/signup"
            className="cf-btn-primary"
            onClick={() => trackEvent("signup_click", { location: "pricing_section_bottom" })}
          >
            Sign up
          </Link>
          <Link href="/enterprise" className="cf-btn-secondary" onClick={() => trackEvent("enterprise_click", { location: "pricing_bottom" })}>
            Compare plans
          </Link>
        </div>
      </div>
    </section>
  );
}
