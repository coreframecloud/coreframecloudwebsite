import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Compute Nodes — RTX 5080 GPU Workstations, ₹399/GPU-hour",
  description:
    "One node, one GPU: NVIDIA RTX 5080 with 16 GB GDDR7, 64 GB ECC RAM and a 6-core EPYC. ₹399 per GPU-hour, GST included, billed per minute from stream start. Hosted in Bengaluru, India.",
  alternates: { canonical: "/compute-nodes" },
};

const whatsapp = (message: string) =>
  `https://wa.me/916366889488?text=${encodeURIComponent(message)}`;

const node = {
  tag: "3D / WINDOWS",
  name: "NVIDIA RTX 5080",
  price: "₹399/hr",
  specs: [
    { label: "GPU", value: "NVIDIA RTX 5080 (Blackwell)" },
    { label: "VRAM", value: "16 GB GDDR7" },
    { label: "Memory bandwidth", value: "960 GB/s" },
    { label: "CUDA cores", value: "10,752" },
    { label: "System RAM", value: "64 GB ECC" },
    { label: "CPU", value: "6-core EPYC" },
    { label: "Storage", value: "500 GB NVMe" },
    { label: "Board power", value: "360 W" },
  ],
};

const goodFor = [
  {
    title: "Design and visualisation",
    text: "D5 Render, Lumion, Enscape, Revit, AutoCAD, 3ds Max and SolidWorks on a full Windows desktop over RDP.",
  },
  {
    title: "Final-frame and animation output",
    text: "Run long renders on the node instead of your workstation, and keep working locally while frames finish.",
  },
  {
    title: "Client review sessions",
    text: "Spin a node up for a walkthrough or a review call, then shut it down — you only pay for the minutes it streamed.",
  },
];

export default function ComputeNodesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <BackgroundGlow />

      <main className="relative mx-auto max-w-7xl px-6 pb-20 pt-20 md:pt-28">
        <div className="max-w-3xl">
          <div className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
            Compute Nodes
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">
            One node. One GPU. No configuration to get wrong.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
            Every Coreframe node is the same machine: an NVIDIA RTX 5080 with
            16 GB GDDR7, 64 GB ECC RAM and a 6-core EPYC, hosted in Bengaluru.
            One SKU means the price you see is the price you are billed, and
            there is no wrong tier to pick.
          </p>
        </div>

        <section className="mt-14">
          <div className="text-sm uppercase tracking-[0.25em] text-cyan-300">
            3D Rendering / Hourly
          </div>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
            RTX 5080 for rendering and visualization.
          </h2>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <Card className="rounded-[1.6rem] border-white/10 bg-white/5 lg:col-span-2">
              <CardContent className="p-6 md:p-8">
                <div className="inline-flex rounded-md border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                  {node.tag}
                </div>

                <div className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
                  {node.name}
                </div>

                <div className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {node.specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="flex items-baseline justify-between gap-4 border-b border-white/8 pb-2 text-sm"
                    >
                      <span className="text-slate-400">{spec.label}</span>
                      <span className="font-medium text-white">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
                  <div>
                    <div className="text-sm text-slate-400">
                      Pay-as-you-go, GST included
                    </div>
                    <div className="text-3xl font-semibold text-cyan-300">
                      {node.price}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      Per GPU-hour · billed per minute from stream start
                    </div>
                  </div>
                  <a
                    href={whatsapp(
                      "Hi Coreframe Cloud, I want to reserve an RTX 5080 node for a 3D rendering / visualization workload."
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button className="rounded-xl">Reserve</Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[1.6rem] border-white/10 bg-white/5">
              <CardContent className="p-6 md:p-8">
                <div className="text-sm uppercase tracking-[0.2em] text-cyan-300">
                  How billing works
                </div>
                <ul className="mt-5 space-y-4 text-sm leading-6 text-slate-300">
                  <li>
                    <span className="font-medium text-white">
                      ₹399 per GPU-hour, GST included.
                    </span>{" "}
                    What you see is what you pay — the 18% GST component is
                    inside the rate, and business customers get a full tax
                    invoice showing the split.
                  </li>
                  <li>
                    <span className="font-medium text-white">
                      Billed per minute from stream start.
                    </span>{" "}
                    The clock starts when your session begins streaming.
                    Provisioning time is free.
                  </li>
                  <li>
                    <span className="font-medium text-white">
                      No commitment.
                    </span>{" "}
                    Spin up anytime and shut down when you are done. Committed
                    monthly plans are cheaper per hour if you run regularly.
                  </li>
                  <li>
                    <span className="font-medium text-white">
                      Session scratch storage only.
                    </span>{" "}
                    Download your outputs before shutting down, or add
                    persistent NAS storage to the account.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-20">
          <div className="text-sm uppercase tracking-[0.25em] text-cyan-300">
            What it is for
          </div>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
            Built around design and rendering workflows.
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {goodFor.map((item) => (
              <Card
                key={item.title}
                className="rounded-[1.6rem] border-white/10 bg-white/5"
              >
                <CardContent className="p-6">
                  <div className="text-lg font-semibold text-white">
                    {item.title}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {item.text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="mt-14 flex flex-wrap items-center gap-4">
          <a
            href={whatsapp(
              "Hi Coreframe Cloud, I'd like to talk about RTX 5080 compute nodes for my team."
            )}
            target="_blank"
            rel="noreferrer"
          >
            <Button className="rounded-xl">Talk to us on WhatsApp</Button>
          </a>
          <span className="text-sm text-slate-400">
            Software licences are BYOL — bring your own D5 Render, Lumion,
            Enscape or SolidWorks seat.
          </span>
        </div>

        <p className="mt-10 text-sm text-slate-400">
          Need something outside this configuration — more storage, a different
          OS image, or a longer-running reserved node? Talk to us and we will
          tell you honestly whether we can run it.
        </p>
      </main>
    </div>
  );
}
