import { BackgroundGlow } from "@/components/home/background-glow";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const whatsapp = (message: string) =>
  `https://wa.me/916366889488?text=${encodeURIComponent(message)}`;

const rtxNodes = [
  {
    tag: "3D / WINDOWS",
    name: "RTX A4000 16GB",
    vram: "16GB",
    vcpu: "16",
    ram: "64GB",
    disk: "200GB SSD",
    price: "₹75/hr",
  },
  {
    tag: "3D / WINDOWS",
    name: "RTX A5000 24GB",
    vram: "24GB",
    vcpu: "16",
    ram: "64GB",
    disk: "250GB SSD",
    price: "₹129/hr",
  },
  {
    tag: "3D / WINDOWS",
    name: "RTX A6000 48GB",
    vram: "48GB",
    vcpu: "32",
    ram: "96GB",
    disk: "300GB SSD",
    price: "₹249/hr",
  },
  {
    tag: "3D / WINDOWS",
    name: "RTX 4000 Ada 20GB",
    vram: "20GB",
    vcpu: "32",
    ram: "64GB",
    disk: "250GB SSD",
    price: "₹99/hr",
  },
  {
    tag: "3D / WINDOWS",
    name: "RTX 6000 Ada 48GB",
    vram: "48GB",
    vcpu: "64",
    ram: "192GB",
    disk: "400GB SSD",
    price: "₹499/hr",
  },
];

const aiNodes = [
  {
    tag: "A-SERIES / LINUX",
    name: "A16 16GB",
    use: "Light inference, VDI density, lightweight compute",
    vram: "16GB",
    plan: "₹32,000/month",
  },
  {
    tag: "A-SERIES / LINUX",
    name: "A30 24GB",
    use: "Balanced AI compute and inference",
    vram: "24GB",
    plan: "₹66,000/month",
  },
  {
    tag: "A-SERIES / LINUX",
    name: "A40 48GB",
    use: "Inference, simulation, render-adjacent compute",
    vram: "48GB",
    plan: "₹150,000/month",
  },
  {
    tag: "A-SERIES / LINUX",
    name: "A100 80GB",
    use: "Training and heavier AI workloads",
    vram: "80GB",
    plan: "Pricing on request",
  },
  {
    tag: "L-SERIES / LINUX",
    name: "L4 24GB",
    use: "Efficient inference and video AI",
    vram: "24GB",
    plan: "₹67,960/month",
  },
  {
    tag: "L-SERIES / LINUX",
    name: "L40S 48GB",
    use: "High-end inference and visual compute",
    vram: "48GB",
    plan: "₹81,320/month",
  },
  {
    tag: "H-SERIES / LINUX",
    name: "H100 94GB",
    use: "Advanced AI training",
    vram: "94GB",
    plan: "₹399,000/month",
  },
  {
    tag: "H-SERIES / LINUX",
    name: "H200 141GB",
    use: "Next-gen training and memory-heavy workloads",
    vram: "141GB",
    plan: "₹420,000/month",
  },
];

export default function ComputeNodesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <BackgroundGlow />
      <SiteHeader />

      <main className="relative mx-auto max-w-7xl px-6 pb-20 pt-20 md:pt-28">
        <div className="max-w-3xl">
          <div className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
            Compute Nodes
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">
            Select the right GPU profile for your workload.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
            RTX nodes are for 3D rendering and design workflows on hourly usage.
            A, L, and H series nodes are for Linux-based AI, inference, and
            training workloads on monthly plans.
          </p>
        </div>

        <section className="mt-14">
          <div className="text-sm uppercase tracking-[0.25em] text-cyan-300">
            3D Rendering / Hourly
          </div>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
            RTX series for rendering and visualization.
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {rtxNodes.map((gpu) => (
              <Card
                key={gpu.name}
                className="rounded-[1.6rem] border-white/10 bg-white/5"
              >
                <CardContent className="p-6">
                  <div className="inline-flex rounded-md border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                    {gpu.tag}
                  </div>

                  <div className="mt-5 text-3xl font-semibold tracking-tight">
                    {gpu.name}
                  </div>

                  <div className="mt-6 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                    <div>{gpu.vram} VRAM</div>
                    <div>{gpu.vcpu} vCPU</div>
                    <div>{gpu.ram} RAM</div>
                    <div>{gpu.disk}</div>
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
                      <Button className="rounded-xl">Reserve</Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="text-sm uppercase tracking-[0.25em] text-cyan-300">
            AI / Linux / Monthly
          </div>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
            A, L, and H series for training and inference.
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {aiNodes.map((gpu) => (
              <Card
                key={gpu.name}
                className="rounded-[1.6rem] border-white/10 bg-white/5"
              >
                <CardContent className="p-6">
                  <div className="inline-flex rounded-md border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                    {gpu.tag}
                  </div>
                  <div className="mt-5 text-2xl font-semibold tracking-tight">
                    {gpu.name}
                  </div>
                  <div className="mt-3 text-sm text-slate-400">{gpu.vram} VRAM</div>
                  <p className="mt-4 text-sm leading-7 text-slate-300">
                    {gpu.use}
                  </p>

                  <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/10 pt-6">
                    <div>
                      <div className="text-sm text-slate-400">Ballpark monthly</div>
                      <div className="text-lg font-semibold text-cyan-300">
                        {gpu.plan}
                      </div>
                    </div>
                    <a
                      href={whatsapp(
                        `Hi Coreframe Cloud, I want pricing and configuration details for ${gpu.name} on a monthly Linux plan.`
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button
                        variant="outline"
                        className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10"
                      >
                        Contact
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <p className="mt-10 text-sm text-slate-400">
          Customizations can be done as per needs, including CPU, RAM, storage,
          operating system, and GPU combinations.
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
