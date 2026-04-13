"use client";

import { InPageLink } from "@/components/ui/in-page-link";
import { trackClarityEvent, trackEvent } from "@/lib/analytics";

const d5Options = [
  { vram: "16GB", gpu: "RTX A4000", price: "₹90/hr" },
  { vram: "20GB", gpu: "RTX 4000 Ada", price: "₹119/hr" },
  { vram: "24GB", gpu: "RTX A5000", price: "₹155/hr" },
  { vram: "48GB", gpu: "RTX A6000", price: "₹299/hr" },
];

export function HeroSection() {
  return (
    <section className="border-b border-white/10">
      <div className="max-w-7xl mx-auto grid gap-16 px-6 py-24 lg:grid-cols-2">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.3em] text-emerald-300">
            D5 Render Ready Workstation
          </div>

          <h1 className="mt-6 text-5xl font-semibold leading-tight text-white">
            Launch RTX-powered
            <br />
            D5 rendering in 2 minutes
          </h1>

          <p className="mt-6 text-lg leading-8 text-white/70">
            Skip GPU upgrades. Launch a ready-to-use Windows workstation with WDDM enabled,
            run D5 Render, upload your files, render, download results, and shut down.
          </p>

          <div className="mt-6 text-lg font-medium text-emerald-300">
            Start rendering from ₹90/hr · No setup · No commitment
          </div>

          <div className="mt-10 flex gap-4">
            <InPageLink
              targetId="reserve-access"
              className="cf-btn-primary"
              onClick={() => {
                trackEvent("reserve_click", { location: "hero_primary" });
                trackClarityEvent("reserve_click_hero");
              }}
            >
              Reserve Access
            </InPageLink>

            <InPageLink
              targetId="pricing"
              className="cf-btn-secondary"
              onClick={() => {
                trackEvent("pricing_click", { location: "hero_secondary" });
                trackClarityEvent("pricing_click_hero");
              }}
            >
              View Pricing
            </InPageLink>
          </div>

          <div className="mt-10 text-sm text-white/50">
            Limited slots available · Dedicated workstation per session
          </div>

          <div className="mt-6 space-y-2 text-sm text-emerald-300">
            <a
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
            </a>
            <a
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
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
            <div className="text-xl font-semibold text-white">
              D5 Render Ready Server
            </div>

            <div className="mt-2 text-sm text-white/60">
              Choose VRAM based on your scene size
            </div>

            <div className="mt-6 space-y-4">
              {d5Options.map((item) => (
                <div
                  key={item.vram}
                  className="flex items-center justify-between border-b border-white/10 pb-3"
                >
                  <div>
                    <div className="font-medium text-white">{item.vram} VRAM</div>
                    <div className="text-xs text-white/50">{item.gpu}</div>
                  </div>

                  <div className="font-semibold text-emerald-300">
                    {item.price}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <InPageLink
                targetId="reserve-access"
                className="cf-btn-primary w-full text-center"
                onClick={() => {
                  trackEvent("reserve_click", { location: "hero_product_card" });
                  trackClarityEvent("reserve_click_product_card");
                }}
              >
                Launch Workstation
              </InPageLink>
            </div>
          </div>

          <div className="absolute inset-0 -z-10 bg-emerald-400/20 opacity-20 blur-3xl" />
        </div>
      </div>
    </section>
  );
}
