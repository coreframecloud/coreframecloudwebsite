import { InPageLink } from "@/components/ui/in-page-link";

export function HeroSection() {
  return (
    <section className="border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12">

        {/* LEFT */}
        <div>
          <h1 className="text-5xl font-semibold text-white leading-tight">
            D5 Render Cloud Workstation  
            <br /> Launch RTX rendering in 2 minutes
          </h1>

          <p className="mt-6 text-white/70 text-lg">
            Run D5 Render on high-performance RTX GPUs with WDDM-enabled Windows machines.
            Upload your project, render, download results, and shut down.
          </p>

          <div className="mt-4 text-emerald-300 font-medium">
            Start rendering from ₹90/hr. No setup. No commitment.
          </div>

          <div className="mt-8 flex gap-4">
            <InPageLink targetId="reserve-access" className="cf-btn-primary">
              Reserve Access
            </InPageLink>

            <InPageLink targetId="pricing" className="cf-btn-secondary">
              View Pricing
            </InPageLink>
          </div>

          {/* SEO BLOCK */}
          <div className="mt-12 text-white/70 text-sm leading-7 max-w-xl">
            <h2 className="text-xl text-white font-semibold">
              Cloud D5 Render Workstations for Architects and 3D Designers
            </h2>

            <p className="mt-4">
              Coreframe Cloud provides ready-to-use D5 Render workstations powered by RTX GPUs.
              Launch a cloud workstation instead of upgrading your local system.
            </p>

            <p className="mt-4">
              Choose from 16GB, 20GB, 24GB, and 48GB VRAM configurations depending on your scene size.
            </p>
          </div>

          {/* 🔥 INTERNAL LINKS (NEW) */}
          <div className="mt-6 text-emerald-300 text-sm space-y-2">
            <a href="/d5-render" className="block hover:underline">
              Learn more about D5 Render cloud workstation →
            </a>

            <a href="/cloud-rendering-for-architects" className="block hover:underline">
              Cloud rendering for architects →
            </a>
          </div>
        </div>

        {/* RIGHT */}
        <div className="border border-white/10 rounded-2xl p-6">
          <h3 className="text-white text-xl font-semibold">
            D5 Render Ready Server
          </h3>

          <div className="mt-4 space-y-4 text-white/70">
            <div>16GB VRAM · RTX A4000 · ₹90/hr</div>
            <div>20GB VRAM · RTX 4000 Ada · ₹119/hr</div>
            <div>24GB VRAM · RTX A5000 · ₹155/hr</div>
            <div>48GB VRAM · RTX A6000 · ₹299/hr</div>
          </div>

          <div className="mt-6 text-xs text-white/50">
            Limited slots available
          </div>
        </div>

      </div>
    </section>
  );
}
