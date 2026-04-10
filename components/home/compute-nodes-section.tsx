import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ComputeNodesSectionProps = {
  compact?: boolean;
};

const whatsapp = (message: string) =>
  `https://wa.me/916366889488?text=${encodeURIComponent(message)}`;

const rtxNodes = [
  {
    tag: "3D / WINDOWS",
    name: "RTX A4000 16GB",
    specs: ["16GB VRAM", "16 vCPU", "64GB RAM", "200GB SSD"],
    price: "₹75/hr",
  },
  {
    tag: "3D / WINDOWS",
    name: "RTX A5000 24GB",
    specs: ["24GB VRAM", "16 vCPU", "64GB RAM", "250GB SSD"],
    price: "₹129/hr",
  },
  {
    tag: "3D / WINDOWS",
    name: "RTX A6000 48GB",
    specs: ["48GB VRAM", "32 vCPU", "96GB RAM", "300GB SSD"],
    price: "₹249/hr",
  },
  {
    tag: "3D / WINDOWS",
    name: "RTX 4000 Ada 20GB",
    specs: ["20GB VRAM", "32 vCPU", "64GB RAM", "250GB SSD"],
    price: "₹99/hr",
  },
  {
    tag: "3D / WINDOWS",
    name: "RTX 6000 Ada 48GB",
    specs: ["48GB VRAM", "64 vCPU", "192GB RAM", "400GB SSD"],
    price: "₹499/hr",
  },
];

const aiNodes = [
  {
    tag: "A-SERIES / LINUX",
    name: "A16 16GB",
    subtitle: "Light inference, VDI density, lightweight compute",
    plan: "₹32,000/month",
  },
  {
    tag: "A-SERIES / LINUX",
    name: "A30 24GB",
    subtitle: "Balanced AI compute and inference",
    plan: "₹66,000/month",
  },
  {
    tag: "A-SERIES / LINUX",
    name: "A40 48GB",
    subtitle: "Inference, simulation, render-adjacent compute",
    plan: "₹150,000/month",
  },
  {
    tag: "A-SERIES / LINUX",
    name: "A100 80GB",
    subtitle: "Training and heavier AI workloads",
    plan: "Pricing on request",
  },
  {
    tag: "L-SERIES / LINUX",
    name: "L4 24GB",
    subtitle: "Efficient inference and video AI",
    plan: "₹67,960/month",
  },
  {
    tag: "L-SERIES / LINUX",
    name: "L40S 48GB",
    subtitle: "High-end inference and visual compute",
    plan: "₹81,320/month",
  },
  {
    tag: "H-SERIES / LINUX",
    name: "H100 94GB",
    subtitle: "Advanced AI training",
    plan: "₹399,000/month",
  },
  {
    tag: "H-SERIES / LINUX",
    name: "H200 141GB",
    subtitle: "Next-gen training and memory-heavy workloads",
    plan: "₹420,000/month",
  },
];

export function ComputeNodesSection({
  compact = false,
}: ComputeNodesSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
      <div className="max-w-3xl">
        <div className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
          Infrastructure
        </div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
          Select your compute node.
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-300 md:text-lg">
          RTX cards are available on hourly plans for 3D rendering. A, L, and H
          series nodes are available on monthly Linux plans for AI workloads.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {rtxNodes.map((gpu) => (
          <Card
            key={gpu.name}
            className="rounded-[1.6rem] border border-white/12 bg-white/6 shadow-[0_20px_50px_rgba(0,0,0,0.22)] backdrop-blur-2xl"
          >
            <CardContent className="p-6">
              <div className="inline-flex rounded-md border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200 backdrop-blur-xl">
                {gpu.tag}
              </div>

              <div className="mt-5 text-3xl font-semibold tracking-tight text-white">
                {gpu.name}
              </div>

              <div className="mt-6 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                {gpu.specs.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>

              <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/10 pt-6">
                <div>
                  <div className="text-sm text-slate-400">Starting at</div>
                  <div className="text-2xl font-semibold text-cyan-300">
                    {gpu.price}
                  </div>
                </div>

                <a
                  href={whatsapp(
                    `Hi Coreframe Cloud, I want to reserve ${gpu.name} for a 3D rendering / visualization workload.`
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button className="rounded-xl border border-cyan-300/20 bg-cyan-400/10 text-white shadow-[0_0_24px_rgba(34,211,238,0.12)] hover:bg-cyan-400/15">
                    Reserve
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16">
        <div className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
          Linux GPU Plans
        </div>
        <h3 className="mt-3 text-2xl font-semibold md:text-3xl">
          AI training and inference nodes.
        </h3>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {aiNodes.map((gpu) => (
            <Card
              key={gpu.name}
              className="rounded-[1.6rem] border border-white/12 bg-white/6 shadow-[0_20px_50px_rgba(0,0,0,0.22)] backdrop-blur-2xl"
            >
              <CardContent className="p-6">
                <div className="inline-flex rounded-md border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200 backdrop-blur-xl">
                  {gpu.tag}
                </div>

                <div className="mt-5 text-2xl font-semibold tracking-tight text-white">
                  {gpu.name}
                </div>

                <div className="mt-3 text-sm text-slate-400">
                  {gpu.subtitle}
                </div>

                <div className="mt-8 border-t border-white/10 pt-6">
                  <div className="text-sm text-slate-400">
                    Indicative monthly pricing
                  </div>
                  <div className="mt-1 text-xl font-semibold text-cyan-300">
                    {gpu.plan}
                  </div>
                </div>

                <a
                  href={whatsapp(
                    `Hi Coreframe Cloud, I want pricing and configuration details for ${gpu.name} on a monthly Linux plan.`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-block w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-white/12 bg-white/6 text-white backdrop-blur-xl hover:bg-white/10"
                  >
                    Contact
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        {compact ? (
          <div className="mt-8">
            <a
              href="/compute-nodes"
              className="text-sm text-cyan-300 hover:text-cyan-200"
            >
              View full compute node list →
            </a>
          </div>
        ) : null}
      </div>

      <p className="mt-8 text-xs leading-6 text-slate-500">
        Deployment profiles can be aligned to application requirements,
        performance expectations, operating system preference, and scaling model.
      </p>
    </section>
  );
}
