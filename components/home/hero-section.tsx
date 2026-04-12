import { InPageLink } from "@/components/ui/in-page-link";

const d5Options = [
  {
    vram: "16GB",
    gpu: "RTX A4000",
    price: "₹90/hr",
  },
  {
    vram: "20GB",
    gpu: "RTX 4000 Ada",
    price: "₹119/hr",
  },
  {
    vram: "24GB",
    gpu: "RTX A5000",
    price: "₹155/hr",
  },
  {
    vram: "48GB",
    gpu: "RTX A6000",
    price: "₹299/hr",
  },
];

export function HeroSection() {
  return (
    <section className="border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16">

        {/* LEFT SIDE */}
        <div className="max-w-2xl">

          {/* Eyebrow */}
          <div className="text-xs uppercase tracking-[0.3em] text-emerald-300">
            D5 RENDER READY WORKSTATION
          </div>

          {/* Headline */}
          <h1 className="mt-6 text-5xl font-semibold leading-tight text-white">
            Launch RTX-powered  
            <br /> D5 rendering in 2 minutes
          </h1>

          {/* Subtext */}
          <p className="mt-6 text-lg text-white/70 leading-8">
            Skip GPU upgrades. Launch a ready-to-use Windows workstation with WDDM enabled,
            run D5 Render, upload your files, render, download results, and shut down.
          </p>

          {/* Pricing anchor */}
          <div className="mt-6 text-emerald-300 text-lg font-medium">
            Start rendering from ₹90/hr · No setup · No commitment
          </div>

          {/* CTA */}
          <div className="mt-10 flex gap-4">
            <InPageLink
              targetId="reserve-access"
              className="cf-btn-primary"
            >
              Reserve Access
            </InPageLink>

            <InPageLink
              targetId="pricing"
              className="cf-btn-secondary"
            >
              View Pricing
            </InPageLink>
          </div>

          {/* Trust / conversion */}
          <div className="mt-10 text-sm text-white/50">
            Limited slots available · Dedicated workstation per session
          </div>

          {/* INTERNAL LINKS (SEO + conversion) */}
          <div className="mt-6 text-emerald-300 text-sm space-y-2">
            <a href="/d5-render" className="block hover:underline">
              Full D5 workflow →
            </a>
            <a href="/cloud-rendering-for-architects" className="block hover:underline">
              For architecture teams →
            </a>
          </div>

        </div>

        {/* RIGHT SIDE — PRODUCT CARD */}
        <div className="relative">

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">

            <div className="text-white text-xl font-semibold">
              D5 Render Ready Server
            </div>

            <div className="mt-2 text-white/60 text-sm">
              Choose VRAM based on your scene size
            </div>

            <div className="mt-6 space-y-4">

              {d5Options.map((item) => (
                <div
                  key={item.vram}
                  className="flex items-center justify-between border-b border-white/10 pb-3"
                >
                  <div>
                    <div className="text-white font-medium">
                      {item.vram} VRAM
                    </div>
                    <div className="text-xs text-white/50">
                      {item.gpu}
                    </div>
                  </div>

                  <div className="text-emerald-300 font-semibold">
                    {item.price}
                  </div>
                </div>
              ))}

            </div>

            {/* CTA inside card */}
            <div className="mt-8">
              <InPageLink
                targetId="reserve-access"
                className="cf-btn-primary w-full text-center"
              >
                Launch Workstation
              </InPageLink>
            </div>

          </div>

          {/* subtle glow */}
          <div className="absolute -z-10 inset-0 blur-3xl opacity-20 bg-emerald-400/20" />

        </div>

      </div>
    </section>
  );
}
