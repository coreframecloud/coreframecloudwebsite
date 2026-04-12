import { InPageLink } from "@/components/ui/in-page-link";

const pricingRows = [
  {
    option: "16GB VRAM",
    spec: "RTX A4000 · 64GB RAM · 16 vCPU · ~4.0 GHz",
    price: "₹90 / hr",
  },
  {
    option: "20GB VRAM",
    spec: "RTX 4000 Ada · 64GB RAM · 32 vCPU · ~4.0 GHz",
    price: "₹119 / hr",
  },
  {
    option: "24GB VRAM",
    spec: "RTX A5000 · 64GB RAM · 16 vCPU · ~4.0 GHz",
    price: "₹155 / hr",
  },
  {
    option: "48GB VRAM",
    spec: "RTX A6000 · 64GB RAM · 32 vCPU · ~4.0 GHz",
    price: "₹299 / hr",
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="cf-eyebrow">PRICING</div>

          <h2 className="mt-4 cf-section-title">
            D5 Render Ready Server Pricing
          </h2>

          <p className="mt-5 cf-section-copy">
            One product, four workstation profiles. Hourly pricing includes the managed workflow around the render session.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03]">
          <div className="grid grid-cols-[1fr_auto] border-b border-white/10 px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
            <div>PROFILE</div>
            <div>PRICE</div>
          </div>

          {pricingRows.map((row) => (
            <div
              key={row.option}
              className="grid grid-cols-[1fr_auto] items-center border-b border-white/10 px-6 py-5 last:border-b-0"
            >
              <div>
                <div className="text-lg font-medium text-white">{row.option}</div>
                <div className="mt-1 text-xs text-white/50">{row.spec}</div>
              </div>

              <div className="text-lg font-semibold text-emerald-300">
                {row.price}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <InPageLink targetId="reserve-access" className="cf-btn-primary">
            Reserve Access
          </InPageLink>
        </div>
      </div>
    </section>
  );
}
