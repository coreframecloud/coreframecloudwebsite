"use client";

import { InPageLink } from "@/components/ui/in-page-link";
import { trackClarityEvent, trackEvent } from "@/lib/analytics";
import Link from "next/link";

const gpuSpecs = [
  { label: "GPU", value: "RTX 5070 Ti" },
  { label: "VRAM", value: "16 GB GDDR7" },
  { label: "System RAM", value: "64 GB ECC" },
  { label: "vCPU", value: "6-core EPYC" },
  { label: "Storage", value: "Persistent NAS" },
];

export function HeroSection() {
  return (
    <section className="border-b border-white/10">
      <div className="max-w-7xl mx-auto grid gap-8 px-6 py-12 lg:grid-cols-2 lg:gap-12 lg:py-16">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.3em] text-emerald-300">
            Managed GPU Cloud · India
          </div>

          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            5× faster rendering.
            <br />
            CFD in hours, not days.
          </h1>

          <p className="mt-4 text-base leading-7 text-white/70">
            Tired of waiting overnight for a render to finish? Or a CFD job that runs for three
            days on your workstation? Coreframe puts RTX 5070 Ti and H100 GPU power in your
            hands — on demand, pay per hour, no hardware to buy.
          </p>

          <div className="mt-3 text-sm font-medium text-emerald-300">
            3D Rendering from ₹400/hr · CFD per job · No setup · Data in India
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="cf-btn-primary"
              onClick={() => {
                trackEvent("signup_click", { location: "hero_primary" });
                trackClarityEvent("signup_click_hero");
              }}
            >
              Get started
            </Link>

            <InPageLink
              targetId="pricing"
              className="cf-btn-secondary"
              onClick={() => {
                trackEvent("pricing_click", { location: "hero_secondary" });
                trackClarityEvent("pricing_click_hero");
              }}
            >
              View pricing
            </InPageLink>
          </div>

          <div className="mt-4 text-xs text-white/40">
            Limited slots available · Dedicated workstation per session
          </div>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-emerald-300">
            <Link
              href="/d5-render"
              className="block hover:underline"
              onClick={() => {
                trackEvent("internal_link_click", {
                  location: "hero",
                  target: "/d5-render",
                });
                trackClarityEvent("internal_link_d5_hero");
              }}
            >
              Full D5 workflow →
            </Link>
            <Link
              href="/cloud-rendering-for-architects"
              className="block hover:underline"
              onClick={() => {
                trackEvent("internal_link_click", {
                  location: "hero",
                  target: "/cloud-rendering-for-architects",
                });
                trackClarityEvent("internal_link_architects_hero");
              }}
            >
              For architecture teams →
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
              Every GPU Instance
            </div>
            <div className="mt-2 text-xl font-bold text-white">RTX 5070 Ti</div>
            <div className="mt-0.5 text-xs text-emerald-300">Consumer RTX · Not available on any other cloud</div>

            <div className="mt-6 space-y-3">
              {gpuSpecs.map((item) => (
                <div key={item.label} className="flex items-center justify-between border-b border-white/8 pb-3 last:border-b-0">
                  <div className="text-sm text-white/50">{item.label}</div>
                  <div className="text-sm font-medium text-white">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Ad-hoc</div>
                <div className="text-2xl font-bold text-emerald-300">₹400</div>
                <div className="text-xs text-white/40">/ GPU-hour</div>
              </div>
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05] p-4 text-center">
                <div className="text-xs text-cyan-300/70 uppercase tracking-wider mb-1">Committed</div>
                <div className="text-2xl font-bold text-cyan-300">₹250</div>
                <div className="text-xs text-cyan-300/50">/ GPU-hour</div>
              </div>
            </div>

            <div className="mt-6">
              <InPageLink
                targetId="reserve-access"
                className="cf-btn-primary w-full text-center"
                onClick={() => {
                  trackEvent("reserve_click", { location: "hero_product_card" });
                  trackClarityEvent("reserve_click_product_card");
                }}
              >
                Get Started
              </InPageLink>
            </div>
          </div>

          <div className="absolute inset-0 -z-10 bg-emerald-400/20 opacity-20 blur-3xl" />
        </div>
      </div>
    </section>
  );
}
