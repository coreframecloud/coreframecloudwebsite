import { InPageLink } from "@/components/ui/in-page-link";


const d5Workstations = [
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
      <div className="mx-auto grid max-w-7xl gap-14 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        
        {/* LEFT */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-2 text-sm text-emerald-300">
            D5 RENDER READY WORKSTATIONS
          </div>

          <h1 className="mt-6 text-6xl font-semibold text-white leading-[1.05]">
            Launch a D5 Render workstation
            <br />
            in under 2 minutes.
          </h1>

          <p className="mt-6 text-lg text-white/65 max-w-xl">
            Windows + WDDM enabled GPU machines. Bring your own D5 license,
            render for the hours you need, download files, and shut down.
          </p>

          <div className="mt-4 text-emerald-300 font-medium">
            Start from ₹75/hr. No setup. No lock-in.
          </div>

          <div className="mt-8 flex gap-4">
            <InPageLink targetId="reserve-access" className="cf-btn-primary">
              Reserve Access
            </InPageLink>
            <InPageLink targetId="pricing" className="cf-btn-secondary">
              View Pricing
            </InPageLink>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div>
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            <div className="text-xs tracking-[0.25em] text-emerald-300">
              D5 READY SERVERS
            </div>

            <div className="mt-5 space-y-4">
              {d5Workstations.map((item) => (
                <div
                  key={item.gpu}
                  className="rounded-2xl border border-white/10 bg-[#07121e] p-4"
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="text-xs text-emerald-300">
                        {item.vram}
                      </div>

                      <div className="text-lg text-white font-semibold mt-1">
                        D5 Render Ready Server
                      </div>

                      {/* 🔥 REAL SPEC LINE */}
                      <div className="text-xs text-white/55 mt-2">
                        {item.gpu} · {item.ram} · {item.cpu}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-white/40">
                        Starting
                      </div>
                      <div className="text-emerald-300 font-semibold">
                        {item.price}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center border-t border-white/10 pt-3">
                    <div className="text-xs text-emerald-300">
                      Limited slots available
                    </div>

                    <InPageLink
                      targetId="reserve-access"
                      className="text-xs border border-emerald-400/20 px-3 py-1 rounded-lg"
                    >
                      Reserve
                    </InPageLink>
                  </div>
                </div>
              ))}
            </div>

            {/* TRUST SIGNAL */}
            <div className="mt-4 text-xs text-white/50">
              Based on real RTX workstation performance benchmarks.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
