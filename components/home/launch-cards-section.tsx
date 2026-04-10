import Link from "next/link";

const launchCards = [
  {
    model: "RTX A4000 16GB",
    description: "Entry 3D rendering and visualization",
    price: "₹75/hr",
  },
  {
    model: "RTX 4000 Ada 20GB",
    description: "Strong value for under-₹100/hr launch",
    price: "₹99/hr",
  },
  {
    model: "RTX A5000 24GB",
    description: "Balanced rendering and compute",
    price: "₹129/hr",
  },
  {
    model: "RTX A6000 48GB",
    description: "Higher memory 3D workloads",
    price: "₹249/hr",
  },
];

export function LaunchCardsSection() {
  return (
    <section id="launch-gpus" className="border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="cf-eyebrow">LAUNCH GPUS</div>
          <h2 className="mt-4 cf-section-title">
            Start with featured RTX launch options.
          </h2>
          <p className="mt-5 cf-section-copy">
            Pick a GPU profile, review the hourly rate, and reserve access in minutes.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-4">
          {launchCards.map((card) => (
            <div
              key={card.model}
              className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="text-2xl font-semibold leading-tight text-white">
                {card.model}
              </div>

              <p className="mt-5 min-h-[52px] text-base leading-7 text-white/62">
                {card.description}
              </p>

              <div className="mt-6 border-t border-white/10 pt-6">
                <div className="text-sm uppercase tracking-[0.18em] text-white/40">
                  Starting at
                </div>
                <div className="mt-2 text-4xl font-semibold text-emerald-300">
                  {card.price}
                </div>
              </div>

              <div className="mt-5 text-sm font-medium text-emerald-300/85">
                Limited slots available
              </div>

              <Link
                href="/#reserve-access"
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:border-emerald-300/35 hover:bg-emerald-400/[0.1]"
              >
                Reserve Access
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
