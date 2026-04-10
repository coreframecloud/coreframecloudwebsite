import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8 lg:pb-32 lg:pt-28">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-2 text-sm font-medium text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            GPU INFRASTRUCTURE FOR DESIGN + AI
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

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link href="#reserve-access" className="cf-btn-primary">
              Request Access
            </Link>

            <Link href="#pricing" className="cf-btn-secondary">
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
                On-demand or reserved access
              </div>
            </div>

            <div>
              <div className="cf-eyebrow">SUPPORT</div>
              <div className="mt-2 text-base text-white/84">
                WhatsApp-first onboarding
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
