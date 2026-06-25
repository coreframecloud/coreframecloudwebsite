"use client";

import { InPageLink } from "@/components/ui/in-page-link";
import { trackEvent } from "@/lib/analytics";
import Link from "next/link";

export function PricingSection() {
  return (
    <section id="pricing" className="border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="cf-eyebrow">PRICING</div>
          <h2 className="mt-4 cf-section-title">Two ways to render.</h2>
          <p className="mt-5 cf-section-copy">
            Commit and save, or spin up on-demand. Every instance is the same hardware — RTX 5070 Ti, 16 GB GDDR7, hosted in Bengaluru.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">

          {/* Ad-hoc */}
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
              Ad-hoc · Pay-as-you-go
            </div>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-5xl font-bold text-white">₹400</span>
              <span className="mb-1.5 text-lg text-white/50">/ GPU-hour</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/60">
              Spin up anytime. 50 GB NVMe scratch storage per session, cleared after use — no persistent storage. Pay only for the hours you run.
            </p>

            <ul className="mt-6 space-y-2 text-sm text-white/70">
              <li className="flex gap-2"><span className="text-emerald-400">✓</span> No commitment, cancel anytime</li>
              <li className="flex gap-2"><span className="text-emerald-400">✓</span> Full Windows desktop via RDP</li>
              <li className="flex gap-2"><span className="text-emerald-400">✓</span> RTX 5070 Ti · 16 GB GDDR7</li>
              <li className="flex gap-2"><span className="text-white/30">—</span> <span className="text-white/40">No persistent storage</span></li>
            </ul>

            <div className="mt-8">
              <InPageLink
                targetId="reserve-access"
                className="cf-btn-primary w-full text-center"
                onClick={() => trackEvent("reserve_click", { location: "pricing_adhoc" })}
              >
                Get Started
              </InPageLink>
            </div>
          </div>

          {/* Committed */}
          <div className="rounded-[28px] border border-cyan-400/20 bg-cyan-400/[0.04] p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/70">
              Committed Monthly Plans
            </div>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-5xl font-bold text-white">₹250</span>
              <span className="mb-1.5 text-lg text-white/50">/ GPU-hour</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/60">
              Bundle persistent storage, render seats, and included GPU-hours at the best rate. Extra hours beyond your plan billed at ₹250/hr.
            </p>

            <ul className="mt-6 space-y-2 text-sm text-white/70">
              <li className="flex gap-2"><span className="text-cyan-400">✓</span> Persistent NAS storage (2–10 TB)</li>
              <li className="flex gap-2"><span className="text-cyan-400">✓</span> 5–25 named render seats</li>
              <li className="flex gap-2"><span className="text-cyan-400">✓</span> Included GPU-hours each month</li>
              <li className="flex gap-2"><span className="text-cyan-400">✓</span> Plans from ₹16,000/month</li>
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

        {/* BYOL note */}
        <div className="mt-8 rounded-[20px] border border-white/8 bg-white/[0.02] px-6 py-5">
          <p className="text-sm leading-6 text-white/50">
            <span className="font-semibold text-white/70">Software licences are BYOL</span> — Bring Your Own Licence.
            D5 Render, Lumion, Enscape, SolidWorks, 3ds Max, and similar apps all work on our instances.
            Named-user licences are fully supported — install your licence on the workstation and it activates against your existing seat.
            All prices exclusive of GST.
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
