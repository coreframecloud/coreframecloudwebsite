import { InPageLink } from "@/components/ui/in-page-link";

const d5Options = [
  {
    vram: "16GB VRAM",
    gpu: "RTX A4000",
    ram: "64GB RAM",
    cpu: "16 vCPU · ~4.0 GHz",
    price: "₹90 / hr",
  },
  {
    vram: "20GB VRAM",
    gpu: "RTX 4000 Ada",
    ram: "64GB RAM",
    cpu: "32 vCPU · ~4.0 GHz",
    price: "₹119 / hr",
  },
  {
    vram: "24GB VRAM",
    gpu: "RTX A5000",
    ram: "64GB RAM",
    cpu: "16 vCPU · ~4.0 GHz",
    price: "₹155 / hr",
  },
  {
    vram: "48GB VRAM",
    gpu: "RTX A6000",
    ram: "64GB RAM",
    cpu: "32 vCPU · ~4.0 GHz",
    price: "₹299 / hr",
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-28 lg:pt-20">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-2 text-sm font-medium text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            D5 RENDER READY WORKSTATIONS + AI WORKLOADS
          </div>

          <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-[0.96] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
            Launch a D5 Render ready
            <br />
            Windows workstation
            <br />
            in under 2 minutes.
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-white/68 sm:text-xl sm:leading-9">
            WDDM-enabled Windows workstations for D5 Render on high-end RTX GPUs.
            Bring your own D5 license, use the machine only for the hours you need,
            terminate it when the render is done, and pull the output back to your local workstation.
          </p>

          <div className="mt-5 text-base font-medium text-emerald-300 sm:text-lg">
            Start from ₹90/hr. No setup. No long-term lock-in.
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <InPageLink targetId="reserve-access" className="cf-btn-primary">
              Reserve Access
            </InPageLink>

            <InPageLink targetId="pricing" className="cf-btn-secondary">
              View Pricing
            </InPageLink>
          </div>

          <div className="mt-6 max-w-xl text-sm text-white/60">
            Includes managed file orchestration, upload/download workflow, and a ready-to-use Windows environment.
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 border-t border-white/10 pt-6 text-xs text-white/60 sm:grid-cols-3">
            <div>✔ D5-ready Windows machine</div>
            <div>✔ Managed upload and download flow</div>
            <div>✔ No infra setup for your team</div>
          </div>

          <div className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-4 text-sm leading-7 text-white/64">
            Project files are transferred over a protected path to the provisioned workstation only.
            Workspace contents are purged when the instance is terminated.
          </div>
        </div>

        <div className="lg:pt-8">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_0_50px_rgba(16,185,129,0.05)]">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300/90">
                  UNIQUE PRODUCT
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  D5 Render Ready Server
                </div>
                <div className="mt-2 text-sm leading-6 text-white/60">
                  WDDM enabled · BYOL for D5 · Ready in under 2 minutes
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs uppercase tracking-[0.18em] text-white/42">
                  Starting at
                </div>
                <div className="mt-1 text-xl font-semibold text-emerald-300">
                  ₹90 / hr
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {d5Options.map((item) => (
                <div
                  key={item.vram}
                  className="rounded-2xl border border-white/10 bg-[#07121e]/80 px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
                        {item.vram}
                      </div>
                      <div className="mt-2 text-sm leading-6 text-white/58">
                        {item.gpu} · {item.ram} · {item.cpu}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-base font-semibold text-white">
                        {item.price}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
              <a
                href="https://www.d5render.com/posts/nvidia-rtx-4090-d5-render-review"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-emerald-300 hover:text-emerald-200"
              >
                View D5 performance reference
              </a>

              <InPageLink
                targetId="reserve-access"
                className="inline-flex items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:border-emerald-300/35 hover:bg-emerald-400/[0.1]"
              >
                Reserve Access
              </InPageLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
