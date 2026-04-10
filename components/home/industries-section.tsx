import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/home/section-heading";
import { industries } from "@/lib/home-data";

export function IndustriesSection() {
  return (
    <section id="industries" className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <SectionHeading
        eyebrow="Industries"
        title="Built for teams where performance directly impacts delivery."
        text="The site is positioned for premium B2B buyers who care about workflow fit, deployment speed, and a reliable client experience."
      />

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {industries.map(({ icon: Icon, title, text }) => (
          <Card
            key={title}
            className="rounded-[1.7rem] border-white/10 bg-white/5"
          >
            <CardContent className="p-7">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 ring-1 ring-cyan-400/20">
                <Icon className="h-5 w-5 text-cyan-200" />
              </div>
              <h3 className="text-2xl font-semibold">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">{text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
