import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const launchCards = [
  {
    name: "RTX A4000 16GB",
    use: "Entry 3D rendering and visualization",
    price: "₹75/hr",
    slug: "RTX A4000 16GB",
  },
  {
    name: "RTX 4000 Ada 20GB",
    use: "Strong value for under-₹100/hr launch",
    price: "₹99/hr",
    slug: "RTX 4000 Ada 20GB",
  },
  {
    name: "RTX A5000 24GB",
    use: "Balanced rendering and compute",
    price: "₹129/hr",
    slug: "RTX A5000 24GB",
  },
  {
    name: "RTX A6000 48GB",
    use: "Higher memory 3D workloads",
    price: "₹249/hr",
    slug: "RTX A6000 48GB",
  },
];

export function LaunchCardsSection() {
  return (
    <section id="launch-gpus" className="mx-auto max-w-7xl px-6 py-16 md:py-20">
      <div className="max-w-3xl">
        <div className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
          Launch GPUs
        </div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
          Start with featured RTX launch options.
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-300 md:text-lg">
          Product-led, simple, and clear. Pick a GPU profile, submit your details,
          and reserve access while availability opens up.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {launchCards.map((gpu) => (
          <Card
            key={gpu.name}
            className="rounded-[1.6rem] border border-white/12 bg-white/6 shadow-[0_20px_50px_rgba(0,0,0,0.22)] backdrop-blur-2xl"
          >
            <CardContent className="p-6">
              <div className="text-2xl font-semibold text-white">{gpu.name}</div>
              <div className="mt-3 text-sm leading-7 text-slate-300">{gpu.use}</div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <div className="text-sm text-slate-400">Starting at</div>
                <div className="mt-1 text-2xl font-semibold text-cyan-300">
                  {gpu.price}
                </div>
              </div>

              <div className="mt-4 text-xs text-amber-200/80">
                No availability for now
              </div>

              <a
                href={`/request-demo?gpu=${encodeURIComponent(gpu.slug)}&type=${encodeURIComponent(
                  "RTX / 3D Rendering"
                )}`}
                className="mt-6 inline-block w-full"
              >
                <Button className="w-full rounded-xl border border-cyan-300/20 bg-cyan-400/10 text-white hover:bg-cyan-400/15">
                  Launch
                </Button>
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
