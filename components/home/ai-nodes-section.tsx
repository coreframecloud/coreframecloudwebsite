import { InPageLink } from "@/components/ui/in-page-link";

const aiOffers = [
  {
    title: "AI Node · NVIDIA L4 24GB",
    description: "Linux environment for inference, lightweight fine-tuning, and applied AI workloads.",
    price: "Starts from ₹120/hr",
  },
  {
    title: "AI Node · RTX 6000 Ada 48GB",
    description: "Higher VRAM Linux node for larger models, sustained runs, and production-grade workloads.",
    price: "Starts from ₹299/hr",
  },
  {
    title: "AI Node · H100 94GB",
    description: "High-end Linux compute for advanced training, heavier experimentation, and premium AI capacity.",
    price: "Custom pricing",
  },
];

export function AiNodesSection() {
  return (
    <section id="ai-nodes" className="border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="cf-eyebrow">AI NODES</div>

          <h2 className="mt-4 cf-section-title">
            Dedicated Linux GPU nodes for AI workloads.
          </h2>

          <p className="mt-5 cf-section-copy">
            Reserved GPU capacity for inference, fine-tuning, experimentation,
            and sustained AI runs. Clear model options, Linux-based environments,
            and direct commercial positioning from the first scroll.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {aiOffers.map((item) => (
            <div
              key={item.title}
              className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="text-2xl font-semibold leading-tight text-white">
                {item.title}
              </div>

              <p className="mt-4 min-h-[96px] text-base leading-7 text-white/62">
                {item.description}
              </p>

              <div className="mt-6 border-t border-white/10 pt-6">
                <div className="text-sm uppercase tracking-[0.18em] text-white/40">
                  Pricing
                </div>
                <div className="mt-2 text-3xl font-semibold text-emerald-300">
                  {item.price}
                </div>
              </div>

              <div className="mt-5 text-sm font-medium text-emerald-300/85">
                Dedicated capacity only
              </div>

              <InPageLink
                targetId="reserve-access"
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:border-emerald-300/35 hover:bg-emerald-400/[0.1]"
              >
                Reserve Access
              </InPageLink>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
