import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const aiCards = [
  {
    name: "A30 24GB",
    note: "Balanced AI compute and inference",
    price: "₹66,000/month",
  },
  {
    name: "A40 48GB",
    note: "Inference, simulation, and visual compute",
    price: "₹150,000/month",
  },
  {
    name: "L40S 48GB",
    note: "High-end inference and visual workloads",
    price: "₹81,320/month",
  },
  {
    name: "H100 94GB",
    note: "Advanced AI training",
    price: "₹399,000/month",
  },
];

export function AiNodesSection() {
  return (
    <section id="ai-nodes" className="mx-auto max-w-7xl px-6 py-16 md:py-20">
      <div className="max-w-3xl">
        <div className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
          AI / Linux Nodes
        </div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
          Need AI training or Linux compute instead?
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-300 md:text-lg">
          Monthly GPU nodes for inference, training, simulation, and heavier Linux
          workloads.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {aiCards.map((gpu) => (
          <Card
            key={gpu.name}
            className="rounded-[1.6rem] border border-white/12 bg-white/6 shadow-[0_20px_50px_rgba(0,0,0,0.22)] backdrop-blur-2xl"
          >
            <CardContent className="p-6">
              <div className="text-2xl font-semibold text-white">{gpu.name}</div>
              <div className="mt-3 text-sm leading-7 text-slate-300">{gpu.note}</div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <div className="text-sm text-slate-400">Indicative monthly pricing</div>
                <div className="mt-1 text-xl font-semibold text-cyan-300">
                  {gpu.price}
                </div>
              </div>

              <a
                href={`/request-demo?gpu=${encodeURIComponent(gpu.name)}&type=${encodeURIComponent(
                  "AI / Linux Workloads"
                )}`}
                className="mt-6 inline-block w-full"
              >
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-white/12 bg-white/6 text-white hover:bg-white/10"
                >
                  Reserve
                </Button>
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
