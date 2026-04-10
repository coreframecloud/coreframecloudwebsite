import Link from "next/link";

const featuredLaunches = [
  {
    model: "RTX A4000 16GB",
    useCase: "Entry 3D rendering and visualization",
    price: "₹75 / hr",
  },
  {
    model: "RTX 4000 Ada 20GB",
    useCase: "Strong value under ₹100/hr launch",
    price: "₹99 / hr",
  },
  {
    model: "RTX A5000 24GB",
    useCase: "Balanced rendering and compute",
    price: "₹129 / hr",
  },
  {
    model: "RTX A6000 48GB",
    useCase: "Higher memory 3D workloads",
    price: "₹249 / hr",
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:pb-28 lg:pt-20">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-2 text-sm font-medium text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            3D RENDERING INFRASTRUCTURE + AI WORKLOADS
          </div>

          <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-[0.96] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
            Launch GPU workstations
            <br />
            built for rendering,
            <br />
            AI, and scale.
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-white/68 sm:text-xl sm:leading-9">
            High-performance cloud GPU infrastructure for D5 Render, Revit,
            AI nodes, and demanding visual workloads — without the cost and
            friction of managing hardware.
          </p>

          <div className="mt-5 text-base font-medium text-emerald-300 sm:text-lg">
            Start rendering from ₹75/hr. No setup. No commitment.
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link href="/#reserve-access" className="cf-btn-primary">
              Reserve Access
            </Link>

            <Link href="/#pricing" className="cf-btn-secondary">
              View Pricing
            </Link>
          </div>

          <div className="mt-12 grid max-w-3xl grid-cols-1 gap-6 border-t border-white/10 pt-8 text-sm text-white/62 sm:grid-cols-3">
            <div>
              <div className="cf-eyebrow">WORKLOADS</div>
              <div className="mt-2 text-base text-white/84">
                D5 Render, Revit, AI, 3D
              </div>
            </div>

            <div>
              <div className="cf-eyebrow">MODEL</div>
              <div className="mt-2 text-base text-white/84">
                Quick launch or reserved access
              </div>
            </div>

            <div>
              <div className="cf-eyebrow">FLOW</div>
              <div className="mt-2 text-base text-white/84">
                Form first, then WhatsApp follow-up
              </div>
            </div>
          </div>
        </div>

        <div className="lg:pt-10">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_0_50px_rgba(16,185,129,0.05)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300/90">
              FEATURED RTX LAUNCHES
            </div>

            <div className="mt-5 space-y-4">
              {featuredLaunches.map((item) => (
                <div
                  key={item.model}
                  className="rounded-2xl border border-white/10 bg-[#07121e]/80 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xl font-semibold text-white">
                        {item.model}
                      </div>
                      <div className="mt-1 text-sm leading-6 text-white/60">
                        {item.useCase}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-sm font-medium uppercase tracking-[0.18em] text-white/42">
                        Starting at
                      </div>
                      <div className="mt-1 text-lg font-semibold text-emerald-300">
                        {item.price}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-emerald-300/80">
                      Limited slots available
                    </div>

                    <Link
                      href="/#reserve-access"
                      className="inline-flex items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:border-emerald-300/35 hover:bg-emerald-400/[0.1]"
                    >
                      Reserve Access
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 text-sm text-white/50">
              Clear hourly pricing for quick commercial evaluation.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
