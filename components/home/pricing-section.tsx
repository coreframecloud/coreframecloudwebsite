"use client";

import { InPageLink } from "@/components/ui/in-page-link";
import { trackEvent } from "@/lib/analytics";
import Link from "next/link";

/**
 * `adhocRate` is the live pay-as-you-go price from the control-plane rate card,
 * passed down by the page (a server component). Set it in the admin Rate Card
 * panel; this page follows within the hour.
 *
 * It falls back to the entry rate string only when the control plane is
 * unreachable at build time. That fallback is the last hardcoded price on this
 * page — every other GPU price now comes from the database.
 *
 * NOT yet database-driven: the committed monthly plans below. Those tiers
 * (storage, seats, included hours, tapering extra-hour rates) have no model in
 * the control plane at all, so they cannot be served from it. They need either
 * a plans table or removal — see docs.
 */
export function PricingSection({ adhocRate }: { adhocRate?: string }) {
  return (
    <section id="pricing" className="border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="max-w-3xl">
          <div className="cf-eyebrow">PRICING</div>
          <h2 className="mt-4 cf-section-title">Two ways to render.</h2>
          <p className="mt-5 cf-section-copy">
            Commit and save, or spin up on-demand. Every instance is the same hardware — RTX 5080, 16 GB GDDR7, hosted in Bengaluru.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">

          {/* Ad-hoc */}
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
              Ad-hoc · Pay-as-you-go
            </div>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-5xl font-bold text-white">{adhocRate ?? "—"}</span>
              <span className="mb-1.5 text-lg text-white/50">/ GPU-hour</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/60">
              Spin up anytime, no contract. Billed per minute from the moment your
              session starts streaming — provisioning, uploads and failed connects
              are all free. Best for one-off renders or trying the platform before
              committing.
            </p>

            <ul className="mt-6 space-y-2 text-sm text-white/70">
              <li className="flex gap-2"><span className="text-emerald-400">✓</span> No commitment, cancel anytime</li>
              <li className="flex gap-2"><span className="text-emerald-400">✓</span> Full Windows desktop via RDP</li>
              <li className="flex gap-2"><span className="text-emerald-400">✓</span> RTX 5080 · 16 GB GDDR7</li>
              <li className="flex gap-2"><span className="text-white/30">—</span> <span className="text-white/40">Session scratch storage only, 7-day retention — download outputs before shutting down</span></li>
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
          <div className="rounded-[28px] border border-cyan-400/20 bg-cyan-400/[0.04] p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/70">
              Committed Monthly Plans
            </div>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-5xl font-bold text-white">₹339</span>
              <span className="mb-1.5 text-lg text-white/50">/ GPU-hour</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/60">
              Committing is genuinely cheaper per hour — every tier costs less than the ₹399 ad-hoc
              rate, not more. Extra hours are ₹379/hr on Studio, ₹359/hr on Medium Firm, and ₹339/hr
              on Big Firm. Persistent storage is billed openly at ₹1,999/TB/month, a rate you can
              compare line-for-line with AWS S3.
            </p>

            <ul className="mt-6 space-y-2 text-sm text-white/70">
              <li className="flex gap-2"><span className="text-cyan-400">✓</span> Persistent NAS storage (2–10 TB included)</li>
              <li className="flex gap-2"><span className="text-cyan-400">✓</span> 5–25 named render seats</li>
              <li className="flex gap-2"><span className="text-cyan-400">✓</span> Included GPU-hours each month</li>
              <li className="flex gap-2"><span className="text-cyan-400">✓</span> Plans from ₹19,000/month</li>
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
        <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.03] px-6 py-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
              Add-on · Persistent NAS storage
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
              Need your project files to outlive the session? Add persistent NAS storage to any
              account — ad-hoc or committed. Your data is retained for as long as the storage
              subscription is active.
            </p>
          </div>
          <div className="mt-4 shrink-0 sm:mt-0 sm:text-right">
            <div className="text-3xl font-bold text-white">₹1,999</div>
            <div className="text-sm text-white/50">/ TB / month</div>
          </div>
        </div>

        {/* BYOL note */}
        <div className="mt-6 rounded-[20px] border border-white/8 bg-white/[0.02] px-6 py-5">
          <p className="text-sm leading-6 text-white/50">
            <span className="font-semibold text-white/70">Software licences are BYOL</span> — Bring Your Own Licence.
            D5 Render, Lumion, Enscape, SolidWorks, 3ds Max, and similar apps all work on our instances.
            Named-user licences are fully supported — install your licence on the workstation and it activates against your existing seat.
            <span className="font-semibold text-white/70"> All prices include GST.</span> What you see is what you pay —
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
