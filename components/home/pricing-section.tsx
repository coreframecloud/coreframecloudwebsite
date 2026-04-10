import { Card, CardContent } from "@/components/ui/card";

const items = [
  {
    title: "Under ₹100/hr",
    text: "Launch entry RTX options like RTX A4000 and RTX 4000 Ada.",
  },
  {
    title: "Hourly RTX",
    text: "Use hourly pricing for rendering, CAD, D5, and visualization workloads.",
  },
  {
    title: "Monthly Linux",
    text: "Use monthly GPU nodes for AI training, inference, and simulation.",
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-16 md:py-20">
      <div className="max-w-3xl">
        <div className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
          Pricing
        </div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
          Clear commercial positioning from the first scroll.
        </h2>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <Card
            key={item.title}
            className="rounded-[1.6rem] border border-white/12 bg-white/6 shadow-[0_20px_50px_rgba(0,0,0,0.22)] backdrop-blur-2xl"
          >
            <CardContent className="p-6">
              <div className="text-2xl font-semibold text-white">{item.title}</div>
              <div className="mt-4 text-sm leading-7 text-slate-300">{item.text}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
