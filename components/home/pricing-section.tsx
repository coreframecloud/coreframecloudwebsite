import { InPageLink } from "@/components/ui/in-page-link";

export function PricingSection() {
  return (
    <section id="pricing" className="border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-20">

        <h2 className="text-3xl font-semibold text-white">
          D5 Render Workstation Pricing
        </h2>

        <div className="mt-8 space-y-4 text-white/70">

          <div className="flex justify-between border-b border-white/10 pb-4">
            <span>16GB VRAM · RTX A4000</span>
            <span>₹90/hr</span>
          </div>

          <div className="flex justify-between border-b border-white/10 pb-4">
            <span>20GB VRAM · RTX 4000 Ada</span>
            <span>₹119/hr</span>
          </div>

          <div className="flex justify-between border-b border-white/10 pb-4">
            <span>24GB VRAM · RTX A5000</span>
            <span>₹155/hr</span>
          </div>

          <div className="flex justify-between border-b border-white/10 pb-4">
            <span>48GB VRAM · RTX A6000</span>
            <span>₹299/hr</span>
          </div>

        </div>

        {/* 🔥 INTERNAL LINK (NEW) */}
        <div className="mt-10">
          <a href="/d5-render" className="text-emerald-300 hover:underline">
            Explore full D5 render workstation →
          </a>
        </div>

        <div className="mt-6">
          <InPageLink targetId="reserve-access" className="cf-btn-primary">
            Reserve Access
          </InPageLink>
        </div>

      </div>
    </section>
  );
}
