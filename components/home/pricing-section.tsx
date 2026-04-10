import Link from "next/link";

const pricingRows = [
  { model: "RTX A4000 16GB", price: "₹75 / hr" },
  { model: "RTX 4000 Ada 20GB", price: "₹99 / hr" },
  { model: "RTX A5000 24GB", price: "₹129 / hr" },
  { model: "RTX A6000 48GB", price: "₹249 / hr" },
];

export function PricingSection() {
  return (
    <section id="pricing" className="border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="cf-eyebrow">PRICING</div>

          <h2 className="mt-4 cf-section-title">
            Start rendering instantly. Pay per hour.
          </h2>

          <p className="mt-5 cf-section-copy">
            Transparent hourly pricing for GPU instances. Launch, render,
            and stop when done — no commitments required.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03]">
          <div className="grid grid-cols-[1fr_auto] border-b border-white/10 px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
            <div>GPU MODEL</div>
            <div>PRICE</div>
          </div>

          {pricingRows.map((row) => (
            <div
              key={row.model}
              className="grid grid-cols-[1fr_auto] items-center border-b border-white/10 px-6 py-5 last:border-b-0"
            >
              <div className="text-lg font-medium text-white">
                {row.model}
              </div>

              <div className="text-lg font-semibold text-emerald-300">
                {row.price}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link href="/#reserve-access" className="cf-btn-primary">
            Reserve Access
          </Link>
        </div>
      </div>
    </section>
  );
}
