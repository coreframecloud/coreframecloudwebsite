const pricingRows = [
  {
    model: "D5 Server — RTX A4000 16GB",
    spec: "16 vCPU · 64GB RAM",
    price: "₹90 / hr",
  },
  {
    model: "D5 Server — RTX 4000 Ada 20GB",
    spec: "32 vCPU · 64GB RAM",
    price: "₹119 / hr",
  },
  {
    model: "D5 Server — RTX A5000 24GB",
    spec: "16 vCPU · 64GB RAM",
    price: "₹155 / hr",
  },
  {
    model: "D5 Server — RTX A6000 48GB",
    spec: "32 vCPU · 64GB RAM",
    price: "₹299 / hr",
  },
];


export function PricingSection() {
  return (
    <section id="pricing" className="border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl text-white font-semibold">
          D5 Render Workstation Pricing
        </h2>

        <div className="mt-8 space-y-4">
          {pricingRows.map((row) => (
            <div
              key={row.model}
              className="flex justify-between border-b border-white/10 pb-4"
            >
              <div>
                <div className="text-white">{row.model}</div>
                <div className="text-xs text-white/50 mt-1">
                  {row.spec}
                </div>
              </div>

              <div className="text-emerald-300 font-semibold">
                {row.price}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
